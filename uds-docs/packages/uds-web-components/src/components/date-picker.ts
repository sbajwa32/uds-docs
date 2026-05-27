import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export interface UdsDatePickerChangeDetail {
  value: string;
}

export type UdsDatePickerState = 'default' | 'error';

/**
 * `<udc-date-picker>` — single-date picker built on a native `<input type="date">`.
 *
 * The Figma source for Date Picker in UDS 0.3 is a placeholder page, so the
 * visual language here matches `<udc-text-input>` (label, bordered field,
 * leading calendar icon, helper text, error/disabled treatment) and falls
 * back to the browser's native date popover.
 *
 * Public attributes/properties:
 *   name           — form field name
 *   value          — ISO date string (YYYY-MM-DD)
 *   label          — visible label text
 *   placeholder    — placeholder text (browser support varies for `type=date`)
 *   helper-text    — supporting text below the field
 *   min            — minimum date (YYYY-MM-DD)
 *   max            — maximum date (YYYY-MM-DD)
 *   state          — "default" | "error"
 *   disabled       — boolean
 *   readonly       — boolean
 *   required       — boolean
 *   show-label     — boolean, default true
 *   show-helper    — boolean
 *
 * Events:
 *   udc-change     — fires when the value changes; detail: { value }
 */
export class UdsDatePickerElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    helperText: { type: String, attribute: 'helper-text', reflect: true },
    min: { type: String, reflect: true },
    max: { type: String, reflect: true },
    state: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    showLabel: { type: Boolean, attribute: 'show-label', reflect: true },
    showHelper: { type: Boolean, attribute: 'show-helper', reflect: true },
  };

  name = '';
  value = '';
  label = '';
  placeholder = '';
  helperText = '';
  min = '';
  max = '';
  state: UdsDatePickerState = 'default';
  disabled = false;
  readonly = false;
  required = false;
  showLabel = true;
  showHelper = false;

  private readonly internals: ElementInternals | null;
  private readonly fieldId = `udc-date-picker-${Math.random().toString(36).slice(2)}`;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
  }

  /**
   * Field chrome closely mirrors `<udc-text-input>` so date pickers
   * line up with the rest of the form vocabulary.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-date-picker {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-050);
      }

      .udc-date-picker__label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-sm);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      .udc-date-picker__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
      }

      .udc-date-picker__field {
        display: flex;
        align-items: center;
        min-height: var(--uds-space-600);
        padding: var(--uds-space-075) var(--uds-space-075) var(--uds-space-075)
          var(--uds-space-100);
        background-color: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }

      .udc-date-picker__leading-icon {
        display: flex;
        align-items: center;
        padding: 0 2px;
        color: var(--uds-color-icon-secondary);
        flex-shrink: 0;
      }

      .udc-date-picker__leading-icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      .udc-date-picker__field input {
        flex: 1 1 0%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        padding: 0 var(--uds-space-075) 0 var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      .udc-date-picker__field input::-webkit-calendar-picker-indicator {
        opacity: 0.55;
        cursor: pointer;
      }

      .udc-date-picker__field input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }

      .udc-date-picker__helper {
        display: flex;
        justify-content: space-between;
        gap: var(--uds-space-100);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-xs);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-xs);
        color: var(--uds-color-text-secondary);
      }

      /* FOCUS */
      .udc-date-picker__field:focus-within {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      /* ERROR */
      :host([state='error']) .udc-date-picker__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([state='error']) .udc-date-picker__field {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-date-picker__helper {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-date-picker__leading-icon {
        color: var(--uds-color-icon-error);
      }

      /* DISABLED */
      :host([disabled]) .udc-date-picker__field {
        background-color: var(--uds-color-surface-interactive-disabled);
        border-color: transparent;
        cursor: not-allowed;
      }

      :host([disabled]) .udc-date-picker__field input {
        color: var(--uds-color-text-disabled-bold);
        cursor: not-allowed;
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }

  render() {
    const showHelperRow = this.showHelper || !!this.helperText;

    return html`
      <div class="udc-date-picker" part="root">
        ${this.showLabel
          ? html`
              <label class="udc-date-picker__label" for=${this.fieldId} part="label">
                ${this.label}
                ${this.required
                  ? html`<span class="udc-date-picker__required" part="required"></span>`
                  : nothing}
              </label>
            `
          : nothing}
        <div class="udc-date-picker__field" part="field">
          <span class="udc-date-picker__leading-icon" part="leading-icon" aria-hidden="true">
            <span class="material-symbols-outlined">calendar_today</span>
          </span>
          <input
            id=${this.fieldId}
            part="input"
            type="date"
            name=${this.name || nothing}
            .value=${this.value}
            placeholder=${this.placeholder || nothing}
            min=${this.min || nothing}
            max=${this.max || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-invalid=${this.state === 'error' ? 'true' : nothing}
            @change=${this.handleChange}
          />
        </div>
        ${showHelperRow
          ? html`
              <div class="udc-date-picker__helper" part="helper">
                <span><slot name="helper">${this.helperText}</slot></span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private handleChange(event: Event) {
    this.value = (event.currentTarget as HTMLInputElement).value;
    emitUdsEvent<UdsDatePickerChangeDetail>(this, 'udc-change', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-date-picker': UdsDatePickerElement;
  }
}
