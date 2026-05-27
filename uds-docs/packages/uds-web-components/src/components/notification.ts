import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export type UdsNotificationTone = 'info' | 'success' | 'error' | 'warning';
export type UdsNotificationVariant = 'subtle' | 'prominent';

export interface UdsNotificationDismissDetail {
  reason: 'click' | 'keyboard';
}

/**
 * `<udc-notification>` — inline message banner with tone, prominent fill,
 * inline style, optional close button, and slot-overridable icon.
 *
 * Public attributes/properties:
 *   tone         — "info" | "success" | "error" | "warning"
 *   variant      — "subtle" (default) | "prominent"
 *   inline       — boolean (no background, no padding)
 *   dismissible  — boolean (renders close button)
 *
 * Slots:
 *   icon         — replace the default Material Symbols leading icon
 *   default      — message content
 *
 * Events:
 *   udc-dismiss  — fires when the close button is clicked (cancelable)
 */
export class UdsNotificationElement extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    inline: { type: Boolean, reflect: true },
    dismissible: { type: Boolean, reflect: true },
  };

  tone: UdsNotificationTone = 'info';
  variant: UdsNotificationVariant = 'subtle';
  inline = false;
  dismissible = false;

  /**
   * Full CSS port from `uds/components/notification/notification.css` on main.
   * Subtle (default) and prominent styles × info/success/error/warning tones,
   * plus the inline variant.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      :host([hidden]) {
        display: none;
      }

      .udc-notification {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-150) var(--uds-space-200);
        border-radius: var(--uds-border-radius-container-sm, 4px);
        overflow: hidden;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        letter-spacing: 0;
      }

      .udc-notification__icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .udc-notification__icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      .udc-notification__text {
        flex: 1 1 0%;
        min-width: 0;
      }

      .udc-notification__close {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0 0 0 auto;
        background: transparent;
        border: 0;
        color: currentColor;
        cursor: pointer;
        opacity: 0.6;
        flex-shrink: 0;
        -webkit-appearance: none;
        appearance: none;
        transition: opacity 120ms ease;
        font: inherit;
      }

      .udc-notification__close:hover {
        opacity: 1;
      }

      .udc-notification__close:focus-visible {
        opacity: 1;
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
        border-radius: var(--uds-border-radius-container-sm);
      }

      .udc-notification__close .material-symbols-outlined {
        font-size: var(--uds-font-size-xl, 20px);
        line-height: 1;
      }

      /* ----- INFO (default) — subtle ----- */
      .udc-notification {
        background-color: var(--uds-color-surface-info-subtle);
        color: var(--uds-color-text-info);
      }

      .udc-notification__icon {
        color: var(--uds-color-icon-info);
      }

      /* ----- SUCCESS — subtle ----- */
      :host([tone='success']) .udc-notification {
        background-color: var(--uds-color-surface-success-subtle);
        color: var(--uds-color-text-success);
      }

      :host([tone='success']) .udc-notification__icon {
        color: var(--uds-color-icon-success);
      }

      /* ----- ERROR — subtle ----- */
      :host([tone='error']) .udc-notification {
        background-color: var(--uds-color-surface-error-subtle);
        color: var(--uds-color-text-error);
      }

      :host([tone='error']) .udc-notification__icon {
        color: var(--uds-color-icon-error);
      }

      /* ----- WARNING — subtle ----- */
      :host([tone='warning']) .udc-notification {
        background-color: var(--uds-color-surface-warning-subtle);
        color: var(--uds-color-text-warning);
      }

      :host([tone='warning']) .udc-notification__icon {
        color: var(--uds-color-icon-warning);
      }

      /* ----- PROMINENT — filled background, inverse text/icon ----- */
      :host([variant='prominent']) .udc-notification {
        color: var(--uds-color-text-inverse);
        background-color: var(--uds-color-surface-info);
      }

      :host([variant='prominent']) .udc-notification__icon,
      :host([variant='prominent']) .udc-notification__close {
        color: var(--uds-color-text-inverse);
      }

      :host([variant='prominent'][tone='success']) .udc-notification {
        background-color: var(--uds-color-surface-success);
      }

      :host([variant='prominent'][tone='error']) .udc-notification {
        background-color: var(--uds-color-surface-error);
      }

      :host([variant='prominent'][tone='warning']) .udc-notification {
        background-color: var(--uds-color-surface-warning);
      }

      /* ----- INLINE — no background, no padding ----- */
      :host([inline]) .udc-notification {
        background-color: transparent;
        padding: 0;
      }
    `,
  ];

  render() {
    const role = this.tone === 'error' ? 'alert' : 'status';
    return html`
      <div class="udc-notification" part="notification" role=${role}>
        <span class="udc-notification__icon" part="icon" aria-hidden="true">
          <slot name="icon"
            ><span class="material-symbols-outlined">${this.defaultIcon}</span></slot
          >
        </span>
        <span class="udc-notification__text" part="text"><slot></slot></span>
        ${this.dismissible
          ? html`
              <button
                class="udc-notification__close"
                part="close"
                type="button"
                aria-label="Dismiss"
                @click=${this.handleDismiss}
              >
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            `
          : nothing}
      </div>
    `;
  }

  private get defaultIcon() {
    if (this.tone === 'success') return 'check_circle';
    if (this.tone === 'error') return 'error_outline';
    if (this.tone === 'warning') return 'warning_amber';
    return 'info';
  }

  private handleDismiss() {
    const event = emitUdsEvent<UdsNotificationDismissDetail>(
      this,
      'udc-dismiss',
      { reason: 'click' },
      { cancelable: true },
    );
    if (!event.defaultPrevented) this.hidden = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-notification': UdsNotificationElement;
  }
}
