import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline, materialIconStyles } from '../styles';

export type UdsChipVariant = 'default' | 'filter' | 'input' | 'dropdown';

export interface UdsChipToggleDetail {
  selected: boolean;
  variant: UdsChipVariant;
}

export interface UdsDismissDetail {
  reason: 'click' | 'keyboard';
}

/**
 * `<udc-chip>` — interactive chip used for filters, input tokens, and
 * dropdown triggers.
 *
 * Public attributes/properties:
 *   variant       — "default" | "filter" | "input" | "dropdown"
 *   selected      — boolean; filter/dropdown variants toggle on click
 *   disabled      — boolean
 *   removable     — boolean (renders close icon, fires `udc-dismiss`)
 *   leading-icon  — Material Symbols name before the label
 *   trailing-icon — Material Symbols name after the label (override)
 *
 * Events:
 *   udc-chip-toggle  — fires when filter/dropdown chip toggles selected
 *   udc-dismiss      — fires when an input chip is dismissed (cancelable)
 */
export class UdsChipElement extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    removable: { type: Boolean, reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
  };

  variant: UdsChipVariant = 'default';
  selected = false;
  disabled = false;
  removable = false;
  leadingIcon = '';
  trailingIcon = '';

  /**
   * Full CSS port from `uds/components/chip/chip.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-050) var(--uds-space-100);
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-container, 999px);
        background-color: var(--uds-color-surface-interactive-none, transparent);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        outline: none;
        transition: background-color 120ms ease, border-color 120ms ease,
          color 120ms ease;
        -webkit-appearance: none;
        appearance: none;
      }

      .udc-chip__label {
        text-align: center;
      }

      .udc-chip__leading-icon,
      .udc-chip__trailing-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .udc-chip__leading-icon .material-symbols-outlined,
      .udc-chip__trailing-icon .material-symbols-outlined {
        font-size: var(--uds-font-size-lg, 18px);
        line-height: 1;
      }

      /* Hover */
      .udc-chip:hover:not(:disabled) {
        background-color: var(--uds-color-surface-interactive-subtle-hover);
      }

      /* Active */
      .udc-chip:active:not(:disabled) {
        background-color: var(--uds-color-surface-interactive-subtle-active);
      }

      /* Focus */
      .udc-chip:focus-visible {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-main),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      /* Selected */
      :host([selected]) .udc-chip {
        background-color: var(--uds-color-surface-interactive-active);
        border-color: var(--uds-color-surface-interactive-active);
        color: var(--uds-color-text-inverse);
      }

      :host([selected]) .udc-chip:hover:not(:disabled) {
        background-color: var(--uds-color-surface-interactive-hover);
        border-color: var(--uds-color-surface-interactive-hover);
      }

      :host([selected]) .udc-chip__leading-icon,
      :host([selected]) .udc-chip__trailing-icon {
        color: var(--uds-color-icon-inverse);
      }

      /* Disabled */
      .udc-chip:disabled {
        color: var(--uds-color-text-disabled);
        border-color: var(--uds-color-border-disabled);
        cursor: not-allowed;
      }

      /* Dropdown variant — slightly smaller trailing icon */
      :host([variant='dropdown'])
        .udc-chip__trailing-icon
        .material-symbols-outlined {
        font-size: var(--uds-font-size-md, 16px);
      }
    `,
  ];

  render() {
    const trailing =
      this.trailingIcon ||
      (this.variant === 'dropdown'
        ? 'keyboard_arrow_down'
        : this.removable || this.variant === 'input'
          ? 'close'
          : '');

    return html`
      <button
        class="udc-chip"
        part="chip"
        type="button"
        ?disabled=${this.disabled}
        aria-selected=${this.isSelectable ? String(this.selected) : nothing}
        aria-pressed=${this.isSelectable ? String(this.selected) : nothing}
        @click=${this.handleClick}
        @keydown=${this.handleKeydown}
      >
        ${this.leadingIcon
          ? html`<span
              class="udc-chip__leading-icon"
              part="leading-icon"
              aria-hidden="true"
              ><span class="material-symbols-outlined">${this.leadingIcon}</span></span
            >`
          : nothing}
        <span class="udc-chip__label" part="label"><slot></slot></span>
        ${trailing
          ? html`<span
              class="udc-chip__trailing-icon"
              part="trailing-icon"
              aria-hidden="true"
              ><span class="material-symbols-outlined">${trailing}</span></span
            >`
          : nothing}
      </button>
    `;
  }

  private get isSelectable() {
    return this.variant === 'filter' || this.variant === 'dropdown';
  }

  private handleClick() {
    if (this.disabled) return;
    if (this.variant === 'input' && this.removable) {
      this.dismiss('click');
      return;
    }
    if (!this.isSelectable) return;
    this.selected = !this.selected;
    emitUdsEvent<UdsChipToggleDetail>(this, 'udc-chip-toggle', {
      selected: this.selected,
      variant: this.variant,
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.disabled) return;
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      (this.removable || this.variant === 'input')
    ) {
      event.preventDefault();
      this.dismiss('keyboard');
    }
  }

  private dismiss(reason: UdsDismissDetail['reason']) {
    const event = emitUdsEvent<UdsDismissDetail>(
      this,
      'udc-dismiss',
      { reason },
      { cancelable: true },
    );
    if (!event.defaultPrevented) this.remove();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-chip': UdsChipElement;
  }
}
