import type { ReactNode } from 'react';

import { DocsCodeBlock, DocsPageHeader, DocsSection } from '@/components/site/ui';

export const metadata = { title: 'Composition Recipes — UDS' };

const modalFormCode = `<div class="udc-dialog-backdrop" data-open="true">
  <div class="udc-dialog" role="dialog" aria-modal="true" aria-labelledby="title">
    <div class="udc-dialog__header">
      <h2 class="udc-dialog__title" id="title">Add Tenant</h2>
      <button class="udc-dialog__close" aria-label="Close">…</button>
    </div>
    <div class="udc-dialog__body">
      <!-- Text Input, Dropdown, Notification components -->
    </div>
    <div class="udc-dialog__footer">
      <button class="udc-button-secondary">Cancel</button>
      <button class="udc-button-primary">Save tenant</button>
    </div>
  </div>
</div>`;

const dataTableCode = `<!-- Filter bar: Search + Chips -->
<div style="display:flex;gap:12px;">
  <div class="udc-search">…</div>
  <button class="udc-chip" data-variant="filter" aria-selected="true">Active</button>
</div>

<!-- Table -->
<div class="udc-data-table">
  <table>…</table>
</div>`;

const settingsPanelCode = `<div class="udc-tabs" role="tablist">
  <button class="udc-tab" aria-selected="true">General</button>
  <button class="udc-tab">Notifications</button>
</div>
<!-- Tabbed panel content: Text Input, Checkboxes, action bar -->`;

const appShellCode = `<div class="udc-nav-header">…</div>
<div style="display:flex;min-height:calc(100vh - 64px);">
  <nav class="udc-nav-vertical" aria-label="Main">…</nav>
  <main style="flex:1;">…</main>
</div>`;

function RecipeExample({ preview, code }: { preview: ReactNode; code: string }) {
  return (
    <div className="ds-example-card">
      <div className="ds-example-card__preview" style={{ display: 'block', justifyContent: 'initial' }}>
        {preview}
      </div>
      <details className="ds-example-card__code">
        <summary>Show code</summary>
        <DocsCodeBlock code={code} language="html" />
      </details>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <>
      <DocsPageHeader
        title="Composition Recipes"
        description="Curated multi-component patterns. Each recipe is a working example of how UDS components compose into common UI patterns. Use them as starting points — copy the structure into Storybook and customize."
      />

      <DocsSection
        title="Modal form with validation"
        description="Dialog + Text Input + Dropdown + Notification + primary/secondary buttons. Demonstrates focus trap, validation, and confirm/cancel actions."
        level={2}
      >
        <RecipeExample
          code={modalFormCode}
          preview={
            <div style={{ padding: 32, background: 'var(--uds-color-surface-page-main)', minHeight: 240 }}>
              <div
                className="udc-dialog-backdrop"
                data-open="true"
                style={{ position: 'relative', inset: 'auto', background: 'transparent', backdropFilter: 'none' }}
              >
                <div className="udc-dialog" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title" style={{ margin: 0 }}>
                  <div className="udc-dialog__header">
                    <h2 className="udc-dialog__title" id="recipe-modal-title">
                      Add Tenant
                    </h2>
                    <button className="udc-dialog__close" aria-label="Close">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="udc-dialog__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="udc-text-input">
                      <label className="udc-text-input__label">
                        Full name<span className="udc-text-input__required"></span>
                      </label>
                      <div className="udc-text-input__field">
                        <input type="text" placeholder="Brian Smith" />
                      </div>
                      <div className="udc-text-input__helper">
                        <span>As it appears on the lease</span>
                      </div>
                    </div>
                    <div className="udc-dropdown">
                      <label className="udc-dropdown__label">Property</label>
                      <div className="udc-dropdown__trigger" tabIndex={0} role="combobox" aria-expanded={false} aria-haspopup="listbox">
                        <span className="udc-dropdown__value" data-placeholder="">
                          Select property...
                        </span>
                        <span className="udc-dropdown__chevron">
                          <span className="material-symbols-outlined">keyboard_arrow_down</span>
                        </span>
                      </div>
                    </div>
                    <div className="udc-notification" data-variant="info" data-inline="true">
                      <span className="udc-notification__icon">
                        <span className="material-symbols-outlined">info</span>
                      </span>
                      <span className="udc-notification__text">Saving will send a welcome email automatically.</span>
                    </div>
                  </div>
                  <div className="udc-dialog__footer">
                    <button className="udc-button-secondary">Cancel</button>
                    <button className="udc-button-primary">Save tenant</button>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </DocsSection>

      <DocsSection
        title="Searchable data table"
        description="Search + Chip filters + Data Table + bulk action bar. Shows the canonical pattern for a list page."
        level={2}
      >
        <RecipeExample
          code={dataTableCode}
          preview={
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
                <div className="udc-search" style={{ flex: 1, minWidth: 240 }}>
                  <div className="udc-search__field">
                    <span className="udc-search__icon">
                      <span className="material-symbols-outlined">search</span>
                    </span>
                    <input type="search" placeholder="Search tenants..." />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="udc-chip" data-variant="filter" aria-selected="true">
                    <span className="udc-chip__leading-icon">
                      <span className="material-symbols-outlined">check</span>
                    </span>
                    <span className="udc-chip__label">Active</span>
                  </button>
                  <button className="udc-chip" data-variant="filter">
                    <span className="udc-chip__label">Pending</span>
                  </button>
                  <button className="udc-chip" data-variant="filter">
                    <span className="udc-chip__label">Overdue</span>
                  </button>
                </div>
              </div>
              <div className="udc-data-table">
                <table>
                  <thead>
                    <tr>
                      <th className="udc-dt-check">
                        <input type="checkbox" />
                      </th>
                      <th>Tenant</th>
                      <th>Status</th>
                      <th>Property</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="udc-dt-check">
                        <input type="checkbox" />
                      </td>
                      <td>Brian Smith</td>
                      <td>
                        <span className="udc-badge" data-variant="success">
                          Active
                        </span>
                      </td>
                      <td>Riverbend Estates</td>
                    </tr>
                    <tr>
                      <td className="udc-dt-check">
                        <input type="checkbox" />
                      </td>
                      <td>Catherine Lee</td>
                      <td>
                        <span className="udc-badge" data-variant="warning">
                          Pending
                        </span>
                      </td>
                      <td>Sunnyvale Towers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          }
        />
      </DocsSection>

      <DocsSection
        title="Settings panel with tabs"
        description="Tabs + List + Text Input + Checkbox + Save action. Pattern for grouped settings or preferences."
        level={2}
      >
        <RecipeExample
          code={settingsPanelCode}
          preview={
            <div style={{ padding: 24 }}>
              <div className="udc-tabs" role="tablist" style={{ marginBottom: 24 }}>
                <button className="udc-tab" role="tab" aria-selected="true">
                  General
                </button>
                <button className="udc-tab" role="tab">
                  Notifications
                </button>
                <button className="udc-tab" role="tab">
                  Billing
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                <div className="udc-text-input">
                  <label className="udc-text-input__label">Display name</label>
                  <div className="udc-text-input__field">
                    <input type="text" defaultValue="Sunnyvale Towers" />
                  </div>
                </div>
                <label className="udc-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span className="udc-checkbox__control"></span>
                  <span className="udc-checkbox__label">Send weekly summary email</span>
                </label>
                <label className="udc-checkbox">
                  <input type="checkbox" />
                  <span className="udc-checkbox__control"></span>
                  <span className="udc-checkbox__label">Allow online payments</span>
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="udc-button-secondary">Cancel</button>
                  <button className="udc-button-primary">Save changes</button>
                </div>
              </div>
            </div>
          }
        />
      </DocsSection>

      <DocsSection
        title="App shell with nav"
        description="Nav Header + Nav Vertical + content area. The standard authenticated app layout."
        level={2}
      >
        <RecipeExample
          code={appShellCode}
          preview={
            <div style={{ padding: 0, border: '1px solid var(--uds-color-border-secondary)', overflow: 'hidden' }}>
              <div className="udc-nav-header">
                <div className="udc-nav-header__left">
                  <div className="udc-nav-logo">
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--uds-color-icon-interactive)' }}>
                      apartment
                    </span>
                    <span className="udc-nav-logo__text">Boardroom</span>
                  </div>
                </div>
                <div className="udc-nav-header__right">
                  <button className="udc-button-ghost" data-icon-only="" data-size="sm">
                    <span className="material-symbols-outlined">notifications</span>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', minHeight: 200 }}>
                <nav
                  className="udc-nav-vertical"
                  aria-label="Main"
                  style={{ width: 200, borderRight: '1px solid var(--uds-color-border-secondary)', padding: '12px 0' }}
                >
                  <button className="udc-nav-button" aria-selected="true">
                    <span className="material-symbols-outlined">space_dashboard</span>
                    <span className="udc-nav-button__label">Dashboard</span>
                  </button>
                  <button className="udc-nav-button">
                    <span className="material-symbols-outlined">book</span>
                    <span className="udc-nav-button__label">Leasing</span>
                  </button>
                </nav>
                <div
                  style={{
                    flex: 1,
                    padding: 16,
                    color: 'var(--uds-color-text-secondary)',
                    fontFamily: 'var(--uds-font-family)',
                    fontSize: 14,
                  }}
                >
                  Page content goes here
                </div>
              </div>
            </div>
          }
        />
      </DocsSection>
    </>
  );
}
