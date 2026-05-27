import { LitElement, css, html, nothing } from 'lit';

import { hostInline } from '../styles';

export type UdsLabelVariant = 'default' | 'disabled' | 'error' | 'interactive' | 'success';
export type UdsLabelSize = 'default' | 'sm';
export type UdsLabelAlign = 'start' | 'middle' | 'right';

/**
 * `<udc-label>` — text label with required dot, sm size, variant colors,
 * alignment, and prominent (bold) weight.
 *
 * Public attributes/properties:
 *   for          — associates with a form control by id
 *   variant      — "default" | "disabled" | "error" | "interactive" | "success"
 *   size         — "default" | "sm"
 *   align        — "start" | "middle" | "right"
 *   required     — boolean (renders required dot after content)
 *   prominent    — boolean (bold weight)
 *   fill-frame   — boolean (full-width display)
 *   multiline    — boolean (allows wrapping up to 320px)
 */
export class UdsLabelElement extends LitElement {
  static properties = {
    for: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    align: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    prominent: { type: Boolean, reflect: true },
    fillFrame: { type: Boolean, attribute: 'fill-frame', reflect: true },
    multiline: { type: Boolean, reflect: true },
  };

  for = '';
  variant: UdsLabelVariant = 'default';
  size: UdsLabelSize = 'default';
  align: UdsLabelAlign = 'start';
  required = false;
  prominent = false;
  fillFrame = false;
  multiline = false;

  /**
   * Full CSS port from `uds/components/label/label.css` on main.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-sm);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
      }

      :host([size='sm']) .udc-label {
        font-size: var(--uds-font-size-xs);
        line-height: var(--uds-font-line-height-xs);
      }

      :host([prominent]) .udc-label {
        font-weight: var(--uds-font-weight-bold);
      }

      :host([align='middle']) .udc-label {
        justify-content: center;
        text-align: center;
      }

      :host([align='right']) .udc-label {
        justify-content: flex-end;
        text-align: right;
      }

      :host([fill-frame]) {
        display: flex;
        width: 100%;
      }

      :host([fill-frame]) .udc-label {
        display: flex;
        width: 100%;
      }

      :host([variant='disabled']) .udc-label {
        color: var(--uds-color-text-disabled);
      }

      :host([variant='error']) .udc-label {
        color: var(--uds-color-text-error);
      }

      :host([variant='interactive']) .udc-label {
        color: var(--uds-color-text-interactive);
      }

      :host([variant='success']) .udc-label {
        color: var(--uds-color-text-success);
      }

      :host([multiline]) .udc-label {
        align-items: flex-start;
        max-width: 320px;
        white-space: normal;
      }

      .udc-label__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: var(--uds-border-radius-container-full, 999px);
        background: var(--uds-color-surface-error);
        flex: 0 0 auto;
      }
    `,
  ];

  render() {
    return html`
      <label class="udc-label" part="label" for=${this.for || nothing}>
        <slot></slot>
        ${this.required
          ? html`<span
              class="udc-label__required"
              part="required"
              aria-hidden="true"
            ></span>`
          : nothing}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-label': UdsLabelElement;
  }
}
