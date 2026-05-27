import { LitElement, css, html, nothing } from 'lit';

import { hostBlock } from '../styles';

/**
 * `<udc-data-view>` — generic data-view card with header + body + actions
 * slots. Use for record-style or summary layouts where Data Table is too
 * dense.
 *
 * Public attributes/properties:
 *   heading      — heading text (or `header` slot)
 *
 * Slots:
 *   header       — overrides the heading (use for title + sub-title + filters)
 *   default      — body content (cards, grids, summary blocks)
 *   actions      — footer actions, right-aligned
 */
export class UdsDataViewElement extends LitElement {
  static properties = {
    heading: { type: String, reflect: true },
  };

  heading = '';

  /**
   * Card-style data view. The original `data-view.css` on main was
   * placeholder-only; this fills in a token-bound default that matches
   * the spec (header, body, actions slots).
   */
  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-data-view {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-200);
        padding: var(--uds-space-300);
        background: var(--uds-color-surface-main);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-md, 12px);
        color: var(--uds-color-text-primary);
      }

      .udc-data-view__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--uds-space-200);
        padding-bottom: var(--uds-space-200);
        border-bottom: 1px solid var(--uds-color-border-secondary);
      }

      .udc-data-view__heading {
        margin: 0;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-xl, 20px);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-400, 28px);
        color: var(--uds-color-text-primary);
      }

      .udc-data-view__body {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-200);
        min-height: 64px;
      }

      .udc-data-view__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--uds-space-100);
        padding-top: var(--uds-space-200);
        border-top: 1px solid var(--uds-color-border-secondary);
      }

      .udc-data-view__actions:empty {
        display: none;
      }
    `,
  ];

  render() {
    return html`
      <section class="udc-data-view" part="root">
        <header class="udc-data-view__header" part="header">
          <slot name="header"
            >${this.heading
              ? html`<h2 class="udc-data-view__heading" part="heading">${this.heading}</h2>`
              : nothing}</slot
          >
        </header>
        <div class="udc-data-view__body" part="body">
          <slot></slot>
        </div>
        <footer class="udc-data-view__actions" part="actions">
          <slot name="actions"></slot>
        </footer>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-data-view': UdsDataViewElement;
  }
}
