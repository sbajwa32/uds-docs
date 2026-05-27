import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline } from '../styles';

export interface UdsCheckboxChangeDetail {
  checked: boolean;
  value: string;
}

export class UdsCheckboxElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    state: { type: String, reflect: true },
  };

  name = '';
  value = 'on';
  checked = false;
  indeterminate = false;
  required = false;
  disabled = false;
  state: 'default' | 'error' = 'default';

  private readonly internals: ElementInternals | null;
  private initialChecked = false;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
    this.initialChecked = this.checked;
  }

  static styles = [
    hostInline,
    css`
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100, 8px);
        cursor: pointer;
        user-select: none;
        position: relative;
      }

      input {
        position: absolute;
        width: 24px;
        height: 24px;
        opacity: 0;
        margin: 0;
        cursor: pointer;
        z-index: 1;
      }

      .control {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .control::before {
        content: '';
        display: block;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1px solid var(--uds-color-border-primary, #d4d4d4);
        background: transparent;
        transition: background-color 120ms ease, border-color 120ms ease;
      }

      .control::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 13px;
        height: 10px;
        transform: translate(-50%, -50%);
        opacity: 0;
        background: var(--uds-color-icon-inverse, #fff);
        transition: opacity 120ms ease;
        clip-path: polygon(14% 44%, 0 59%, 39% 100%, 100% 14%, 86% 0, 37% 68%);
      }

      input:checked ~ .control::before {
        background: var(--uds-color-surface-interactive-default, #1f6feb);
        border-color: var(--uds-color-surface-interactive-default, #1f6feb);
      }

      input:checked ~ .control::after {
        opacity: 1;
      }

      :host([indeterminate]) .control::after {
        width: 10px;
        height: 2px;
        clip-path: none;
        opacity: 1;
      }

      label:hover .control::before {
        border-color: var(--uds-color-border-interactive, #1f6feb);
      }

      input:focus-visible ~ .control {
        outline: 2px solid var(--uds-color-border-outline-focus-visible, #2563eb);
        outline-offset: 1px;
        border-radius: 6px;
      }

      .label {
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-medium, 500);
        line-height: var(--uds-font-line-height-base, 1.5);
        color: var(--uds-color-text-primary, #171717);
      }

      .required {
        width: var(--uds-space-050, 4px);
        height: var(--uds-space-050, 4px);
        border-radius: 50%;
        background: var(--uds-color-icon-error, #b42318);
        flex-shrink: 0;
      }

      :host([state='error']) .control::before {
        background: var(--uds-color-surface-interactive-red-subtle, #fef3f2);
        border-color: var(--uds-color-border-error, #b42318);
      }

      :host([state='error']) .label {
        color: var(--uds-color-text-error, #b42318);
        font-weight: var(--uds-font-weight-bold, 700);
      }

      :host([disabled]) label {
        cursor: not-allowed;
      }

      input:disabled ~ .control::before {
        background: var(--uds-color-surface-interactive-disabled, #f5f5f5);
        border-color: var(--uds-color-border-disabled, #d4d4d4);
      }

      input:disabled ~ .label {
        color: var(--uds-color-text-disabled, #a3a3a3);
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('checked') || changed.has('value')) this.syncFormValue();
  }

  formResetCallback() {
    this.checked = this.initialChecked;
    this.indeterminate = false;
  }

  render() {
    return html`
      <label part="root">
        <input
          part="input"
          type="checkbox"
          name=${this.name || nothing}
          value=${this.value}
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.state === 'error' ? 'true' : nothing}
          @change=${this.handleChange}
        />
        <span part="control" class="control"></span>
        <span part="label" class="label"><slot></slot></span>
        ${this.required ? html`<span part="required" class="required"></span>` : nothing}
      </label>
    `;
  }

  private handleChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    emitUdsEvent<UdsCheckboxChangeDetail>(this, 'udc-change', {
      checked: this.checked,
      value: this.value,
    });
  }

  private syncFormValue() {
    this.internals?.setFormValue(this.checked ? this.value : null);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-checkbox': UdsCheckboxElement;
  }
}
