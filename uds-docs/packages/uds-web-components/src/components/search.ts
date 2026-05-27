import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export interface UdsSearchChangeDetail {
  value: string;
}

export type UdsSearchState = 'default' | 'error';

/**
 * `<udc-search>` — search bar with leading icon and clear button.
 *
 * Public attributes/properties:
 *   name           — form field name
 *   value          — current input value
 *   placeholder    — placeholder text
 *   state          — "default" | "error"
 *   disabled       — boolean
 *
 * Events:
 *   udc-input      — fires on each keystroke; detail: { value }
 *   udc-change     — fires on committed change; detail: { value }
 *   udc-clear      — fires when the clear button is clicked
 */
export class UdsSearchElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    state: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  name = '';
  value = '';
  placeholder = 'Search…';
  state: UdsSearchState = 'default';
  disabled = false;

  private readonly internals: ElementInternals | null;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
  }

  /**
   * Full CSS port from `uds/components/search/search.css` on main.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
        position: relative;
      }

      .udc-search {
        display: flex;
        flex-direction: column;
        gap: var(--uds-space-050);
        font-family: var(--uds-font-family);
        position: relative;
      }

      .udc-search__field {
        display: flex;
        align-items: center;
        gap: 0;
        min-height: var(--uds-space-600);
        padding: var(--uds-space-075) var(--uds-space-075) var(--uds-space-075)
          var(--uds-space-100);
        border: 1px solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        background-color: var(--uds-color-surface-main);
        transition: background-color 120ms ease, border-color 120ms ease;
        overflow: hidden;
      }

      .udc-search__field:hover {
        background-color: var(--uds-color-surface-subtle);
      }

      /* Focus ring on the wrapper */
      :host(:focus-within) .udc-search__field {
        border-color: var(--uds-color-border-primary);
        box-shadow:
          0 0 0 2px var(--uds-color-surface-main),
          0 0 0 4px var(--uds-color-border-outline-focus-visible);
      }

      :host([state='error']:focus-within) .udc-search__field {
        box-shadow:
          0 0 0 2px var(--uds-color-surface-main),
          0 0 0 4px var(--uds-color-border-error);
      }

      :host([state='error']) .udc-search__field {
        border-color: var(--uds-color-border-error);
      }

      :host([disabled]) .udc-search__field {
        background-color: var(--uds-color-surface-interactive-disabled);
        border-color: transparent;
      }

      .udc-search__icon {
        display: flex;
        align-items: center;
        padding: 0 var(--uds-space-025);
        flex-shrink: 0;
        color: var(--uds-color-icon-secondary);
      }

      .udc-search__icon .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      .udc-search__field input {
        flex: 1 1 0%;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        font-weight: var(--uds-font-weight-regular);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        padding: 0 var(--uds-space-050);
      }

      .udc-search__field input::placeholder {
        color: var(--uds-color-text-secondary);
      }

      .udc-search__clear {
        display: none;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: var(--uds-space-075);
        border: none;
        border-radius: var(--uds-border-radius-input);
        background: var(--uds-color-surface-interactive-none, transparent);
        color: var(--uds-color-icon-secondary);
        cursor: pointer;
        flex-shrink: 0;
        -webkit-appearance: none;
        appearance: none;
        font: inherit;
      }

      .udc-search__clear .material-symbols-outlined {
        font-size: var(--uds-font-size-2xl);
        line-height: 1;
      }

      .udc-search__clear:hover {
        background: var(--uds-color-surface-interactive-subtle-hover);
      }

      .udc-search__clear:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }

      :host([data-has-value='true']) .udc-search__clear {
        display: flex;
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this.internals?.setFormValue(this.value);
      if (this.value) {
        this.setAttribute('data-has-value', 'true');
      } else {
        this.removeAttribute('data-has-value');
      }
    }
  }

  render() {
    return html`
      <div class="udc-search" part="root">
        <div class="udc-search__field" part="field">
          <span class="udc-search__icon" part="leading-icon" aria-hidden="true">
            <span class="material-symbols-outlined">search</span>
          </span>
          <input
            part="input"
            type="search"
            name=${this.name || nothing}
            .value=${this.value}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            aria-invalid=${this.state === 'error' ? 'true' : nothing}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <button
            class="udc-search__clear"
            part="clear"
            type="button"
            aria-label="Clear search"
            ?disabled=${this.disabled}
            @click=${this.handleClear}
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    `;
  }

  private handleInput(event: Event) {
    this.value = (event.currentTarget as HTMLInputElement).value;
    emitUdsEvent<UdsSearchChangeDetail>(this, 'udc-input', { value: this.value });
  }

  private handleChange() {
    emitUdsEvent<UdsSearchChangeDetail>(this, 'udc-change', { value: this.value });
  }

  private handleClear = () => {
    if (this.disabled) return;
    this.value = '';
    emitUdsEvent<UdsSearchChangeDetail>(this, 'udc-clear', { value: '' });
    emitUdsEvent<UdsSearchChangeDetail>(this, 'udc-input', { value: '' });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-search': UdsSearchElement;
  }
}
