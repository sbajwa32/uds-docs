import { LitElement, css, html, nothing } from 'lit';

import { hostInline, materialIconStyles } from '../styles';

export type UdsIconWrapperSize = '16' | '20' | '24' | '32' | '48' | '64';
export type UdsIconWrapperColor =
  | 'primary'
  | 'secondary'
  | 'interactive'
  | 'success'
  | 'error'
  | 'warning';

/**
 * `<udc-icon-wrapper>` — fixed-size container that holds a single icon
 * (SVG, img, or Material Symbols glyph). The inner icon is sized to fit
 * the padded area.
 *
 * Public attributes/properties:
 *   icon   — Material Symbols name (renders the glyph automatically)
 *   size   — "16" | "20" | "24" (default) | "32" | "48" | "64"
 *   color  — icon color token: "primary" | "secondary" | "interactive" |
 *            "success" | "error" | "warning"
 *
 * Slots:
 *   default — overrides the `icon` attribute (use for custom SVG / img)
 */
export class UdsIconWrapperElement extends LitElement {
  static properties = {
    icon: { type: String, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
  };

  icon = '';
  size: UdsIconWrapperSize = '24';
  color: UdsIconWrapperColor | '' = '';

  /**
   * Full CSS port from `uds/components/icon-wrapper/icon-wrapper.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        padding: 2px;
        --_icon-size: 20px;
      }

      :host([size='16']) {
        width: 16px;
        height: 16px;
        padding: 1px;
        --_icon-size: 14px;
      }
      :host([size='20']) {
        width: 20px;
        height: 20px;
        padding: 2px;
        --_icon-size: 16px;
      }
      :host([size='32']) {
        width: 32px;
        height: 32px;
        padding: 3px;
        --_icon-size: 26px;
      }
      :host([size='48']) {
        width: 48px;
        height: 48px;
        padding: 4px;
        --_icon-size: 40px;
      }
      :host([size='64']) {
        width: 64px;
        height: 64px;
        padding: 5px;
        --_icon-size: 54px;
      }

      :host([color='primary']) {
        color: var(--uds-color-icon-primary);
      }
      :host([color='secondary']) {
        color: var(--uds-color-icon-secondary);
      }
      :host([color='interactive']) {
        color: var(--uds-color-icon-interactive);
      }
      :host([color='success']) {
        color: var(--uds-color-icon-success);
      }
      :host([color='error']) {
        color: var(--uds-color-icon-error);
      }
      :host([color='warning']) {
        color: var(--uds-color-icon-warning);
      }

      ::slotted(svg),
      ::slotted(img) {
        display: block;
        width: 100%;
        height: 100%;
        flex-shrink: 0;
      }

      .material-symbols-outlined {
        font-size: var(--_icon-size);
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ];

  render() {
    return this.icon
      ? html`<span class="material-symbols-outlined" aria-hidden="true">${this.icon}</span>`
      : html`<slot>${nothing}</slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-icon-wrapper': UdsIconWrapperElement;
  }
}
