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

export interface UdsPageChangeDetail {
  page: number;
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

export class UdsLabelElement extends LitElement {
  static properties = {
    for: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  for = '';
  required = false;
  disabled = false;

  static styles = [
    hostInline,
    css`
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050, 4px);
        color: var(--uds-color-text-primary, #171717);
        font-size: var(--uds-font-size-sm, 14px);
        font-weight: var(--uds-font-weight-medium, 500);
      }

      :host([disabled]) label {
        color: var(--uds-color-text-disabled-bold, #737373);
      }

      .required {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--uds-color-icon-error, #b42318);
      }
    `,
  ];

  render() {
    return html`<label part="label" for=${this.for || nothing}><slot></slot>${this.required ? html`<span part="required" class="required"></span>` : nothing}</label>`;
  }
}

export class UdsLinkElement extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
    target: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon', reflect: true },
    trailingIcon: { type: String, attribute: 'trailing-icon', reflect: true },
  };

  href = '';
  target = '';
  disabled = false;
  leadingIcon = '';
  trailingIcon = '';

  static styles = [
    hostInline,
    materialIconStyles,
    css`
      a {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050, 4px);
        color: var(--uds-color-text-interactive, #005ff0);
        font: inherit;
        text-decoration: underline;
        text-underline-offset: 0.16em;
      }

      a[aria-disabled='true'] {
        color: var(--uds-color-text-disabled-bold, #737373);
        pointer-events: none;
      }
    `,
    focusRing,
  ];

  render() {
    return html`
      <a part="link" href=${this.disabled ? nothing : this.href} target=${this.target || nothing} aria-disabled=${this.disabled ? 'true' : nothing}>
        ${this.leadingIcon ? html`<span part="leading-icon" class="material-symbols-outlined" aria-hidden="true">${this.leadingIcon}</span>` : nothing}
        <slot></slot>
        ${this.trailingIcon ? html`<span part="trailing-icon" class="material-symbols-outlined" aria-hidden="true">${this.trailingIcon}</span>` : nothing}
      </a>
    `;
  }
}

export class UdsTextAreaElement extends LitElement {
  static formAssociated = true;
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    helperText: { type: String, attribute: 'helper-text', reflect: true },
    placeholder: { type: String, reflect: true },
    state: { type: String, reflect: true },
    rows: { type: Number, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    maxLength: { type: Number, attribute: 'max-length', reflect: true },
  };

  name = '';
  value = '';
  label = '';
  helperText = '';
  placeholder = '';
  state = 'default';
  rows = 4;
  required = false;
  disabled = false;
  maxLength?: number;
  private readonly internals = formInternals(this);

  static styles = [hostBlock, fieldChrome];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }

  render() {
    return html`
      <label part="label" class="label">${this.label}<slot name="label"></slot></label>
      <div part="field" class="field">
        <textarea
          part="textarea"
          name=${this.name || nothing}
          .value=${this.value}
          rows=${this.rows}
          placeholder=${this.placeholder || nothing}
          maxlength=${this.maxLength ?? nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.state === 'error' ? 'true' : nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        ></textarea>
      </div>
      ${this.helperText || this.maxLength !== undefined ? html`<div part="helper" class="helper">${this.helperText}<span>${this.maxLength !== undefined ? `${this.value.length}/${this.maxLength}` : ''}</span></div>` : nothing}
    `;
  }

  private handleInput(event: Event) {
    this.value = (event.currentTarget as HTMLTextAreaElement).value;
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-input', { value: this.value });
  }

  private handleChange() {
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-change', { value: this.value });
  }
}

// Toggle lives in ./toggle.ts (extracted with the full CSS port).
export { UdsToggleElement } from './toggle';
export type { UdsToggleChangeDetail } from './toggle';

export class UdsRadioGroupElement extends LitElement {
  static formAssociated = true;
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };

  name = '';
  value = '';
  label = '';
  private readonly internals = formInternals(this);

  static styles = [hostBlock, css`.group { display: grid; gap: var(--uds-space-100, 8px); } .label { font-weight: var(--uds-font-weight-medium, 500); }`];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }

  render() {
    return html`<fieldset part="group" class="group" @udc-change=${this.handleRadioChange}><legend part="label" class="label">${this.label}<slot name="label"></slot></legend><slot></slot></fieldset>`;
  }

  private handleRadioChange(event: Event) {
    const detail = (event as CustomEvent<UdsCheckedChangeDetail>).detail;
    if (!detail?.checked) return;
    this.value = detail.value;
    this.querySelectorAll<UdsRadioElement>('udc-radio').forEach((radio) => {
      radio.checked = radio.value === this.value;
      radio.name = this.name;
    });
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-radio-group-change', { value: this.value });
  }
}

export class UdsRadioElement extends LitElement {
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  name = '';
  value = '';
  checked = false;
  disabled = false;

  static styles = [hostInline, css`label { display: inline-flex; align-items: center; gap: var(--uds-space-100, 8px); color: var(--uds-color-text-primary, #171717); }`];

  render() {
    return html`<label part="label"><input part="input" type="radio" name=${this.name || nothing} value=${this.value} ?checked=${this.checked} ?disabled=${this.disabled} @change=${this.handleChange} /><slot></slot></label>`;
  }

  private handleChange(event: Event) {
    this.checked = (event.currentTarget as HTMLInputElement).checked;
    emitUdsEvent<UdsCheckedChangeDetail>(this, 'udc-change', { checked: this.checked, value: this.value });
  }
}

export class UdsSearchElement extends LitElement {
  static formAssociated = true;
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
  };

  name = '';
  value = '';
  label = 'Search';
  placeholder = 'Search';
  private readonly internals = formInternals(this);

  static styles = [hostBlock, materialIconStyles, fieldChrome];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }

  render() {
    return html`<label part="label" class="label">${this.label}</label><div part="field" class="field"><span class="material-symbols-outlined" aria-hidden="true">search</span><input part="input" type="search" .value=${this.value} name=${this.name || nothing} placeholder=${this.placeholder} @input=${this.handleInput} @change=${this.handleChange} /></div>`;
  }

  private handleInput(event: Event) {
    this.value = (event.currentTarget as HTMLInputElement).value;
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-input', { value: this.value });
  }

  private handleChange() {
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-change', { value: this.value });
  }
}

export class UdsBreadcrumbElement extends LitElement {
  static styles = [hostBlock, css`nav { color: var(--uds-color-text-secondary, #525252); font-size: var(--uds-font-size-sm, 14px); } ::slotted(*) { margin-right: var(--uds-space-075, 6px); }`];
  render() {
    return html`<nav part="nav" aria-label="Breadcrumb"><slot></slot></nav>`;
  }
}

export class UdsListElement extends LitElement {
  static properties = {
    selectable: { type: Boolean, reflect: true },
  };
  selectable = false;
  static styles = [hostBlock, css`.list { display: grid; gap: var(--uds-space-050, 4px); }`];
  render() {
    return html`<div part="list" class="list" role=${this.selectable ? 'listbox' : 'list'}><slot></slot></div>`;
  }
}

export class UdsListItemElement extends LitElement {
  static properties = {
    selected: { type: Boolean, reflect: true },
    value: { type: String, reflect: true },
  };
  selected = false;
  value = '';
  static styles = [hostBlock, css`button { width: 100%; text-align: left; padding: var(--uds-space-150, 12px); border: 1px solid var(--uds-color-border-secondary, #e5e5e5); border-radius: var(--uds-border-radius-input, 8px); background: var(--uds-color-surface-main, #fff); color: var(--uds-color-text-primary, #171717); font: inherit; } :host([selected]) button { border-color: var(--uds-color-border-interactive, #005ff0); background: var(--uds-color-surface-interactive-subtle-active, #eef5ff); }`, focusRing];
  render() {
    return html`<button part="item" role="option" aria-selected=${this.selected ? 'true' : 'false'} @click=${this.handleClick}><slot></slot></button>`;
  }
  private handleClick() {
    this.selected = !this.selected;
    emitUdsEvent(this, 'udc-list-item-select', { value: this.value, selected: this.selected });
  }
}

export class UdsPaginationElement extends LitElement {
  static properties = {
    page: { type: Number, reflect: true },
    totalPages: { type: Number, attribute: 'total-pages', reflect: true },
  };
  page = 1;
  totalPages = 1;
  static styles = [hostInline, css`.root { display: inline-flex; align-items: center; gap: var(--uds-space-100, 8px); } button { font: inherit; }`, focusRing];
  render() {
    return html`<nav part="nav" class="root" aria-label="Pagination"><button part="previous" ?disabled=${this.page <= 1} @click=${() => this.setPage(this.page - 1)}>Previous</button><span part="status">Page ${this.page} of ${this.totalPages}</span><button part="next" ?disabled=${this.page >= this.totalPages} @click=${() => this.setPage(this.page + 1)}>Next</button></nav>`;
  }
  private setPage(page: number) {
    this.page = Math.max(1, Math.min(this.totalPages, page));
    emitUdsEvent<UdsPageChangeDetail>(this, 'udc-page-change', { page: this.page });
  }
}

export class UdsTooltipElement extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
  };
  open = false;
  position = 'top';
  static styles = [hostInline, css`.root { position: relative; display: inline-flex; } .tip { position: absolute; z-index: 20; min-width: max-content; max-width: 260px; padding: var(--uds-space-075, 6px) var(--uds-space-100, 8px); border-radius: var(--uds-border-radius-input, 8px); background: var(--uds-color-surface-inverse, #171717); color: var(--uds-color-text-inverse, #fff); font-size: var(--uds-font-size-xs, 12px); line-height: var(--uds-font-line-height-xs, 1.2); } :host(:not([open])) .tip { display: none; } :host([position='top']) .tip { inset-block-end: calc(100% + var(--uds-space-050, 4px)); inset-inline-start: 50%; transform: translateX(-50%); } :host([position='bottom']) .tip { inset-block-start: calc(100% + var(--uds-space-050, 4px)); inset-inline-start: 50%; transform: translateX(-50%); } :host([position='left']) .tip { inset-inline-end: calc(100% + var(--uds-space-050, 4px)); inset-block-start: 50%; transform: translateY(-50%); } :host([position='right']) .tip { inset-inline-start: calc(100% + var(--uds-space-050, 4px)); inset-block-start: 50%; transform: translateY(-50%); }`];
  render() {
    return html`<span part="root" class="root" @mouseenter=${this.show} @mouseleave=${this.hide} @focusin=${this.show} @focusout=${this.hide} @keydown=${this.handleKeydown}><slot name="trigger"></slot><span part="tooltip" class="tip" role="tooltip"><slot></slot></span></span>`;
  }
  private show() {
    this.open = true;
  }
  private hide() {
    this.open = false;
  }
  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.hide();
  }
}

export class UdsDialogElement extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String, reflect: true },
  };
  open = false;
  heading = '';
  static styles = [hostBlock, css`:host(:not([open])) { display: none; } .backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; background: rgb(0 0 0 / 45%); } .dialog { width: min(560px, calc(100vw - 32px)); padding: var(--uds-space-300, 24px); border-radius: var(--uds-border-radius-card, 12px); background: var(--uds-color-surface-main, #fff); color: var(--uds-color-text-primary, #171717); box-shadow: var(--uds-shadow-depth-400, 0 16px 40px rgb(0 0 0 / 20%)); } header { display: flex; justify-content: space-between; gap: var(--uds-space-200, 16px); }`];
  protected updated(changed: PropertyValues<this>) {
    if (changed.has('open') && this.open) {
      queueMicrotask(() => this.focusFirstElement());
    }
  }
  render() {
    return html`<div part="backdrop" class="backdrop" @click=${this.handleBackdrop} @keydown=${this.handleKeydown}><section part="dialog" class="dialog" role="dialog" aria-modal="true" aria-label=${this.heading || nothing}><header><h2>${this.heading}<slot name="heading"></slot></h2><button part="close" type="button" @click=${this.close}>Close</button></header><slot></slot><footer part="actions"><slot name="actions"></slot></footer></section></div>`;
  }
  private handleBackdrop(event: Event) {
    if (event.target === event.currentTarget) this.close();
  }
  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.focusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  private focusFirstElement() {
    this.focusableElements()[0]?.focus();
  }
  private focusableElements(): HTMLElement[] {
    const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const shadowItems = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(selectors));
    const slottedItems = Array.from(this.querySelectorAll<HTMLElement>(selectors));
    return [...shadowItems, ...slottedItems].filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
  }
  close() {
    this.open = false;
    emitUdsEvent(this, 'udc-close', {});
  }
}

// Dropdown + DropdownItem live in ./dropdown.ts (extracted with the full CSS port).
// Re-export so existing imports from './components/remaining' keep working.
export { UdsDropdownElement, UdsDropdownItemElement } from './dropdown';
export type { UdsDropdownChangeDetail, UdsDropdownState } from './dropdown';

import { UdsDropdownElement as _UdsDropdownElement, UdsDropdownItemElement as _UdsDropdownItemElement } from './dropdown';

/** Combobox is currently a Dropdown alias; full filtering/autocomplete arrives later. */
export class UdsComboboxElement extends _UdsDropdownElement {}
export class UdsComboboxOptionElement extends _UdsDropdownItemElement {}

export class UdsDatePickerElement extends LitElement {
  static formAssociated = true;
  static properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };
  name = '';
  value = '';
  label = '';
  private readonly internals = formInternals(this);
  static styles = [hostBlock, fieldChrome];
  protected updated(changed: PropertyValues<this>) {
    if (changed.has('value')) this.internals?.setFormValue(this.value);
  }
  render() {
    return html`<label class="label">${this.label}</label><div class="field"><input part="input" type="date" name=${this.name || nothing} .value=${this.value} @change=${this.handleChange} /></div>`;
  }
  private handleChange(event: Event) {
    this.value = (event.currentTarget as HTMLInputElement).value;
    emitUdsEvent<UdsValueChangeDetail>(this, 'udc-change', { value: this.value });
  }
}

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

export class UdsNavHeaderElement extends LitElement {
  static styles = [hostBlock, css`header { display: flex; align-items: center; justify-content: space-between; gap: var(--uds-space-200, 16px); padding: var(--uds-space-150, 12px) var(--uds-space-300, 24px); background: var(--uds-color-surface-main, #fff); border-bottom: 1px solid var(--uds-color-border-secondary, #e5e5e5); }`];
  render() {
    return html`<header part="header"><div part="brand"><slot name="brand"></slot></div><nav part="nav"><slot></slot></nav><div part="actions"><slot name="actions"></slot></div></header>`;
  }
}

export class UdsNavVerticalElement extends LitElement {
  static styles = [hostBlock, css`nav { display: grid; gap: var(--uds-space-050, 4px); }`];
  render() {
    return html`<nav part="nav" aria-label=${this.getAttribute('aria-label') || 'Navigation'}><slot></slot></nav>`;
  }
}

export class UdsNavItemElement extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
    current: { type: Boolean, reflect: true },
  };
  href = '';
  current = false;
  static styles = [hostBlock, css`a { display: flex; align-items: center; gap: var(--uds-space-100, 8px); padding: var(--uds-space-100, 8px); border-radius: var(--uds-border-radius-input, 8px); color: var(--uds-color-text-primary, #171717); text-decoration: none; } :host([current]) a { background: var(--uds-color-surface-interactive-subtle-active, #eef5ff); color: var(--uds-color-text-interactive, #005ff0); }`];
  render() {
    return html`<a part="link" href=${this.href || nothing} aria-current=${this.current ? 'page' : nothing}><slot></slot></a>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-divider': UdsDividerElement;
    'udc-spacer': UdsSpacerElement;
    'udc-icon-wrapper': UdsIconWrapperElement;
    'udc-label': UdsLabelElement;
    'udc-link': UdsLinkElement;
    'udc-text-area': UdsTextAreaElement;
    'udc-radio-group': UdsRadioGroupElement;
    'udc-radio': UdsRadioElement;
    'udc-search': UdsSearchElement;
    'udc-breadcrumb': UdsBreadcrumbElement;
    'udc-list': UdsListElement;
    'udc-list-item': UdsListItemElement;
    'udc-pagination': UdsPaginationElement;
    'udc-tooltip': UdsTooltipElement;
    'udc-dialog': UdsDialogElement;
    'udc-combobox': UdsComboboxElement;
    'udc-combobox-option': UdsComboboxOptionElement;
    'udc-date-picker': UdsDatePickerElement;
    'udc-data-table': UdsDataTableElement;
    'udc-data-view': UdsDataViewElement;
    'udc-nav-header': UdsNavHeaderElement;
    'udc-nav-vertical': UdsNavVerticalElement;
    'udc-nav-item': UdsNavItemElement;
  }
}
