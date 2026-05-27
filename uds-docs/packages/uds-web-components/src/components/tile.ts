import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostInline, materialIconStyles } from '../styles';

export interface UdsTileToggleDetail {
  selected: boolean;
}

export class UdsTileElement extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
    description: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    noChevron: { type: Boolean, attribute: 'no-chevron', reflect: true },
  };

  label = '';
  description = '';
  selected = false;
  disabled = false;
  required = false;
  noChevron = false;

  static styles = [
    hostInline,
    materialIconStyles,
    css`
      button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--uds-space-200, 16px);
        padding: var(--uds-space-200, 16px);
        border-radius: var(--uds-border-radius-input, 8px);
        border: 1px solid var(--uds-color-border-primary, #d4d4d4);
        background: var(--uds-color-surface-main, #fff);
        color: var(--uds-color-text-primary, #171717);
        cursor: pointer;
        overflow: hidden;
        position: relative;
        font: inherit;
        text-align: left;
        appearance: none;
        outline: none;
        transition: background-color 120ms ease, border-color 120ms ease;
      }

      button:hover:not(:disabled) {
        background: var(--uds-color-surface-interactive-subtle, rgb(31 111 235 / 8%));
      }

      button[aria-pressed='true'] {
        background: var(--uds-color-surface-info-subtle, #eff6ff);
        border: 2px solid var(--uds-color-border-interactive, #1f6feb);
      }

      button:disabled {
        background: var(--uds-color-surface-main, #fff);
        border-color: var(--uds-color-border-disabled, #d4d4d4);
        opacity: 0.5;
        cursor: not-allowed;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-100, 8px);
        flex: 1 1 0;
        min-width: 0;
      }

      .label {
        display: flex;
        align-items: center;
        gap: var(--uds-space-050, 4px);
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-bold, 700);
        line-height: var(--uds-font-line-height-base, 1.5);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .required {
        width: var(--uds-space-050, 4px);
        height: var(--uds-space-050, 4px);
        border-radius: 50%;
        background: var(--uds-color-text-error, #b42318);
        flex-shrink: 0;
      }

      .description {
        font-size: var(--uds-font-size-base, 16px);
        line-height: var(--uds-font-line-height-base, 1.5);
      }

      .chevron {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--uds-color-icon-secondary, #737373);
      }
    `,
    focusRing,
  ];

  render() {
    return html`
      <button
        part="tile"
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${String(this.selected)}
        @click=${this.handleClick}
      >
        <span part="content" class="content">
          <span part="label" class="label">
            <slot name="label">${this.label}</slot>
            ${this.required ? html`<span part="required" class="required"></span>` : nothing}
          </span>
          <span part="description" class="description"><slot>${this.description}</slot></span>
        </span>
        ${this.noChevron ? nothing : html`<span part="chevron" class="chevron material-symbols-outlined" aria-hidden="true">chevron_right</span>`}
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
