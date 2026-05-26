import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

export const metadata = { title: 'Layout Templates — UDS' };

export default function TemplatesPage() {
  return (
    <div className="sg-page-content">
      <SgPageTitle>Layout Templates</SgPageTitle>
      <SgPageDesc>Starter page structures. Each template is the bare skeleton — copy, fill in, and ship. All use UDS tokens and components only.</SgPageDesc>

      <div className="sg-subsection"><h3 className="sg-subsection-title">App shell</h3>
        <p className="sg-subsection-desc">Nav Header + Nav Vertical + main content. Use as the base layout for every authenticated page.</p>
        <div className="sg-example">
          <details className="sg-example-code" open><summary>Show code</summary><pre><code>{`<div class="udc-nav-header">
  <div class="udc-nav-header__left">…brand + bento…</div>
  <div class="udc-nav-header__center">…breadcrumb / search…</div>
  <div class="udc-nav-header__right">…notifications, account…</div>
</div>

<div style="display:flex;min-height:calc(100vh - 64px);">
  <nav class="udc-nav-vertical" aria-label="Main" style="width:240px;
       border-right:1px solid var(--uds-color-border-secondary);">
    …nav buttons…
  </nav>
  <main style="flex:1;padding:var(--uds-space-300);overflow-y:auto;">
    …page content…
  </main>
</div>`}</code></pre></details>
        </div>
      </div>

      <div className="sg-subsection"><h3 className="sg-subsection-title">Settings page</h3>
        <p className="sg-subsection-desc">Header + Tabs + form fields + sticky save bar.</p>
        <div className="sg-example">
          <details className="sg-example-code" open><summary>Show code</summary><pre><code>{`<header style="margin-bottom:var(--uds-space-300);">
  <h1>Settings</h1>
</header>

<div class="udc-tabs" role="tablist">…</div>

<form style="max-width:640px;display:flex;flex-direction:column;
              gap:var(--uds-space-200);">
  …udc-text-input, udc-dropdown, udc-checkbox…
</form>

<div style="position:sticky;bottom:0;display:flex;gap:var(--uds-space-100);
            justify-content:flex-end;padding:var(--uds-space-200);
            background:var(--uds-color-surface-main);
            border-top:1px solid var(--uds-color-border-secondary);">
  <button class="udc-button-secondary">Cancel</button>
  <button class="udc-button-primary">Save changes</button>
</div>`}</code></pre></details>
        </div>
      </div>

      <div className="sg-subsection"><h3 className="sg-subsection-title">Data browsing page</h3>
        <p className="sg-subsection-desc">Filter bar (Search + Chips) + Data Table + pagination.</p>
        <div className="sg-example">
          <details className="sg-example-code" open><summary>Show code</summary><pre><code>{`<div style="display:flex;gap:var(--uds-space-150);
            margin-bottom:var(--uds-space-200);">
  <div class="udc-search" style="flex:1;">…</div>
  <button class="udc-chip" data-variant="filter">Active</button>
</div>

<div class="udc-data-table">
  <table>…</table>
</div>

<nav style="display:flex;justify-content:flex-end;
            gap:var(--uds-space-100);margin-top:var(--uds-space-200);"
     aria-label="Pagination">
  …pagination buttons…
</nav>`}</code></pre></details>
        </div>
      </div>

      <div className="sg-subsection"><h3 className="sg-subsection-title">Marketing landing</h3>
        <p className="sg-subsection-desc">Hero + feature tiles + CTA. Simpler header than the app shell.</p>
        <div className="sg-example">
          <details className="sg-example-code" open><summary>Show code</summary><pre><code>{`<header>
  <nav>…minimal brand + CTA…</nav>
</header>

<section style="padding:var(--uds-space-1000) var(--uds-space-300);
                text-align:center;">
  <h1 class="uds-text-heading-xl">…</h1>
  <p>…</p>
  <button class="udc-button-primary">Get started</button>
</section>

<section style="display:grid;grid-template-columns:repeat(3,1fr);
                gap:var(--uds-space-300);padding:var(--uds-space-500);">
  …udc-tile cards…
</section>`}</code></pre></details>
        </div>
      </div>
    </div>
  );
}
