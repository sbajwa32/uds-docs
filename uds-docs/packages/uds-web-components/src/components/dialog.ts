import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

/**
 * `<udc-dialog>` — modal dialog with backdrop, header (title + close),
 * body (default slot), and footer (`actions` slot for buttons).
 *
 * Public attributes/properties:
 *   open      — boolean (controls visibility + focus trap)
 *   heading   — title text (or `heading` slot)
 *
 * Slots:
 *   heading   — overrides the `heading` attribute
 *   default   — body content
 *   actions   — footer buttons (right-aligned)
 *
 * Events:
 *   udc-close — fires when the dialog is dismissed (backdrop, Escape, close button)
 */
export class UdsDialogElement extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String, reflect: true },
  };

  open = false;
  heading = '';

  /**
   * Full CSS port from `uds/components/dialog/dialog.css` on main.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: contents;
        font-family: var(--uds-font-family);
      }

      :host(:not([open])) .udc-dialog-backdrop {
        display: none;
      }

      .udc-dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--uds-z-index-modal, 1300);
        background-color: var(--uds-overlay-backdrop, rgb(0 0 0 / 45%));
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .udc-dialog {
        display: flex;
        flex-direction: column;
        min-width: 300px;
        width: 480px;
        max-width: calc(100vw - 48px);
        max-height: calc(100vh - 48px);
        background-color: var(--uds-color-surface-main);
        border-radius: var(--uds-border-radius-container-xl, 24px);
        box-shadow: var(--uds-shadow-depth-500);
        overflow: hidden;
        font-family: var(--uds-font-family);
        color: var(--uds-color-text-primary);
      }

      .udc-dialog__header {
        display: flex;
        align-items: center;
        gap: var(--uds-space-150);
        padding: var(--uds-space-300) var(--uds-space-300) var(--uds-space-200);
        background-color: var(--uds-color-surface-subtle);
        border-bottom: 1px solid var(--uds-color-border-interactive);
      }

      .udc-dialog__title {
        flex: 1 1 0%;
        min-width: 0;
        margin: 0;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-xl, 20px);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-400, 28px);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      .udc-dialog__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: var(--uds-space-075);
        background: var(--uds-color-surface-interactive-none, transparent);
        border: none;
        border-radius: var(--uds-border-radius-input);
        color: var(--uds-color-icon-secondary);
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 120ms ease;
        -webkit-appearance: none;
        appearance: none;
        font: inherit;
      }

      .udc-dialog__close:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-dialog__close:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }

      .udc-dialog__close .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      .udc-dialog__body {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-300);
        padding: var(--uds-space-200) var(--uds-space-300);
        overflow-y: auto;
        flex: 1 1 auto;
      }

      .udc-dialog__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--uds-space-100);
        padding: var(--uds-space-200) var(--uds-space-300)
          var(--uds-space-300);
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('open') && this.open) {
      queueMicrotask(() => this.focusFirstElement());
    }
  }

  render() {
    return html`
      <div
        class="udc-dialog-backdrop"
        part="backdrop"
        @click=${this.handleBackdrop}
        @keydown=${this.handleKeydown}
      >
        <section
          class="udc-dialog"
          part="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.heading || nothing}
        >
          <header class="udc-dialog__header" part="header">
            <h2 class="udc-dialog__title" part="title">
              <slot name="heading">${this.heading}</slot>
            </h2>
            <button
              class="udc-dialog__close"
              part="close"
              type="button"
              aria-label="Close"
              @click=${this.close}
            >
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </header>
          <div class="udc-dialog__body" part="body">
            <slot></slot>
          </div>
          <footer class="udc-dialog__footer" part="footer">
            <slot name="actions"></slot>
          </footer>
        </section>
      </div>
    `;
  }

  private handleBackdrop = (event: MouseEvent) => {
    const backdrop = event.currentTarget as HTMLElement;
    if (event.target === backdrop) this.close();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.focusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private focusFirstElement() {
    this.focusableElements()[0]?.focus();
  }

  private focusableElements(): HTMLElement[] {
    const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const shadowItems = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(selectors));
    const slottedItems = Array.from(this.querySelectorAll<HTMLElement>(selectors));
    return [...shadowItems, ...slottedItems].filter(
      (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
    );
  }

  /** Close the dialog and emit `udc-close`. */
  close() {
    this.open = false;
    emitUdsEvent(this, 'udc-close', {});
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-dialog': UdsDialogElement;
  }
}
