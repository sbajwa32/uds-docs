import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, hostInline, materialIconStyles } from '../styles';

export interface UdsListItemSelectDetail {
  value: string;
  selected: boolean;
}

/**
 * `<udc-list>` — list container for `<udc-list-item>` children.
 *
 * Public attributes/properties:
 *   selectable    — boolean (when true, the list uses role="listbox" and
 *                   children get role="option")
 */
export class UdsListElement extends LitElement {
  static properties = {
    selectable: { type: Boolean, reflect: true },
  };

  selectable = false;

  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        font-family: var(--uds-font-family);
      }
    `,
  ];

  render() {
    return html`
      <div
        class="udc-list"
        part="list"
        role=${this.selectable ? 'listbox' : 'list'}
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * `<udc-list-item>` — single list row with optional leading/trailing icons,
 * hover/active/selected/focus states.
 *
 * Public attributes/properties:
 *   value         — string emitted in `udc-list-item-select`
 *   selected      — boolean (applies the selected styling + `aria-selected`)
 *   disabled      — boolean
 *   leading-icon  — Material Symbols name before the label
 *   trailing-icon — Material Symbols name after the label
 *
 * Events:
 *   udc-list-item-select — fires when the item is clicked
 */
export class UdsListItemElement extends LitElement {
  static properties = {
    value: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
  };

  value = '';
  selected = false;
  disabled = false;
  leadingIcon = '';
  trailingIcon = '';

  /**
   * Full CSS port from `uds/components/list/list.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-list-item {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100);
        height: var(--uds-space-600);
        padding: var(--uds-space-150) var(--uds-space-200);
        border-radius: var(--uds-border-radius-input);
        border: 1px solid transparent;
        background-color: var(--uds-color-surface-interactive-none, transparent);
        cursor: pointer;
        outline: none;
        position: relative;
        transition: background-color 120ms ease;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        width: 100%;
        text-align: left;
        -webkit-appearance: none;
        appearance: none;
        font-style: inherit;
      }

      .udc-list-item__label {
        flex: 1 1 0%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .udc-list-item__leading-icon,
      .udc-list-item__trailing-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--uds-color-icon-primary);
      }

      .udc-list-item__leading-icon .material-symbols-outlined,
      .udc-list-item__trailing-icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      :host([leading-icon]:not([leading-icon=''])) .udc-list-item {
        padding-left: var(--uds-space-150);
      }

      :host([trailing-icon]:not([trailing-icon=''])) .udc-list-item {
        padding-right: var(--uds-space-150);
      }

      .udc-list-item:hover {
        background-color: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-list-item:active {
        background-color: var(--uds-color-surface-interactive-subtle-active);
      }

      :host([selected]) .udc-list-item {
        background-color: var(--uds-color-surface-interactive-active);
        color: var(--uds-color-text-inverse);
      }

      :host([selected]) .udc-list-item__leading-icon,
      :host([selected]) .udc-list-item__trailing-icon {
        color: var(--uds-color-icon-inverse);
      }

      .udc-list-item:focus-visible {
        background-color: var(--uds-color-surface-interactive-subtle);
        box-shadow: 0 0 0 3px var(--uds-color-border-outline-focus-visible);
      }

      :host([disabled]) .udc-list-item {
        opacity: 0.55;
        cursor: not-allowed;
        pointer-events: none;
      }
    `,
  ];

  render() {
    const inList = this.closest('udc-list') as { selectable?: boolean } | null;
    const role = inList?.selectable ? 'option' : 'listitem';

    return html`
      <button
        class="udc-list-item"
        part="item"
        type="button"
        role=${role}
        aria-selected=${role === 'option' ? String(this.selected) : nothing}
        tabindex=${this.disabled ? '-1' : '0'}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        ${this.leadingIcon
          ? html`<span class="udc-list-item__leading-icon" part="leading-icon" aria-hidden="true"
              ><span class="material-symbols-outlined">${this.leadingIcon}</span></span
            >`
          : nothing}
        <span class="udc-list-item__label" part="label"><slot></slot></span>
        ${this.trailingIcon
          ? html`<span class="udc-list-item__trailing-icon" part="trailing-icon" aria-hidden="true"
              ><span class="material-symbols-outlined">${this.trailingIcon}</span></span
            >`
          : nothing}
      </button>
    `;
  }

  private handleClick() {
    if (this.disabled) return;
    this.selected = !this.selected;
    emitUdsEvent<UdsListItemSelectDetail>(this, 'udc-list-item-select', {
      value: this.value,
      selected: this.selected,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-list': UdsListElement;
    'udc-list-item': UdsListItemElement;
  }
}
