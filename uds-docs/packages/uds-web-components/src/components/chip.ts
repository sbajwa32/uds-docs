import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostInline, materialIconStyles } from '../styles';

export type UdsChipVariant = 'default' | 'filter' | 'input' | 'dropdown';

export interface UdsChipToggleDetail {
  selected: boolean;
  variant: UdsChipVariant;
}

export interface UdsDismissDetail {
  reason: 'click' | 'keyboard';
}

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

  static styles = [
    hostInline,
    materialIconStyles,
    css`
      button {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100, 8px);
        padding: var(--uds-space-050, 4px) var(--uds-space-100, 8px);
        border: 1px solid var(--uds-color-border-primary, #d4d4d4);
        border-radius: var(--uds-border-radius-container, 999px);
        background: var(--uds-color-surface-interactive-none, transparent);
        color: var(--uds-color-text-primary, #171717);
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        font: inherit;
        font-size: var(--uds-font-size-base, 16px);
        line-height: var(--uds-font-line-height-base, 1.5);
        appearance: none;
        outline: none;
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
      }

      button:hover:not(:disabled) {
        background: var(--uds-color-surface-interactive-subtle-hover, rgb(31 111 235 / 10%));
      }

      button:active:not(:disabled) {
        background: var(--uds-color-surface-interactive-subtle-active, rgb(31 111 235 / 16%));
      }

      button[aria-selected='true'] {
        background: var(--uds-color-surface-interactive-active, #174ea6);
        border-color: var(--uds-color-surface-interactive-active, #174ea6);
        color: var(--uds-color-text-inverse, #fff);
      }

      button[aria-selected='true']:hover:not(:disabled) {
        background: var(--uds-color-surface-interactive-hover, #1a5dcc);
        border-color: var(--uds-color-surface-interactive-hover, #1a5dcc);
      }

      button:disabled {
        color: var(--uds-color-text-disabled, #a3a3a3);
        border-color: var(--uds-color-border-disabled, #d4d4d4);
        cursor: not-allowed;
      }

      .icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
    `,
    focusRing,
  ];

  render() {
    const trailing = this.trailingIcon || (this.variant === 'dropdown' ? 'expand_more' : this.removable ? 'close' : '');

    return html`
      <button
        part="chip"
        type="button"
        ?disabled=${this.disabled}
        aria-selected=${this.isSelectable ? String(this.selected) : nothing}
        @click=${this.handleClick}
        @keydown=${this.handleKeydown}
      >
        ${this.leadingIcon ? html`<span part="leading-icon" class="icon material-symbols-outlined" aria-hidden="true">${this.leadingIcon}</span>` : nothing}
        <span part="label"><slot></slot></span>
        ${trailing ? html`<span part="trailing-icon" class="icon material-symbols-outlined" aria-hidden="true">${trailing}</span>` : nothing}
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
    if ((event.key === 'Delete' || event.key === 'Backspace') && (this.removable || this.variant === 'input')) {
      event.preventDefault();
      this.dismiss('keyboard');
    }
  }

  private dismiss(reason: UdsDismissDetail['reason']) {
    const event = emitUdsEvent<UdsDismissDetail>(this, 'udc-dismiss', { reason }, { cancelable: true });
    if (!event.defaultPrevented) this.remove();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-chip': UdsChipElement;
  }
}
