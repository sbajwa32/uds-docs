import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export type UdsTextInputState = 'default' | 'error';
export type UdsTextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export interface UdsTextInputDetail {
  value: string;
}

/**
 * `<udc-text-input>` — single-line text field with optional leading icon,
 * trailing icon button, helper text, and character counter.
 *
 * Public attributes/properties:
 *   value          — current input value (reflected; form-associated)
 *   label          — visible label text
 *   placeholder    — placeholder text
 *   helper-text    — helper text rendered below the field
 *   max-length     — character counter max
 *   state          — "default" | "error"
 *   type           — input type
 *   inputmode      — virtual-keyboard hint
 *   disabled       — boolean
 *   readonly       — boolean
 *   required       — boolean (renders required dot next to label)
 *   show-label     — boolean, default true
 *   show-helper    — boolean, default false; auto-true when max-length is set
 *   leading-icon   — Material Symbols name for the leading icon
 *   trailing-icon  — Material Symbols name for the trailing button
 *
 * Slots:
 *   label          — custom label content (replaces `label` attribute)
 *   helper         — custom helper content (replaces `helper-text` attribute)
 *   leading        — custom leading content (replaces `leading-icon`)
 *   trailing       — custom trailing content (replaces `trailing-icon`)
 *
 * Events:
 *   udc-input             — fires on each keystroke; detail: { value }
 *   udc-change            — fires on committed change; detail: { value }
 *   udc-trailing-click    — fires when the trailing button is clicked
 */
export class UdsTextInputElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    helperText: { type: String, attribute: 'helper-text', reflect: true },
    placeholder: { type: String, reflect: true },
    state: { type: String, reflect: true },
    type: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    showLabel: { type: Boolean, attribute: 'show-label', reflect: true },
    showHelper: { type: Boolean, attribute: 'show-helper', reflect: true },
    maxLength: { type: Number, attribute: 'max-length', reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
    inputMode: { type: String, attribute: 'inputmode', reflect: true },
  };

  name = '';
  value = '';
  label = '';
  helperText = '';
  placeholder = '';
  state: UdsTextInputState = 'default';
  type: UdsTextInputType = 'text';
  required = false;
  disabled = false;
  readonly = false;
  showLabel = true;
  showHelper = false;
  maxLength?: number;
  leadingIcon = '';
  trailingIcon = '';
  inputMode = '';

  private readonly internals: ElementInternals | null;
  private readonly fieldId = `udc-text-input-${Math.random().toString(36).slice(2)}`;
  private readonly helperId = `${this.fieldId}-helper`;
  private initialValue = '';

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
    this.initialValue = this.value;
  }

  /**
   * Full CSS port from `uds/components/text-input/text-input.css` on main.
   * Lives in shadow DOM so the same class names are safe (no leakage).
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      /* Root wrapper */
      .udc-text-input {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-050);
      }

      /* Label */
      .udc-text-input__label {
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

      .udc-text-input__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
      }

      /* Text field container */
      .udc-text-input__field {
        display: flex;
        align-items: center;
        gap: 0;
        min-height: var(--uds-space-600);
        padding: var(--uds-space-075) var(--uds-space-075) var(--uds-space-075) var(--uds-space-100);
        background-color: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }

      /* The actual <input> element */
      .udc-text-input__field input {
        flex: 1 1 0%;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        padding: 0 var(--uds-space-075) 0 var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      .udc-text-input__field input::placeholder {
        color: var(--uds-color-text-secondary);
      }

      /* Leading icon */
      .udc-text-input__leading-icon {
        display: flex;
        align-items: center;
        padding: 0 2px;
        color: var(--uds-color-icon-secondary);
        flex-shrink: 0;
      }

      .udc-text-input__leading-icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      /* Trailing action button */
      .udc-text-input__trailing-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: var(--uds-space-075);
        margin-left: var(--uds-space-050);
        background: var(--uds-color-surface-interactive-none, transparent);
        border: none;
        border-radius: var(--uds-border-radius-input);
        color: var(--uds-color-icon-secondary);
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 120ms ease;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
        font: inherit;
      }

      .udc-text-input__trailing-btn:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-text-input__trailing-btn:active {
        background: var(--uds-color-surface-interactive-subtle-active);
      }

      .udc-text-input__trailing-btn:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }

      .udc-text-input__trailing-btn .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      /* Helper row */
      .udc-text-input__helper {
        display: flex;
        justify-content: space-between;
        gap: var(--uds-space-100);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-xs);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-xs);
        color: var(--uds-color-text-secondary);
        letter-spacing: 0;
      }

      .udc-text-input__counter {
        flex-shrink: 0;
        margin-left: auto;
      }

      /* FOCUS STATE — separate 2px blue ring on the field wrapper */
      .udc-text-input__field:focus-within {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      /* ERROR STATE */
      :host([state='error']) .udc-text-input__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([state='error']) .udc-text-input__field {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-text-input__field:focus-within {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      :host([state='error']) .udc-text-input__field input,
      :host([state='error']) .udc-text-input__field input::placeholder {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-text-input__helper {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-text-input__counter {
        color: var(--uds-color-text-secondary);
      }

      /* DISABLED STATE */
      :host([disabled]) .udc-text-input__field {
        background-color: var(--uds-color-surface-interactive-disabled);
        border-color: transparent;
        cursor: not-allowed;
      }

      :host([disabled]) .udc-text-input__field input {
        color: var(--uds-color-text-disabled-bold);
        cursor: not-allowed;
      }

      :host([disabled]) .udc-text-input__field input::placeholder {
        color: var(--uds-color-text-disabled);
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

    return html`
      <div class="udc-text-input" part="root">
        ${this.showLabel
          ? html`
              <label class="udc-text-input__label" for=${this.fieldId} part="label">
                <slot name="label">${this.label}</slot>
                ${this.required
                  ? html`<span class="udc-text-input__required" part="required"></span>`
                  : nothing}
              </label>
            `
          : nothing}
        <div class="udc-text-input__field" part="field">
          ${this.leadingIcon
            ? html`
                <span class="udc-text-input__leading-icon" part="leading-icon" aria-hidden="true">
                  <slot name="leading"
                    ><span class="material-symbols-outlined">${this.leadingIcon}</span></slot
                  >
                </span>
              `
            : html`<slot name="leading"></slot>`}
          <input
            id=${this.fieldId}
            part="input"
            name=${this.name || nothing}
            .value=${this.value}
            type=${this.type}
            placeholder=${this.placeholder || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            maxlength=${this.maxLength ?? nothing}
            inputmode=${this.inputMode || nothing}
            aria-invalid=${this.state === 'error' ? 'true' : nothing}
            aria-describedby=${showHelperRow ? this.helperId : nothing}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          ${this.trailingIcon
            ? html`
                <button
                  class="udc-text-input__trailing-btn"
                  part="trailing-button"
                  type="button"
                  ?disabled=${this.disabled}
                  @click=${this.handleTrailingClick}
                >
                  <slot name="trailing"
                    ><span class="material-symbols-outlined">${this.trailingIcon}</span></slot
                  >
                </button>
              `
            : html`<slot name="trailing"></slot>`}
        </div>
        ${showHelperRow
          ? html`
              <div class="udc-text-input__helper" part="helper" id=${this.helperId}>
                <span><slot name="helper">${this.helperText}</slot></span>
                ${showCounter
                  ? html`<span class="udc-text-input__counter" part="counter"
                      >${this.value.length}/${this.maxLength}</span
                    >`
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    emitUdsEvent<UdsTextInputDetail>(this, 'udc-input', { value: this.value });
  }

  private handleChange() {
    emitUdsEvent<UdsTextInputDetail>(this, 'udc-change', { value: this.value });
  }

  private handleTrailingClick = (event: MouseEvent) => {
    if (this.disabled) return;
    emitUdsEvent<UdsTextInputDetail>(this, 'udc-trailing-click', { value: this.value });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-text-input': UdsTextInputElement;
  }
}
