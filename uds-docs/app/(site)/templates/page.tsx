import { DocsCodeBlock, DocsPageHeader, DocsSection } from '@/components/site/ui';

export const metadata = { title: 'Layout Templates — UDS' };

const templates = [
  {
    title: 'App shell',
    description: 'Nav Header + Nav Vertical + main content. Use as the base layout for every authenticated page.',
    code: `<udc-nav-header>
  <span slot="brand">…brand…</span>
  <udc-search slot="actions" label="Search" placeholder="Search"></udc-search>
  <udc-button slot="actions" variant="ghost" leading-icon="account_circle">Account</udc-button>
</udc-nav-header>

<div style="display:flex;min-height:calc(100vh - 64px);">
  <udc-nav-vertical aria-label="Main" style="width:240px;
       border-right:1px solid var(--uds-color-border-secondary);">
    <udc-nav-item href="/dashboard" current>Dashboard</udc-nav-item>
    <udc-nav-item href="/leases">Leases</udc-nav-item>
  </udc-nav-vertical>
  <main style="flex:1;padding:var(--uds-space-300);overflow-y:auto;">
    …page content…
  </main>
</div>`,
  },
  {
    title: 'Settings page',
    description: 'Header + Tabs + form fields + sticky save bar.',
    code: `<header style="margin-bottom:var(--uds-space-300);">
  <h1>Settings</h1>
</header>

<udc-tabs selected-panel="general">
  <udc-tab panel="general">General</udc-tab>
  <udc-tab panel="notifications">Notifications</udc-tab>
</udc-tabs>

<form style="max-width:640px;display:flex;flex-direction:column;
              gap:var(--uds-space-200);">
  <udc-text-input label="Display name"></udc-text-input>
  <udc-dropdown label="Property"></udc-dropdown>
  <udc-checkbox name="summary">Send weekly summary email</udc-checkbox>
</form>

<div style="position:sticky;bottom:0;display:flex;gap:var(--uds-space-100);
            justify-content:flex-end;padding:var(--uds-space-200);
            background:var(--uds-color-surface-main);
            border-top:1px solid var(--uds-color-border-secondary);">
  <udc-button variant="secondary">Cancel</udc-button>
  <udc-button variant="primary">Save changes</udc-button>
</div>`,
  },
  {
    title: 'Data browsing page',
    description: 'Filter bar (Search + Chips) + Data Table + pagination.',
    code: `<div style="display:flex;gap:var(--uds-space-150);
            margin-bottom:var(--uds-space-200);">
  <udc-search style="flex:1;" label="Search"></udc-search>
  <udc-chip variant="filter">Active</udc-chip>
</div>

<udc-data-table>
  <table>…</table>
</udc-data-table>

<udc-pagination page="1" total-pages="10"></udc-pagination>`,
  },
  {
    title: 'Marketing landing',
    description: 'Hero + feature tiles + CTA. Simpler header than the app shell.',
    code: `<header>
  <nav>…minimal brand + CTA…</nav>
</header>

<section style="padding:var(--uds-space-1000) var(--uds-space-300);
                text-align:center;">
  <h1 class="uds-text-heading-xl">…</h1>
  <p>…</p>
  <udc-button variant="primary">Get started</udc-button>
</section>

<section style="display:grid;grid-template-columns:repeat(3,1fr);
                gap:var(--uds-space-300);padding:var(--uds-space-500);">
  <udc-tile label="Feature" description="Feature description"></udc-tile>
</section>`,
  },
];

export default function TemplatesPage() {
  return (
    <>
      <DocsPageHeader
        title="Layout Templates"
        description="Starter page structures. Each template is the bare skeleton — copy, fill in, and ship. All use UDS tokens and components only."
      />

      {templates.map((template) => (
        <DocsSection key={template.title} title={template.title} description={template.description}>
          <DocsCodeBlock code={template.code} language="html" />
        </DocsSection>
      ))}
    </>
  );
}
