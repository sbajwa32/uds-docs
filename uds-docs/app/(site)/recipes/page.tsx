import type { ReactNode } from 'react';

import { WebComponentPreview } from '@/components/site/WebComponentPreview';
import { DocsCodeBlock, DocsPageHeader, DocsSection } from '@/components/site/ui';

export const metadata = { title: 'Composition Recipes — UDS' };

const modalFormCode = `<udc-dialog heading="Add Tenant" open>
  <udc-text-input label="Full name" required></udc-text-input>
  <udc-dropdown label="Property">
    <udc-dropdown-item value="riverbend">Riverbend Estates</udc-dropdown-item>
  </udc-dropdown>
  <udc-notification tone="info" inline>
    Saving will send a welcome email automatically.
  </udc-notification>
  <div slot="actions">
    <udc-button variant="secondary">Cancel</udc-button>
    <udc-button variant="primary">Save tenant</udc-button>
  </div>
</udc-dialog>`;

const dataTableCode = `<!-- Filter bar: Search + Chips -->
<div style="display:flex;gap:12px;">
  <udc-search label="Search tenants"></udc-search>
  <udc-chip variant="filter" selected>Active</udc-chip>
</div>

<!-- Table -->
<udc-data-table>
  <table>…</table>
</udc-data-table>`;

const settingsPanelCode = `<udc-tabs selected-panel="general">
  <udc-tab panel="general">General</udc-tab>
  <udc-tab panel="notifications">Notifications</udc-tab>
  <udc-tab-panel panel="general">
    <udc-text-input label="Display name"></udc-text-input>
    <udc-checkbox name="summary">Send weekly summary email</udc-checkbox>
    <udc-button variant="primary">Save changes</udc-button>
  </udc-tab-panel>
</udc-tabs>`;

const appShellCode = `<udc-nav-header>
  <span slot="brand">Boardroom</span>
  <udc-button slot="actions" variant="ghost" leading-icon="notifications" icon-only aria-label="Notifications"></udc-button>
</udc-nav-header>
<div style="display:flex;min-height:calc(100vh - 64px);">
  <udc-nav-vertical aria-label="Main">
    <udc-nav-item href="/dashboard" current>Dashboard</udc-nav-item>
    <udc-nav-item href="/leasing">Leasing</udc-nav-item>
  </udc-nav-vertical>
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
        description="Curated multi-component patterns. Each recipe shows the target Web Component API for composing common UI patterns."
      />

      <DocsSection
        title="Modal form with validation"
        description="Dialog + Text Input + Dropdown + Notification + primary/secondary buttons. Demonstrates focus trap, validation, and confirm/cancel actions."
        level={2}
      >
        <RecipeExample
          code={modalFormCode}
          preview={<WebComponentPreview html={modalFormCode} />}
        />
      </DocsSection>

      <DocsSection
        title="Searchable data table"
        description="Search + Chip filters + Data Table + bulk action bar. Shows the canonical pattern for a list page."
        level={2}
      >
        <RecipeExample
          code={dataTableCode}
          preview={<WebComponentPreview html={dataTableCode} />}
        />
      </DocsSection>

      <DocsSection
        title="Settings panel with tabs"
        description="Tabs + List + Text Input + Checkbox + Save action. Pattern for grouped settings or preferences."
        level={2}
      >
        <RecipeExample
          code={settingsPanelCode}
          preview={<WebComponentPreview html={settingsPanelCode} />}
        />
      </DocsSection>

      <DocsSection
        title="App shell with nav"
        description="Nav Header + Nav Vertical + content area. The standard authenticated app layout."
        level={2}
      >
        <RecipeExample
          code={appShellCode}
          preview={<WebComponentPreview html={appShellCode} />}
        />
      </DocsSection>
    </>
  );
}
