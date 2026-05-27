import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostBlock, materialIconStyles } from '../styles';

export type UdsNotificationTone = 'info' | 'success' | 'error' | 'warning';
export type UdsNotificationVariant = 'subtle' | 'prominent';

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

  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host([hidden]) {
        display: none;
      }

      .notification {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100, 8px);
        padding: var(--uds-space-150, 12px) var(--uds-space-200, 16px);
        border-radius: var(--uds-border-radius-container-sm, 4px);
        overflow: hidden;
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-medium, 500);
        line-height: var(--uds-font-line-height-base, 1.5);
        background: var(--uds-color-surface-info-subtle, #eff6ff);
        color: var(--uds-color-text-info, #175cd3);
      }

      :host([inline]) .notification {
        background: transparent;
        padding: 0;
      }

      :host([tone='success']) .notification {
        background: var(--uds-color-surface-success-subtle, #ecfdf3);
        color: var(--uds-color-text-success, #067647);
      }

      :host([tone='error']) .notification {
        background: var(--uds-color-surface-error-subtle, #fef3f2);
        color: var(--uds-color-text-error, #b42318);
      }

      :host([tone='warning']) .notification {
        background: var(--uds-color-surface-warning-subtle, #fffaeb);
        color: var(--uds-color-text-warning, #b54708);
      }

      :host([variant='prominent']) .notification {
        background: var(--uds-color-surface-info, #1f6feb);
        color: var(--uds-color-text-inverse, #fff);
      }

      :host([variant='prominent'][tone='success']) .notification {
        background: var(--uds-color-surface-success, #067647);
      }

      :host([variant='prominent'][tone='error']) .notification {
        background: var(--uds-color-surface-error, #b42318);
      }

      :host([variant='prominent'][tone='warning']) .notification {
        background: var(--uds-color-surface-warning, #b54708);
      }

      .icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .icon.material-symbols-outlined {
        font-size: var(--uds-font-size-2xl, 24px);
      }

      .message {
        flex: 1 1 0;
        min-width: 0;
      }

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0 0 0 auto;
        background: transparent;
        border: 0;
        color: currentColor;
        cursor: pointer;
        opacity: 0.7;
        flex-shrink: 0;
        appearance: none;
        outline: none;
        transition: opacity 120ms ease;
      }

      button:hover {
        opacity: 1;
      }
    `,
    focusRing,
  ];

  render() {
    const role = this.tone === 'error' ? 'alert' : 'status';
    return html`
      <div part="notification" class="notification" role=${role}>
        <slot name="icon">
          <span part="icon" class="icon material-symbols-outlined" aria-hidden="true">${this.defaultIcon}</span>
        </slot>
        <span part="message" class="message"><slot></slot></span>
        ${this.dismissible
          ? html`
              <button part="dismiss-button" type="button" aria-label="Dismiss" @click=${this.handleDismiss}>
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            `
          : nothing}
      </div>
    `;
  }

  private get defaultIcon() {
    if (this.tone === 'success') return 'check_circle';
    if (this.tone === 'error') return 'error';
    if (this.tone === 'warning') return 'warning';
    return 'info';
  }

  private handleDismiss() {
    const event = emitUdsEvent(this, 'udc-dismiss', { reason: 'click' as const }, { cancelable: true });
    if (!event.defaultPrevented) this.hidden = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-notification': UdsNotificationElement;
  }
}
