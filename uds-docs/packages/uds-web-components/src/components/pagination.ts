import { LitElement, css, html, nothing } from 'lit';

import { emitUdsEvent } from '../events';
import { hostInline, materialIconStyles } from '../styles';

export interface UdsPageChangeDetail {
  page: number;
}

/**
 * `<udc-pagination>` — pagination control with previous/next chevrons,
 * numbered page buttons, and an optional meta row (rows-per-page +
 * range summary).
 *
 * Public attributes/properties:
 *   page             — current page (1-indexed)
 *   total-pages      — total number of pages
 *   total-items      — total number of items (for the meta row)
 *   rows-per-page    — rows-per-page value shown in the meta row
 *   show-meta        — boolean (renders the rows-per-page + range meta)
 *
 * Events:
 *   udc-page-change  — fires when the page changes; detail: { page }
 */
export class UdsPaginationElement extends LitElement {
  static properties = {
    page: { type: Number, reflect: true },
    totalPages: { type: Number, attribute: 'total-pages', reflect: true },
    totalItems: { type: Number, attribute: 'total-items', reflect: true },
    rowsPerPage: { type: Number, attribute: 'rows-per-page', reflect: true },
    showMeta: { type: Boolean, attribute: 'show-meta', reflect: true },
  };

  page = 1;
  totalPages = 1;
  totalItems = 0;
  rowsPerPage = 0;
  showMeta = false;

  /**
   * Full CSS port from `uds/components/pagination/pagination.css` on main.
   */
  static styles = [
    hostInline,
    materialIconStyles,
    css`
      :host {
        display: inline-flex;
        font-family: var(--uds-font-family);
      }

      .udc-pagination {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        font-family: var(--uds-font-family);
        color: var(--uds-color-text-primary);
      }

      .udc-pagination__pages {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-050);
      }

      .udc-pagination__button {
        min-width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: var(--uds-border-width-100, 1px) solid var(--uds-color-border-primary);
        border-radius: var(--uds-border-radius-input);
        background: var(--uds-color-surface-main);
        color: var(--uds-color-text-primary);
        font-family: var(--uds-font-family);
        font-size: var(--uds-font-size-sm);
        font-weight: var(--uds-font-weight-medium);
        line-height: var(--uds-font-line-height-sm);
        cursor: pointer;
        font-style: inherit;
        -webkit-appearance: none;
        appearance: none;
      }

      .udc-pagination__button:hover:not(:disabled):not([aria-current='page']) {
        background: var(--uds-color-surface-interactive-subtle-hover);
        border-color: var(--uds-color-border-interactive-hover);
      }

      .udc-pagination__button[aria-current='page'] {
        background: var(--uds-color-surface-interactive-default);
        border-color: var(--uds-color-border-interactive);
        color: var(--uds-color-text-inverse);
      }

      .udc-pagination__button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .udc-pagination__button:focus-visible {
        outline: var(--uds-border-width-200, 2px) solid
          var(--uds-color-border-outline-focus-visible);
        outline-offset: var(--uds-space-050);
      }

      .udc-pagination__button .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
      }

      .udc-pagination__meta {
        display: inline-flex;
        align-items: center;
        gap: var(--uds-space-100);
        margin-left: var(--uds-space-200);
        color: var(--uds-color-text-secondary);
        font-size: var(--uds-font-size-sm);
        line-height: var(--uds-font-line-height-sm);
      }
    `,
  ];

  render() {
    const pages = this.computePages();
    const start = this.totalItems
      ? Math.min((this.page - 1) * (this.rowsPerPage || 1) + 1, this.totalItems)
      : 0;
    const end = this.totalItems
      ? Math.min(this.page * (this.rowsPerPage || 1), this.totalItems)
      : 0;

    return html`
      <nav class="udc-pagination" part="nav" aria-label="Pagination">
        <div class="udc-pagination__pages" part="pages">
          <button
            class="udc-pagination__button"
            part="previous"
            type="button"
            aria-label="Previous page"
            ?disabled=${this.page <= 1}
            @click=${() => this.setPage(this.page - 1)}
          >
            <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
          ${pages.map((p) =>
            typeof p === 'number'
              ? html`<button
                  class="udc-pagination__button"
                  type="button"
                  aria-current=${p === this.page ? 'page' : nothing}
                  aria-label=${`Page ${p}`}
                  @click=${() => this.setPage(p)}
                >
                  ${p}
                </button>`
              : html`<span aria-hidden="true">…</span>`,
          )}
          <button
            class="udc-pagination__button"
            part="next"
            type="button"
            aria-label="Next page"
            ?disabled=${this.page >= this.totalPages}
            @click=${() => this.setPage(this.page + 1)}
          >
            <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          </button>
        </div>
        ${this.showMeta && (this.rowsPerPage || this.totalItems)
          ? html`
              <div class="udc-pagination__meta" part="meta">
                ${this.rowsPerPage
                  ? html`<span>Rows per page</span><span>${this.rowsPerPage}</span>`
                  : nothing}
                ${this.totalItems
                  ? html`<span>${start}-${end} / ${this.totalItems}</span>`
                  : nothing}
              </div>
            `
          : nothing}
      </nav>
    `;
  }

  /** Compute visible page numbers with ellipsis for large ranges. */
  private computePages(): Array<number | '…'> {
    const total = Math.max(1, this.totalPages);
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: Array<number | '…'> = [1];
    const start = Math.max(2, this.page - 1);
    const end = Math.min(total - 1, this.page + 1);
    if (start > 2) pages.push('…');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
  }

  private setPage(page: number) {
    const next = Math.max(1, Math.min(this.totalPages, page));
    if (next === this.page) return;
    this.page = next;
    emitUdsEvent<UdsPageChangeDetail>(this, 'udc-page-change', { page: this.page });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'udc-pagination': UdsPaginationElement;
  }
}
