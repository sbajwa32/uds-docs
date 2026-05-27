import { LitElement, css, html, nothing } from 'lit';

import { hostInline, materialIconStyles } from '../styles';

/**
 * `<udc-link>` — text link with optional leading or trailing icon, current-
 * page indicator, disabled state, and new-window affordance.
 *
 * Public attributes/properties:
 *   href           — destination URL
 *   target         — anchor target (e.g. "_blank")
 *   rel            — anchor rel attribute
 *   current        — boolean, renders aria-current="page"
 *   disabled       — boolean
 *   new-window     — boolean (sets target/rel + renders an open_in_new icon)
 *   leading-icon   — Material Symbols name before the label
 *   trailing-icon  — Material Symbols name after the label
 */
export class UdsLinkElement extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
    target: { type: String, reflect: true },
    rel: { type: String, reflect: true },
    current: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    newWindow: { type: Boolean, attribute: 'new-window', reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
  };

  href = '';
  target = '';
  rel = '';
  current = false;
  disabled = false;
  newWindow = false;
  leadingIcon = '';
  trailingIcon = '';

  /**
   * Full CSS port from `uds/components/link/link.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-link {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-interactive);
        text-decoration: underline;
        text-underline-offset: 0.18em;
        cursor: pointer;
      }

      .udc-link:hover {
        color: var(--uds-color-text-interactive-hover);
      }

      .udc-link:active,
      :host([current]) .udc-link {
        color: var(--uds-color-text-interactive-active);
      }

      .udc-link:focus-visible {
        outline: var(--uds-border-width-200, 2px) solid
          var(--uds-color-border-outline-focus-visible);
        outline-offset: var(--uds-space-050);
        border-radius: var(--uds-border-radius-container-sm);
      }

      :host([disabled]) .udc-link {
        color: var(--uds-color-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      .udc-link .material-symbols-outlined {
        font-size: var(--uds-font-size-md, 18px);
        line-height: 1;
      }
    `,
  ];

  render() {
    const isNewWindow = this.newWindow;
    const resolvedTarget = this.target || (isNewWindow ? '_blank' : nothing);
    const resolvedRel = this.rel || (isNewWindow ? 'noopener noreferrer' : nothing);
    const trailingIcon = this.trailingIcon || (isNewWindow ? 'open_in_new' : '');

    return html`
      <a
        class="udc-link"
        part="link"
        href=${this.disabled ? nothing : this.href || nothing}
        target=${resolvedTarget}
        rel=${resolvedRel}
        aria-current=${this.current ? 'page' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
      >
        ${this.leadingIcon
          ? html`<span
              class="material-symbols-outlined"
              part="leading-icon"
              aria-hidden="true"
              >${this.leadingIcon}</span
            >`
          : nothing}
        <slot></slot>
        ${trailingIcon
          ? html`<span
              class="material-symbols-outlined"
              part="trailing-icon"
              aria-hidden="true"
              >${trailingIcon}</span
            >`
          : nothing}
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-link': UdsLinkElement;
  }
}
