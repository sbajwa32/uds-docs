import { LitElement, css, html, nothing } from 'lit';

import { hostInline } from '../styles';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * `<udc-breadcrumb>` — breadcrumb trail with optional pill container.
 *
 * Public attributes/properties:
 *   items       — array of `{ label, href? }` rendered as an ordered list
 *                 (last item without href becomes `aria-current="page"`)
 *   frameless   — boolean (no container background/border/padding)
 *
 * Slots:
 *   default     — overrides the rendered list (consumers can provide custom
 *                 `<ol>` markup if needed)
 */
export class UdsBreadcrumbElement extends LitElement {
  static properties = {
    items: { type: Array },
    frameless: { type: Boolean, reflect: true },
  };

  items: BreadcrumbItem[] = [];
  frameless = false;

  /**
   * Full CSS port from `uds/components/breadcrumb/breadcrumb.css` on main.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-breadcrumb {
        display: inline-flex;
        align-items: center;
        padding: var(--uds-space-150) var(--uds-space-300);
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-tertiary);
        border-radius: var(--uds-border-radius-container-xl);
      }

      :host([frameless]) .udc-breadcrumb {
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 0;
      }

      ol {
        display: flex;
        align-items: center;
        gap: var(--uds-space-200);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: var(--uds-space-200);
      }

      li:not(:last-child)::after {
        content: '';
        display: inline-block;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        background: var(--uds-color-icon-secondary);
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z'/%3E%3C/svg%3E");
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z'/%3E%3C/svg%3E");
        mask-size: contain;
        mask-repeat: no-repeat;
      }

      a {
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-interactive-neutral);
        text-decoration: none;
        letter-spacing: 0;
      }

      a:hover {
        text-decoration: underline;
      }

      a:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: 2px;
        border-radius: 2px;
      }

      li[aria-current='page'] {
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }
    `,
  ];

  render() {
    return html`
      <nav class="udc-breadcrumb" part="nav" aria-label="Breadcrumb">
        ${this.items.length
          ? html`
              <ol>
                ${this.items.map((item, i) => {
                  const isLast = i === this.items.length - 1;
                  return html`
                    <li aria-current=${isLast ? 'page' : nothing}>
                      ${item.href && !isLast
                        ? html`<a href=${item.href}>${item.label}</a>`
                        : item.label}
                    </li>
                  `;
                })}
              </ol>
            `
          : html`<slot></slot>`}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-breadcrumb': UdsBreadcrumbElement;
  }
}
