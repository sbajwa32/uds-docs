import { LitElement, css, html } from 'lit';

import { hostBlock } from '../styles';

export type UdsDividerPadding = 'sm' | 'md' | 'lg' | 'xl';

/**
 * `<udc-divider>` — horizontal rule with token-driven padding above/below.
 *
 * Public attributes/properties:
 *   padding   — "sm" (default, 4px) | "md" (8px) | "lg" (12px) | "xl" (16px)
 */
export class UdsDividerElement extends LitElement {
  static properties = {
    padding: { type: String, reflect: true },
  };

  padding: UdsDividerPadding = 'sm';

  /**
   * Full CSS port from `uds/components/divider/divider.css` on main.
   */
  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
      }

      hr {
        display: block;
        width: 100%;
        height: 0;
        border: none;
        border-top: 1px solid var(--uds-color-border-tertiary);
        border-radius: var(--uds-border-radius-full, 999px);
        margin: var(--uds-space-050) 0;
      }

      :host([padding='md']) hr {
        margin: var(--uds-space-100) 0;
      }

      :host([padding='lg']) hr {
        margin: var(--uds-space-150) 0;
      }

      :host([padding='xl']) hr {
        margin: var(--uds-space-200) 0;
      }
    `,
  ];

  render() {
    return html`<hr part="divider" role="separator" aria-orientation="horizontal" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-divider': UdsDividerElement;
  }
}
