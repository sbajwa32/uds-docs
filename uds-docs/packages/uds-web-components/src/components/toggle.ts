import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline } from '../styles';

export interface UdsToggleChangeDetail {
  checked: boolean;
  value: string;
}

/**
 * `<udc-toggle>` — accessible on/off switch with optional label.
 *
 * Public attributes/properties:
 *   name        — form field name
 *   value       — form value when checked (default "on")
 *   checked     — boolean
 *   disabled    — boolean
 *   label       — visible label text (or slot content)
 *
 * Slots:
 *   default     — label content (replaces `label` attribute)
 *
 * Events:
 *   udc-change  — fires when checked changes; detail: { checked, value }
 */
export class UdsToggleElement extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  name = '';
  value = 'on';
  label = '';
  checked = false;
  disabled = false;

  private readonly internals: ElementInternals | null;

  constructor() {
    super();
    const host = this as HTMLElement & { attachInternals?: () => ElementInternals };
    this.internals = typeof host.attachInternals === 'function' ? host.attachInternals() : null;
  }

  /**
   * Full CSS port from `uds/components/toggle/toggle.css` on main.
   * 52×32 outer track, 20×20 thumb, translates 20px when active.
   */
  static styles = [
    hostInline,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        font-family: var(--uds-font-family);
        color: var(--uds-color-text-primary);
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
      }

      .udc-toggle__control {
        position: relative;
        width: 52px;
        height: 32px;
        border: var(--uds-border-width-100, 1px) solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-container-full, 999px);
        background: var(--uds-color-surface-interactive-disabled);
        cursor: pointer;
        transition: background-color 120ms ease, border-color 120ms ease;
        flex-shrink: 0;
      }

      .udc-toggle__thumb {
        position: absolute;
        top: var(--uds-space-075);
        left: var(--uds-space-075);
        width: 20px;
        height: 20px;
        border-radius: var(--uds-border-radius-container-full, 999px);
        background: var(--uds-color-surface-white);
        box-shadow: var(--uds-shadow-depth-100);
        transition: transform 120ms ease;
      }

      :host([checked]) .udc-toggle__control {
        background: var(--uds-color-surface-interactive-default);
        border-color: var(--uds-color-border-interactive);
      }

      :host([checked]) .udc-toggle__thumb {
        transform: translateX(20px);
      }

      .udc-toggle:focus-visible .udc-toggle__control {
        outline: var(--uds-border-width-200, 2px) solid
          var(--uds-color-border-outline-focus-visible);
        outline-offset: var(--uds-space-050);
      }

      :host([disabled]) .udc-toggle {
        color: var(--uds-color-text-disabled);
        cursor: not-allowed;
      }

      :host([disabled]) .udc-toggle__control {
        border-color: var(--uds-color-border-disabled);
        opacity: 0.7;
        cursor: not-allowed;
      }

      .udc-toggle__label {
        font-size: var(--uds-font-size-base);
        line-height: var(--uds-font-line-height-base);
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('checked') || changed.has('value')) {
      this.internals?.setFormValue(this.checked ? this.value : null);
    }
  }

  render() {
    return html`
      <button
        class="udc-toggle"
        part="root"
        type="button"
        role="switch"
        aria-checked=${this.checked ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : nothing}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <span class="udc-toggle__control" part="control">
          <span class="udc-toggle__thumb" part="thumb"></span>
        </span>
        <span class="udc-toggle__label" part="label">
          <slot>${this.label}</slot>
        </span>
      </button>
    `;
  }

  private handleClick = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    emitUdsEvent<UdsToggleChangeDetail>(this, 'udc-change', {
      checked: this.checked,
      value: this.value,
    });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-toggle': UdsToggleElement;
  }
}
