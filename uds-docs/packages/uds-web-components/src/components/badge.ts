import { LitElement, css, html } from 'lit';

import { hostInline } from '../styles';

export type UdsBadgeTone = 'info' | 'secondary' | 'success' | 'error' | 'warning';
export type UdsBadgeVariant = 'prominent' | 'subtle';
export type UdsBadgeSize = 'default' | 'sm';

export class UdsBadgeElement extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  tone: UdsBadgeTone = 'info';
  variant: UdsBadgeVariant = 'prominent';
  size: UdsBadgeSize = 'default';

  static styles = [
    hostInline,
    css`
      span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--uds-space-100, 8px);
        padding: var(--uds-space-050, 4px) var(--uds-space-100, 8px);
        border-radius: var(--uds-border-radius-container-sm, 4px);
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-regular, 400);
        line-height: var(--uds-font-line-height-base, 1.5);
        white-space: nowrap;
        background: var(--uds-color-surface-info, #1f6feb);
        color: var(--uds-color-text-inverse, #fff);
      }

      :host([size='sm']) span {
        gap: var(--uds-space-050, 4px);
        padding: var(--uds-space-025, 2px) var(--uds-space-050, 4px);
        font-size: var(--uds-font-size-xs, 12px);
        line-height: var(--uds-font-line-height-sm, 1.25);
      }

      :host([tone='secondary']) span {
        background: var(--uds-color-surface-bold, #d4d4d4);
        color: var(--uds-color-text-primary, #171717);
      }

      :host([tone='success']) span {
        background: var(--uds-color-surface-success, #067647);
      }

      :host([tone='error']) span {
        background: var(--uds-color-surface-error, #b42318);
      }

      :host([tone='warning']) span {
        background: var(--uds-color-surface-warning, #b54708);
      }

      :host([variant='subtle']) span {
        background: var(--uds-color-surface-info-subtle, #eff6ff);
        color: var(--uds-color-text-info, #175cd3);
      }

      :host([variant='subtle'][tone='secondary']) span {
        background: var(--uds-color-surface-alt, #f5f5f5);
        color: var(--uds-color-text-secondary, #525252);
      }

      :host([variant='subtle'][tone='success']) span {
        background: var(--uds-color-surface-success-subtle, #ecfdf3);
        color: var(--uds-color-text-success, #067647);
      }

      :host([variant='subtle'][tone='error']) span {
        background: var(--uds-color-surface-error-subtle, #fef3f2);
        color: var(--uds-color-text-error, #b42318);
      }

      :host([variant='subtle'][tone='warning']) span {
        background: var(--uds-color-surface-warning-subtle, #fffaeb);
        color: var(--uds-color-text-warning, #b54708);
      }
    `,
  ];

  render() {
    return html`<span part="badge"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-badge': UdsBadgeElement;
  }
}
