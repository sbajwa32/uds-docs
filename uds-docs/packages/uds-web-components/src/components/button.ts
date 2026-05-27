import { LitElement, css, html, nothing } from 'lit';

import { focusRing, hostInline, materialIconStyles } from '../styles';

export type UdsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UdsButtonSize = 'default' | 'sm';
export type UdsButtonColor = 'default' | 'danger';
export type UdsButtonType = 'button' | 'submit' | 'reset';

export class UdsButtonElement extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
    type: { type: String, reflect: true },
  };

  variant: UdsButtonVariant = 'primary';
  size: UdsButtonSize = 'default';
  color: UdsButtonColor = 'default';
  disabled = false;
  selected = false;
  iconOnly = false;
  leadingIcon = '';
  trailingIcon = '';
  type: UdsButtonType = 'button';

  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        --_btn-fill: var(--uds-color-surface-interactive-default, #1f6feb);
        --_btn-fill-hover: var(--uds-color-surface-interactive-hover, #1a5dcc);
        --_btn-fill-active: var(--uds-color-surface-interactive-active, #174ea6);
        --_btn-fill-disabled: var(--uds-color-surface-interactive-disabled, #d4d4d4);
        --_btn-subtle-hover: var(--uds-color-surface-interactive-subtle-hover, rgb(31 111 235 / 10%));
        --_btn-subtle-active: var(--uds-color-surface-interactive-subtle-active, rgb(31 111 235 / 16%));
        --_btn-text: var(--uds-color-text-brand, #1f6feb);
        --_btn-border: var(--uds-color-border-interactive, #1f6feb);
        --_btn-text-disabled: var(--uds-color-text-disabled-bold, #737373);
      }

      :host([color='danger']) {
        --_btn-fill: var(--uds-color-surface-error, #b42318);
        --_btn-fill-hover: var(--uds-color-surface-error-hover, #a01f16);
        --_btn-fill-active: var(--uds-color-surface-error-active, #7a180f);
        --_btn-subtle-hover: var(--uds-color-surface-error-subtle, rgb(180 35 24 / 10%));
        --_btn-subtle-active: var(--uds-color-surface-error-subtle, rgb(180 35 24 / 16%));
        --_btn-text: var(--uds-color-text-error, #b42318);
        --_btn-border: var(--uds-color-border-error, #b42318);
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--uds-space-100, 8px);
        padding: var(--uds-space-150, 12px) var(--uds-space-200, 16px);
        border: 1px solid transparent;
        border-radius: var(--uds-border-radius-input, 8px);
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        user-select: none;
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
        font: inherit;
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-medium, 500);
        line-height: var(--uds-font-line-height-base, 1.5);
        appearance: none;
        outline: none;
      }

      button[data-variant='secondary'],
      button[data-variant='ghost'] {
        gap: var(--uds-space-150, 12px);
      }

      button[data-variant='primary'] {
        background: var(--_btn-fill);
        border-color: var(--_btn-fill);
        color: var(--uds-color-text-inverse, #fff);
      }

      button[data-variant='primary']:hover:not(:disabled) {
        background: var(--_btn-fill-hover);
        border-color: var(--_btn-fill-hover);
      }

      button[data-variant='primary']:active:not(:disabled) {
        background: var(--_btn-fill-active);
        border-color: var(--_btn-fill-active);
      }

      button[data-variant='secondary'] {
        background: var(--uds-color-surface-interactive-none, transparent);
        border-color: var(--_btn-border);
        color: var(--_btn-text);
      }

      button[data-variant='secondary']:hover:not(:disabled),
      button[data-variant='ghost']:hover:not(:disabled) {
        background: var(--_btn-subtle-hover);
      }

      button[data-variant='secondary']:active:not(:disabled),
      button[data-variant='ghost']:active:not(:disabled) {
        background: var(--_btn-subtle-active);
      }

      button[data-variant='ghost'] {
        background: var(--uds-color-surface-interactive-none, transparent);
        border-color: transparent;
        color: var(--_btn-text);
      }

      button[data-selected='true'] {
        box-shadow: 0 0 0 2px var(--uds-color-surface-white, #fff),
          0 0 0 4px var(--uds-color-border-outline-focus-visible, #2563eb);
      }

      button:disabled {
        background: var(--_btn-fill-disabled);
        border-color: transparent;
        color: var(--_btn-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      :host([size='sm']) button {
        padding: var(--uds-space-075, 6px) var(--uds-space-150, 12px);
      }

      :host([leading-icon]) button {
        padding-left: var(--uds-space-150, 12px);
      }

      :host([trailing-icon]) button {
        padding-right: var(--uds-space-150, 12px);
      }

      :host([leading-icon][size='sm']) button {
        padding-left: var(--uds-space-100, 8px);
      }

      :host([trailing-icon][size='sm']) button {
        padding-right: var(--uds-space-100, 8px);
      }

      :host([icon-only]) button {
        gap: 0;
        padding: var(--uds-space-150, 12px);
      }

      :host([icon-only][size='sm']) button {
        padding: var(--uds-space-075, 6px);
      }

      .material-symbols-outlined {
        flex-shrink: 0;
      }
    `,
    focusRing,
  ];

  render() {
    const label = this.getAttribute('aria-label');

    return html`
      <button
        part="button"
        type=${this.type}
        data-variant=${this.variant}
        ?disabled=${this.disabled}
        data-selected=${this.selected ? 'true' : 'false'}
        aria-pressed=${this.selected ? 'true' : nothing}
        aria-label=${label || nothing}
        @click=${this.handleClick}
      >
        ${this.leadingIcon ? html`<span part="leading-icon" class="material-symbols-outlined" aria-hidden="true">${this.leadingIcon}</span>` : nothing}
        <slot></slot>
        ${this.trailingIcon ? html`<span part="trailing-icon" class="material-symbols-outlined" aria-hidden="true">${this.trailingIcon}</span>` : nothing}
      </button>
    `;
  }

  private handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.type === 'submit' || this.type === 'reset') {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        const form = this.closest('form');
        if (!form) return;
        if (this.type === 'submit') form.requestSubmit();
        if (this.type === 'reset') form.reset();
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-button': UdsButtonElement;
  }
}
