import { LitElement, PropertyValues, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostBlock, hostInline, materialIconStyles } from '../styles';

export interface UdsValueChangeDetail {
  value: string;
}

export interface UdsCheckedChangeDetail {
  checked: boolean;
  value: string;
}

export interface UdsSortChangeDetail {
  key: string;
  direction: 'asc' | 'desc' | 'none';
}

const fieldChrome = css`
  .field {
    display: flex;
    align-items: center;
    gap: var(--uds-space-075, 6px);
    min-height: var(--uds-space-600, 48px);
    padding: var(--uds-space-075, 6px) var(--uds-space-100, 8px);
    background: var(--uds-color-surface-main, #fff);
    border: 1px solid var(--uds-color-border-primary, #d4d4d4);
    border-radius: var(--uds-border-radius-input, 8px);
    color: var(--uds-color-text-primary, #171717);
  }

  .field:focus-within {
    box-shadow: 0 0 0 2px var(--uds-color-surface-white, #fff),
      0 0 0 4px var(--uds-color-border-outline-focus-visible, #2563eb);
  }

  input,
  textarea,
  select {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--uds-font-size-base, 16px);
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: var(--uds-space-050, 4px);
    color: var(--uds-color-text-primary, #171717);
    font-size: var(--uds-font-size-sm, 14px);
    font-weight: var(--uds-font-weight-medium, 500);
  }

  .helper {
    color: var(--uds-color-text-secondary, #525252);
    font-size: var(--uds-font-size-xs, 12px);
  }

  :host([state='error']) .field {
    border-color: var(--uds-color-border-error, #b42318);
  }

  :host([state='error']) .label,
  :host([state='error']) .helper {
    color: var(--uds-color-text-error, #b42318);
  }
`;

function formInternals(host: HTMLElement): ElementInternals | null {
  const candidate = host as HTMLElement & { attachInternals?: () => ElementInternals };
  return typeof candidate.attachInternals === 'function' ? candidate.attachInternals() : null;
}

export class UdsDividerElement extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
  };

  orientation: 'horizontal' | 'vertical' = 'horizontal';

  static styles = [
    hostBlock,
    css`
      :host {
        display: block;
      }

      .divider {
        width: 100%;
        border: 0;
        border-top: 1px solid var(--uds-color-border-secondary, #e5e5e5);
      }

      :host([orientation='vertical']) {
        display: inline-block;
        align-self: stretch;
      }

      :host([orientation='vertical']) .divider {
        width: 0;
        height: 100%;
        min-height: var(--uds-space-300, 24px);
        border-top: 0;
        border-left: 1px solid var(--uds-color-border-secondary, #e5e5e5);
      }
    `,
  ];

  render() {
    return html`<div part="divider" class="divider" role="separator" aria-orientation=${this.orientation}></div>`;
  }
}

export class UdsSpacerElement extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    axis: { type: String, reflect: true },
  };

  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  axis: 'block' | 'inline' = 'block';

  private sizeValue() {
    return {
      xs: 'var(--uds-space-100, 8px)',
      sm: 'var(--uds-space-200, 16px)',
      md: 'var(--uds-space-300, 24px)',
      lg: 'var(--uds-space-400, 32px)',
      xl: 'var(--uds-space-600, 48px)',
    }[this.size];
  }

  render() {
    const value = this.sizeValue();
    const style = this.axis === 'inline' ? `display:inline-block;width:${value};height:1px;` : `display:block;height:${value};`;
    return html`<span part="spacer" aria-hidden="true" style=${style}></span>`;
  }
}

export class UdsIconWrapperElement extends LitElement {
  static properties = {
    icon: { type: String, reflect: true },
    label: { type: String, reflect: true },
    tone: { type: String, reflect: true },
  };

  icon = '';
  label = '';
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'error' = 'neutral';

  static styles = [
    hostInline,
    materialIconStyles,
    css`
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--uds-space-400, 32px);
        height: var(--uds-space-400, 32px);
        border-radius: var(--uds-border-radius-full, 999px);
        background: var(--uds-color-surface-subtle, #f5f5f5);
        color: var(--uds-color-icon-primary, #171717);
      }

      :host([tone='info']) .icon { color: var(--uds-color-icon-info, #005ff0); background: var(--uds-color-surface-info-subtle, #eef5ff); }
      :host([tone='success']) .icon { color: var(--uds-color-icon-success, #067647); background: var(--uds-color-surface-success-subtle, #ecfdf3); }
      :host([tone='warning']) .icon { color: var(--uds-color-icon-warning, #b54708); background: var(--uds-color-surface-warning-subtle, #fffaeb); }
      :host([tone='error']) .icon { color: var(--uds-color-icon-error, #b42318); background: var(--uds-color-surface-error-subtle, #fef3f2); }
    `,
  ];

  render() {
    return html`
      <span part="icon" class="icon" role=${this.label ? 'img' : nothing} aria-label=${this.label || nothing}>
        <slot><span class="material-symbols-outlined" aria-hidden="true">${this.icon}</span></slot>
      </span>
    `;
  }
}

// Label lives in ./label.ts (extracted with the full CSS port).
export { UdsLabelElement } from './label';
export type { UdsLabelVariant, UdsLabelSize, UdsLabelAlign } from './label';

// Link lives in ./link.ts (extracted with the full CSS port).
export { UdsLinkElement } from './link';

// TextArea lives in ./text-area.ts (extracted with the full CSS port).
export { UdsTextAreaElement } from './text-area';
export type { UdsTextAreaChangeDetail, UdsTextAreaState } from './text-area';

// Toggle lives in ./toggle.ts (extracted with the full CSS port).
export { UdsToggleElement } from './toggle';
export type { UdsToggleChangeDetail } from './toggle';

// Radio + RadioGroup live in ./radio.ts (extracted with the full CSS port).
export { UdsRadioElement, UdsRadioGroupElement } from './radio';
export type { UdsRadioChangeDetail, UdsRadioState } from './radio';

// Search lives in ./search.ts (extracted with the full CSS port).
export { UdsSearchElement } from './search';
export type { UdsSearchChangeDetail, UdsSearchState } from './search';

// Breadcrumb lives in ./breadcrumb.ts (extracted with the full CSS port).
export { UdsBreadcrumbElement } from './breadcrumb';
export type { BreadcrumbItem } from './breadcrumb';

// List + ListItem live in ./list.ts (extracted with the full CSS port).
export { UdsListElement, UdsListItemElement } from './list';
export type { UdsListItemSelectDetail } from './list';

// Pagination lives in ./pagination.ts (extracted with the full CSS port).
export { UdsPaginationElement } from './pagination';

// Tooltip lives in ./tooltip.ts (extracted with the full CSS port).
export { UdsTooltipElement } from './tooltip';
export type { UdsTooltipPosition } from './tooltip';

// Dialog lives in ./dialog.ts (extracted with the full CSS port).
export { UdsDialogElement } from './dialog';

// Dropdown + DropdownItem live in ./dropdown.ts (extracted with the full CSS port).
// Re-export so existing imports from './components/remaining' keep working.
export { UdsDropdownElement, UdsDropdownItemElement } from './dropdown';
export type { UdsDropdownChangeDetail, UdsDropdownState } from './dropdown';

import { UdsDropdownElement as _UdsDropdownElement, UdsDropdownItemElement as _UdsDropdownItemElement } from './dropdown';

/** Combobox is currently a Dropdown alias; full filtering/autocomplete arrives later. */
export class UdsComboboxElement extends _UdsDropdownElement {}
export class UdsComboboxOptionElement extends _UdsDropdownItemElement {}

// DatePicker lives in ./date-picker.ts (extracted with full field chrome).
export { UdsDatePickerElement } from './date-picker';
export type { UdsDatePickerChangeDetail, UdsDatePickerState } from './date-picker';

export class UdsDataTableElement extends LitElement {
  static properties = {
    sortKey: { type: String, attribute: 'sort-key', reflect: true },
    sortDirection: { type: String, attribute: 'sort-direction', reflect: true },
  };

  sortKey = '';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';

  static styles = [hostBlock, css`.wrap { overflow: auto; border: 1px solid var(--uds-color-border-secondary, #e5e5e5); border-radius: var(--uds-border-radius-card, 12px); } ::slotted(table) { width: 100%; border-collapse: collapse; }`];
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleSortClick);
    this.addEventListener('keydown', this.handleSortKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleSortClick);
    this.removeEventListener('keydown', this.handleSortKeydown);
    super.disconnectedCallback();
  }

  render() {
    return html`<div part="wrapper" class="wrap"><slot></slot></div>`;
  }

  private handleSortClick = (event: Event) => {
    const header = (event.target as Element | null)?.closest?.('th[data-sort-key]');
    if (!header || !this.contains(header)) return;
    this.setSort(header.getAttribute('data-sort-key') || '');
  };

  private handleSortKeydown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return;
    const header = (keyboardEvent.target as Element | null)?.closest?.('th[data-sort-key]');
    if (!header || !this.contains(header)) return;
    keyboardEvent.preventDefault();
    this.setSort(header.getAttribute('data-sort-key') || '');
  };

  private setSort(key: string) {
    if (!key) return;
    const nextDirection =
      this.sortKey !== key || this.sortDirection === 'none'
        ? 'asc'
        : this.sortDirection === 'asc'
          ? 'desc'
          : 'none';
    this.sortKey = nextDirection === 'none' ? '' : key;
    this.sortDirection = nextDirection;
    emitUdsEvent<UdsSortChangeDetail>(this, 'udc-sort-change', {
      key,
      direction: nextDirection,
    });
  }
}

export class UdsDataViewElement extends LitElement {
  static styles = [hostBlock, css`.root { display: grid; gap: var(--uds-space-200, 16px); padding: var(--uds-space-300, 24px); border: 1px solid var(--uds-color-border-secondary, #e5e5e5); border-radius: var(--uds-border-radius-card, 12px); background: var(--uds-color-surface-main, #fff); }`];
  render() {
    return html`<section part="root" class="root"><header part="header"><slot name="header"></slot></header><div part="body"><slot></slot></div><footer part="actions"><slot name="actions"></slot></footer></section>`;
  }
}

// NavHeader lives in ./nav-header.ts (extracted with the full canonical anatomy).
export { UdsNavHeaderElement } from './nav-header';

// NavVertical + NavItem live in ./nav-vertical.ts (extracted with full CSS port).
export { UdsNavVerticalElement, UdsNavItemElement } from './nav-vertical';

declare global {
  interface HTMLElementTagNameMap {
    'udc-divider': UdsDividerElement;
    'udc-spacer': UdsSpacerElement;
    'udc-icon-wrapper': UdsIconWrapperElement;
    'udc-combobox': UdsComboboxElement;
    'udc-combobox-option': UdsComboboxOptionElement;
    'udc-data-table': UdsDataTableElement;
    'udc-data-view': UdsDataViewElement;
  }
}
