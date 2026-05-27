import { LitElement, css, html, nothing } from 'lit';

import { hostBlock, materialIconStyles } from '../styles';

/**
 * `<udc-nav-header>` — full top navigation bar with logo, title-area pill,
 * center search, "My Work" pill, and account button group.
 *
 * Renders the canonical anatomy in the shadow DOM. Composition slots are
 * provided for the logo glyph, title icon, badge, and the account button
 * group so consumers can customize without forking the CSS.
 *
 * Public attributes/properties:
 *   app-name        — page title text (default "Boardroom")
 *   title-icon      — Material Symbols glyph for the title area (default "dashboard")
 *   title-only      — boolean (renders the bare page title, no pill chrome)
 *   show-search     — boolean (default true)
 *   show-mywork     — boolean (default true)
 *   search-placeholder — placeholder text for the search input
 *   mywork-label    — label inside the My Work button (default "My Work")
 *   mywork-badge    — count badge inside the My Work button (default "")
 *   logo-icon       — Material Symbols glyph for the brand mark (default "apartment")
 *
 * Slots:
 *   logo            — overrides the default logo glyph
 *   title-icon      — overrides the default title icon (when not title-only)
 *   search          — overrides the entire search section (e.g. for autocomplete)
 *   mywork          — overrides the My Work button
 *   account         — overrides the default account button group
 */
export class UdsNavHeaderElement extends LitElement {
  static properties = {
    appName: { type: String, attribute: 'app-name', reflect: true },
    titleIcon: { type: String, attribute: 'title-icon', reflect: true },
    titleOnly: { type: Boolean, attribute: 'title-only', reflect: true },
    showSearch: { type: Boolean, attribute: 'show-search', reflect: true },
    showMywork: { type: Boolean, attribute: 'show-mywork', reflect: true },
    searchPlaceholder: { type: String, attribute: 'search-placeholder', reflect: true },
    myworkLabel: { type: String, attribute: 'mywork-label', reflect: true },
    myworkBadge: { type: String, attribute: 'mywork-badge', reflect: true },
    logoIcon: { type: String, attribute: 'logo-icon', reflect: true },
  };

  appName = 'Boardroom';
  titleIcon = 'dashboard';
  titleOnly = false;
  showSearch = true;
  showMywork = true;
  searchPlaceholder = 'Search or ask a question';
  myworkLabel = 'My Work';
  myworkBadge = '';
  logoIcon = 'apartment';

  /**
   * Full CSS port from `uds/components/nav-header/nav-header.css` on main.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-nav-header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        gap: var(--uds-space-300);
        padding: var(--uds-space-150) var(--uds-space-300);
        min-height: 76px;
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .udc-nav-header__left {
        display: flex;
        align-items: center;
        gap: var(--uds-space-200);
      }

      .udc-nav-header__center {
        max-width: 500px;
        width: 100%;
        justify-self: center;
      }

      .udc-nav-header__right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--uds-space-100);
      }

      /* Logo */
      .udc-nav-logo {
        width: 24px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--uds-color-icon-interactive);
      }

      .udc-nav-logo .material-symbols-outlined {
        font-size: 32px;
        line-height: 1;
      }

      /* Title area */
      .udc-nav-title-area {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-150);
        padding: var(--uds-space-100) var(--uds-space-150) var(--uds-space-100)
          var(--uds-space-200);
        height: 48px;
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-full);
        box-shadow: var(--uds-shadow-depth-100);
        white-space: nowrap;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
      }

      .udc-nav-title-area .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
        flex-shrink: 0;
      }

      .udc-nav-title-area__icon {
        color: var(--uds-color-icon-interactive);
      }

      .udc-nav-title-area__chevron {
        color: var(--uds-color-icon-primary);
      }

      :host([title-only]) .udc-nav-title-area {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: var(--uds-space-100) var(--uds-space-150);
        border-radius: var(--uds-border-radius-input);
        font-size: var(--uds-font-size-xl);
        line-height: var(--uds-font-line-height-xl);
      }

      :host([title-only]) .udc-nav-title-area .material-symbols-outlined {
        display: none;
      }

      /* Search */
      .udc-nav-search {
        display: flex;
        align-items: center;
        height: 48px;
        padding: var(--uds-space-075) var(--uds-space-075) var(--uds-space-075)
          var(--uds-space-100);
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-xl);
        box-shadow: var(--uds-shadow-depth-100);
        box-sizing: border-box;
      }

      .udc-nav-search .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
        color: var(--uds-color-icon-secondary);
        flex-shrink: 0;
        padding: 0 var(--uds-space-025);
      }

      .udc-nav-search__input {
        flex: 1 1 0%;
        min-width: 0;
        border: none;
        background: transparent;
        outline: none;
        padding: 0 var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
      }

      .udc-nav-search__input::placeholder {
        color: var(--uds-color-text-secondary);
      }

      /* My Work */
      .udc-nav-mywork {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-150);
        padding: var(--uds-space-100) var(--uds-space-250) var(--uds-space-100)
          var(--uds-space-200);
        height: 52px;
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-full);
        box-shadow: var(--uds-shadow-depth-100);
        cursor: pointer;
        white-space: nowrap;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        -webkit-appearance: none;
        appearance: none;
      }

      .udc-nav-mywork .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      }

      .udc-nav-mywork__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 var(--uds-space-050);
        background: var(--uds-color-surface-warning);
        color: var(--uds-color-text-inverse);
        border-radius: var(--uds-border-radius-container-sm);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-bold);
        flex-shrink: 0;
      }

      /* Account */
      .udc-nav-account {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-100) var(--uds-space-150);
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-full);
        box-shadow: var(--uds-shadow-depth-100);
      }

      .udc-nav-account ::slotted(button),
      .udc-nav-account button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: var(--uds-space-075);
        border: 0;
        border-radius: var(--uds-border-radius-container-full);
        background: transparent;
        color: var(--uds-color-icon-primary);
        cursor: pointer;
      }

      .udc-nav-account button:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-nav-account .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }
    `,
  ];

  render() {
    return html`
      <header class="udc-nav-header" part="header">
        <div class="udc-nav-header__left" part="left">
          <div class="udc-nav-logo" part="logo">
            <slot name="logo"
              ><span class="material-symbols-outlined">${this.logoIcon}</span></slot
            >
          </div>
          <div class="udc-nav-title-area" part="title-area">
            ${this.titleOnly
              ? nothing
              : html`
                  <span class="udc-nav-title-area__icon" aria-hidden="true">
                    <slot name="title-icon"
                      ><span class="material-symbols-outlined">${this.titleIcon}</span></slot
                    >
                  </span>
                `}
            <span class="udc-nav-title-area__label"
              ><slot name="title">${this.appName}</slot></span
            >
            ${this.titleOnly
              ? nothing
              : html`
                  <span
                    class="material-symbols-outlined udc-nav-title-area__chevron"
                    aria-hidden="true"
                    >keyboard_arrow_down</span
                  >
                `}
          </div>
        </div>
        ${this.showSearch
          ? html`
              <div class="udc-nav-header__center" part="center">
                <slot name="search">
                  <div class="udc-nav-search" part="search">
                    <span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                    <input
                      class="udc-nav-search__input"
                      part="search-input"
                      type="text"
                      placeholder=${this.searchPlaceholder || nothing}
                    />
                  </div>
                </slot>
              </div>
            `
          : nothing}
        <div class="udc-nav-header__right" part="right">
          ${this.showMywork
            ? html`
                <slot name="mywork">
                  <button class="udc-nav-mywork" part="mywork" type="button">
                    <span class="material-symbols-outlined" aria-hidden="true"
                      >notifications_active</span
                    >
                    ${this.myworkLabel}
                    ${this.myworkBadge
                      ? html`<span class="udc-nav-mywork__badge" part="mywork-badge"
                          >${this.myworkBadge}</span
                        >`
                      : nothing}
                  </button>
                </slot>
              `
            : nothing}
          <slot name="account">
            <div class="udc-nav-account" part="account">
              <button type="button" aria-label="Notifications">
                <span class="material-symbols-outlined">notifications</span>
              </button>
              <button type="button" aria-label="Settings">
                <span class="material-symbols-outlined">settings</span>
              </button>
              <button type="button" aria-label="Account">
                <span class="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </slot>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-nav-header': UdsNavHeaderElement;
  }
}
