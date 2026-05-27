import { LitElement, css, html, nothing } from 'lit';

import { hostInline } from '../styles';

export type UdsSpacerSize = '050' | '075' | '100' | '150' | '200' | '300' | '400' | '500' | '600';

/**
 * `<udc-spacer>` — transparent whitespace element. Defaults to 100×100
 * (matching the Figma default); accepts a `size` attribute mapped to UDS
 * `--uds-space-*` tokens.
 *
 * Public attributes/properties:
 *   size  — token step ("050" | "075" | "100" | "150" | "200" | "300" |
 *           "400" | "500" | "600"). Applied to both width and height.
 */
export class UdsSpacerElement extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  size: UdsSpacerSize | '' = '';

  /**
   * Full CSS port from `uds/components/spacer/spacer.css` on main.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: block;
        background: transparent;
        flex-shrink: 0;
        width: 100px;
        height: 100px;
      }

      :host([size='050']) {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
      }
      :host([size='075']) {
        width: var(--uds-space-075);
        height: var(--uds-space-075);
      }
      :host([size='100']) {
        width: var(--uds-space-100);
        height: var(--uds-space-100);
      }
      :host([size='150']) {
        width: var(--uds-space-150);
        height: var(--uds-space-150);
      }
      :host([size='200']) {
        width: var(--uds-space-200);
        height: var(--uds-space-200);
      }
      :host([size='300']) {
        width: var(--uds-space-300);
        height: var(--uds-space-300);
      }
      :host([size='400']) {
        width: var(--uds-space-400);
        height: var(--uds-space-400);
      }
      :host([size='500']) {
        width: var(--uds-space-500);
        height: var(--uds-space-500);
      }
      :host([size='600']) {
        width: var(--uds-space-600);
        height: var(--uds-space-600);
      }
    `,
  ];

  render() {
    return html`<span part="spacer" aria-hidden="true">${nothing}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-spacer': UdsSpacerElement;
  }
}
