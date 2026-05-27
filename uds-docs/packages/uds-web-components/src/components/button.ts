import { LitElement, css, html, nothing } from 'lit';

import { hostInline, materialIconStyles } from '../styles';

export type UdsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UdsButtonSize = 'default' | 'sm';
export type UdsButtonColor = 'default' | 'danger' | 'success' | 'warning' | 'neutral';
export type UdsButtonType = 'button' | 'submit' | 'reset';

/**
 * `<udc-button>` — primary / secondary / ghost button with optional leading
 * and trailing icons, icon-only mode, sm size, and danger/success/warning/
 * neutral color palettes.
 *
 * Public attributes/properties:
 *   variant        — "primary" (default) | "secondary" | "ghost"
 *   size           — "default" | "sm"
 *   color          — "default" | "danger" | "success" | "warning" | "neutral"
 *   type           — native button type
 *   disabled       — boolean
 *   selected       — boolean (renders aria-pressed and a focus-style ring)
 *   icon-only      — boolean (square button, no label gap)
 *   leading-icon   — Material Symbols name before the label
 *   trailing-icon  — Material Symbols name after the label
 */
export class UdsButtonElement extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    type: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
  };

  variant: UdsButtonVariant = 'primary';
  size: UdsButtonSize = 'default';
  color: UdsButtonColor = 'default';
  type: UdsButtonType = 'button';
  disabled = false;
  selected = false;
  iconOnly = false;
  leadingIcon = '';
  trailingIcon = '';

  /**
   * Full CSS port from `uds/components/button/button.css` on main.
   * Shadow DOM safe — internal class names don't leak.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      /* ----------------------------------------------------------------
         Internal design tokens — set on :host so danger/success/warning/
         neutral can override them via :host([color='…']).
         ---------------------------------------------------------------- */
      :host {
        --_btn-fill: var(--uds-color-surface-interactive-default);
        --_btn-fill-hover: var(--uds-color-surface-interactive-hover);
        --_btn-fill-active: var(--uds-color-surface-interactive-active);
        --_btn-fill-disabled: var(--uds-color-surface-interactive-disabled);
        --_btn-subtle-hover: var(--uds-color-surface-interactive-subtle-hover);
        --_btn-subtle-active: var(--uds-color-surface-interactive-subtle-active);
        --_btn-text: var(--uds-color-text-brand);
        --_btn-border: var(--uds-color-border-interactive);
        --_btn-text-disabled: var(--uds-color-text-disabled-bold);
      }

      :host([color='danger']) {
        --_btn-fill: var(--uds-color-surface-interactive-red);
        --_btn-fill-hover: var(--uds-color-surface-interactive-red-hover);
        --_btn-fill-active: var(--uds-color-surface-interactive-red-active);
        --_btn-subtle-hover: var(--uds-color-surface-interactive-red-subtle-hover);
        --_btn-subtle-active: var(--uds-color-surface-interactive-red-subtle-active);
        --_btn-text: var(--uds-color-text-error);
        --_btn-border: var(--uds-color-border-error);
      }

      :host([color='success']) {
        --_btn-fill: var(--uds-primitive-color-green-70);
        --_btn-fill-hover: var(--uds-primitive-color-green-80);
        --_btn-fill-active: var(--uds-primitive-color-green-90);
        --_btn-subtle-hover: var(--uds-primitive-color-green-20);
        --_btn-subtle-active: var(--uds-primitive-color-green-30);
        --_btn-text: var(--uds-primitive-color-green-70);
        --_btn-border: var(--uds-primitive-color-green-70);
      }

      :host([color='warning']) {
        --_btn-fill: var(--uds-primitive-color-orange-70);
        --_btn-fill-hover: var(--uds-primitive-color-orange-80);
        --_btn-fill-active: var(--uds-primitive-color-orange-90);
        --_btn-subtle-hover: var(--uds-primitive-color-orange-20);
        --_btn-subtle-active: var(--uds-primitive-color-orange-30);
        --_btn-text: var(--uds-primitive-color-orange-70);
        --_btn-border: var(--uds-primitive-color-orange-70);
      }

      :host([color='neutral']) {
        --_btn-fill: var(--uds-primitive-color-neutral-90);
        --_btn-fill-hover: var(--uds-primitive-color-neutral-100);
        --_btn-fill-active: var(--uds-primitive-color-neutral-110);
        --_btn-subtle-hover: var(--uds-primitive-color-neutral-20);
        --_btn-subtle-active: var(--uds-primitive-color-neutral-30);
        --_btn-text: var(--uds-primitive-color-neutral-90);
        --_btn-border: var(--uds-primitive-color-neutral-90);
      }

      /* ----------------------------------------------------------------
         Shared structure across all variants
         ---------------------------------------------------------------- */
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-150) var(--uds-space-200);
        border-radius: var(--uds-border-radius-input);
        border: 1px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        user-select: none;
        transition: background-color 120ms ease, border-color 120ms ease,
          color 120ms ease, box-shadow 120ms ease;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        letter-spacing: 0;
        -webkit-appearance: none;
        appearance: none;
        background: none;
        outline: none;
      }

      /* Secondary & ghost use wider gap per Figma (space/150 = 12px) */
      :host([variant='secondary']) button,
      :host([variant='ghost']) button {
        gap: var(--uds-space-150);
      }

      /* Shared keyboard focus ring */
      button:focus-visible {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      /* ----------------------------------------------------------------
         PRIMARY — filled background using the accent color
         ---------------------------------------------------------------- */
      :host([variant='primary']) button {
        background-color: var(--_btn-fill);
        border-color: var(--_btn-fill);
        color: var(--uds-color-text-inverse);
      }

      :host([variant='primary']) button:hover:not(:disabled) {
        background-color: var(--_btn-fill-hover);
        border-color: var(--_btn-fill-hover);
      }

      :host([variant='primary']) button:active:not(:disabled) {
        background-color: var(--_btn-fill-active);
        border-color: var(--_btn-fill-active);
      }

      :host([variant='primary'][selected]) button {
        background-color: var(--_btn-fill);
        border-color: var(--_btn-fill);
      }

      :host([variant='primary']) button:disabled {
        background-color: var(--_btn-fill-disabled);
        border-color: var(--_btn-fill-disabled);
        color: var(--_btn-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ----------------------------------------------------------------
         SECONDARY — transparent bg with accent border
         ---------------------------------------------------------------- */
      :host([variant='secondary']) button {
        background-color: var(--uds-color-surface-interactive-none, transparent);
        border-color: var(--_btn-border);
        color: var(--_btn-text);
      }

      :host([variant='secondary']) button:hover:not(:disabled) {
        background-color: var(--_btn-subtle-hover);
      }

      :host([variant='secondary']) button:active:not(:disabled) {
        background-color: var(--_btn-subtle-active);
      }

      :host([variant='secondary'][selected]) button {
        background-color: var(--uds-color-surface-interactive-none, transparent);
        border-color: var(--_btn-border);
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      :host([variant='secondary']) button:disabled {
        background-color: var(--_btn-fill-disabled);
        border-color: transparent;
        color: var(--_btn-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ----------------------------------------------------------------
         GHOST — no border, no background, text only
         ---------------------------------------------------------------- */
      :host([variant='ghost']) button {
        background-color: var(--uds-color-surface-interactive-none, transparent);
        border-color: transparent;
        color: var(--_btn-text);
      }

      :host([variant='ghost']) button:hover:not(:disabled) {
        background-color: var(--_btn-subtle-hover);
      }

      :host([variant='ghost']) button:active:not(:disabled) {
        background-color: var(--_btn-subtle-active);
      }

      :host([variant='ghost'][selected]) button {
        background-color: var(--uds-color-surface-interactive-none, transparent);
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      :host([variant='ghost']) button:disabled {
        background-color: transparent;
        color: var(--_btn-text-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ----------------------------------------------------------------
         Icon styling — Material Symbols
         Figma: 24×24 wrapper with 2px padding → 20px visible icon
         ---------------------------------------------------------------- */
      .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      }

      /* ----------------------------------------------------------------
         SIZE: small — tighter padding (same font size)
         ---------------------------------------------------------------- */
      :host([size='sm']) button {
        padding: var(--uds-space-075) var(--uds-space-150);
      }

      /* ----------------------------------------------------------------
         Leading icon — reduce left padding.
         The :not([leading-icon='']) guard handles Lit's empty-string
         attribute reflection on string properties.
         ---------------------------------------------------------------- */
      :host([leading-icon]:not([leading-icon=''])) button {
        padding-left: var(--uds-space-150);
      }

      :host([leading-icon]:not([leading-icon=''])[size='sm']) button {
        padding-left: var(--uds-space-100);
      }

      /* ----------------------------------------------------------------
         Trailing icon — reduce right padding
         ---------------------------------------------------------------- */
      :host([trailing-icon]:not([trailing-icon=''])) button {
        padding-right: var(--uds-space-150);
      }

      :host([trailing-icon]:not([trailing-icon=''])[size='sm']) button {
        padding-right: var(--uds-space-100);
      }

      /* ----------------------------------------------------------------
         Icon-only — square, equal padding, no label gap
         ---------------------------------------------------------------- */
      :host([icon-only]) button {
        padding: var(--uds-space-150);
        gap: 0;
      }

      :host([icon-only][size='sm']) button {
        padding: var(--uds-space-075);
      }
    `,
  ];

  render() {
    const ariaLabel = this.getAttribute('aria-label');

    return html`
      <button
        part="button"
        type=${this.type}
        ?disabled=${this.disabled}
        aria-pressed=${this.selected ? 'true' : nothing}
        aria-label=${ariaLabel || nothing}
        @click=${this.handleClick}
      >
        ${this.leadingIcon
          ? html`<span
              part="leading-icon"
              class="material-symbols-outlined"
              aria-hidden="true"
              >${this.leadingIcon}</span
            >`
          : nothing}
        <slot></slot>
        ${this.trailingIcon
          ? html`<span
              part="trailing-icon"
              class="material-symbols-outlined"
              aria-hidden="true"
              >${this.trailingIcon}</span
            >`
          : nothing}
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
