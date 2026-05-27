import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline } from '../styles';

export interface UdsCheckboxChangeDetail {
  checked: boolean;
  value: string;
}

export type UdsCheckboxState = 'default' | 'error';

/**
 * `<udc-checkbox>` — accessible checkbox with label, required dot, error
 * state, and indeterminate support.
 *
 * Public attributes/properties:
 *   name           — form field name
 *   value          — form value when checked (default "on")
 *   label          — visible label text (or slot content)
 *   checked        — boolean
 *   indeterminate  — boolean (mid-state, e.g. tristate "select all")
 *   required       — boolean (renders required dot after label)
 *   disabled       — boolean
 *   state          — "default" | "error"
 *
 * Slots:
 *   default        — label content (replaces `label` attribute)
 *
 * Events:
 *   udc-change     — fires when checked changes; detail: { checked, value }
 *   change         — native change event (re-dispatched for bubble+compose)
 */
export class UdsCheckboxElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    state: { type: String, reflect: true },
  };

  name = '';
  value = 'on';
  label = '';
  checked = false;
  indeterminate = false;
  required = false;
  disabled = false;
  state: UdsCheckboxState = 'default';

  private readonly internals: ElementInternals | null;
  private initialChecked = false;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
    this.initialChecked = this.checked;
  }

  /**
   * Full CSS port from `uds/components/checkbox/checkbox.css` on main.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      /* Root — horizontal flex, gap = space/100 (8px) */
      .udc-checkbox {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        cursor: pointer;
        user-select: none;
        position: relative;
      }

      /* Hide native input but keep it accessible */
      .udc-checkbox input[type='checkbox'] {
        position: absolute;
        width: 24px;
        height: 24px;
        opacity: 0;
        margin: 0;
        cursor: pointer;
        z-index: var(--uds-z-index-base, 1);
      }

      /* Control — visible checkbox box */
      .udc-checkbox__control {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .udc-checkbox__control::before {
        content: '';
        display: block;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1px solid var(--uds-color-border-primary);
        background: transparent;
        transition: background-color 120ms ease, border-color 120ms ease;
      }

      /* Checkmark — hidden by default */
      .udc-checkbox__control::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 13px;
        height: 10px;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 120ms ease;
        background: var(--uds-color-icon-inverse);
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 10'%3E%3Cpath d='M1 5l3.5 3.5L12 1' stroke='white' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 10'%3E%3Cpath d='M1 5l3.5 3.5L12 1' stroke='white' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        mask-size: contain;
        mask-repeat: no-repeat;
      }

      /* Label */
      .udc-checkbox__label {
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      /* Required dot */
      .udc-checkbox__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
        align-self: flex-start;
        margin-top: 2px;
      }

      /* CHECKED — inner box fills with interactive color, checkmark visible */
      .udc-checkbox input[type='checkbox']:checked ~ .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-default);
        border-color: var(--uds-color-surface-interactive-default);
      }

      .udc-checkbox input[type='checkbox']:checked ~ .udc-checkbox__control::after {
        opacity: 1;
      }

      /* INDETERMINATE — horizontal bar instead of checkmark */
      :host([indeterminate]) .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-default);
        border-color: var(--uds-color-surface-interactive-default);
      }

      :host([indeterminate]) .udc-checkbox__control::after {
        opacity: 1;
        width: 10px;
        height: 2px;
        mask-image: none;
        -webkit-mask-image: none;
      }

      /* HOVER */
      .udc-checkbox:hover .udc-checkbox__control::before {
        border-color: var(--uds-color-border-interactive);
      }

      /* FOCUS-VISIBLE */
      .udc-checkbox input[type='checkbox']:focus-visible ~ .udc-checkbox__control {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: 1px;
        border-radius: 6px;
      }

      /* DISABLED */
      :host([disabled]) .udc-checkbox {
        cursor: not-allowed;
      }

      .udc-checkbox input[type='checkbox']:disabled ~ .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-disabled);
        border-color: var(--uds-color-border-disabled);
      }

      .udc-checkbox input[type='checkbox']:disabled:checked ~ .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-disabled);
        border-color: var(--uds-color-border-disabled);
      }

      .udc-checkbox input[type='checkbox']:disabled ~ .udc-checkbox__label {
        color: var(--uds-color-text-disabled);
      }

      /* ERROR STATE */
      :host([state='error']) .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-red-subtle);
        border-color: var(--uds-color-border-error);
      }

      :host([state='error'])
        .udc-checkbox
        input[type='checkbox']:checked
        ~ .udc-checkbox__control::before {
        background: var(--uds-color-surface-interactive-red-subtle);
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-checkbox__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
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
      <label class="udc-checkbox" part="root">
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
        <span class="udc-checkbox__control" part="control"></span>
        <span class="udc-checkbox__label" part="label"><slot>${this.label}</slot></span>
        ${this.required
          ? html`<span class="udc-checkbox__required" part="required"></span>`
          : nothing}
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
