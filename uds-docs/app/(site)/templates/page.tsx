// Ported from docs/pages/templates.html during Chunk 06a.
// Wrapped via dangerouslySetInnerHTML to preserve markup verbatim — every
// .sg-* class and inline <details>/<pre> block carries through unchanged.
// Hash routes (#/foo) rewritten to plain Next.js paths (/foo).

export const metadata = { title: 'Layout Templates — UDS' };

const HTML = `<h1 class="sg-page-title">Layout Templates</h1>
        <p class="sg-page-desc">Starter page structures. Each template is the bare skeleton — copy, fill in, and ship. All use UDS tokens and components only.</p>

        <div class="sg-subsection"><h3 class="sg-subsection-title">App shell</h3>
          <p class="sg-subsection-desc">Nav Header + Nav Vertical + main content. Use as the base layout for every authenticated page.</p>
          <div class="sg-example">
            <details class="sg-example-code" open><summary>Show code</summary><pre><code>&lt;div class="udc-nav-header"&gt;
  &lt;div class="udc-nav-header__left"&gt;…brand + bento…&lt;/div&gt;
  &lt;div class="udc-nav-header__center"&gt;…breadcrumb / search…&lt;/div&gt;
  &lt;div class="udc-nav-header__right"&gt;…notifications, account…&lt;/div&gt;
&lt;/div&gt;

&lt;div style="display:flex;min-height:calc(100vh - 64px);"&gt;
  &lt;nav class="udc-nav-vertical" aria-label="Main" style="width:240px;
       border-right:1px solid var(--uds-color-border-secondary);"&gt;
    …nav buttons…
  &lt;/nav&gt;
  &lt;main style="flex:1;padding:var(--uds-space-300);overflow-y:auto;"&gt;
    …page content…
  &lt;/main&gt;
&lt;/div&gt;</code></pre></details>
          </div>
        </div>

        <div class="sg-subsection"><h3 class="sg-subsection-title">Settings page</h3>
          <p class="sg-subsection-desc">Header + Tabs + form fields + sticky save bar.</p>
          <div class="sg-example">
            <details class="sg-example-code" open><summary>Show code</summary><pre><code>&lt;header style="margin-bottom:var(--uds-space-300);"&gt;
  &lt;h1&gt;Settings&lt;/h1&gt;
&lt;/header&gt;

&lt;div class="udc-tabs" role="tablist"&gt;…&lt;/div&gt;

&lt;form style="max-width:640px;display:flex;flex-direction:column;
              gap:var(--uds-space-200);"&gt;
  …udc-text-input, udc-dropdown, udc-checkbox…
&lt;/form&gt;

&lt;div style="position:sticky;bottom:0;display:flex;gap:var(--uds-space-100);
            justify-content:flex-end;padding:var(--uds-space-200);
            background:var(--uds-color-surface-main);
            border-top:1px solid var(--uds-color-border-secondary);"&gt;
  &lt;button class="udc-button-secondary"&gt;Cancel&lt;/button&gt;
  &lt;button class="udc-button-primary"&gt;Save changes&lt;/button&gt;
&lt;/div&gt;</code></pre></details>
          </div>
        </div>

        <div class="sg-subsection"><h3 class="sg-subsection-title">Data browsing page</h3>
          <p class="sg-subsection-desc">Filter bar (Search + Chips) + Data Table + pagination.</p>
          <div class="sg-example">
            <details class="sg-example-code" open><summary>Show code</summary><pre><code>&lt;div style="display:flex;gap:var(--uds-space-150);
            margin-bottom:var(--uds-space-200);"&gt;
  &lt;div class="udc-search" style="flex:1;"&gt;…&lt;/div&gt;
  &lt;button class="udc-chip" data-variant="filter"&gt;Active&lt;/button&gt;
&lt;/div&gt;

&lt;div class="udc-data-table"&gt;
  &lt;table&gt;…&lt;/table&gt;
&lt;/div&gt;

&lt;nav style="display:flex;justify-content:flex-end;
            gap:var(--uds-space-100);margin-top:var(--uds-space-200);"
     aria-label="Pagination"&gt;
  …pagination buttons…
&lt;/nav&gt;</code></pre></details>
          </div>
        </div>

        <div class="sg-subsection"><h3 class="sg-subsection-title">Marketing landing</h3>
          <p class="sg-subsection-desc">Hero + feature tiles + CTA. Simpler header than the app shell.</p>
          <div class="sg-example">
            <details class="sg-example-code" open><summary>Show code</summary><pre><code>&lt;header&gt;
  &lt;nav&gt;…minimal brand + CTA…&lt;/nav&gt;
&lt;/header&gt;

&lt;section style="padding:var(--uds-space-1000) var(--uds-space-300);
                text-align:center;"&gt;
  &lt;h1 class="uds-text-heading-xl"&gt;…&lt;/h1&gt;
  &lt;p&gt;…&lt;/p&gt;
  &lt;button class="udc-button-primary"&gt;Get started&lt;/button&gt;
&lt;/section&gt;

&lt;section style="display:grid;grid-template-columns:repeat(3,1fr);
                gap:var(--uds-space-300);padding:var(--uds-space-500);"&gt;
  …udc-tile cards…
&lt;/section&gt;</code></pre></details>
          </div>
        </div>`;

import { ProseContent } from '@/components/site/ProseContent';

export default function TemplatesPage() {
  return <ProseContent className="sg-page-content" html={HTML} />;
}
