import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostBlock, materialIconStyles } from '../styles';

export type UdsDataTableSortDirection = 'asc' | 'desc' | 'none';

export interface UdsDataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  prominent?: boolean;
  width?: string;
}

export type UdsDataTableCell =
  | string
  | number
  | { text?: string; html?: string; badge?: { label: string; tone?: string } };

export type UdsDataTableRow = Record<string, UdsDataTableCell>;

export interface UdsDataTableSortChangeDetail {
  key: string;
  direction: UdsDataTableSortDirection;
}

/**
 * `<udc-data-table>` — full data table that renders columns + rows from
 * JSON attributes. Ports the original `data-table.css` into shadow DOM so
 * the consumer doesn't need to write the inner `<table>` markup.
 *
 * Public attributes/properties:
 *   columns         — array of `{ key, label, align?, sortable?, prominent?, width? }`
 *   rows            — array of row objects keyed by column.key
 *   sort-key        — current sort column key (reflected)
 *   sort-direction  — "asc" | "desc" | "none" (reflected)
 *   striped         — boolean (zebra rows)
 *   selectable      — boolean (adds a checkbox column + row selection)
 *
 * Events:
 *   udc-sort-change      — fires when a sortable column header is activated
 *   udc-selection-change — fires when the row selection changes
 */
export class UdsDataTableElement extends LitElement {
  static properties = {
    columns: { type: Array },
    rows: { type: Array },
    sortKey: { type: String, attribute: 'sort-key', reflect: true },
    sortDirection: { type: String, attribute: 'sort-direction', reflect: true },
    striped: { type: Boolean, reflect: true },
    selectable: { type: Boolean, reflect: true },
  };

  columns: UdsDataTableColumn[] = [];
  rows: UdsDataTableRow[] = [];
  sortKey = '';
  sortDirection: UdsDataTableSortDirection = 'none';
  striped = false;
  selectable = false;

  private selectedRows = new Set<number>();

  /**
   * Full CSS port from `uds/components/data-table/data-table.css` on main.
   */
  static styles = [
    hostBlock,
    materialIconStyles,
    css`
      :host {
        display: block;
        font-family: var(--uds-font-family);
      }

      .udc-data-table {
        width: 100%;
        overflow-x: auto;
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-base);
        line-height: var(--uds-font-line-height-base);
        color: var(--uds-color-text-primary);
        border: 1px solid var(--uds-color-border-secondary);
        border-radius: var(--uds-border-radius-container-sm, 4px);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
      }

      /* Header */
      thead th {
        height: 56px;
        padding: var(--uds-space-100) var(--uds-space-200);
        background-color: var(--uds-color-surface-alt);
        font-weight: var(--uds-font-weight-bold);
        font-size: var(--uds-font-size-base);
        color: var(--uds-color-text-primary);
        text-align: left;
        white-space: nowrap;
        border-bottom: 1px solid var(--uds-color-border-secondary);
        position: sticky;
        top: 0;
        z-index: var(--uds-z-index-sticky, 100);
        user-select: none;
        vertical-align: middle;
      }

      thead th:not(:last-child) {
        border-right: 1px solid var(--uds-color-border-secondary);
      }

      thead th.is-sortable {
        cursor: pointer;
      }

      thead th.is-sortable:focus-visible {
        outline: 2px solid var(--uds-color-border-outline-focus-visible);
        outline-offset: -2px;
      }

      /* Body */
      tbody td {
        height: 44px;
        padding: var(--uds-space-100) var(--uds-space-200);
        background-color: var(--uds-color-surface-interactive-none, transparent);
        font-weight: var(--uds-font-weight-regular, 400);
        vertical-align: middle;
        border-bottom: 1px solid var(--uds-color-border-secondary);
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      :host([striped]) tbody tr:nth-child(even) td {
        background-color: var(--uds-color-surface-alt);
      }

      tbody tr:hover td {
        background-color: var(--uds-color-surface-interactive-subtle-hover);
      }

      tbody tr[aria-selected='true'] td {
        background-color: var(--uds-color-surface-info-subtle);
      }

      /* Alignment */
      .udc-dt-align-center {
        text-align: center;
      }

      .udc-dt-align-right {
        text-align: right;
      }

      /* Prominent */
      .udc-dt-prominent {
        font-weight: var(--uds-font-weight-bold);
      }

      /* Checkbox column */
      .udc-dt-check {
        width: 40px;
        text-align: center;
        padding-left: var(--uds-space-100);
        padding-right: var(--uds-space-100);
      }

      .udc-dt-check input[type='checkbox'] {
        width: 16px;
        height: 16px;
        margin: 0;
        cursor: pointer;
        accent-color: var(--uds-color-surface-interactive-default);
      }

      /* Sort indicator */
      .udc-dt-sort {
        display: inline-flex;
        align-items: center;
        margin-left: 4px;
        vertical-align: middle;
      }

      .udc-dt-sort .material-symbols-outlined {
        font-size: 16px;
        line-height: 1;
        color: var(--uds-color-icon-secondary);
      }

      .udc-dt-sort[data-dir='asc'] .material-symbols-outlined,
      .udc-dt-sort[data-dir='desc'] .material-symbols-outlined {
        color: var(--uds-color-icon-interactive);
      }
    `,
  ];

  render() {
    const cols = this.columns;
    const allSelected =
      this.rows.length > 0 && this.rows.every((_, i) => this.selectedRows.has(i));

    return html`
      <div class="udc-data-table" part="wrapper">
        <table>
          <thead>
            <tr>
              ${this.selectable
                ? html`<th class="udc-dt-check">
                    <input
                      type="checkbox"
                      .checked=${allSelected}
                      @change=${this.handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>`
                : nothing}
              ${cols.map((col) => this.renderHeader(col))}
            </tr>
          </thead>
          <tbody>
            ${this.rows.map((row, i) => this.renderRow(row, i, cols))}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderHeader(col: UdsDataTableColumn) {
    const align =
      col.align === 'center'
        ? 'udc-dt-align-center'
        : col.align === 'right'
          ? 'udc-dt-align-right'
          : '';
    const sortable = col.sortable !== false;
    const direction = this.sortKey === col.key ? this.sortDirection : 'none';
    const sortIcon =
      direction === 'asc'
        ? 'arrow_upward'
        : direction === 'desc'
          ? 'arrow_downward'
          : 'unfold_more';

    return html`
      <th
        class=${`${align} ${sortable ? 'is-sortable' : ''}`}
        style=${col.width ? `width:${col.width}` : nothing}
        tabindex=${sortable ? '0' : nothing}
        @click=${sortable ? () => this.handleSortToggle(col.key) : null}
        @keydown=${sortable ? (e: KeyboardEvent) => this.handleSortKeydown(e, col.key) : null}
        aria-sort=${direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : nothing}
      >
        ${col.label}
        ${sortable
          ? html`<span class="udc-dt-sort" data-dir=${direction === 'none' ? nothing : direction}
              ><span class="material-symbols-outlined">${sortIcon}</span></span
            >`
          : nothing}
      </th>
    `;
  }

  private renderRow(row: UdsDataTableRow, index: number, cols: UdsDataTableColumn[]) {
    const selected = this.selectedRows.has(index);
    return html`
      <tr aria-selected=${this.selectable ? String(selected) : nothing}>
        ${this.selectable
          ? html`<td class="udc-dt-check">
              <input
                type="checkbox"
                .checked=${selected}
                @change=${(e: Event) => this.handleRowSelect(index, e)}
                aria-label=${`Select row ${index + 1}`}
              />
            </td>`
          : nothing}
        ${cols.map((col) => this.renderCell(row, col))}
      </tr>
    `;
  }

  private renderCell(row: UdsDataTableRow, col: UdsDataTableColumn) {
    const value = row[col.key];
    const align =
      col.align === 'center'
        ? 'udc-dt-align-center'
        : col.align === 'right'
          ? 'udc-dt-align-right'
          : '';
    const classes = [align, col.prominent ? 'udc-dt-prominent' : ''].filter(Boolean).join(' ');

    const content = (() => {
      if (value === undefined || value === null) return '';
      if (typeof value === 'string' || typeof value === 'number') return value;
      if (typeof value === 'object' && 'text' in value) return value.text ?? '';
      return '';
    })();

    return html`<td class=${classes || nothing}>${content}</td>`;
  }

  private handleSortToggle(key: string) {
    const nextDirection =
      this.sortKey !== key || this.sortDirection === 'none'
        ? 'asc'
        : this.sortDirection === 'asc'
          ? 'desc'
          : 'none';
    this.sortKey = nextDirection === 'none' ? '' : key;
    this.sortDirection = nextDirection;
    emitUdsEvent<UdsDataTableSortChangeDetail>(this, 'udc-sort-change', {
      key,
      direction: nextDirection,
    });
  }

  private handleSortKeydown(event: KeyboardEvent, key: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleSortToggle(key);
    }
  }

  private handleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.rows.forEach((_, i) => this.selectedRows.add(i));
    } else {
      this.selectedRows.clear();
    }
    this.requestUpdate();
    this.emitSelectionChange();
  }

  private handleRowSelect(index: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRows.add(index);
    } else {
      this.selectedRows.delete(index);
    }
    this.requestUpdate();
    this.emitSelectionChange();
  }

  private emitSelectionChange() {
    emitUdsEvent(this, 'udc-selection-change', {
      selected: Array.from(this.selectedRows),
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-data-table': UdsDataTableElement;
  }
}
