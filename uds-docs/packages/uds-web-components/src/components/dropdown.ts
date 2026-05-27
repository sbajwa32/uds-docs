import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export interface UdsDropdownChangeDetail {
  value: string;
}

export type UdsDropdownState = 'default' | 'error';

/**
 * Internal helper: form association via ElementInternals when available.
 * Falls back to a non-form-associated element on unsupported browsers
 * (still functional, just doesn't participate in form submission).
 */
function attachFormInternals(host: HTMLElement): ElementInternals | null {
  const candidate = host as HTMLElement & { attachInternals?: () => ElementInternals };
  return typeof candidate.attachInternals === 'function' ? candidate.attachInternals() : null;
}

/**
 * `<udc-dropdown>` — single-select dropdown with floating option list.
 *
 * Public attributes/properties:
 *   value          — currently selected value
 *   label          — visible label text
 *   placeholder    — placeholder text when no value selected
 *   helper-text    — supporting text below the trigger
 *   counter-text   — character counter on the right of the helper row
 *   state          — "default" | "error"
 *   disabled       — boolean
 *   required       — boolean (renders required dot next to label)
 *   show-label     — boolean, default true
 *   show-helper    — boolean, default false
 *   show-counter   — boolean, default false
 *   leading-icon   — Material Symbols name (renders a leading icon)
 *   open           — boolean, expanded state (reflected)
 *
 * Slots:
 *   default        — `<udc-dropdown-item>` elements
 *
 * Events:
 *   udc-change     — fires when value changes; detail: { value }
 */
export class UdsDropdownElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    helperText: { type: String, attribute: 'helper-text', reflect: true },
    counterText: { type: String, attribute: 'counter-text', reflect: true },
    state: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    showLabel: { type: Boolean, attribute: 'show-label', reflect: true },
    showHelper: { type: Boolean, attribute: 'show-helper', reflect: true },
    showCounter: { type: Boolean, attribute: 'show-counter', reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    open: { type: Boolean, reflect: true },
  };

  name = '';
  value = '';
  label = '';
  placeholder = 'Choose…';
  helperText = '';
  counterText = '';
  state: UdsDropdownState = 'default';
  disabled = false;
  required = false;
  showLabel = true;
  showHelper = false;
  showCounter = false;
  leadingIcon = '';
  open = false;

  private readonly internals: ElementInternals | null;
  private readonly triggerId = `udc-dropdown-trigger-${Math.random().toString(36).slice(2)}`;
  private readonly listboxId = `udc-dropdown-listbox-${Math.random().toString(36).slice(2)}`;

  constructor() {
    super();
    this.internals = attachFormInternals(this);
  }

  /**
   * Full CSS port from `uds/components/dropdown/dropdown.css` on main.
   * Lives in shadow DOM so the same class names are safe (no leakage).
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        position: relative;
        font-family: var(--uds-font-family);
      }

      /* Root wrapper — positioned container, vertical stack */
      .udc-dropdown {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-050);
        position: relative;
      }

      /* Label */
      .udc-dropdown__label {
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

      .udc-dropdown__required {
        width: var(--uds-space-050);
        height: var(--uds-space-050);
        border-radius: 50%;
        background: var(--uds-color-icon-error);
        flex-shrink: 0;
      }

      /* Trigger — the bordered box that opens the list */
      .udc-dropdown__trigger {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100);
        min-height: var(--uds-space-600);
        padding: var(--uds-space-150);
        background-color: var(--uds-color-surface-interactive-neutral, var(--uds-color-surface-main));
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        cursor: pointer;
        transition: border-color 120ms ease, background-color 120ms ease;
        outline: none;
        font: inherit;
        text-align: left;
        width: 100%;
      }

      .udc-dropdown__trigger:hover {
        background-color: var(--uds-color-surface-interactive-subtle-hover);
        border-color: var(--uds-color-border-interactive);
      }

      .udc-dropdown__trigger:active,
      :host([open]) .udc-dropdown__trigger {
        background-color: var(--uds-color-surface-interactive-subtle-active);
        border-color: var(--uds-color-border-interactive);
      }

      .udc-dropdown__trigger:focus-visible {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-white),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      /* Leading icon */
      .udc-dropdown__leading-icon {
        display: flex;
        align-items: center;
        color: var(--uds-color-icon-interactive);
        flex-shrink: 0;
      }

      .udc-dropdown__leading-icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      /* Selected value text */
      .udc-dropdown__value {
        flex: 1 1 0%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-interactive);
        letter-spacing: 0;
      }

      .udc-dropdown__value[data-placeholder] {
        color: var(--uds-color-text-secondary);
      }

      /* Trailing chevron */
      .udc-dropdown__chevron {
        display: flex;
        align-items: center;
        color: var(--uds-color-icon-interactive);
        flex-shrink: 0;
        transition: transform 200ms ease;
      }

      .udc-dropdown__chevron .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      :host([open]) .udc-dropdown__chevron {
        transform: rotate(180deg);
      }

      /* Helper row */
      .udc-dropdown__helper {
        display: flex;
        justify-content: space-between;
        gap: var(--uds-space-100);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-xs);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-xs);
        color: var(--uds-color-text-secondary);
        letter-spacing: 0;
      }

      .udc-dropdown__counter {
        flex-shrink: 0;
        margin-left: auto;
      }

      /* Dropdown list panel — hidden by default */
      .udc-dropdown__list {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: var(--uds-z-index-dropdown, 1000);
        margin-top: var(--uds-space-050);
        padding: var(--uds-space-050);
        background-color: var(--uds-color-surface-interactive-neutral, var(--uds-color-surface-main));
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        box-shadow: var(--uds-shadow-depth-300);
        max-height: 240px;
        overflow-y: auto;
      }

      :host([open]) .udc-dropdown__list {
        display: block;
      }

      /* When the trigger row is the topmost element (no label visible),
         shift the list to align under the trigger box, not the root. */
      :host(:not([show-label])) .udc-dropdown__list {
        top: calc(100% - var(--uds-space-050));
      }

      /* ERROR STATE */
      :host([state='error']) .udc-dropdown__label {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([state='error']) .udc-dropdown__trigger {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-dropdown__trigger:hover,
      :host([state='error']) .udc-dropdown__trigger:active,
      :host([state='error'][open]) .udc-dropdown__trigger {
        border-color: var(--uds-color-border-error);
      }

      :host([state='error']) .udc-dropdown__value {
        color: var(--uds-color-text-error);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([state='error']) .udc-dropdown__helper {
        color: var(--uds-color-text-error);
      }

      :host([state='error']) .udc-dropdown__counter {
        color: var(--uds-color-text-secondary);
      }

      :host([state='error']) .udc-dropdown__leading-icon,
      :host([state='error']) .udc-dropdown__chevron {
        color: var(--uds-color-icon-error);
      }

      /* DISABLED STATE */
      :host([disabled]) .udc-dropdown__trigger {
        background-color: var(--uds-color-surface-interactive-disabled);
        border-color: var(--uds-color-border-disabled);
        cursor: not-allowed;
        pointer-events: none;
      }

      :host([disabled]) .udc-dropdown__value {
        color: var(--uds-color-text-disabled-bold);
      }

      :host([disabled]) .udc-dropdown__leading-icon,
      :host([disabled]) .udc-dropdown__chevron {
        color: var(--uds-color-icon-disabled);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('udc-dropdown-item-select', this.handleItemSelect as EventListener);
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    this.removeEventListener('udc-dropdown-item-select', this.handleItemSelect as EventListener);
    document.removeEventListener('click', this.handleOutsideClick);
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this.internals?.setFormValue(this.value);
      // Reflect aria-selected on items.
      this.querySelectorAll<HTMLElement>('udc-dropdown-item').forEach((item) => {
        const itemValue = item.getAttribute('value') || item.textContent?.trim() || '';
        if (itemValue === this.value) {
          item.setAttribute('selected', '');
        } else {
          item.removeAttribute('selected');
        }
      });
    }
  }

  render() {
    const displayValue = this.value || this.placeholder;
    const isPlaceholder = !this.value;

    return html`
      <div class="udc-dropdown" part="root">
        ${this.showLabel
          ? html`
              <label class="udc-dropdown__label" for=${this.triggerId} part="label">
                ${this.label}
                ${this.required
                  ? html`<span class="udc-dropdown__required" part="required"></span>`
                  : nothing}
              </label>
            `
          : nothing}
        <button
          id=${this.triggerId}
          class="udc-dropdown__trigger"
          part="trigger"
          type="button"
          role="combobox"
          aria-controls=${this.listboxId}
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-disabled=${this.disabled ? 'true' : nothing}
          ?disabled=${this.disabled}
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeydown}
        >
          ${this.leadingIcon
            ? html`
                <span class="udc-dropdown__leading-icon" part="leading-icon" aria-hidden="true">
                  <span class="material-symbols-outlined">${this.leadingIcon}</span>
                </span>
              `
            : nothing}
          <span
            class="udc-dropdown__value"
            part="value"
            data-placeholder=${isPlaceholder ? '' : nothing}
          >
            ${displayValue}
          </span>
          <span class="udc-dropdown__chevron" part="chevron" aria-hidden="true">
            <span class="material-symbols-outlined">keyboard_arrow_down</span>
          </span>
        </button>
        ${this.showHelper || this.showCounter
          ? html`
              <div class="udc-dropdown__helper" part="helper">
                ${this.showHelper
                  ? html`<span><slot name="helper">${this.helperText}</slot></span>`
                  : nothing}
                ${this.showCounter
                  ? html`<span class="udc-dropdown__counter" part="counter">${this.counterText}</span>`
                  : nothing}
              </div>
            `
          : nothing}
        <div
          id=${this.listboxId}
          class="udc-dropdown__list"
          part="listbox"
          role="listbox"
          aria-labelledby=${this.triggerId}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }

  private handleTriggerClick = (event: MouseEvent) => {
    if (this.disabled) return;
    event.stopPropagation();
    this.open = !this.open;
  };

  private handleTriggerKeydown = (event: KeyboardEvent) => {
    if (this.disabled) return;
    if (event.key === 'Escape') {
      this.open = false;
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open = true;
      queueMicrotask(() => {
        const first = this.querySelector<UdsDropdownItemElement>('udc-dropdown-item, udc-combobox-option');
        first?.focusOption();
      });
    }
  };

  private handleItemSelect = (event: Event) => {
    const detail = (event as CustomEvent<UdsDropdownChangeDetail>).detail;
    if (!detail) return;
    this.value = detail.value;
    this.open = false;
    emitUdsEvent<UdsDropdownChangeDetail>(this, 'udc-change', { value: this.value });
  };

  private handleOutsideClick = (event: MouseEvent) => {
    if (!this.open) return;
    if (!event.composedPath().includes(this)) {
      this.open = false;
    }
  };
}

/**
 * `<udc-dropdown-item>` — a single option inside `<udc-dropdown>`.
 *
 * Attributes:
 *   value     — the value emitted when this item is selected
 *   selected  — visual selected state (auto-managed by parent)
 *   disabled  — non-interactive
 */
export class UdsDropdownItemElement extends LitElement {
  static properties = {
    value: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  value = '';
  selected = false;
  disabled = false;

  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
      }

      .udc-dropdown__item {
        display: flex;
        align-items: center;
        gap: var(--uds-space-100);
        padding: var(--uds-space-150) var(--uds-space-200);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        letter-spacing: 0;
        cursor: pointer;
        border-radius: var(--uds-border-radius-input);
        background-color: var(--uds-color-surface-interactive-none, transparent);
        border: 1px solid transparent;
        transition: background-color 120ms ease;
        width: 100%;
        text-align: left;
      }

      .udc-dropdown__item:hover {
        background-color: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-dropdown__item:active {
        background-color: var(--uds-color-surface-interactive-subtle-active);
      }

      :host([selected]) .udc-dropdown__item {
        background-color: var(--uds-color-surface-interactive-subtle-active);
        color: var(--uds-color-text-interactive);
        font-weight: var(--uds-font-weight-bold);
      }

      :host([disabled]) .udc-dropdown__item {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .udc-dropdown__item:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }
    `,
  ];

  render() {
    return html`
      <button
        class="udc-dropdown__item"
        part="item"
        type="button"
        role="option"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : nothing}
        ?disabled=${this.disabled}
        @click=${this.select}
        @keydown=${this.handleKeydown}
      >
        <slot></slot>
      </button>
    `;
  }

  /** Public: focus this option (called by the parent dropdown on open). */
  focusOption() {
    this.renderRoot.querySelector<HTMLElement>('button')?.focus();
  }

  private select = () => {
    if (this.disabled) return;
    const resolvedValue = this.value || this.textContent?.trim() || '';
    emitUdsEvent<UdsDropdownChangeDetail>(this, 'udc-dropdown-item-select', { value: resolvedValue });
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusSibling(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusSibling(-1);
    } else if (event.key === 'Escape') {
      // Bubble up to dropdown trigger
      const dropdown = this.parentElement;
      (dropdown as HTMLElement | null)?.focus?.();
      if (dropdown && 'open' in dropdown) {
        (dropdown as unknown as { open: boolean }).open = false;
      }
    }
  };

  private focusSibling(delta: number) {
    const siblings = Array.from(
      this.parentElement?.querySelectorAll<UdsDropdownItemElement>('udc-dropdown-item, udc-combobox-option') ?? [],
    );
    const idx = siblings.indexOf(this as unknown as UdsDropdownItemElement);
    const next = siblings[(idx + delta + siblings.length) % siblings.length];
    next?.focusOption();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-dropdown': UdsDropdownElement;
    'udc-dropdown-item': UdsDropdownItemElement;
  }
}
