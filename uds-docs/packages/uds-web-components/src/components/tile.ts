import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline, materialIconStyles } from '../styles';

export interface UdsTileToggleDetail {
  selected: boolean;
}

/**
 * `<udc-tile>` — selectable card with label, body lines, required dot,
 * and an optional trailing chevron.
 *
 * Public attributes/properties:
 *   label        — heading text (or `label` slot)
 *   selected     — boolean
 *   disabled     — boolean
 *   required     — boolean (renders required dot beside the label)
 *   no-chevron   — boolean (hides the trailing chevron)
 *
 * Slots:
 *   label        — overrides the `label` attribute
 *   default      — body content (renders below the label)
 *
 * Events:
 *   udc-tile-toggle — fires when the tile is clicked; detail: { selected }
 */
export class UdsTileElement extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    noChevron: { type: Boolean, attribute: 'no-chevron', reflect: true },
  };

  label = '';
  selected = false;
  disabled = false;
  required = false;
  noChevron = false;

  /**
   * Full CSS port from `uds/components/tile/tile.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-tile {
        display: flex;
        align-items: center;
        gap: var(--uds-space-200);
        padding: var(--uds-space-200);
        border-radius: var(--uds-border-radius-input);
        border: 1px solid var(--uds-color-border-primary);
        background-color: var(--uds-color-surface-main);
        overflow: hidden;
        cursor: pointer;
        transition: background-color 120ms ease, border-color 120ms ease;
        outline: none;
        position: relative;
        font-family: var(--uds-font-family);
        color: var(--uds-color-text-primary);
        width: 100%;
        font: inherit;
        text-align: left;
        -webkit-appearance: none;
        appearance: none;
      }

      .udc-tile__content {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-100);
        flex: 1 1 0%;
        min-width: 0;
      }

      .udc-tile__label {
        display: flex;
        align-items: center;
        gap: var(--uds-space-050);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-bold);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .udc-tile__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-text-error);
        flex-shrink: 0;
      }

      .udc-tile__body {
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular, 400);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
      }

      .udc-tile__chevron {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--uds-color-icon-secondary);
      }

      .udc-tile__chevron .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      /* Hover */
      .udc-tile:hover:not(:disabled) {
        background-color: var(--uds-color-surface-interactive-subtle);
      }

      /* Selected */
      :host([selected]) .udc-tile {
        background-color: var(--uds-color-surface-info-subtle);
        border: 2px solid var(--uds-color-border-interactive);
      }

      /* Focus */
      .udc-tile:focus-visible {
        border-color: var(--uds-color-border-primary);
        box-shadow: 0 0 0 3px var(--uds-color-border-outline-focus-visible);
      }

      /* Disabled */
      .udc-tile:disabled,
      :host([disabled]) .udc-tile {
        background-color: var(--uds-color-surface-main);
        border-color: var(--uds-color-border-disabled);
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
      }

      :host([disabled]) .udc-tile__chevron {
        display: none;
      }
    `,
  ];

  render() {
    return html`
      <button
        class="udc-tile"
        part="tile"
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${String(this.selected)}
        @click=${this.handleClick}
      >
        <span class="udc-tile__content" part="content">
          <span class="udc-tile__label" part="label">
            <slot name="label">${this.label}</slot>
            ${this.required
              ? html`<span class="udc-tile__required" part="required"></span>`
              : nothing}
          </span>
          <span class="udc-tile__body" part="body"><slot></slot></span>
        </span>
        ${this.noChevron
          ? nothing
          : html`<span class="udc-tile__chevron" part="chevron" aria-hidden="true"
              ><span class="material-symbols-outlined">chevron_right</span></span
            >`}
      </button>
    `;
  }

  private handleClick() {
    if (this.disabled) return;
    this.selected = !this.selected;
    emitUdsEvent<UdsTileToggleDetail>(this, 'udc-tile-toggle', { selected: this.selected });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-tile': UdsTileElement;
  }
}
