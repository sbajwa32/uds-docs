import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock } from '../styles';

export interface UdsTextAreaChangeDetail {
  value: string;
}

export type UdsTextAreaState = 'default' | 'focused' | 'error' | 'error-focused';

/**
 * `<udc-text-area>` — multiline text field with label, helper, counter.
 *
 * Public attributes/properties:
 *   name           — form field name
 *   value          — current input value
 *   label          — visible label text
 *   placeholder    — placeholder text
 *   helper-text    — supporting text below the field
 *   max-length     — character counter max
 *   rows           — initial visible rows (default 4)
 *   state          — "default" | "focused" | "error" | "error-focused"
 *   disabled       — boolean
 *   required       — boolean
 *   show-label     — boolean, default true
 *   show-helper    — boolean, default false; auto-true when max-length is set
 *
 * Events:
 *   udc-input      — fires on each keystroke; detail: { value }
 *   udc-change     — fires on committed change; detail: { value }
 */
export class UdsTextAreaElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    helperText: { type: String, attribute: 'helper-text', reflect: true },
    placeholder: { type: String, reflect: true },
    state: { type: String, reflect: true },
    rows: { type: Number, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    showLabel: { type: Boolean, attribute: 'show-label', reflect: true },
    showHelper: { type: Boolean, attribute: 'show-helper', reflect: true },
    maxLength: { type: Number, attribute: 'max-length', reflect: true },
  };

  name = '';
  value = '';
  label = '';
  helperText = '';
  placeholder = '';
  state: UdsTextAreaState = 'default';
  rows = 4;
  required = false;
  disabled = false;
  showLabel = true;
  showHelper = false;
  maxLength?: number;

  private readonly internals: ElementInternals | null;
  private readonly fieldId = `udc-text-area-${Math.random().toString(36).slice(2)}`;
  private initialValue = '';

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
    this.initialValue = this.value;
  }

  /**
   * Full CSS port from `uds/components/text-area/text-area.css` on main.
   */
  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-text-area {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-075);
        font-family: var(--uds-font-family);
      }

      .udc-text-area__label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-sm);
        color: var(--uds-color-text-primary);
      }

      .udc-text-area__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
      }

      .udc-text-area__field {
        min-height: 88px;
        display: flex;
        align-items: stretch;
        padding: var(--uds-space-100);
        border: var(--uds-border-width-100, 1px) solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        background: var(--uds-color-surface-main);
        transition: border-color 120ms ease, outline-color 120ms ease;
      }

      .udc-text-area:hover .udc-text-area__field {
        border-color: var(--uds-color-border-outline-hover);
      }

      .udc-text-area__field:focus-within,
      :host([state='focused']) .udc-text-area__field,
      :host([state='error-focused']) .udc-text-area__field {
        outline: var(--uds-border-width-200, 2px) solid
          var(--uds-color-border-outline-focus-visible);
        outline-offset: var(--uds-space-025, 2px);
      }

      .udc-text-area textarea {
        width: 100%;
        min-height: 68px;
        border: 0;
        outline: 0;
        resize: vertical;
        background: transparent;
        color: var(--uds-color-text-primary);
        font: inherit;
        font-size: var(--uds-font-size-base);
        line-height: var(--uds-font-line-height-base);
      }

      .udc-text-area textarea::placeholder {
        color: var(--uds-color-text-secondary);
      }

      .udc-text-area__helper {
        display: flex;
        justify-content: space-between;
        gap: var(--uds-space-100);
        font-size: var(--uds-font-size-xs);
        line-height: var(--uds-font-line-height-xs);
        color: var(--uds-color-text-secondary);
      }

      /* ERROR */
      :host([state='error']) .udc-text-area,
      :host([state='error-focused']) .udc-text-area {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-text-area__field,
      :host([state='error-focused']) .udc-text-area__field {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-text-area__helper,
      :host([state='error-focused']) .udc-text-area__helper {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-text-area__label,
      :host([state='error-focused']) .udc-text-area__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      /* DISABLED */
      :host([disabled]) .udc-text-area__field {
        background-color: var(--uds-color-surface-interactive-disabled);
        border-color: transparent;
        cursor: not-allowed;
      }

      :host([disabled]) .udc-text-area textarea {
        color: var(--uds-color-text-disabled-bold);
        cursor: not-allowed;
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }

  formResetCallback() {
    this.value = this.initialValue;
  }

  render() {
    const showCounter = this.maxLength !== undefined && this.maxLength !== null;
    const showHelperRow = this.showHelper || !!this.helperText || showCounter;
    const isError = this.state === 'error' || this.state === 'error-focused';

    return html`
      <div class="udc-text-area" part="root">
        ${this.showLabel
          ? html`
              <label class="udc-text-area__label" for=${this.fieldId} part="label">
                ${this.label}
                ${this.required
                  ? html`<span class="udc-text-area__required" part="required"></span>`
                  : nothing}
              </label>
            `
          : nothing}
        <div class="udc-text-area__field" part="field">
          <textarea
            id=${this.fieldId}
            part="textarea"
            name=${this.name || nothing}
            .value=${this.value}
            rows=${this.rows}
            placeholder=${this.placeholder || nothing}
            maxlength=${this.maxLength ?? nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            aria-invalid=${isError ? 'true' : nothing}
            @input=${this.handleInput}
            @change=${this.handleChange}
          ></textarea>
        </div>
        ${showHelperRow
          ? html`
              <div class="udc-text-area__helper" part="helper">
                <span><slot name="helper">${this.helperText}</slot></span>
                ${showCounter
                  ? html`<span part="counter">${this.value.length}/${this.maxLength}</span>`
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private handleInput(event: Event) {
    this.value = (event.currentTarget as HTMLTextAreaElement).value;
    emitUdsEvent<UdsTextAreaChangeDetail>(this, 'udc-input', { value: this.value });
  }

  private handleChange() {
    emitUdsEvent<UdsTextAreaChangeDetail>(this, 'udc-change', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-text-area': UdsTextAreaElement;
  }
}
