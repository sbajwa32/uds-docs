import { LitElement, css, html } from 'lit';

import { hostInline } from '../styles';

export type UdsTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * `<udc-tooltip>` — accessible tooltip that wraps a trigger and shows a
 * popover on hover / focus.
 *
 * Public attributes/properties:
 *   text      — tooltip text (or use the default slot)
 *   position  — "top" (default) | "bottom" | "left" | "right"
 *   open      — boolean; forced-open state (overrides hover/focus)
 *
 * Slots:
 *   trigger   — the interactive element the tooltip describes
 *   default   — tooltip content (overrides `text`)
 */
export class UdsTooltipElement extends LitElement {
  static properties = {
    text: { type: String, reflect: true },
    position: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  text = '';
  position: UdsTooltipPosition = 'top';
  open = false;

  /**
   * Full CSS port from `uds/components/tooltip/tooltip.css` on main.
   * Light surface tooltip with shadow-depth-300, hover/focus-driven
   * visibility, and 4 position options.
   */
  static styles = [
    hostInline,
    css`
      :host {
        position: relative;
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-tooltip {
        position: absolute;
        bottom: calc(100% + var(--uds-space-100));
        left: 50%;
        transform: translateX(-50%);
        max-width: 250px;
        padding: var(--uds-space-150) var(--uds-space-200);
        background-color: var(--uds-color-surface-main);
        border-radius: var(--uds-border-radius-container);
        box-shadow: var(--uds-shadow-depth-300);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        white-space: normal;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 150ms ease, visibility 150ms ease;
        z-index: var(--uds-z-index-tooltip, 1100);
      }

      :host([position='bottom']) .udc-tooltip {
        bottom: auto;
        top: calc(100% + var(--uds-space-100));
      }

      :host([position='left']) .udc-tooltip {
        bottom: auto;
        top: 50%;
        left: auto;
        right: calc(100% + var(--uds-space-100));
        transform: translateY(-50%);
      }

      :host([position='right']) .udc-tooltip {
        bottom: auto;
        top: 50%;
        left: calc(100% + var(--uds-space-100));
        transform: translateY(-50%);
      }

      :host(:hover) .udc-tooltip,
      :host(:focus-within) .udc-tooltip,
      :host([open]) .udc-tooltip {
        opacity: 1;
        visibility: visible;
      }
    `,
  ];

  render() {
    return html`
      <slot name="trigger"></slot>
      <span class="udc-tooltip" part="tooltip" role="tooltip">
        <slot>${this.text}</slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-tooltip': UdsTooltipElement;
  }
}
