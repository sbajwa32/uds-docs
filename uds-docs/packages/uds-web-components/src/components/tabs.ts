import { LitElement, PropertyValues, css, html } from 'lit';

import { emitUdsEvent } from '../events';
import { focusRing, hostBlock } from '../styles';

export interface UdsTabChangeDetail {
  panel: string;
  index: number;
}

export class UdsTabElement extends LitElement {
  static properties = {
    panel: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  panel = '';
  selected = false;
  disabled = false;

  static styles = [
    css`
      :host {
        display: inline-flex;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--uds-tab-padding-block, var(--uds-space-200, 16px)) var(--uds-space-300, 24px);
        border: 0;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        background: transparent;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        font: inherit;
        font-size: var(--uds-font-size-base, 16px);
        font-weight: var(--uds-font-weight-medium, 500);
        line-height: var(--uds-font-line-height-base, 1.5);
        color: var(--uds-color-text-primary, #171717);
        appearance: none;
        outline: none;
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
      }

      button:hover:not(:disabled):not([aria-selected='true']) {
        background: var(--uds-color-surface-interactive-subtle-hover, rgb(31 111 235 / 10%));
        color: var(--uds-color-text-interactive, #1f6feb);
      }

      button[aria-selected='true'] {
        color: var(--uds-color-text-interactive, #1f6feb);
        border-bottom-color: var(--uds-color-border-interactive, #1f6feb);
      }

      button[aria-selected='true']:hover {
        background: var(--uds-color-surface-interactive-subtle-hover, rgb(31 111 235 / 10%));
        border-bottom-color: var(--uds-color-border-interactive-hover, #1a5dcc);
      }

      button:disabled {
        color: var(--uds-color-text-disabled, #a3a3a3);
        cursor: not-allowed;
        pointer-events: none;
      }
    `,
    focusRing,
  ];

  render() {
    return html`
      <button
        part="tab"
        type="button"
        role="tab"
        aria-selected=${String(this.selected)}
        aria-controls=${this.panel || undefined}
        tabindex=${this.selected ? '0' : '-1'}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }

  focusTab() {
    this.renderRoot.querySelector('button')?.focus();
  }

  private handleClick() {
    if (!this.disabled) emitUdsEvent(this, 'udc-tab-activate', { panel: this.panel });
  }
}

export class UdsTabPanelElement extends LitElement {
  static properties = {
    panel: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  panel = '';
  selected = false;

  static styles = [
    hostBlock,
    css`
      :host([hidden]) {
        display: none;
      }

      section {
        padding: var(--uds-space-200, 16px) 0;
      }
    `,
  ];

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('selected')) this.hidden = !this.selected;
  }

  render() {
    return html`
      <section part="panel" role="tabpanel" id=${this.panel || undefined}>
        <slot></slot>
      </section>
    `;
  }
}

export class UdsTabsElement extends LitElement {
  static properties = {
    selectedPanel: { type: String, attribute: 'selected-panel', reflect: true },
    size: { type: String, reflect: true },
  };

  selectedPanel = '';
  size: 'default' | 'sm' = 'default';

  static styles = [
    hostBlock,
    css`
      .tabs {
        display: flex;
        border-bottom: 1px solid var(--uds-color-border-primary, #d4d4d4);
      }

      :host([size='sm']) ::slotted(udc-tab) {
        --uds-tab-padding-block: var(--uds-space-100, 8px);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('udc-tab-activate', this.handleActivate as EventListener);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('udc-tab-activate', this.handleActivate as EventListener);
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.syncTabs(false);
  }

  render() {
    return html`
      <div part="tablist" class="tabs" role="tablist">
        <slot name="tab" @slotchange=${() => this.syncTabs(false)}></slot>
      </div>
      <slot name="panel" @slotchange=${() => this.syncTabs(false)}></slot>
    `;
  }

  private get tabs() {
    return Array.from(this.querySelectorAll<UdsTabElement>('udc-tab'));
  }

  private get panels() {
    return Array.from(this.querySelectorAll<UdsTabPanelElement>('udc-tab-panel'));
  }

  private handleActivate = (event: Event) => {
    const tab = event.target instanceof UdsTabElement ? event.target : null;
    if (tab) this.selectTab(tab, true, false);
  };

  private handleKeydown = (event: KeyboardEvent) => {
    const tabs = this.tabs.filter((tab) => !tab.disabled);
    const path = event.composedPath();
    const activeTab = path.find((node): node is UdsTabElement => node instanceof UdsTabElement);
    if (!activeTab || !tabs.length) return;

    const current = tabs.indexOf(activeTab);
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    this.selectTab(tabs[next], true, true);
  };

  private syncTabs(notify: boolean) {
    const tabs = this.tabs;
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      if (tab.slot !== 'tab') tab.slot = 'tab';
    });
    this.panels.forEach((panel) => {
      if (panel.slot !== 'panel') panel.slot = 'panel';
    });

    const selected =
      tabs.find((tab) => tab.panel && tab.panel === this.selectedPanel && !tab.disabled) ??
      tabs.find((tab) => tab.selected && !tab.disabled) ??
      tabs.find((tab) => !tab.disabled) ??
      tabs[0];

    this.selectTab(selected, notify, false);
  }

  private selectTab(tab: UdsTabElement, notify: boolean, focus: boolean) {
    const tabs = this.tabs;
    const panel = tab.panel || `panel-${tabs.indexOf(tab)}`;
    this.selectedPanel = panel;

    tabs.forEach((item) => {
      item.selected = item === tab;
    });

    this.panels.forEach((item) => {
      item.selected = item.panel === panel;
    });

    if (focus) tab.focusTab();

    if (notify) {
      emitUdsEvent<UdsTabChangeDetail>(this, 'udc-tab-change', {
        panel,
        index: tabs.indexOf(tab),
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-tabs': UdsTabsElement;
    'udc-tab': UdsTabElement;
    'udc-tab-panel': UdsTabPanelElement;
  }
}
