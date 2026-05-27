import { LitElement, css, html, nothing } from 'lit';

import { hostBlock, hostInline, materialIconStyles } from '../styles';

/**
 * `<udc-nav-vertical>` — sidebar / rail navigation container that hosts
 * `<udc-nav-item>` children.
 *
 * Public attributes/properties:
 *   variant       — "list" (default, full-width buttons) | "rail" (compact, icon-over-label)
 *   leading-icons — boolean, default true; set false for text-only list mode
 *   aria-label    — accessibility label for the nav
 */
export class UdsNavVerticalElement extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    leadingIcons: { type: Boolean, attribute: 'leading-icons', reflect: true },
  };

  variant: 'list' | 'rail' = 'list';
  leadingIcons = true;

  /**
   * Full CSS port from `uds/components/nav-vertical/nav-vertical.css` on main.
   * Styles apply to slotted `<udc-nav-item>` children via `::slotted()`.
   */
  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-nav-vertical {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
      }

      :host([variant='rail']) .udc-nav-vertical {
        flex-direction: row;
        gap: var(--uds-space-100);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.syncChildren();
  }

  updated() {
    this.syncChildren();
  }

  render() {
    return html`
      <nav
        class="udc-nav-vertical"
        part="nav"
        aria-label=${this.getAttribute('aria-label') || 'Navigation'}
      >
        <slot @slotchange=${this.syncChildren}></slot>
      </nav>
    `;
  }

  private syncChildren = () => {
    const items = Array.from(this.querySelectorAll<UdsNavItemElement>('udc-nav-item'));
    items.forEach((item) => {
      if (this.variant) item.setAttribute('variant', this.variant);
      if (!this.leadingIcons) {
        item.setAttribute('no-icon', '');
      } else {
        item.removeAttribute('no-icon');
      }
    });
  };
}

/**
 * `<udc-nav-item>` — individual nav button rendered inside `<udc-nav-vertical>`.
 *
 * Public attributes/properties:
 *   href       — link target; when set, renders as `<a>` instead of `<button>`
 *   icon       — Material Symbols name for the leading icon
 *   current    — boolean, applies `aria-current="page"` and the selected styling
 *   disabled   — boolean
 *   trailing-icon — Material Symbols name for an optional trailing icon
 *   variant    — "list" (default) | "rail" — set by the parent automatically
 *   no-icon    — boolean — set by the parent when `leading-icons="false"`
 */
export class UdsNavItemElement extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
    icon: { type: String, reflect: true },
    current: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
    variant: { type: String, reflect: true },
    noIcon: { type: Boolean, attribute: 'no-icon', reflect: true },
  };

  href = '';
  icon = '';
  current = false;
  disabled = false;
  trailingIcon = '';
  variant: 'list' | 'rail' = 'list';
  noIcon = false;

  /**
   * Full CSS port for both list and rail variants of the nav button.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      /* LIST variant — full-width row */
      :host(:not([variant='rail'])) .udc-nav-button {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-150) var(--uds-space-200) var(--uds-space-150)
          var(--uds-space-150);
        height: 48px;
        border: 1px solid transparent;
        border-radius: var(--uds-border-radius-input);
        background: var(--uds-color-surface-interactive-none, transparent);
        cursor: pointer;
        text-decoration: none;
        position: relative;
        box-sizing: border-box;
        transition: background-color 120ms ease, color 120ms ease;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        width: 100%;
        font-style: inherit;
        -webkit-appearance: none;
        appearance: none;
        text-align: left;
      }

      :host([no-icon]) .udc-nav-button {
        padding-left: var(--uds-space-200);
      }

      .udc-nav-button .udc-nav-button__leading-icon,
      .udc-nav-button .udc-nav-button__leading-icon .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
        color: var(--uds-color-icon-primary);
      }

      .udc-nav-button__label {
        flex: 1 1 0%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .udc-nav-button__trailing {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: var(--uds-color-icon-secondary);
      }

      .udc-nav-button__trailing .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
      }

      :host(:not([current]):not([disabled])) .udc-nav-button:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
      }

      :host(:not([disabled])) .udc-nav-button:active {
        background: var(--uds-color-surface-interactive-subtle-active);
      }

      :host([current]) .udc-nav-button {
        background: var(--uds-color-surface-interactive-active);
        color: var(--uds-color-text-inverse);
        border-color: transparent;
      }

      :host([current]) .udc-nav-button .material-symbols-outlined {
        color: var(--uds-color-icon-inverse);
      }

      .udc-nav-button:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }

      :host([disabled]) .udc-nav-button {
        color: var(--uds-color-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      :host([disabled]) .udc-nav-button .material-symbols-outlined {
        color: var(--uds-color-icon-disabled);
      }

      /* RAIL variant — compact, icon over label, active indicator bar on the left */
      :host([variant='rail']) .udc-nav-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--uds-space-075);
        padding: var(--uds-space-075);
        border: none;
        border-radius: var(--uds-border-radius-input);
        background: var(--uds-color-surface-interactive-none, transparent);
        cursor: pointer;
        text-decoration: none;
        position: relative;
        transition: background-color 120ms ease, color 120ms ease;
        font-family: var(--uds-font-family);
        font-size: 10px;
        font-weight: var(--uds-font-weight-medium);
        line-height: 1;
        color: var(--uds-color-text-interactive);
        text-align: center;
        width: auto;
      }

      :host([variant='rail']) .udc-nav-button .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
        color: var(--uds-color-icon-interactive);
      }

      :host([variant='rail']) .udc-nav-button:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
        color: var(--uds-color-text-interactive-hover);
      }

      :host([variant='rail']) .udc-nav-button:hover .material-symbols-outlined {
        color: var(--uds-color-text-interactive-hover);
      }

      :host([variant='rail'][current]) .udc-nav-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 2px;
        border-radius: var(--uds-border-radius-container-full);
        background: var(--uds-color-surface-interactive-default);
      }

      :host([variant='rail'][current]) .udc-nav-button {
        color: var(--uds-color-text-interactive);
        background: transparent;
      }
    `,
  ];

  render() {
    const hasIcon = !this.noIcon && this.icon;
    const inner = html`
      ${hasIcon
        ? html`<span class="udc-nav-button__leading-icon" aria-hidden="true"
            ><span class="material-symbols-outlined">${this.icon}</span></span
          >`
        : nothing}
      <span class="udc-nav-button__label" part="label"><slot></slot></span>
      ${this.trailingIcon
        ? html`<span class="udc-nav-button__trailing" aria-hidden="true"
            ><span class="material-symbols-outlined">${this.trailingIcon}</span></span
          >`
        : nothing}
    `;

    return this.href
      ? html`<a
          class="udc-nav-button"
          part="link"
          href=${this.href}
          aria-current=${this.current ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          >${inner}</a
        >`
      : html`<button
          class="udc-nav-button"
          part="button"
          type="button"
          aria-current=${this.current ? 'page' : nothing}
          ?disabled=${this.disabled}
          >${inner}</button
        >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-nav-vertical': UdsNavVerticalElement;
    'udc-nav-item': UdsNavItemElement;
  }
}
