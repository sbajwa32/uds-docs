// Ported from docs/pages/design-language.html during Chunk 06c.
//
// The page-local <style> block from the legacy HTML (lines 4-450) is extracted
// into styles/pages/design-language.css. Body markup (page title + meta + ToC
// + 12 \<section> blocks) is preserved verbatim via dangerouslySetInnerHTML.
//
// The DesignLanguageToc client component wires the sticky-ToC scroll-spy and
// smooth-scroll behavior — direct port of the legacy IntersectionObserver
// hook from docs/app.js:125-166.

import { DesignLanguageToc } from './DesignLanguageToc';

import '../../../styles/pages/design-language.css';

export const metadata = { title: 'Design Language — UDS' };

const HTML = `<h1 class="sg-page-title">Design Language</h1>
        <p class="sg-page-desc">How UDS components look in each state. Every preview on this page is a real component &mdash; the colors come from the same tokens as production. Where components disagree on the same state, both are shown so we can pick one.</p>


<!-- Header meta — one line, designer-friendly -->
<div class="sg-dl-meta">
  <span class="sg-dl-meta-stat"><span class="material-symbols-outlined" style="font-size:18px;color:var(--uds-color-icon-secondary);">lightbulb</span> Reflects how every UDS component handles state today. Five differences between components are flagged at the bottom for us to talk through.</span>
</div>

<!-- Two-column layout: sticky ToC + main content -->
<div class="sg-dl-layout">

  <!-- =========== LEFT: STICKY TOC =========== -->
  <aside class="sg-dl-toc" aria-label="On this page">
    <p class="sg-dl-toc-heading">On this page</p>
    <ul class="sg-dl-toc-list">
      <li><a href="#interaction-states">1. Interaction states</a></li>
      <li><a href="#validation-states">2. Validation states</a></li>
      <li><a href="#availability-states">3. Availability states</a></li>
      <li><a href="#selection-states">4. Selection states</a></li>
      <li><a href="#disabled-vs-readonly">5. Disabled vs Read-only</a></li>
      <li><a href="#focus-ring">6. Focus ring</a></li>
      <li><a href="#surface-treatments">7. Surfaces</a></li>
      <li><a href="#elevation">8. Elevation</a></li>
      <li><a href="#radius">9. Border radius</a></li>
      <li><a href="#density">10. Density / sizing</a></li>
      <li><a href="#naming">11. Naming guidance</a></li>
      <li><a href="#inconsistencies">12. Known inconsistencies</a></li>
    </ul>
  </aside>

  <!-- =========== RIGHT: MAIN CONTENT =========== -->
  <div class="sg-dl-main">

<!-- ============================================================
     1. INTERACTION STATES
     ============================================================ -->
<section class="sg-dl-section" id="interaction-states">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Interaction states</h2>
  </header>
  <p class="sg-dl-section-lede">Four states an interactive element moves through: at rest, pointer-over, pressed, and keyboard-focused. Each preview below is a real UDS component rendered in that state.</p>

  <div class="sg-dl-state-grid">

    <!-- Default -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Default</h3>
        <span class="sg-dl-state-card-tag">rest</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-text-input">
          <label class="udc-text-input__label">Field label</label>
          <div class="udc-text-input__field">
            <input type="text" placeholder="Placeholder text" />
          </div>
        </div>
        <button class="udc-button-primary" type="button">Primary</button>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main<span class="sg-dl-chip-role">bg</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-primary)"></span>border-primary<span class="sg-dl-chip-role">border</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-primary)"></span>text-primary<span class="sg-dl-chip-role">value</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-secondary)"></span>text-secondary<span class="sg-dl-chip-role">placeholder</span></span>
      </div>
    </div>

    <!-- Hover -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Hover</h3>
        <span class="sg-dl-state-card-tag">pointer over</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview (forced state)</span>
        <div class="udc-text-input">
          <label class="udc-text-input__label">Field label</label>
          <div class="udc-text-input__field sg-dl-force-hover">
            <input type="text" placeholder="Placeholder text" />
          </div>
        </div>
        <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;">→ <strong>Hover over a real button</strong> on the Button page to see it animated.</p>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-outline-hover)"></span>border-outline-hover<span class="sg-dl-chip-role">field border</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle-hover)"></span>surface-interactive-subtle-hover<span class="sg-dl-chip-role">ghost / tab bg</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-hover)"></span>surface-interactive-hover<span class="sg-dl-chip-role">primary button bg</span></span>
      </div>
      <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;line-height:1.5;"><span class="sg-dl-badge sg-dl-badge--warn">inconsistency</span> Four different form-field hover patterns coexist today — see <a href="#inconsistencies" style="color:var(--uds-color-text-interactive);">§12.2</a>.</p>
    </div>

    <!-- Focus -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Focus</h3>
        <span class="sg-dl-state-card-tag">keyboard focus</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview (forced state)</span>
        <div class="udc-text-input">
          <label class="udc-text-input__label">Field label</label>
          <div class="udc-text-input__field sg-dl-force-focus">
            <input type="text" placeholder="Placeholder text" />
          </div>
        </div>
        <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;">→ <strong>Tab</strong> through any real field on the Text Input page to see it.</p>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-outline-focus-visible)"></span>border-outline-focus-visible<span class="sg-dl-chip-role">ring color</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main<span class="sg-dl-chip-role">gap (theme-safe)</span></span>
      </div>
      <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;line-height:1.5;">Three constructions exist — outline+offset, stacked box-shadow, single-ring. See <a href="#focus-ring" style="color:var(--uds-color-text-interactive);">§6 deep dive</a>.</p>
    </div>

    <!-- Active / Pressed -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Pressed</h3>
        <span class="sg-dl-state-card-tag"><code>:active</code></span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <button class="udc-button-primary" type="button" style="background:var(--uds-color-surface-interactive-active);border-color:var(--uds-color-surface-interactive-active);">Pressed primary</button>
        <button class="udc-button-secondary" type="button" style="background:var(--uds-color-surface-interactive-subtle-active);">Pressed secondary</button>
        <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;">→ Mouse-down on a real button to see this state.</p>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-active)"></span>surface-interactive-active<span class="sg-dl-chip-role">primary bg</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle-active)"></span>surface-interactive-subtle-active<span class="sg-dl-chip-role">ghost bg</span></span>
      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     2. VALIDATION STATES
     ============================================================ -->
<section class="sg-dl-section" id="validation-states">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Validation states</h2>
  </header>
  <p class="sg-dl-section-lede">How fields, notifications, and badges communicate success, warning, error, and info.</p>

  <div class="sg-dl-state-grid">

    <!-- Error -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Error</h3>
        <span class="sg-dl-state-card-tag">red, bold</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-text-input" data-state="error">
          <label class="udc-text-input__label">Email <span class="udc-text-input__required"></span></label>
          <div class="udc-text-input__field">
            <input type="text" value="not-an-email" />
          </div>
          <div class="udc-text-input__helper"><span>Use a valid email address</span></div>
        </div>
        <div class="udc-notification" data-variant="error">
          <span class="udc-notification__icon"><span class="material-symbols-outlined">error</span></span>
          <span class="udc-notification__text">Something went wrong.</span>
        </div>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-error)"></span>border-error</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-error)"></span>text-error</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-icon-error)"></span>icon-error</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-error-subtle)"></span>surface-error-subtle<span class="sg-dl-chip-role">notification bg</span></span>
      </div>
    </div>

    <!-- Info -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Info</h3>
        <span class="sg-dl-state-card-tag">blue</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-notification" data-variant="info">
          <span class="udc-notification__icon"><span class="material-symbols-outlined">info</span></span>
          <span class="udc-notification__text">Heads up — info notification.</span>
        </div>
        <span class="udc-badge" data-variant="info" data-prominent="false">Info badge</span>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-info-subtle)"></span>surface-info-subtle</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-info)"></span>text-info</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-info)"></span>surface-info<span class="sg-dl-chip-role">prominent</span></span>
      </div>
    </div>

    <!-- Success -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Success</h3>
        <span class="sg-dl-state-card-tag">green</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-notification" data-variant="success">
          <span class="udc-notification__icon"><span class="material-symbols-outlined">check_circle</span></span>
          <span class="udc-notification__text">All set — your changes saved.</span>
        </div>
        <span class="udc-badge" data-variant="success" data-prominent="false">Done</span>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-success-subtle)"></span>surface-success-subtle</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-success)"></span>text-success</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-success)"></span>surface-success<span class="sg-dl-chip-role">prominent</span></span>
      </div>
    </div>

    <!-- Warning -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Warning</h3>
        <span class="sg-dl-state-card-tag">orange</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-notification" data-variant="warning">
          <span class="udc-notification__icon"><span class="material-symbols-outlined">warning</span></span>
          <span class="udc-notification__text">Heads up — something needs attention.</span>
        </div>
        <span class="udc-badge" data-variant="warning" data-prominent="false">Pending</span>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-warning-subtle)"></span>surface-warning-subtle</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-warning)"></span>text-warning</span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-warning)"></span>surface-warning<span class="sg-dl-chip-role">prominent</span></span>
      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     3. AVAILABILITY STATES
     ============================================================ -->
<section class="sg-dl-section" id="availability-states">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Availability states</h2>
  </header>
  <p class="sg-dl-section-lede">Disabled means "you can't act here right now." Read-only means "this value is what it is." They look different on purpose.</p>

  <div class="sg-dl-state-grid">

    <!-- Disabled -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Disabled</h3>
        <span class="sg-dl-state-card-tag">non-interactive</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div class="udc-text-input">
          <label class="udc-text-input__label">Account ID</label>
          <div class="udc-text-input__field">
            <input type="text" placeholder="Auto-generated" disabled />
          </div>
        </div>
        <button class="udc-button-primary" type="button" disabled>Submit</button>
        <button class="udc-button-secondary" type="button" disabled>Cancel</button>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-disabled)"></span>surface-interactive-disabled<span class="sg-dl-chip-role">filled bg</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-disabled-bold)"></span>text-disabled-bold<span class="sg-dl-chip-role">value text</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-disabled)"></span>text-disabled<span class="sg-dl-chip-role">general copy</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-disabled)"></span>border-disabled<span class="sg-dl-chip-role">outlined elements</span></span>
      </div>
    </div>

    <!-- Read-only -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Read-only</h3>
        <span class="sg-dl-state-card-tag">value is fixed</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview (proposed)</span>
        <div class="udc-text-input">
          <label class="udc-text-input__label">Property name</label>
          <div class="udc-text-input__field sg-dl-force-readonly">
            <input type="text" value="Riverbend Estates" readonly />
          </div>
        </div>
        <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;">User can read + copy the value but not edit. <span class="sg-dl-badge sg-dl-badge--warn">proposed</span></p>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-subtle)"></span>surface-subtle<span class="sg-dl-chip-role">bg tint</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-primary)"></span>border-primary<span class="sg-dl-chip-role">keep visible</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-primary)"></span>text-primary<span class="sg-dl-chip-role">full opacity</span></span>
      </div>
    </div>

    <!-- Loading -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Loading</h3>
        <span class="sg-dl-state-card-tag">deferred</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Status</span>
        <p style="font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0;line-height:1.55;">Not specified in UDS today. Components that need a loading look currently fall back to Disabled as the closest approximation.</p>
        <p style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);margin:0;line-height:1.55;"><span class="sg-dl-badge sg-dl-badge--warn">deferred</span> Waiting on designer review.</p>
      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     4. SELECTION STATES
     ============================================================ -->
<section class="sg-dl-section" id="selection-states">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Selection states</h2>
  </header>
  <p class="sg-dl-section-lede">How "this is the chosen one" reads visually. Filled elements (chip, toggle, checkbox) go more saturated. Outlined elements (tile, tab, radio) gain a colored marker and recolor text to <code style="font-family:monospace;">text-interactive</code>.</p>

  <div class="sg-dl-state-grid">

    <!-- Checkbox checked -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Checkbox · checked</h3>
        <span class="sg-dl-state-card-tag">filled</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <label class="udc-checkbox"><input type="checkbox" checked /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Marketing emails</span></label>
        <label class="udc-checkbox"><input type="checkbox" /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Promotional offers</span></label>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-default)"></span>surface-interactive-default<span class="sg-dl-chip-role">filled box</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-icon-inverse);border:1px solid var(--uds-color-border-secondary);"></span>icon-inverse<span class="sg-dl-chip-role">checkmark</span></span>
      </div>
    </div>

    <!-- Radio selected -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Radio · selected</h3>
        <span class="sg-dl-state-card-tag">dot fills + label tints</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <label class="udc-radio"><input type="radio" name="dl-demo-radio" checked /><span class="udc-radio__control"></span><span class="udc-radio__label">Yes, send updates</span></label>
        <label class="udc-radio"><input type="radio" name="dl-demo-radio" /><span class="udc-radio__control"></span><span class="udc-radio__label">No thanks</span></label>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-icon-interactive)"></span>icon-interactive<span class="sg-dl-chip-role">center dot</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-interactive)"></span>text-interactive<span class="sg-dl-chip-role">selected label</span></span>
      </div>
    </div>

    <!-- Chip selected -->
    <div class="sg-dl-state-card">
      <div class="sg-dl-state-card-header">
        <h3 class="sg-dl-state-card-name">Chip · selected</h3>
        <span class="sg-dl-state-card-tag">filled, inverse text</span>
      </div>
      <div class="sg-dl-preview">
        <span class="sg-dl-preview-label">Live preview</span>
        <div style="display:flex;gap:var(--uds-space-100);flex-wrap:wrap;">
          <button class="udc-chip" type="button"><span class="udc-chip__label">All</span></button>
          <button class="udc-chip" type="button" data-selected="true"><span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span><span class="udc-chip__label">Open</span></button>
          <button class="udc-chip" type="button"><span class="udc-chip__label">Closed</span></button>
        </div>
      </div>
      <div class="sg-dl-chip-row">
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-active)"></span>surface-interactive-active<span class="sg-dl-chip-role">bg + border</span></span>
        <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-text-inverse);border:1px solid var(--uds-color-border-secondary);"></span>text-inverse<span class="sg-dl-chip-role">label</span></span>
      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     5. DISABLED VS READ-ONLY
     ============================================================ -->
<section class="sg-dl-section" id="disabled-vs-readonly">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Disabled vs Read-only — quick reference</h2>
  </header>
  <p class="sg-dl-section-lede">Confusing these two is the most common spec-writing mistake. Use this table.</p>

  <table class="sg-dl-table">
    <thead><tr><th>Question</th><th>Disabled</th><th>Read-only</th></tr></thead>
    <tbody>
      <tr><td>User can read the value?</td><td>technically yes, but greyed</td><td>yes, full primary text</td></tr>
      <tr><td>User can copy the value?</td><td>usually not (cursor not-allowed)</td><td>yes</td></tr>
      <tr><td>User can focus the element?</td><td>no (skipped by Tab)</td><td>yes</td></tr>
      <tr><td>User can edit?</td><td>no</td><td>no</td></tr>
      <tr><td>Communicates "temporarily unavailable"?</td><td>yes</td><td>no &mdash; "this is fixed information"</td></tr>
      <tr><td>Communicates "you can't change this"?</td><td>yes</td><td>yes (because the system owns it)</td></tr>
    </tbody>
  </table>

  <div class="sg-dl-callout sg-dl-callout--warn">
    <span class="sg-dl-callout-icon material-symbols-outlined">priority_high</span>
    <span><strong>Common confusion:</strong> applying Disabled to "this field is auto-filled and shouldn't be edited" &mdash; that's Read-only. Disabled is for "the action isn't currently available" (e.g. a "Save" button while the form is invalid).</span>
  </div>
</section>

<!-- ============================================================
     6. FOCUS RING — deep dive
     ============================================================ -->
<section class="sg-dl-section" id="focus-ring">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Focus ring construction</h2>
  </header>
  <p class="sg-dl-section-lede">UDS has three focus-ring constructions in the current CSS. They're not interchangeable &mdash; pick one by the rules below, not by aesthetic preference.</p>

  <div class="sg-dl-compare">

    <!-- Construction A -->
    <div class="sg-dl-compare-card">
      <h3 class="sg-dl-compare-card-name">A. <code>outline + outline-offset</code> <span class="sg-dl-badge sg-dl-badge--safe">recommended</span></h3>
      <p class="sg-dl-compare-card-desc">Outline with a transparent offset. The gap is genuinely empty space &mdash; always blends with whatever's behind. Default for new code.</p>
      <div class="sg-dl-compare-card-preview">
        <a class="udc-link" href="#focus-ring" tabindex="-1" style="outline:2px solid var(--uds-color-border-outline-focus-visible);outline-offset:var(--uds-space-050);border-radius:var(--uds-border-radius-container-sm);">Focused link</a>
      </div>
      <p class="sg-dl-compare-card-desc"><strong>Used by:</strong> checkbox, radio, link, toggle, tabs, text-area, dropdown items, dialog close, notification close.</p>
    </div>

    <!-- Construction B -->
    <div class="sg-dl-compare-card">
      <h3 class="sg-dl-compare-card-name">B. Stacked <code>box-shadow</code></h3>
      <p class="sg-dl-compare-card-desc">Two box-shadows: a surface-colored "gap" layer + the focus ring outside it. Use when an outline would be clipped (form field with <code>overflow:hidden</code>). Theme-safe ONLY when the gap binds to <code>surface-main</code>, not <code>surface-white</code>.</p>
      <div class="sg-dl-compare-card-preview">
        <div class="udc-text-input" style="max-width:200px;margin:0;">
          <div class="udc-text-input__field sg-dl-force-focus" style="min-height:36px;">
            <input type="text" value="focused" />
          </div>
        </div>
      </div>
      <p class="sg-dl-compare-card-desc"><strong>Used by:</strong> chip, search (theme-safe). <strong>Bug:</strong> button, text-input, dropdown bind the gap to <code>surface-white</code> &mdash; visible white ring in dark mode. See <a href="#inconsistencies" style="color:var(--uds-color-text-interactive);">§12.1</a>.</p>
    </div>

    <!-- Construction C -->
    <div class="sg-dl-compare-card">
      <h3 class="sg-dl-compare-card-name">C. Single ring, no gap</h3>
      <p class="sg-dl-compare-card-desc">A direct ring on the element with no separating gap. Reserved for large containers where extra visual weight competes with neighbors.</p>
      <div class="sg-dl-compare-card-preview">
        <div style="background:var(--uds-color-surface-main);border:1px solid var(--uds-color-border-primary);border-radius:var(--uds-border-radius-input);padding:var(--uds-space-150);box-shadow:0 0 0 3px var(--uds-color-border-outline-focus-visible);font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-primary);">Focused tile</div>
      </div>
      <p class="sg-dl-compare-card-desc"><strong>Used by:</strong> tile only.</p>
    </div>

  </div>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">Decision tree</h3>

  <div class="sg-dl-decision-tree">Is the element inside a clipped container (overflow:hidden)?
├── Yes  → Use construction B (box-shadow stacked) bound to surface-main
└── No
    │
    Is the element a large card / tile?
    ├── Yes → Use construction C (single ring, no gap)
    └── No  → Use construction A (outline + offset)  ← default</div>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">Universal rules</h3>
  <ul style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);line-height:1.7;padding-left:var(--uds-space-250);margin:var(--uds-space-100) 0;">
    <li>Ring color: always <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-outline-focus-visible)"></span>border-outline-focus-visible</span></li>
    <li>Ring thickness: 2 px for inline controls and form fields, 3 px for tiles</li>
    <li>Gap (in A or B): 1&ndash;2 px</li>
    <li>Selector: <code>:focus-visible</code>, never <code>:focus</code> &mdash; the latter fires on every click</li>
    <li>Error doesn't recolor the focus ring &mdash; it stays blue (search is the only exception today)</li>
  </ul>
</section>

<!-- ============================================================
     7. SURFACE TREATMENTS
     ============================================================ -->
<section class="sg-dl-section" id="surface-treatments">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Surface treatments</h2>
  </header>
  <p class="sg-dl-section-lede">Page surfaces, content surfaces, interactive surfaces, status surfaces. Full chip set with resolved colors. For the full token reference see <a href="/semantic-colors" style="color:var(--uds-color-text-interactive);">Semantic Colors</a>.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-200) 0 var(--uds-space-100);">Content surfaces</h3>
  <div class="sg-dl-chip-row" style="flex-direction:row;flex-wrap:wrap;gap:var(--uds-space-075);">
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-subtle)"></span>surface-subtle</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-alt)"></span>surface-alt</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-bold)"></span>surface-bold</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-xbold)"></span>surface-xbold</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-xxbold)"></span>surface-xxbold</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-inverse)"></span>surface-inverse</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch sg-dl-chip-swatch-checkered" style="background:var(--uds-color-surface-none);"></span>surface-none</span>
  </div>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">Interactive surfaces</h3>
  <div class="sg-dl-chip-row" style="flex-direction:row;flex-wrap:wrap;gap:var(--uds-space-075);">
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-default)"></span>interactive-default</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-hover)"></span>interactive-hover</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-active)"></span>interactive-active</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle)"></span>interactive-subtle</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle-hover)"></span>interactive-subtle-hover</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle-active)"></span>interactive-subtle-active</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-disabled)"></span>interactive-disabled</span>
  </div>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">Status surfaces</h3>
  <div class="sg-dl-chip-row" style="flex-direction:row;flex-wrap:wrap;gap:var(--uds-space-075);">
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-info)"></span>info</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-info-subtle)"></span>info-subtle</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-success)"></span>success</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-success-subtle)"></span>success-subtle</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-error)"></span>error</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-error-subtle)"></span>error-subtle</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-warning)"></span>warning</span>
    <span class="sg-dl-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-warning-subtle)"></span>warning-subtle</span>
  </div>

  <div class="sg-dl-callout sg-dl-callout--warn" style="margin-top:var(--uds-space-300);">
    <span class="sg-dl-callout-icon material-symbols-outlined">priority_high</span>
    <span><code>surface-white</code> and <code>surface-black</code> are <strong>literal white and black in every theme</strong>. Almost never the right token &mdash; usually you want <code>surface-main</code>. Three components in UDS use <code>surface-white</code> incorrectly for focus-ring gaps; see <a href="#inconsistencies" style="color:var(--uds-color-text-interactive);">§12.1</a>.</span>
  </div>
</section>

<!-- ============================================================
     8. ELEVATION
     ============================================================ -->
<section class="sg-dl-section" id="elevation">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Elevation / shadow scale</h2>
  </header>
  <p class="sg-dl-section-lede">Three depth levels plus a bento variant for dashboards. Pick by purpose, not by size. Live preview of each shadow below.</p>

  <div class="sg-dl-elev-grid">
    <div class="sg-dl-elev-tile sg-dl-elev-tile--100">depth-100</div>
    <div class="sg-dl-elev-tile sg-dl-elev-tile--300">depth-300</div>
    <div class="sg-dl-elev-tile sg-dl-elev-tile--500">depth-500</div>
    <div class="sg-dl-elev-tile sg-dl-elev-tile--bento">bento</div>
  </div>

  <table class="sg-dl-table">
    <thead><tr><th>Token</th><th>Use when…</th><th>Live examples</th></tr></thead>
    <tbody>
      <tr><td><code>shadow-depth-100</code></td><td>A small element is lifted off its surface</td><td>Toggle thumb</td></tr>
      <tr><td><code>shadow-depth-300</code></td><td>A transient overlay near its trigger</td><td>Tooltips, dropdown menus, popovers</td></tr>
      <tr><td><code>shadow-depth-500</code></td><td>A modal that floats above the entire page</td><td>Dialogs, sheets</td></tr>
      <tr><td><code>shadow-bento</code></td><td>Bento-style card grouping (dashboards)</td><td>Dashboard cards</td></tr>
    </tbody>
  </table>

  <div class="sg-dl-callout sg-dl-callout--warn">
    <span class="sg-dl-callout-icon material-symbols-outlined">priority_high</span>
    <span><strong>Don't bind elevation tokens to non-elevation effects.</strong> The shadow scale exists to communicate depth, not decoration.</span>
  </div>
</section>

<!-- ============================================================
     9. RADIUS
     ============================================================ -->
<section class="sg-dl-section" id="radius">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Border radius scale</h2>
  </header>
  <p class="sg-dl-section-lede">Two families: <code style="font-family:monospace;">input</code> for things you interact with, <code style="font-family:monospace;">container</code> for surfaces holding content.</p>

  <div class="sg-dl-radius-grid">
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container-sm)"></div><span class="sg-dl-radius-name">container-sm</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-input)"></div><span class="sg-dl-radius-name">input · 8 px</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container)"></div><span class="sg-dl-radius-name">container</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container-md)"></div><span class="sg-dl-radius-name">container-md</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container-lg)"></div><span class="sg-dl-radius-name">container-lg</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container-xl)"></div><span class="sg-dl-radius-name">container-xl · 24 px</span></div>
    <div class="sg-dl-radius-tile"><div class="sg-dl-radius-square" style="border-radius:var(--uds-border-radius-container-full)"></div><span class="sg-dl-radius-name">container-full</span></div>
  </div>

  <table class="sg-dl-table">
    <thead><tr><th>Token</th><th>Live examples in UDS</th></tr></thead>
    <tbody>
      <tr><td><code>border-radius-input</code></td><td>text-input, dropdown trigger, button, dialog close, tile, dropdown items</td></tr>
      <tr><td><code>border-radius-container-sm</code></td><td>notification, badge, link focus, tab focus</td></tr>
      <tr><td><code>border-radius-container</code></td><td>tooltip, chip</td></tr>
      <tr><td><code>border-radius-container-xl</code></td><td>dialog (24 px)</td></tr>
      <tr><td><code>border-radius-container-full</code></td><td>toggle control + thumb</td></tr>
    </tbody>
  </table>
</section>

<!-- ============================================================
     10. DENSITY
     ============================================================ -->
<section class="sg-dl-section" id="density">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Density / sizing</h2>
  </header>
  <p class="sg-dl-section-lede">Two density tracks: default (comfortable) and small (filter rows, dense forms). Side-by-side live preview.</p>

  <div class="sg-dl-compare" style="grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));">
    <div class="sg-dl-compare-card">
      <h3 class="sg-dl-compare-card-name">Default (comfortable)</h3>
      <div class="sg-dl-compare-card-preview" style="flex-direction:column;gap:var(--uds-space-150);">
        <button class="udc-button-primary" type="button">Submit</button>
        <button class="udc-button-secondary" type="button">Cancel</button>
      </div>
      <p class="sg-dl-compare-card-desc">Button: <code>padding: space-150 space-200</code> (12 &times; 16 px)<br>Tab: <code>padding: space-200 space-300</code> (16 &times; 24 px)</p>
    </div>
    <div class="sg-dl-compare-card">
      <h3 class="sg-dl-compare-card-name">Small (<code>data-size="sm"</code>)</h3>
      <div class="sg-dl-compare-card-preview" style="flex-direction:column;gap:var(--uds-space-150);">
        <button class="udc-button-primary" type="button" data-size="sm">Submit</button>
        <button class="udc-button-secondary" type="button" data-size="sm">Cancel</button>
      </div>
      <p class="sg-dl-compare-card-desc">Button: <code>padding: space-075 space-150</code> (6 &times; 12 px)<br>Tab: <code>padding-top/bottom: space-100</code> (8 px)</p>
    </div>
  </div>

  <div class="sg-dl-callout sg-dl-callout--info">
    <span class="sg-dl-callout-icon material-symbols-outlined">info</span>
    <span><strong>No <code>lg</code> size in UDS yet.</strong> Components that need a bigger size should check with the designer before adding one.</span>
  </div>
</section>

<!-- ============================================================
     11. NAMING GUIDANCE
     ============================================================ -->
<section class="sg-dl-section" id="naming">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Checked vs Selected vs Active &mdash; naming guidance</h2>
  </header>
  <p class="sg-dl-section-lede">Three words that get confused. Use the right one for the right element.</p>

  <table class="sg-dl-table">
    <thead><tr><th>Term</th><th>Used by</th><th>Pair with</th></tr></thead>
    <tbody>
      <tr><td><strong>Checked</strong></td><td>checkbox, radio, toggle</td><td><code>&lt;input checked&gt;</code> / <code>aria-checked="true"</code></td></tr>
      <tr><td><strong>Selected</strong></td><td>tabs, dropdown items, chip, tile</td><td><code>aria-selected="true"</code> / <code>data-selected="true"</code></td></tr>
      <tr><td><strong>Active</strong> (current)</td><td>link, button (<code>[data-selected]</code>)</td><td><code>aria-current="page"</code></td></tr>
      <tr><td><strong>Active</strong> (pressed)</td><td>every interactive control while held down</td><td><code>:active</code> (CSS pseudo)</td></tr>
    </tbody>
  </table>

  <div class="sg-dl-callout sg-dl-callout--warn">
    <span class="sg-dl-callout-icon material-symbols-outlined">priority_high</span>
    <span><strong>The two meanings of "Active" collide.</strong> Prefer <strong>"Pressed"</strong> for the mouse-down meaning and <strong>"Current"</strong> for the selected-as-nav meaning when writing specs.</span>
  </div>
</section>

<!-- ============================================================
     12. KNOWN INCONSISTENCIES
     ============================================================ -->
<section class="sg-dl-section" id="inconsistencies">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">Known inconsistencies <span class="sg-dl-badge sg-dl-badge--warn" style="margin-left:var(--uds-space-100);">needs review</span></h2>
  </header>
  <p class="sg-dl-section-lede">Five places where components disagree with each other today. Each one needs a quick decision from the designer. Until that happens, new components default to whichever option is the safest across themes.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-200) 0 var(--uds-space-100);">12.1 Focus ring gap binding</h3>

  <table class="sg-dl-table">
    <thead><tr><th>Component</th><th>Gap binding</th><th>Theme-safe?</th></tr></thead>
    <tbody>
      <tr><td>button</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-white)"></span>surface-white</span></td><td><span class="sg-dl-badge sg-dl-badge--bug">no &mdash; white in dark mode</span></td></tr>
      <tr><td>text-input</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-white)"></span>surface-white</span></td><td><span class="sg-dl-badge sg-dl-badge--bug">no</span></td></tr>
      <tr><td>dropdown trigger</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-white)"></span>surface-white</span></td><td><span class="sg-dl-badge sg-dl-badge--bug">no</span></td></tr>
      <tr><td>chip</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main</span></td><td><span class="sg-dl-badge sg-dl-badge--safe">yes</span></td></tr>
      <tr><td>search</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main</span></td><td><span class="sg-dl-badge sg-dl-badge--safe">yes</span></td></tr>
    </tbody>
  </table>
  <p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0 0 var(--uds-space-200);"><strong>Suggested fix:</strong> bind the gap to <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-main)"></span>surface-main</span> everywhere. Three components need a small CSS update.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">12.2 Hover treatment for form fields</h3>

  <table class="sg-dl-table">
    <thead><tr><th>Component</th><th>Hover treatment</th></tr></thead>
    <tbody>
      <tr><td>text-input</td><td>(no hover state defined)</td></tr>
      <tr><td>dropdown trigger</td><td>bg → <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-interactive-subtle-hover)"></span>interactive-subtle-hover</span>, border → <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-interactive)"></span>border-interactive</span></td></tr>
      <tr><td>search field</td><td>bg → <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-surface-subtle)"></span>surface-subtle</span></td></tr>
      <tr><td>text-area</td><td>border → <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-outline-hover)"></span>border-outline-hover</span></td></tr>
    </tbody>
  </table>
  <p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0 0 var(--uds-space-200);"><strong>Suggested fix:</strong> use text-area's <span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-outline-hover)"></span>border-outline-hover</span> everywhere. It reads as hover without competing with the focus ring.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">12.3 Disabled border treatment</h3>

  <table class="sg-dl-table">
    <thead><tr><th>Component</th><th>Disabled border</th></tr></thead>
    <tbody>
      <tr><td>button (primary)</td><td>same as bg &mdash; invisible border</td></tr>
      <tr><td>button (secondary), text-input</td><td>transparent</td></tr>
      <tr><td>dropdown, checkbox, radio, tile</td><td><span class="sg-dl-inline-chip"><span class="sg-dl-chip-swatch" style="background:var(--uds-color-border-disabled)"></span>border-disabled</span></td></tr>
    </tbody>
  </table>
  <p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0 0 var(--uds-space-200);"><strong>Suggested fix:</strong> use <code>border-disabled</code> on outlined elements (form controls) and transparent on filled ones. Both treatments are fine &mdash; they say slightly different things about disabled.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">12.4 Toggle's <code>opacity: 0.7</code> for disabled</h3>
  <p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0 0 var(--uds-space-200);">Toggle is the only component that drops opacity for disabled. Either everyone else should match it, or toggle should drop the opacity. Designer call.</p>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">12.5 Required dot color token</h3>
  <table class="sg-dl-table">
    <thead><tr><th>Component</th><th>Required dot color</th></tr></thead>
    <tbody>
      <tr><td>text-input, dropdown, checkbox, radio</td><td><code>icon-error</code></td></tr>
      <tr><td>tile</td><td><code>text-error</code></td></tr>
    </tbody>
  </table>
  <p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-sm);color:var(--uds-color-text-secondary);margin:0 0 var(--uds-space-200);">Both resolve to the same red. Pick one and use it everywhere.</p>

</section>

<!-- ============================================================
     CROSS-CUTTING
     ============================================================ -->
<section class="sg-dl-section">
  <header class="sg-dl-section-header">
    <h2 class="sg-dl-section-title">A few rules that apply across the board</h2>
  </header>
  <ul style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);line-height:1.7;padding-left:var(--uds-space-250);margin:var(--uds-space-100) 0;">
    <li><strong>Stroke alignment is <code>INSIDE</code> for form fields</strong> so border weight doesn't affect outer dimensions.</li>
    <li><strong>Border weight stays at 1 px</strong> through state transitions for most components. Exceptions: tile thickens to 2 px on selection; tabs use 2 px bottom border.</li>
    <li><strong><code>:focus-visible</code> is the focus selector</strong>, never <code>:focus</code>.</li>
    <li><strong>Transitions are <code>120ms ease</code></strong> for color and border, <code>200ms ease</code> for transforms.</li>
    <li><strong>Disabled elements need <code>pointer-events: none</code> AND <code>cursor: not-allowed</code></strong> &mdash; both are required.</li>
  </ul>

  <h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:var(--uds-space-300) 0 var(--uds-space-100);">Related pages</h3>
  <ul style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);line-height:1.7;padding-left:var(--uds-space-250);margin:var(--uds-space-100) 0;">
    <li><a href="/semantic-colors" style="color:var(--uds-color-text-interactive);">Semantic Colors</a> &mdash; the full token vocabulary the constructions here resolve to.</li>
    <li><a href="/spacing" style="color:var(--uds-color-text-interactive);">Spacing</a> &mdash; the <code>space-*</code> scale referenced in density patterns.</li>
    <li><a href="/text-styles" style="color:var(--uds-color-text-interactive);">Text Styles</a> &mdash; typography decisions that pair with these visual treatments.</li>
    <li><a href="/cursor-workflows" style="color:var(--uds-color-text-interactive);">Cursor Workflows</a> &mdash; the same content for AI agents lives in <code>.cursor/rules/uds-design-language.mdc</code>.</li>
  </ul>
</section>

  </div><!-- /.sg-dl-main -->
</div><!-- /.sg-dl-layout -->`;

import { ProseContent } from '@/components/site/ProseContent';

export default function DesignLanguagePage() {
  return (
    <DesignLanguageToc>
      <ProseContent className="sg-page-content" html={HTML} />
    </DesignLanguageToc>
  );
}
