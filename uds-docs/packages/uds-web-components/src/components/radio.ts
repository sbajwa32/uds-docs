import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, hostInline } from '../styles';

export interface UdsRadioChangeDetail {
  checked: boolean;
  value: string;
}

export type UdsRadioState = 'default' | 'error';

/**
 * `<udc-radio-group>` — vertical group of `<udc-radio>` options.
 *
 * Public attributes/properties:
 *   name        — shared form-field name applied to all radios
 *   value       — currently selected value
 *   label       — group legend text (or `legend` slot)
 *
 * Events:
 *   udc-change  — fires when the selected value changes; detail: { value }
 */
export class UdsRadioGroupElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };

  name = '';
  value = '';
  label = '';

  private readonly internals: ElementInternals | null;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
  }

  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-radio-group {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-100);
      }

      .udc-radio-group__legend {
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-sm);
        color: var(--uds-color-text-primary);
        margin-bottom: var(--uds-space-050);
        padding: 0;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('udc-radio-change', this.handleRadioChange as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('udc-radio-change', this.handleRadioChange as EventListener);
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this.internals?.setFormValue(this.value);
      this.syncRadios();
    }
    if (changed.has('name')) this.syncRadios();
  }

  protected firstUpdated() {
    this.syncRadios();
  }

  render() {
    return html`
      <fieldset class="udc-radio-group" part="group">
        ${this.label
          ? html`<legend class="udc-radio-group__legend" part="legend">
              <slot name="legend">${this.label}</slot>
            </legend>`
          : html`<slot name="legend"></slot>`}
        <slot></slot>
      </fieldset>
    `;
  }

  private handleRadioChange = (event: Event) => {
    const detail = (event as CustomEvent<UdsRadioChangeDetail>).detail;
    if (!detail) return;
    this.value = detail.value;
    emitUdsEvent<{ value: string }>(this, 'udc-change', { value: this.value });
  };

  private syncRadios() {
    this.querySelectorAll<UdsRadioElement>('udc-radio').forEach((radio) => {
      if (this.name) radio.name = this.name;
      radio.checked = radio.value === this.value;
    });
  }
}

/**
 * `<udc-radio>` — single radio option for use inside `<udc-radio-group>`.
 *
 * Public attributes/properties:
 *   name        — form field name (usually set by the parent group)
 *   value       — value emitted when this radio is selected
 *   label       — visible label text (or default slot content)
 *   checked     — boolean
 *   disabled    — boolean
 *   required    — boolean
 *   state       — "default" | "error"
 *
 * Events:
 *   udc-radio-change — fires when this radio is selected; detail: { checked, value }
 *                      (intended for the parent group; consumers usually listen
 *                      on the group's `udc-change` instead).
 */
export class UdsRadioElement extends LitElement {
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    state: { type: String, reflect: true },
  };

  name = '';
  value = '';
  label = '';
  checked = false;
  disabled = false;
  required = false;
  state: UdsRadioState = 'default';

  /**
   * Full CSS port from `uds/components/radio/radio.css` on main.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-radio {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        cursor: pointer;
        user-select: none;
        position: relative;
      }

      .udc-radio input[type='radio'] {
        position: absolute;
        width: 24px;
        height: 24px;
        opacity: 0;
        margin: 0;
        cursor: pointer;
        z-index: var(--uds-z-index-base, 1);
      }

      /* Control — 24×24 outer, 20×20 ring with 2px stroke */
      .udc-radio__control {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .udc-radio__control::before {
        content: '';
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--uds-color-border-primary);
        background: transparent;
        transition: border-color 120ms ease;
      }

      .udc-radio__control::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: transparent;
        transition: background-color 120ms ease;
      }

      .udc-radio__label {
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      .udc-radio__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
        align-self: flex-start;
        margin-top: 2px;
      }

      /* SELECTED */
      .udc-radio input[type='radio']:checked ~ .udc-radio__control::after {
        background: var(--uds-color-icon-interactive);
      }

      .udc-radio input[type='radio']:checked ~ .udc-radio__label {
        color: var(--uds-color-text-interactive);
      }

      /* HOVER */
      .udc-radio:hover .udc-radio__control::before {
        border-color: var(--uds-color-border-interactive);
      }

      /* FOCUS-VISIBLE */
      .udc-radio input[type='radio']:focus-visible ~ .udc-radio__control {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: 1px;
        border-radius: 50%;
      }

      /* DISABLED */
      :host([disabled]) .udc-radio {
        cursor: not-allowed;
      }

      .udc-radio input[type='radio']:disabled ~ .udc-radio__control::before {
        border-color: var(--uds-color-border-disabled);
      }

      .udc-radio input[type='radio']:disabled ~ .udc-radio__control::after {
        background: transparent;
      }

      .udc-radio input[type='radio']:disabled ~ .udc-radio__label {
        color: var(--uds-color-text-disabled);
      }

      /* ERROR STATE */
      :host([state='error']) .udc-radio__control::before {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-radio__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([state='error'])
        .udc-radio
        input[type='radio']:checked
        ~ .udc-radio__control::after {
        background: var(--uds-color-icon-error);
      }
    `,
  ];

  render() {
    return html`
      <label class="udc-radio" part="root">
        <input
          part="input"
          type="radio"
          name=${this.name || nothing}
          value=${this.value}
          .checked=${this.checked}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.state === 'error' ? 'true' : nothing}
          @change=${this.handleChange}
        />
        <span class="udc-radio__control" part="control"></span>
        <span class="udc-radio__label" part="label"><slot>${this.label}</slot></span>
        ${this.required
          ? html`<span class="udc-radio__required" part="required"></span>`
          : nothing}
      </label>
    `;
  }

  private handleChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.checked = input.checked;
    if (this.checked) {
      emitUdsEvent<UdsRadioChangeDetail>(this, 'udc-radio-change', {
        checked: true,
        value: this.value,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-radio-group': UdsRadioGroupElement;
    'udc-radio': UdsRadioElement;
  }
}
