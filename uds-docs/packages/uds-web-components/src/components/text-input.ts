import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostBlock, materialIconStyles } from '../styles';

export type UdsTextInputState = 'default' | 'error';
export type UdsTextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export interface UdsTextInputDetail {
  value: string;
}

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

  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      .root {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-050, 4px);
      }

      label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050, 4px);
        font-size: var(--uds-font-size-sm, 14px);
        font-weight: var(--uds-font-weight-medium, 500);
        line-height: var(--uds-font-line-height-sm, 1.25);
        color: var(--uds-color-text-primary, #171717);
      }

      :host([state='error']) label {
        color: var(--uds-color-text-error, #b42318);
        font-weight: var(--uds-font-weight-bold, 700);
      }

      .required {
        width: var(--uds-space-050, 4px);
        height: var(--uds-space-050, 4px);
        border-radius: 50%;
        background: var(--uds-color-icon-error, #b42318);
        flex-shrink: 0;
      }

      .field {
        display: flex;
        align-items: center;
        min-height: var(--uds-space-600, 48px);
        padding: var(--uds-space-075, 6px) var(--uds-space-075, 6px) var(--uds-space-075, 6px)
          var(--uds-space-100, 8px);
        background: var(--uds-color-surface-main, #fff);
        border: 1px solid var(--uds-color-border-primary, #d4d4d4);
        border-radius: var(--uds-border-radius-input, 8px);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }

      :host([state='error']) .field {
        border-color: var(--uds-color-border-error, #b42318);
      }

      :host([disabled]) .field {
        background: var(--uds-color-surface-interactive-disabled, #f5f5f5);
        border-color: transparent;
        cursor: not-allowed;
      }

      input {
        flex: 1 1 0;
        min-width: 0;
        border: 0;
        outline: none;
        background: transparent;
        padding: 0 var(--uds-space-075, 6px) 0 var(--uds-space-050, 4px);
        font: inherit;
        font-size: var(--uds-font-size-base, 16px);
        line-height: var(--uds-font-line-height-base, 1.5);
        color: var(--uds-color-text-primary, #171717);
      }

      input::placeholder {
        color: var(--uds-color-text-secondary, #525252);
      }

      :host([state='error']) input,
      :host([state='error']) input::placeholder {
        color: var(--uds-color-text-error, #b42318);
      }

      input:disabled {
        color: var(--uds-color-text-disabled-bold, #737373);
        cursor: not-allowed;
      }

      .icon {
        display: flex;
        align-items: center;
        padding: 0 2px;
        color: var(--uds-color-icon-secondary, #737373);
        flex-shrink: 0;
      }

      .icon.material-symbols-outlined {
        font-size: var(--uds-font-size-2xl, 24px);
      }

      .helper {
        display: flex;
        justify-content: space-between;
        gap: var(--uds-space-100, 8px);
        font-size: var(--uds-font-size-xs, 12px);
        line-height: var(--uds-font-line-height-xs, 1.2);
        color: var(--uds-color-text-secondary, #525252);
      }

      :host([state='error']) .helper {
        color: var(--uds-color-text-error, #b42318);
      }

      .counter {
        margin-left: auto;
        color: var(--uds-color-text-secondary, #525252);
        flex-shrink: 0;
      }
    `,
    css`
      .field:focus-within {
        box-shadow: 0 0 0 2px var(--uds-color-surface-white, #fff),
          0 0 0 4px var(--uds-color-border-outline-focus-visible, #2563eb);
      }
    `,
    focusRing,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.syncFormValue();
  }

  formResetCallback() {
    this.value = this.initialValue;
  }

  render() {
    const showHelper = this.helperText || this.maxLength !== undefined;

    return html`
      <div part="root" class="root">
        <label part="label" for=${this.fieldId}>
          ${this.label}<slot name="label"></slot>
          ${this.required ? html`<span part="required" class="required"></span>` : nothing}
        </label>
        <div part="field" class="field">
          ${this.leadingIcon ? html`<span part="leading-icon" class="icon material-symbols-outlined" aria-hidden="true">${this.leadingIcon}</span>` : nothing}
          <slot name="leading"></slot>
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
            aria-describedby=${showHelper ? this.helperId : nothing}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <slot name="trailing"></slot>
          ${this.trailingIcon ? html`<span part="trailing-icon" class="icon material-symbols-outlined" aria-hidden="true">${this.trailingIcon}</span>` : nothing}
        </div>
        ${showHelper
          ? html`
              <div part="helper" class="helper" id=${this.helperId}>
                <span><slot name="helper">${this.helperText}</slot></span>
                ${this.maxLength !== undefined ? html`<span part="counter" class="counter">${this.value.length}/${this.maxLength}</span>` : nothing}
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

  private syncFormValue() {
    this.internals?.setFormValue(this.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-text-input': UdsTextInputElement;
  }
}
