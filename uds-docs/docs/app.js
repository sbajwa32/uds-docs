/* ==========================================================================
   UDS Design System — SPA Application Logic
   Router, tab system, playground engine, theme switcher

   ES module. Loaded by index.html via <script type="module">.
   ========================================================================== */

'use strict';

import { udsResolve, udsPath, viewingVersion, isViewingHistorical, currentVersion, versionsReady } from './helpers/uds-path.js';

const html = document.documentElement;

/* ========================================================================
     1. THEME SWITCHER
     ======================================================================== */
function dataKey(attr) {
    return attr.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function setupGroup(htmlAttr, btnSelector) {
    const btnAttr = 'data-set-' + htmlAttr.replace(/^data-/, '');
    const key = dataKey(btnAttr);
    document.querySelectorAll(btnSelector).forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset[key];
        if (val) html.setAttribute(htmlAttr, val);
        else html.removeAttribute(htmlAttr);
        document.querySelectorAll(btnSelector).forEach(b => {
          b.classList.remove('udc-button-primary', 'active');
          b.classList.add('udc-button-secondary');
        });
        btn.classList.remove('udc-button-secondary');
        btn.classList.add('udc-button-primary', 'active');
        refreshPlaygrounds();
      });
    });
}

setupGroup('data-color-scheme', '[data-set-color-scheme]');
setupGroup('data-theme', '[data-set-theme]');
setupGroup('data-font', '[data-set-font]');
setupGroup('data-font-scale', '[data-set-font-scale]');
setupGroup('data-density', '[data-set-density]');

/* ========================================================================
     2. COPY BUTTON UTILITY
     ======================================================================== */
function buildCopyButton(getText) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sg-code-copy';
    btn.title = 'Copy code';
    btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
    btn.addEventListener('click', function () {
      var text = typeof getText === 'function' ? getText() : getText;
      navigator.clipboard.writeText(text).then(function () {
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        btn.setAttribute('data-copied', '');
        setTimeout(function () {
          btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
          btn.removeAttribute('data-copied');
        }, 1500);
      });
    });
    return btn;
}

/* ========================================================================
     3. SPA ROUTER
     ======================================================================== */
function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [pageId, qs] = raw.split('?');
    const params = {};
    if (qs) qs.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      params[k] = decodeURIComponent(v || '');
    });
    return { pageId: pageId || 'changelog', tab: params.tab || null };
}

// ============================================================================
// Page fragment loader (Phase 5)
//
// Non-component pages live as docs/pages/<id>.html (or
// docs/pages/tokens/<id>.html for the 4 token-reference pages). The
// matching <div data-page="<id>" data-page-fragment></div> placeholder in
// index.html starts empty; the first time the user navigates to that page,
// we fetch the fragment, inject it, run any registered post-load hook, and
// flip the placeholder so we don't fetch twice.
// ============================================================================

const TOKEN_PAGES_SET = new Set(['semantic-colors', 'primitive-colors', 'text-styles', 'spacing']);

// Hooks fired AFTER a fragment's HTML is injected into its placeholder.
// Each hook can assume its target slots (e.g. #sg-global-changelog) now
// exist in the DOM. Components register hooks here lazily as needed.
const PAGE_LOAD_HOOKS = {};

function registerPageLoadHook(pageId, fn) {
    if (!PAGE_LOAD_HOOKS[pageId]) PAGE_LOAD_HOOKS[pageId] = [];
    PAGE_LOAD_HOOKS[pageId].push(fn);
}

const _fragmentLoadCache = {};

async function loadPageFragment(pageId, page) {
    if (!page || !page.hasAttribute('data-page-fragment')) return;
    if (page.dataset.fragmentLoaded === 'true') return;
    if (_fragmentLoadCache[pageId]) return _fragmentLoadCache[pageId];

    const subdir = TOKEN_PAGES_SET.has(pageId) ? 'tokens/' : '';
    const url = `./docs/pages/${subdir}${pageId}.html`;

    _fragmentLoadCache[pageId] = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to load page fragment', url, res.status);
          page.innerHTML = `<p style="padding:24px;color:var(--uds-color-text-error)">Failed to load page (${res.status}).</p>`;
          return;
        }
        const html = await res.text();
        page.innerHTML = html;
        page.dataset.fragmentLoaded = 'true';

        // Run any registered post-load hooks for this page
        const hooks = PAGE_LOAD_HOOKS[pageId] || [];
        for (const hook of hooks) {
          try { hook(page); } catch (e) { console.error('Page load hook failed for', pageId, e); }
        }
      } catch (e) {
        console.error('loadPageFragment error', pageId, e);
      }
    })();

    return _fragmentLoadCache[pageId];
}

// ============================================================================
// Per-component Examples tab renderer (Phase 7b)
//
// Component pages used to have inline <div data-tab-panel="examples">
// content baked into index.html. After Phase 7b that's empty — the
// renderer below fetches the per-component examples manifest, fetches each
// example's HTML from uds/components/<id>/examples/, applies the canonical
// pool's token substitution, and wraps each in the same .sg-subsection
// markup the inline version used.
//
// This makes uds/components/<id>/examples/ the SINGLE source of truth for
// example HTML — Demo Builder reads the same files (with random pool),
// docs page Examples tab reads them too (with canonical pool). Drift is
// structurally impossible.
// ============================================================================

const _examplesRenderInited = {};

async function renderComponentExamplesTab(pageId) {
    if (_examplesRenderInited[pageId]) return;
    const page = document.querySelector('[data-page="' + pageId + '"]');
    if (!page) return;
    const panel = page.querySelector('[data-tab-panel="examples"][data-needs-fetch]');
    if (!panel) return;

    try {
      const [{ fetchAllExamples }, { CANONICAL_POOL }] = await Promise.all([
        import('./modules/demo-builder/example-fetcher.js'),
        import('./modules/demo-builder/canonical-pool.js')
      ]);
      const examples = await fetchAllExamples(pageId, CANONICAL_POOL);
      if (!examples.length) {
        panel.innerHTML = '<p class="sg-subsection-desc" style="padding:24px;color:var(--uds-color-text-secondary)">No examples available yet.</p>';
        _examplesRenderInited[pageId] = true;
        return;
      }
      panel.innerHTML = examples.map(function (e) {
        const desc = e.description ? '<p class="sg-subsection-desc">' + esc(e.description) + '</p>' : '';
        return '<div class="sg-subsection"><h3 class="sg-subsection-title">' + esc(e.label) + '</h3>' + desc + e.html + '</div>';
      }).join('\n');
      _examplesRenderInited[pageId] = true;
    } catch (err) {
      console.error('Failed to render examples for', pageId, err);
      panel.innerHTML = '<p style="padding:24px;color:var(--uds-color-text-error)">Failed to load examples.</p>';
    }
}

async function navigate(pageId, tab) {
    document.querySelectorAll('[data-page]').forEach(p => p.classList.remove('active'));
    const page = document.querySelector('[data-page="' + pageId + '"]');
    if (page) {
      page.classList.add('active');
    } else {
      const fallback = document.querySelector('[data-page="semantic-colors"]');
      if (fallback) fallback.classList.add('active');
      pageId = 'semantic-colors';
    }

    document.querySelectorAll('.sg-sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector('.sg-sidebar-link[href="#/' + pageId + '"]');
    if (link) link.classList.add('active');

    // Lazy-load the fragment if this is a placeholder page
    const targetPage = page || document.querySelector('[data-page="' + pageId + '"]');
    if (targetPage && targetPage.hasAttribute('data-page-fragment') && targetPage.dataset.fragmentLoaded !== 'true') {
      await loadPageFragment(pageId, targetPage);
    }

    var defaultTab = targetPage ? (targetPage.getAttribute('data-default-tab') || 'examples') : 'examples';
    switchTab(pageId, tab || defaultTab);
    document.querySelector('.sg-main').scrollTo(0, 0);

    var stalePortal = document.getElementById('sg-sidebar-portal-tooltip');
    if (stalePortal) stalePortal.setAttribute('data-visible', 'false');
}

document.querySelectorAll('.sg-sidebar-link[href^="#/"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const pageId = link.getAttribute('href').replace('#/', '');
      history.pushState(null, '', '#/' + pageId);
      var targetPage = document.querySelector('[data-page="' + pageId + '"]');
      var defaultTab = targetPage ? (targetPage.getAttribute('data-default-tab') || 'examples') : 'examples';
      navigate(pageId, defaultTab);
    });
});

window.addEventListener('hashchange', () => {
    const { pageId, tab } = parseHash();
    navigate(pageId, tab);
});

/* ========================================================================
     3. TAB SYSTEM
     ======================================================================== */
function switchTab(pageId, tabId) {
    const page = document.querySelector('[data-page="' + pageId + '"]');
    if (!page) return;
    const tabs = page.querySelectorAll('.sg-page-tab');
    if (!tabs.length) return;

    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    page.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.remove('active'));

    const tab = page.querySelector('.sg-page-tab[data-tab="' + tabId + '"]');
    const panel = page.querySelector('[data-tab-panel="' + tabId + '"]');
    if (tab) tab.setAttribute('aria-selected', 'true');
    if (panel) panel.classList.add('active');

    if (tabId === 'playground') initPlayground(pageId);
    if (tabId === 'guidelines' || tabId === 'usage') initGuidelines(pageId);
    if (tabId === 'examples') renderComponentExamplesTab(pageId);
}

document.querySelectorAll('.sg-page-tabs').forEach(function (tablist) {
    var page = tablist.closest('[data-page]');
    if (!page) return;
    var pageId = page.dataset.page;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.sg-page-tab'));

    tabs.forEach(function (tab, i) {
      var tabId = tab.dataset.tab;
      var panelId = 'panel-' + pageId + '-' + tabId;
      tab.setAttribute('role', 'tab');
      tab.id = 'tab-' + pageId + '-' + tabId;
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');

      var panel = page.querySelector('[data-tab-panel="' + tabId + '"]');
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.id = panelId;
        panel.setAttribute('aria-labelledby', tab.id);
      }
    });
});

document.addEventListener('click', function (e) {
    var tab = e.target.closest('.sg-page-tab');
    if (!tab) return;
    e.preventDefault();
    var page = tab.closest('[data-page]');
    if (!page) return;
    var pageId = page.dataset.page;
    var tabId = tab.dataset.tab;
    var hashBase = '#/' + pageId;
    var newHash = tabId === 'examples' ? hashBase : hashBase + '?tab=' + tabId;
    history.replaceState(null, '', newHash);
    switchTab(pageId, tabId);

    var tabs = page.querySelectorAll('.sg-page-tab');
    tabs.forEach(function (t) { t.setAttribute('tabindex', t === tab ? '0' : '-1'); });
    tab.focus();
});

document.addEventListener('keydown', function (e) {
    var tab = e.target.closest('.sg-page-tab');
    if (!tab) return;
    var tablist = tab.closest('.sg-page-tabs');
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.sg-page-tab'));
    var idx = tabs.indexOf(tab);
    var next;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = tabs[(idx + 1) % tabs.length];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = tabs[(idx - 1 + tabs.length) % tabs.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      next = tabs[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      next = tabs[tabs.length - 1];
    }

    if (next) {
      tabs.forEach(function (t) { t.setAttribute('tabindex', t === next ? '0' : '-1'); });
      next.focus();
      next.click();
    }
});

/* ========================================================================
     4. ICON PICKER (searchable dropdown for Material Symbols)
     ======================================================================== */
const iconList = window.MATERIAL_ICONS || [];
const MAX_RESULTS = 60;

function buildIconPicker(defaultVal, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'sg-icon-picker';

    const selected = document.createElement('button');
    selected.type = 'button';
    selected.className = 'sg-icon-picker-trigger';
    selected.innerHTML = '<span class="material-symbols-outlined">' + (defaultVal || 'info') + '</span><span class="sg-icon-picker-name">' + (defaultVal || 'info') + '</span>';
    wrap.appendChild(selected);

    const dropdown = document.createElement('div');
    dropdown.className = 'sg-icon-picker-dropdown';
    dropdown.style.display = 'none';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'sg-icon-picker-search';
    searchInput.placeholder = 'Search icons…';
    searchInput.value = '';
    dropdown.appendChild(searchInput);

    const results = document.createElement('div');
    results.className = 'sg-icon-picker-results';
    dropdown.appendChild(results);
    wrap.appendChild(dropdown);

    let currentVal = defaultVal || 'info';
    let open = false;

    function renderResults(query) {
      const q = (query || '').toLowerCase().replace(/\s+/g, '_');
      const matches = q
        ? iconList.filter(n => n.includes(q)).slice(0, MAX_RESULTS)
        : iconList.slice(0, MAX_RESULTS);
      results.innerHTML = '';
      if (!matches.length) {
        results.innerHTML = '<div class="sg-icon-picker-empty">No icons found</div>';
        return;
      }
      matches.forEach(name => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'sg-icon-picker-item' + (name === currentVal ? ' active' : '');
        item.innerHTML = '<span class="material-symbols-outlined">' + name + '</span><span>' + name + '</span>';
        item.addEventListener('click', () => {
          currentVal = name;
          selected.innerHTML = '<span class="material-symbols-outlined">' + name + '</span><span class="sg-icon-picker-name">' + name + '</span>';
          closeDropdown();
          onChange(name);
        });
        results.appendChild(item);
      });
    }

    function openDropdown() {
      open = true;
      dropdown.style.display = '';
      searchInput.value = '';
      renderResults('');
      requestAnimationFrame(() => searchInput.focus());
    }

    function closeDropdown() {
      open = false;
      dropdown.style.display = 'none';
    }

    selected.addEventListener('click', e => {
      e.stopPropagation();
      if (open) closeDropdown(); else openDropdown();
    });

    searchInput.addEventListener('input', () => renderResults(searchInput.value));
    searchInput.addEventListener('click', e => e.stopPropagation());
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDropdown();
    });

    document.addEventListener('click', e => {
      if (open && !wrap.contains(e.target)) closeDropdown();
    });

    return wrap;
}

/* ========================================================================
     4b. GUIDELINES RENDERER (JSON-driven)
     Renders the Guidelines tab from content/<component>.json.
     Empty/null fields are hidden. Computes spec completeness score.
     ======================================================================== */
const contentCache = {};           // componentId -> JSON data (once loaded)
const guidelinesInited = {};       // componentId -> true
const completenessScores = {};     // componentId -> { filled, total, pct }

// Which schema fields count toward completeness. Motion/responsive are
// excluded (deferred until UDS has the foundation tokens).
// COMPLETENESS_FIELDS moved to docs/data/completeness-fields.js (Phase 3c)
import { COMPLETENESS_FIELDS } from './data/completeness-fields.js';

function getField(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
}

function isFilled(v) {
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') {
      if ('dos' in v || 'donts' in v) return (v.dos && v.dos.length > 0) || (v.donts && v.donts.length > 0);
      if ('designer' in v || 'developer' in v) {
        return (v.designer && v.designer !== 'Unassigned') || (v.developer && v.developer !== 'Unassigned');
      }
      return Object.keys(v).length > 0;
    }
    return !!v;
}

function computeCompleteness(data) {
    var filled = 0;
    var filledFields = [];
    var missingFields = [];
    COMPLETENESS_FIELDS.forEach(function (path) {
      if (isFilled(getField(data, path))) {
        filled++;
        filledFields.push(path);
      } else {
        missingFields.push(path);
      }
    });
    var total = COMPLETENESS_FIELDS.length;
    return {
      filled: filled,
      total: total,
      pct: Math.round((filled / total) * 100),
      filledFields: filledFields,
      missingFields: missingFields
    };
}

function loadContent(componentId) {
    if (contentCache[componentId]) return Promise.resolve(contentCache[componentId]);
    // Phase 14: gate every UDS-data fetch on versionsReady so udsResolve()
    // returns the right base path when ?uds=X.Y is set.
    return versionsReady
      .then(function () { return fetch(udsResolve('components/' + componentId + '/spec.json')); })
      .then(function (r) {
        if (!r.ok) throw new Error('Content not found: ' + componentId);
        return r.json();
      }).then(function (data) {
        contentCache[componentId] = data;
        completenessScores[componentId] = computeCompleteness(data);
        return data;
      }).catch(function () { return null; });
}

function initGuidelines(pageId) {
    if (guidelinesInited[pageId]) return;
    var page = document.querySelector('[data-page="' + pageId + '"]');
    if (!page) return;
    var panel = page.querySelector('[data-tab-panel="guidelines"], [data-tab-panel="usage"]');
    if (!panel) return;

    loadContent(pageId).then(function (data) {
      if (!data) return;
      panel.innerHTML = '';
      renderGuidelines(panel, data);
      guidelinesInited[pageId] = true;
      updateCompletenessIndicator(pageId);
    });
}

function renderGuidelines(panel, d) {
    // 1. Overview: description, whenToUse, whenNotToUse
    var overview = [];
    if (d.description) overview.push(sectionProse('Description', d.description));
    if (d.whenToUse) overview.push(sectionProse('When to use', d.whenToUse));
    if (d.whenNotToUse) overview.push(sectionProse('When not to use', d.whenNotToUse));
    if (overview.length) panel.appendChild(groupSection('Overview', overview));

    // 2. Specification: acceptance criteria, dependencies, props, events, slots
    var spec = [];
    if (isFilled(d.acceptanceCriteria)) spec.push(sectionList('Acceptance Criteria', d.acceptanceCriteria, true));
    if (d.dependencies && (isFilled(d.dependencies.css) || isFilled(d.dependencies.js))) {
      spec.push(sectionDependencies(d.dependencies));
    }
    if (isFilled(d.props)) spec.push(sectionPropsTable(d.props));
    if (isFilled(d.events)) spec.push(sectionEventsTable(d.events));
    if (isFilled(d.slots)) spec.push(sectionSlotsTable(d.slots));
    if (spec.length) panel.appendChild(groupSection('Specification', spec));

    // 3. Behavior: states, content guidelines, density, hierarchy
    var behavior = [];
    if (isFilled(d.states)) behavior.push(sectionStatesTable(d.states));
    if (d.contentGuidelines) behavior.push(sectionProse('Content Guidelines', d.contentGuidelines));
    if (d.visualHierarchy) behavior.push(sectionProse('Visual Hierarchy', d.visualHierarchy));
    if (d.densityBehavior) behavior.push(sectionProse('Density Behavior', d.densityBehavior));
    if (behavior.length) panel.appendChild(groupSection('Behavior', behavior));

    // 4. Patterns
    var patterns = [];
    if (d.dosDonts && (isFilled(d.dosDonts.dos) || isFilled(d.dosDonts.donts))) {
      patterns.push(sectionDosDonts(d.dosDonts));
    }
    if (isFilled(d.commonlyPairedWith)) patterns.push(sectionPairedWith(d.commonlyPairedWith));
    if (patterns.length) panel.appendChild(groupSection('Patterns', patterns));

    // 5. Accessibility
    var a11y = d.accessibility || {};
    var a11yParts = [];
    if (isFilled(a11y.keyboard)) a11yParts.push(sectionKeyboardTable(a11y.keyboard));
    if (isFilled(a11y.screenReader)) a11yParts.push(sectionScreenReaderTable(a11y.screenReader));
    if (isFilled(a11y.wcag)) a11yParts.push(sectionWcagTable(a11y.wcag));
    if (isFilled(a11y.contrast)) a11yParts.push(sectionContrastTable(a11y.contrast));
    if (d._legacyAccessibilityNotes) a11yParts.push(sectionProse('Additional Notes', d._legacyAccessibilityNotes));
    if (a11yParts.length) panel.appendChild(groupSection('Accessibility', a11yParts));

    // 6. Known Issues
    if (isFilled(d.knownIssues)) {
      panel.appendChild(groupSection('Known Issues', [sectionList('', d.knownIssues, false)]));
    }

    // 7. Ownership
    if (d.owner && ((d.owner.designer && d.owner.designer !== 'Unassigned') || (d.owner.developer && d.owner.developer !== 'Unassigned'))) {
      panel.appendChild(groupSection('Ownership', [sectionOwnership(d.owner)]));
    }

    // If nothing to render, show a friendly empty state
    if (!panel.children.length) {
      var empty = document.createElement('div');
      empty.className = 'sg-guidelines-empty';
      empty.innerHTML = '<p>No guidelines captured yet. This spec is in progress.</p>';
      panel.appendChild(empty);
    }
}

// ----- Section builders -----
function groupSection(title, children) {
    var el = document.createElement('section');
    el.className = 'sg-gl-group';
    var h = document.createElement('h3');
    h.className = 'sg-gl-group-title';
    h.textContent = title;
    el.appendChild(h);
    children.forEach(function (c) { el.appendChild(c); });
    return el;
}

function subhead(title) {
    if (!title) return null;
    var h = document.createElement('h4');
    h.className = 'sg-gl-subhead';
    h.textContent = title;
    return h;
}

function sectionProse(title, text) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    var sh = subhead(title); if (sh) wrap.appendChild(sh);
    var p = document.createElement('p');
    p.className = 'sg-gl-prose';
    p.textContent = text;
    wrap.appendChild(p);
    return wrap;
}

function sectionList(title, items, checklist) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    var sh = subhead(title); if (sh) wrap.appendChild(sh);
    var ul = document.createElement('ul');
    ul.className = checklist ? 'sg-gl-checklist' : 'sg-gl-list';
    items.forEach(function (item) {
      var li = document.createElement('li');
      if (checklist) {
        var check = document.createElement('span');
        check.className = 'sg-gl-check';
        check.setAttribute('aria-hidden', 'true');
        var text = document.createElement('span');
        text.textContent = item;
        li.appendChild(check);
        li.appendChild(text);
      } else {
        li.textContent = item;
      }
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
}

function sectionDependencies(deps) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Dependencies'));
    var list = [];
    (deps.css || []).forEach(function (f) { list.push({ kind: 'CSS', path: f }); });
    (deps.js || []).forEach(function (f) { list.push({ kind: 'JS', path: f }); });
    var ul = document.createElement('ul');
    ul.className = 'sg-gl-list';
    list.forEach(function (it) {
      var li = document.createElement('li');
      li.innerHTML = '<code>' + esc(it.path) + '</code> <span class="sg-gl-kind">' + esc(it.kind) + '</span>';
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
}

function sectionPropsTable(props) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Props / Attributes'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Required</th><th>Description</th></tr></thead>';
    var body = document.createElement('tbody');
    props.forEach(function (p) {
      var tr = document.createElement('tr');
      var typeStr = p.type || '';
      if (p.enum && p.enum.length) typeStr += ' (' + p.enum.map(function(e){return "'"+e+"'";}).join(' | ') + ')';
      var def = (p.default === null || p.default === undefined) ? '' : String(p.default);
      tr.innerHTML = '<td><code>' + esc(p.name) + '</code></td><td>' + esc(typeStr) + '</td><td>' + (def ? '<code>' + esc(def) + '</code>' : '') + '</td><td>' + (p.required ? '<strong>yes</strong>' : 'no') + '</td><td>' + esc(p.description || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionEventsTable(events) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Events Emitted'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Event</th><th>Payload</th><th>Description</th></tr></thead>';
    var body = document.createElement('tbody');
    events.forEach(function (e) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + esc(e.name) + '</code></td><td>' + esc(e.payload || '') + '</td><td>' + esc(e.description || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionSlotsTable(slots) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Slots / Content Model'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Slot</th><th>Description</th></tr></thead>';
    var body = document.createElement('tbody');
    slots.forEach(function (s) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + esc(s.name) + '</code></td><td>' + esc(s.description || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionStatesTable(states) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('States Coverage'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>State</th><th>Has Visual</th><th>Description</th></tr></thead>';
    var body = document.createElement('tbody');
    states.forEach(function (s) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + esc(s.name) + '</code></td><td>' + (s.hasVisual ? 'yes' : 'no') + '</td><td>' + esc(s.description || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionDosDonts(dd) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section sg-gl-dodont';
    var cols = document.createElement('div');
    cols.className = 'sg-gl-dodont-cols';
    var dos = document.createElement('div');
    dos.className = 'sg-gl-dodont-col sg-gl-do';
    dos.innerHTML = '<h4 class="sg-gl-subhead">Do</h4>';
    var dul = document.createElement('ul'); dul.className = 'sg-gl-list';
    (dd.dos || []).forEach(function (t) { var li = document.createElement('li'); li.textContent = t; dul.appendChild(li); });
    dos.appendChild(dul);

    var donts = document.createElement('div');
    donts.className = 'sg-gl-dodont-col sg-gl-dont';
    donts.innerHTML = '<h4 class="sg-gl-subhead">Don\'t</h4>';
    var xul = document.createElement('ul'); xul.className = 'sg-gl-list';
    (dd.donts || []).forEach(function (t) { var li = document.createElement('li'); li.textContent = t; xul.appendChild(li); });
    donts.appendChild(xul);

    cols.appendChild(dos); cols.appendChild(donts);
    wrap.appendChild(cols);
    return wrap;
}

function sectionPairedWith(ids) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Commonly Paired With'));
    var p = document.createElement('p');
    p.className = 'sg-gl-paired';
    ids.forEach(function (id, i) {
      if (i > 0) p.appendChild(document.createTextNode(', '));
      var a = document.createElement('a');
      a.href = '#/' + id;
      a.textContent = id;
      a.className = 'sg-gl-link';
      p.appendChild(a);
    });
    wrap.appendChild(p);
    return wrap;
}

function sectionKeyboardTable(rows) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Keyboard'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Key</th><th>Action</th></tr></thead>';
    var body = document.createElement('tbody');
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><kbd>' + esc(r.key) + '</kbd></td><td>' + esc(r.action) + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionScreenReaderTable(rows) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Screen Reader'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Trigger</th><th>Announcement</th></tr></thead>';
    var body = document.createElement('tbody');
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + esc(r.trigger) + '</td><td>' + esc(r.announcement) + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionWcagTable(rows) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('WCAG 2.2 Criteria'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Criterion</th><th>Level</th><th>How met</th></tr></thead>';
    var body = document.createElement('tbody');
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + esc(r.criterion) + '</code></td><td>' + esc(r.level) + '</td><td>' + esc(r.howMet || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionContrastTable(rows) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section';
    wrap.appendChild(subhead('Color Contrast'));
    var tbl = document.createElement('table');
    tbl.className = 'sg-gl-table';
    tbl.innerHTML = '<thead><tr><th>Foreground</th><th>Background</th><th>Ratio</th><th>Passes</th></tr></thead>';
    var body = document.createElement('tbody');
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + esc(r.foreground) + '</code></td><td><code>' + esc(r.background) + '</code></td><td>' + (r.ratio || '') + '</td><td>' + esc(r.passes || '') + '</td>';
      body.appendChild(tr);
    });
    tbl.appendChild(body);
    wrap.appendChild(tbl);
    return wrap;
}

function sectionOwnership(owner) {
    var wrap = document.createElement('div');
    wrap.className = 'sg-gl-section sg-gl-owner';
    wrap.innerHTML = '<p><strong>Designer:</strong> ' + esc(owner.designer || 'Unassigned') + '</p><p><strong>Developer:</strong> ' + esc(owner.developer || 'Unassigned') + '</p>';
    return wrap;
}

function updateCompletenessIndicator(pageId) {
    var score = completenessScores[pageId];
    if (!score) return;
    renderComponentProgress(pageId);
    updateSidebarMetadataTooltip(pageId);
}

// STATUS_STEPS moved to docs/data/status-labels.js (Phase 3c)
import { STATUS_STEPS } from './data/status-labels.js';

function renderComponentProgress(pageId) {
    var page = document.querySelector('[data-page="' + pageId + '"]');
    if (!page || typeof COMPONENT_STATUS === 'undefined') return;
    var info = COMPONENT_STATUS[pageId];
    if (!info) return;
    var meta = STATUS_LABELS[info.status] || { label: info.status, css: info.status };
    var desc = page.querySelector('.sg-page-desc');
    var links = page.querySelector('.sg-page-links');
    if (!desc) return;

    // Remove any legacy pills/badges/cards from previous designs.
    page.querySelectorAll('.sg-status-badge, .sg-spec-completeness, .sg-component-progress').forEach(function (el) { el.remove(); });

    var wrap = page.querySelector('.sg-readiness');
    if (!wrap) {
      wrap = document.createElement('section');
      wrap.className = 'sg-readiness';
      wrap.setAttribute('aria-label', 'Component readiness');
      if (links) links.insertAdjacentElement('afterend', wrap);
      else desc.insertAdjacentElement('afterend', wrap);
    } else if (links && links.nextElementSibling !== wrap) {
      links.insertAdjacentElement('afterend', wrap);
    }

    // Status row — 5 labeled segments
    var currentIndex = STATUS_STEPS.findIndex(function (s) { return s.key === info.status; });
    var statusSegments = STATUS_STEPS.map(function (step, idx) {
      var state = idx < currentIndex ? 'complete' : (idx === currentIndex ? 'current' : 'future');
      if (currentIndex < 0) state = 'future';
      return '<span class="sg-status-bar__segment" data-state="' + state + '" data-status="' + step.key + '">' + step.label + '</span>';
    }).join('');

    // Spec row — 22 flat segments (total). Each segment maps to a COMPLETENESS_FIELDS entry.
    var score = completenessScores[pageId];
    var specSegments = '';
    var specValueText = score ? (score.filled + ' of ' + score.total + ' fields filled') : 'Loading spec';
    if (score) {
      var filledLookup = {};
      (score.filledFields || []).forEach(function (f) { filledLookup[f] = true; });
      for (var i = 0; i < score.total; i++) {
        var fieldKey = COMPLETENESS_FIELDS[i] || '';
        var isFilled = filledLookup[fieldKey] === true;
        specSegments += '<span class="sg-spec-bar__segment" data-filled="' + (isFilled ? 'true' : 'false') + '" data-field="' + fieldKey + '"></span>';
      }
    }

    var ctaSpan = score
      ? ' <span class="sg-readiness__cta">View checklist <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>'
      : '';

    wrap.innerHTML =
      '<div class="sg-readiness__row">' +
        '<div class="sg-readiness__label">' +
          '<span>Status</span>' +
          '<span class="sg-readiness__value">' + meta.label +
          ' <span class="sg-readiness__value--muted">· since ' + info.since + '</span></span>' +
        '</div>' +
        '<div class="sg-status-bar" role="group" aria-label="Component status: ' + meta.label + '">' + statusSegments + '</div>' +
      '</div>' +
      '<div class="sg-readiness__row">' +
        '<div class="sg-readiness__label">' +
          '<span>Spec</span>' +
          '<span class="sg-readiness__value">' + specValueText + ctaSpan + '</span>' +
        '</div>' +
        '<button type="button" class="sg-spec-bar sg-spec-progress-trigger" aria-haspopup="dialog" aria-expanded="false" aria-label="' + (score ? 'Spec progress: ' + score.filled + ' of ' + score.total + ' fields filled. Click to view checklist.' : 'Spec progress loading') + '">' +
          specSegments +
        '</button>' +
      '</div>';

    var trigger = wrap.querySelector('.sg-spec-progress-trigger');
    if (trigger && score) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        toggleSpecPopover(trigger, pageId);
      });
    }
}

// Sidebar metadata tooltip — uses the real UDS udc-tooltip CSS pattern.
// We inject a <span class="udc-tooltip" data-position="right"> inside each
// component sidebar link; CSS handles show/hide on :hover / :focus-within.
// The sidebar tooltip is portaled to <body> rather than nested inside the
// sidebar link. `.sg-sidebar` has `position: sticky` which creates a
// stacking context (per CSS spec) — anything inside it, even with
// `position: fixed; z-index: 9999`, gets stacked relative to the
// sidebar's stacking context and ends up painted under `.sg-main`.
// Portaling sidesteps both the stacking context and the `overflow:auto`
// clipping issue.
function getSidebarPortalTooltip() {
    var portal = document.getElementById('sg-sidebar-portal-tooltip');
    if (!portal) {
      portal = document.createElement('span');
      portal.id = 'sg-sidebar-portal-tooltip';
      // Intentionally no `data-position` — `.udc-tooltip[data-position="right"]`
      // has higher specificity (0,2,0) than `.sg-sidebar-portal-tooltip`
      // (0,1,0) and would override our custom `left/top/transform`.
      portal.className = 'udc-tooltip sg-sidebar-portal-tooltip';
      portal.setAttribute('role', 'tooltip');
      portal.setAttribute('data-visible', 'false');
      document.body.appendChild(portal);

      // Hide the tooltip if the sidebar scrolls — the anchor link moves and
      // the tooltip would float away from its target.
      var sidebar = document.querySelector('.sg-sidebar');
      if (sidebar) {
        sidebar.addEventListener('scroll', function () {
          portal.setAttribute('data-visible', 'false');
        }, { passive: true });
      }
    }
    return portal;
}

function showSidebarPortalTooltip(link, html) {
    var portal = getSidebarPortalTooltip();
    portal.innerHTML = html;
    var r = link.getBoundingClientRect();
    portal.style.top = (r.top + r.height / 2) + 'px';
    portal.setAttribute('data-visible', 'true');
}

function hideSidebarPortalTooltip() {
    var portal = document.getElementById('sg-sidebar-portal-tooltip');
    if (portal) portal.setAttribute('data-visible', 'false');
}

function updateSidebarMetadataTooltip(pageId) {
    var link = document.querySelector('.sg-sidebar-link[href="#/' + pageId + '"]');
    if (!link || typeof COMPONENT_STATUS === 'undefined') return;
    var info = COMPONENT_STATUS[pageId];
    var meta = info ? (STATUS_LABELS[info.status] || { label: info.status }) : null;
    var score = completenessScores[pageId];
    var name = (link.dataset.label || link.textContent || '').trim();
    if (!link.dataset.label) link.dataset.label = name;

    // Strip legacy native title / dot indicators.
    link.removeAttribute('title');
    link.querySelectorAll('.sg-sidebar-dot').forEach(function (dot) { dot.remove(); });
    // Strip any legacy nested tooltip from a prior render.
    link.querySelectorAll(':scope > .udc-tooltip').forEach(function (n) { n.remove(); });

    // Wire hover/focus handlers ONCE per link.
    if (!link.dataset.tooltipWired) {
      link.dataset.tooltipWired = 'true';
      link.addEventListener('mouseenter', function () {
        if (link.dataset.tooltipHtml) showSidebarPortalTooltip(link, link.dataset.tooltipHtml);
      });
      link.addEventListener('mouseleave', hideSidebarPortalTooltip);
      link.addEventListener('focus', function () {
        if (link.dataset.tooltipHtml) showSidebarPortalTooltip(link, link.dataset.tooltipHtml);
      });
      link.addEventListener('blur', hideSidebarPortalTooltip);
    }

    // STATUS section: 5 mini segments + status label below
    var statusBlock = '';
    if (meta) {
      var currentIdx = STATUS_STEPS.findIndex(function (s) { return s.key === info.status; });
      var statusMini = STATUS_STEPS.map(function (step, idx) {
        var st = idx < currentIdx ? 'complete' : (idx === currentIdx ? 'current' : 'future');
        if (currentIdx < 0) st = 'future';
        return '<span class="sg-sidebar-tooltip__mini-segment" data-state="' + st + '" data-status="' + step.key + '"></span>';
      }).join('');
      statusBlock =
        '<span class="sg-sidebar-tooltip__section">' +
          '<span class="sg-sidebar-tooltip__section-label">Status</span>' +
          '<span class="sg-sidebar-tooltip__mini-bar sg-sidebar-tooltip__mini-bar--status">' + statusMini + '</span>' +
          '<span class="sg-sidebar-tooltip__caption">' + meta.label + ' · since ' + info.since + '</span>' +
        '</span>';
    }

    // SPEC section: 22 mini segments + caption
    var specBlock = '';
    if (score) {
      var filledLookup = {};
      (score.filledFields || []).forEach(function (f) { filledLookup[f] = true; });
      var specMini = '';
      for (var i = 0; i < score.total; i++) {
        var fieldKey = COMPLETENESS_FIELDS[i] || '';
        var isFilled = filledLookup[fieldKey] === true;
        specMini += '<span class="sg-sidebar-tooltip__mini-segment sg-sidebar-tooltip__mini-segment--spec" data-filled="' + (isFilled ? 'true' : 'false') + '"></span>';
      }
      specBlock =
        '<span class="sg-sidebar-tooltip__section">' +
          '<span class="sg-sidebar-tooltip__section-label">Spec</span>' +
          '<span class="sg-sidebar-tooltip__mini-bar sg-sidebar-tooltip__mini-bar--spec">' + specMini + '</span>' +
          '<span class="sg-sidebar-tooltip__caption">' + score.filled + ' of ' + score.total + ' fields filled</span>' +
        '</span>';
    } else {
      specBlock =
        '<span class="sg-sidebar-tooltip__section">' +
          '<span class="sg-sidebar-tooltip__section-label">Spec</span>' +
          '<span class="sg-sidebar-tooltip__caption">Loading</span>' +
        '</span>';
    }

    // Optional preview of next missing fields
    var missingHtml = '';
    if (score && score.missingFields && score.missingFields.length) {
      var preview = score.missingFields.slice(0, 3).map(function (p) { return SPEC_FIELD_LABELS[p] || p; }).join(', ');
      missingHtml =
        '<span class="sg-sidebar-tooltip__missing">' +
          '<span class="sg-sidebar-tooltip__section-label">Next to fill</span>' + preview +
        '</span>';
    }

    var html =
      '<span class="sg-sidebar-tooltip__title">' + name + '</span>' +
      statusBlock + specBlock + missingHtml;
    link.dataset.tooltipHtml = html;

    // If this link is currently being hovered/focused, refresh the visible
    // portal tooltip immediately so a stale render isn't shown.
    var portal = document.getElementById('sg-sidebar-portal-tooltip');
    if (portal && portal.getAttribute('data-visible') === 'true' &&
        (link.matches(':hover') || link.matches(':focus'))) {
      showSidebarPortalTooltip(link, html);
    }
}

// Human-readable label for each COMPLETENESS_FIELDS path
// SPEC_FIELD_LABELS moved to docs/data/completeness-fields.js (Phase 3c)
import { SPEC_FIELD_LABELS } from './data/completeness-fields.js';

function toggleSpecPopover(triggerEl, pageId) {
    var existing = document.getElementById('sg-spec-popover');
    if (existing && existing.dataset.for === pageId) {
      closeSpecPopover();
      return;
    }
    if (existing) closeSpecPopover();

    var score = completenessScores[pageId];
    if (!score) return;

    var pop = document.createElement('div');
    pop.id = 'sg-spec-popover';
    pop.className = 'sg-spec-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Spec completeness for ' + pageId);
    pop.dataset.for = pageId;

    var filledList = (score.filledFields || []).map(function (p) {
      return '<li class="sg-spec-popover__filled"><span class="sg-spec-popover__check">&#10003;</span>' + (SPEC_FIELD_LABELS[p] || p) + '</li>';
    }).join('');
    var missingList = (score.missingFields || []).map(function (p) {
      return '<li class="sg-spec-popover__missing"><span class="sg-spec-popover__dot"></span>' + (SPEC_FIELD_LABELS[p] || p) + '</li>';
    }).join('');

    pop.innerHTML =
      '<div class="sg-spec-popover__header">' +
        '<strong>Spec ' + score.filled + '/' + score.total + '</strong>' +
        '<button type="button" class="sg-spec-popover__close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>' +
      '</div>' +
      '<p class="sg-spec-popover__intro">22 spec fields are tracked per component. Filled fields appear in the Guidelines tab; empty ones are hidden until a designer fills them in via <code>content/' + pageId + '.json</code>.</p>' +
      (missingList ? '<div class="sg-spec-popover__group"><h4>Missing (' + score.missingFields.length + ')</h4><ul>' + missingList + '</ul></div>' : '') +
      (filledList ? '<div class="sg-spec-popover__group sg-spec-popover__group--filled"><h4>Filled (' + score.filledFields.length + ')</h4><ul>' + filledList + '</ul></div>' : '') +
      '<p class="sg-spec-popover__footer">Motion and Responsive Behavior are intentionally deferred (UDS does not yet have those token sets). They do not count toward this score.</p>';

    document.body.appendChild(pop);
    triggerEl.setAttribute('aria-expanded', 'true');

    // Position the popover below the pill
    var rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    pop.style.left = (rect.left + window.scrollX) + 'px';

    // Wire close button + click-outside
    pop.querySelector('.sg-spec-popover__close').addEventListener('click', closeSpecPopover);
    setTimeout(function () { document.addEventListener('click', specPopoverOutsideHandler); }, 0);
    document.addEventListener('keydown', specPopoverEscHandler);
}

function closeSpecPopover() {
    var pop = document.getElementById('sg-spec-popover');
    if (pop) {
      var pageId = pop.dataset.for;
      var trigger = document.querySelector('[data-page="' + pageId + '"] .sg-spec-progress-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      pop.remove();
    }
    document.removeEventListener('click', specPopoverOutsideHandler);
    document.removeEventListener('keydown', specPopoverEscHandler);
}

function specPopoverOutsideHandler(e) {
    var pop = document.getElementById('sg-spec-popover');
    if (!pop) return;
    if (pop.contains(e.target)) return;
    if (e.target.closest('.sg-spec-progress-trigger')) return;
    closeSpecPopover();
}

function specPopoverEscHandler(e) {
    if (e.key === 'Escape') closeSpecPopover();
}

// Preload content and completeness for all component JSONs so sidebar dots
// and header pills can render immediately without waiting for tab open.
// Only attempts to load for known component IDs (skips Foundations, Reference,
// and Patterns pages which have no content JSON).
function preloadAllContent() {
    if (typeof COMPONENT_STATUS === 'undefined') return;
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      loadContent(id).then(function (data) {
        if (data) {
          updateCompletenessIndicator(id);
          // Phase 13: now that contentCache[id] has the spec, re-render the
          // page-link bar so the Figma deep-link, Storybook slug, and Report
          // Issue title pick up the data they need from spec.json.
          if (typeof renderComponentLinksFor === 'function') {
            renderComponentLinksFor(id);
          }
        }
      });
      // Phase 8: also pre-fetch per-component changelog.json so the
      // "Last updated" header panel and the per-component Changelog tab
      // have synchronous access via _componentChangelogCache.
      preloadComponentChangelog(id);
    });
}

const _componentChangelogCache = {};
function preloadComponentChangelog(componentId) {
    if (_componentChangelogCache[componentId] !== undefined) return;
    _componentChangelogCache[componentId] = null; // mark in-flight
    versionsReady
      .then(function () { return fetch(udsResolve('components/' + componentId + '/changelog.json')); })
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (data) {
      _componentChangelogCache[componentId] = data || { entries: [] };
      // Re-render the per-component header extras now that the cache is
      // warm (so the "Last updated" panel can appear without a navigation).
      if (typeof renderComponentHeaderExtras === 'function') {
        try { renderComponentHeaderExtras(componentId); } catch (_) {}
      }
    }).catch(function () {
      _componentChangelogCache[componentId] = { entries: [] };
    });
}

/* ========================================================================
     5. PLAYGROUND ENGINE
     ======================================================================== */
const playgroundInited = {};

// Phase 13: per-component playground configs are dynamically imported from
// uds/components/<id>/playground.js on first init. Cached so re-clicking
// the Playground tab is synchronous.
const playgroundCache = {};

function loadPlaygroundConfig(pageId) {
    if (playgroundCache[pageId] !== undefined) {
      return Promise.resolve(playgroundCache[pageId]);
    }
    // Phase 14: when viewing a historical archive, the snapshot may not
    // include playground.js (only the live version carries interactive
    // configs). Resolve to udsResolve()-style URL anchored at the site
    // root via document.baseURI so dynamic import works either way.
    var url = new URL(udsResolve('components/' + pageId + '/playground.js'),
                      document.baseURI).href;
    return import(/* @vite-ignore */ url)
      .then(function (mod) {
        playgroundCache[pageId] = mod && mod.default ? mod.default : null;
        return playgroundCache[pageId];
      })
      .catch(function () {
        playgroundCache[pageId] = null;
        return null;
      });
}

function refreshPlaygrounds() {
    Object.keys(playgroundInited).forEach(id => {
      const cfg = playgroundCache[id];
      if (cfg && cfg._update) cfg._update();
    });
    refreshImplSections();
}

async function initPlayground(pageId) {
    if (playgroundInited[pageId]) return;
    const cfg = await loadPlaygroundConfig(pageId);
    if (!cfg) return;

    const panel = document.querySelector('[data-page="' + pageId + '"] [data-tab-panel="playground"]');
    if (!panel) return;

    const previewEl = document.createElement('div');
    previewEl.className = 'sg-playground-preview';

    const controlsEl = document.createElement('div');
    controlsEl.className = 'sg-playground-controls';

    const codeEl = document.createElement('pre');
    codeEl.className = 'sg-playground-code';

    panel.innerHTML = '';

    // Re-add the "Example only" banner since we wiped the panel.
    var pgBanner = document.createElement('div');
    pgBanner.className = 'sg-example-only-banner';
    pgBanner.innerHTML = '<span class="material-symbols-outlined">code_blocks</span><span><strong>Example only.</strong> All code on this page is reference. Production components live in Storybook.</span>';
    panel.appendChild(pgBanner);

    const layout = document.createElement('div');
    layout.className = 'sg-playground-layout';

    const left = document.createElement('div');
    left.className = 'sg-playground-left';
    left.appendChild(previewEl);
    left.appendChild(controlsEl);

    const right = document.createElement('div');
    right.className = 'sg-playground-right';
    const codeWrap = document.createElement('div');
    codeWrap.className = 'sg-code-wrap';
    const copyBtn = buildCopyButton(function() { return codeEl.textContent; });
    codeWrap.appendChild(copyBtn);
    codeWrap.appendChild(codeEl);
    right.appendChild(codeWrap);

    layout.appendChild(left);
    layout.appendChild(right);
    panel.appendChild(layout);

    const state = {};
    cfg.controls.forEach(c => { state[c.key] = c.default; });

    function update() {
      const result = cfg.render(state);
      previewEl.innerHTML = result.html;
      codeEl.textContent = result.code;
    }

    cfg.controls.forEach(ctrl => {
      const row = document.createElement('div');
      row.className = 'sg-pg-control';

      const label = document.createElement('label');
      label.className = 'sg-pg-label';
      label.textContent = ctrl.label;
      row.appendChild(label);

      if (ctrl.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'sg-pg-select';
        ctrl.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          if (o.value === ctrl.default) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => { state[ctrl.key] = sel.value; update(); });
        row.appendChild(sel);
      } else if (ctrl.type === 'checkbox') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sg-pg-checkbox';
        cb.checked = !!ctrl.default;
        cb.addEventListener('change', () => { state[ctrl.key] = cb.checked; update(); });
        row.appendChild(cb);
      } else if (ctrl.type === 'text') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'sg-pg-input';
        inp.value = ctrl.default || '';
        inp.addEventListener('input', () => { state[ctrl.key] = inp.value; update(); });
        row.appendChild(inp);
      } else if (ctrl.type === 'icon-search') {
        row.appendChild(buildIconPicker(ctrl.default || 'info', val => {
          state[ctrl.key] = val;
          update();
        }));
      }

      controlsEl.appendChild(row);
    });

    cfg._update = update;
    update();

    // Phase 13: impl.json is fetched on-demand. The cache means subsequent
    // playground inits for the same component are synchronous.
    loadImplData(pageId).then(function (data) {
      if (!data) return;
      var implSection = buildImplSection(pageId);
      if (implSection) right.appendChild(implSection);
    });

    playgroundInited[pageId] = true;
}

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}



/* ========================================================================
     6c. BUILD IMPLEMENTATION REFERENCE SECTION
     ======================================================================== */
var jsBehaviorCache = {};

// Phase 13: fetchJsBehavior takes a `data` arg with jsFunc + jsFile, sourced
// from per-component impl.json. Replaces the legacy JS_FUNC_TO_FILE table.
function fetchJsBehavior(data, callback) {
    var funcName = data && data.jsFunc;
    if (!funcName) { callback(''); return; }
    if (jsBehaviorCache[funcName] !== undefined) {
      callback(jsBehaviorCache[funcName]);
      return;
    }
    var file = data.jsFile || 'uds/uds.js';
    fetch(udsResolve(file)).then(function (r) { return r.text(); }).then(function (text) {
      var pattern = new RegExp('(  function ' + funcName + '\\([^)]*\\)[\\s\\S]*?\\n  \\})');
      var match = text.match(pattern);
      jsBehaviorCache[funcName] = match ? match[1] : text;
      callback(jsBehaviorCache[funcName]);
    });
}

var cssFileCache = {};

function fetchCssFile(path, callback) {
    if (cssFileCache[path] !== undefined) {
      callback(cssFileCache[path]);
      return;
    }
    fetch(path).then(function (r) { return r.text(); }).then(function (text) {
      cssFileCache[path] = text;
      callback(text);
    });
}

// Phase 13: per-component impl.json files cached after first fetch.
var implDataCache = {};

function loadImplData(pageId) {
    if (implDataCache[pageId] !== undefined) {
      return Promise.resolve(implDataCache[pageId]);
    }
    return versionsReady
      .then(function () { return fetch(udsResolve('components/' + pageId + '/impl.json')); })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (data) {
        implDataCache[pageId] = data;
        return data;
      });
}

function buildImplSection(pageId) {
    var data = implDataCache[pageId];
    if (!data) return null;

    var details = document.createElement('details');
    details.className = 'sg-impl-details';

    var summary = document.createElement('summary');
    summary.textContent = 'Implementation Reference';
    details.appendChild(summary);

    var body = document.createElement('div');
    body.className = 'sg-impl-body';

    var tabBar = document.createElement('div');
    tabBar.className = 'sg-impl-tabs';

    var panels = document.createElement('div');

    var tabDefs = [{ id: 'component', label: 'Component File' }, { id: 'styles', label: 'Styles (CSS)' }];
    if (data.jsFunc) tabDefs.push({ id: 'behavior', label: 'Behavior (JS)' });
    var hasTokens = data.tokens && Object.keys(data.tokens).length > 0;
    if (hasTokens) tabDefs.push({ id: 'tokens', label: 'Tokens Used' });

    var activePanelEl = null;

    tabDefs.forEach(function (td, idx) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'sg-impl-tab';
      tab.textContent = td.label;
      tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      tab.dataset.implTab = td.id;

      var panel = document.createElement('div');
      panel.className = 'sg-impl-panel' + (idx === 0 ? ' active' : '');
      panel.dataset.implPanel = td.id;

      tab.addEventListener('click', function () {
        tabBar.querySelectorAll('.sg-impl-tab').forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        panels.querySelectorAll('.sg-impl-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.setAttribute('aria-selected', 'true');
        panel.classList.add('active');
      });

      tabBar.appendChild(tab);
      panels.appendChild(panel);

      if (td.id === 'component') {
        var pre = document.createElement('pre');
        var wrap = document.createElement('div');
        wrap.className = 'sg-code-wrap';
        wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
        wrap.appendChild(pre);
        panel.appendChild(wrap);
        panel._pre = pre;
        updateComponentTab(panel, data);
      }

      if (td.id === 'styles') {
        var pre2 = document.createElement('pre');
        pre2.textContent = 'Loading…';
        var wrap2 = document.createElement('div');
        wrap2.className = 'sg-code-wrap';
        wrap2.appendChild(buildCopyButton(function () { return pre2.textContent; }));
        wrap2.appendChild(pre2);
        panel.appendChild(wrap2);
        // Read CSS path from spec.json (dependencies.css[0]). loadContent is
        // idempotent (cached), so calling it here is safe even if
        // preloadAllContent already fetched it.
        loadContent(pageId).then(function (json) {
          var cssPath = (json && json.dependencies && json.dependencies.css && json.dependencies.css[0]) || null;
          if (cssPath) {
            // Phase 14: route through udsResolve so historical archives
            // serve their CSS from versions/<X>/uds/components/.../<id>.css
            fetchCssFile(udsResolve(cssPath), function (text) { pre2.textContent = text; });
          } else {
            pre2.textContent = '/* No CSS dependency declared in spec.json */';
          }
        });
      }

      if (td.id === 'behavior') {
        var pre3 = document.createElement('pre');
        pre3.textContent = 'Loading…';
        var wrap3 = document.createElement('div');
        wrap3.className = 'sg-code-wrap';
        wrap3.appendChild(buildCopyButton(function () { return pre3.textContent; }));
        wrap3.appendChild(pre3);
        panel.appendChild(wrap3);
        panel._pre = pre3;
        updateBehaviorTab(panel, data);
      }

      if (td.id === 'tokens') {
        buildTokensPanel(panel, data.tokens);
      }
    });

    body.appendChild(tabBar);
    body.appendChild(panels);
    details.appendChild(body);
    details._data = data;

    return details;
}

function updateComponentTab(panel, data) {
    var pre = panel._pre;
    if (!pre) return;
    // Phase 13: data.html is now a plain string (was a zero-arg function in
    // the old IMPL_DATA table). Tolerate both shapes for resilience.
    pre.textContent = typeof data.html === 'function' ? data.html() : (data.html || '');
}

function updateBehaviorTab(panel, data) {
    var pre = panel._pre;
    if (!pre) return;
    if (data.jsFunc) {
      fetchJsBehavior(data, function (code) { pre.textContent = code; });
    }
}

function buildTokensPanel(panel, tokenGroups) {
    var container = document.createElement('div');
    container.className = 'sg-impl-tokens';

    var computedStyle = getComputedStyle(document.documentElement);

    Object.keys(tokenGroups).forEach(function (group) {
      var header = document.createElement('div');
      header.className = 'sg-impl-token-group';
      header.textContent = group;
      container.appendChild(header);

      tokenGroups[group].forEach(function (token) {
        var row = document.createElement('div');
        row.className = 'sg-impl-token-row';

        var resolved = computedStyle.getPropertyValue(token).trim();
        var isColor = token.indexOf('color') !== -1;

        if (isColor && resolved) {
          var swatch = document.createElement('div');
          swatch.className = 'sg-impl-token-swatch';
          swatch.style.background = resolved;
          row.appendChild(swatch);
        }

        var nameSpan = document.createElement('span');
        nameSpan.className = 'sg-impl-token-name';
        nameSpan.textContent = token;
        row.appendChild(nameSpan);

        var valSpan = document.createElement('span');
        valSpan.className = 'sg-impl-token-val';
        valSpan.textContent = resolved || '';
        row.appendChild(valSpan);

        container.appendChild(row);
      });
    });

    panel.appendChild(container);
}

function refreshImplSections() {
    document.querySelectorAll('.sg-impl-details').forEach(function (details) {
      var data = details._data;
      if (!data) return;

      var compPanel = details.querySelector('[data-impl-panel="component"]');
      if (compPanel) updateComponentTab(compPanel, data);

      var behavPanel = details.querySelector('[data-impl-panel="behavior"]');
      if (behavPanel && data.jsFunc) updateBehaviorTab(behavPanel, data);
    });
}

/* ========================================================================
     7. TOKEN COPY BUTTONS
     ======================================================================== */
const copyIcon = '<span class="material-symbols-outlined">content_copy</span>';
const checkIcon = '<span class="material-symbols-outlined">check</span>';

document.querySelectorAll('.sg-token-row').forEach(row => {
    const nameEl = row.querySelector('.sg-token-name');
    if (!nameEl) return;
    const btn = document.createElement('button');
    btn.className = 'sg-token-copy';
    btn.type = 'button';
    btn.title = 'Copy token name';
    btn.innerHTML = copyIcon;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(nameEl.textContent.trim()).then(() => {
        btn.innerHTML = checkIcon;
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = copyIcon; btn.classList.remove('copied'); }, 1500);
      });
    });
    row.appendChild(btn);
});

/* ========================================================================
     8. CODE BLOCK COPY BUTTONS — add to all "Show code" example blocks
     ======================================================================== */
document.querySelectorAll('.sg-example-code').forEach(function (details) {
    var pre = details.querySelector('pre');
    if (!pre) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
});

document.querySelectorAll('[data-tab-panel="code"] pre.sg-playground-code').forEach(function (pre) {
    if (pre.parentNode.classList.contains('sg-code-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
});

/* ========================================================================
     9. POPULATE PRIMITIVE COLOR SWATCHES
     ======================================================================== */
// The actual primitive-color row rendering was DEFERRED to the
// 'primitive-colors' page load hook above (Phase 5) — running it eagerly
// here breaks because the #prim-<family> slots only exist after the
// primitive-colors page fragment is fetched and injected.


/* ========================================================================
     11. DOWNLOAD UDS ZIP
     ======================================================================== */
function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

var dlBtn = document.getElementById('gs-download-btn');
if (dlBtn) {
    dlBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (typeof JSZip === 'undefined') {
        alert('JSZip library failed to load. Please check your internet connection and try again.');
        return;
      }

      var originalText = dlBtn.innerHTML;
      dlBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Building zip\u2026';
      dlBtn.style.pointerEvents = 'none';

      var files = [
        'uds.css',
        'uds.js',
        'tokens/primitives.css',
        'tokens/semantic.css',
        'tokens/text-styles.css',
        'components/button.css',
        'components/link.css',
        'components/label.css',
        'components/text-input.css',
        'components/text-input.js',
        'components/text-area.css',
        'components/checkbox.css',
        'components/checkbox.js',
        'components/radio.css',
        'components/combobox.css',
        'components/date-picker.css',
        'components/toggle.css',
        'components/badge.css',
        'components/divider.css',
        'components/icon-wrapper.css',
        'components/spacer.css',
        'components/breadcrumb.css',
        'components/pagination.css',
        'components/tab-horizontal.css',
        'components/tabs.js',
        'components/dropdown.css',
        'components/dropdown.js',
        'components/nav-header.css',
        'components/nav-header.js',
        'components/nav-vertical.css',
        'components/nav-vertical.js',
        'components/notification.css',
        'components/notification.js',
        'components/dialog.css',
        'components/dialog.js',
        'components/tile.css',
        'components/tile.js',
        'components/list.css',
        'components/list.js',
        'components/data-table.css',
        'components/data-table.js',
        'components/data-view.css',
        'components/chip.css',
        'components/chip.js',
        'components/search.css',
        'components/search.js',
        'components/tooltip.css'
      ];

      Promise.all(files.map(function (f) {
        return fetch('uds/' + f).then(function (r) {
          if (!r.ok) throw new Error('Failed to fetch ' + f + ' (' + r.status + ')');
          return r.text();
        }).then(function (text) {
          return { path: f, content: text };
        });
      })).then(function (results) {
        var zip = new JSZip();
        var folder = zip.folder('uds');
        results.forEach(function (r) {
          folder.file(r.path, r.content);
        });
        return zip.generateAsync({ type: 'blob' });
      }).then(function (blob) {
        triggerDownload(blob, 'uds.zip');
        dlBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Downloaded!';
        setTimeout(function () {
          dlBtn.innerHTML = originalText;
          dlBtn.style.pointerEvents = '';
        }, 2000);
      }).catch(function (err) {
        console.error('Download failed:', err);
        dlBtn.innerHTML = '<span class="material-symbols-outlined">error</span> Download failed';
        setTimeout(function () {
          dlBtn.innerHTML = originalText;
          dlBtn.style.pointerEvents = '';
        }, 3000);
      });
    });
}

/* ========================================================================
     12. CHANGELOG + COMPONENT STATUS + VERSION DROPDOWN
     ======================================================================== */

// CHANGELOG dissolved in Phase 8 — per-component changelog.json files
// are the source of truth, aggregated into uds/CHANGELOG.json by
// scripts/aggregate-changelog.sh and consumed by renderGlobalChangelog().


// SITE_CHANGELOG moved to docs/data/site-changelog.js (Phase 3c)
import { SITE_CHANGELOG } from './data/site-changelog.js';

// STATUS_LABELS moved to docs/data/status-labels.js (Phase 3c)
import { STATUS_LABELS } from './data/status-labels.js';

// COMPONENT_STATUS is built at boot from uds/components.json + each
// per-component status.json. The single source of truth is the per-component
// folder; this map is just an in-memory index for fast O(1) lookups by render
// functions. componentsReady resolves after the map is fully populated.
var COMPONENT_STATUS = {};
var componentsReady = (async () => {
    try {
      // Phase 14: wait for the version map to settle so udsResolve()
      // routes correctly when ?uds=X.Y is set on the URL.
      await versionsReady;
      const manifestRes = await fetch(udsResolve('components.json'));
      if (!manifestRes.ok) return;
      const manifest = await manifestRes.json();
      const ids = (manifest.components || []).map(c => c.id);
      const statuses = await Promise.all(
        ids.map(id => fetch(udsResolve(`components/${id}/status.json`))
          .then(r => r.ok ? r.json() : null)
          .catch(() => null))
      );
      ids.forEach((id, i) => {
        const s = statuses[i];
        if (s) {
          COMPONENT_STATUS[id] = { status: s.current, since: s.since };
        }
      });
      window.COMPONENT_STATUS_MAP = window.COMPONENT_STATUS_MAP || {};
      Object.keys(COMPONENT_STATUS).forEach(id => {
        window.COMPONENT_STATUS_MAP[id] = COMPONENT_STATUS[id].status;
      });
    } catch (e) {
      console.error('Failed to load component manifest:', e);
    }
})();

// UDS_VERSION is loaded from uds/version.json on init (Phase 8). The
// initial value below is just a fallback used while the fetch is in-flight
// or on error — the fetch overwrites it on module load so all downstream
// code (version dropdown, snapshot detection, etc.) sees the real value.
var UDS_VERSION = '0.3';

(async () => {
    try {
      await versionsReady;
      const res = await fetch(udsResolve('version.json'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.version) UDS_VERSION = data.version;
      }
    } catch (_) {}
})();

var TYPE_LABELS = {
    added: 'Added', changed: 'Changed', fixed: 'Fixed',
    deprecated: 'Deprecated', removed: 'Removed'
};

function renderChangeItems(parent, entries, type) {
    entries.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'sg-cl-item sg-cl-item--' + type;
      var prefix = '<span class="sg-cl-type sg-cl-type--' + type + '">' + (TYPE_LABELS[type] || type) + ':</span> ';
      var compLabels = '';
      if (entry.component) {
        var comps = Array.isArray(entry.component) ? entry.component : [entry.component];
        comps.forEach(function (c) {
          compLabels += '<span class="udc-badge sg-cl-component" data-variant="secondary" data-prominent="true" data-size="sm">' + c + '</span>';
        });
      }
      item.innerHTML = prefix + compLabels + entry.text;
      parent.appendChild(item);
    });
}

function renderCategorySection(parent, categoryTitle, changes, typeOrder) {
    var grouped = {};
    changes.forEach(function (c) {
      if (!grouped[c.type]) grouped[c.type] = [];
      grouped[c.type].push(c);
    });

    var hasEntries = false;
    typeOrder.forEach(function (type) { if (grouped[type]) hasEntries = true; });
    if (!hasEntries) return;

    var catGroup = document.createElement('div');
    catGroup.className = 'sg-cl-group';
    var catTitle = document.createElement('div');
    catTitle.className = 'sg-cl-group-title sg-cl-group-title--added';
    catTitle.textContent = categoryTitle;
    catGroup.appendChild(catTitle);

    typeOrder.forEach(function (type) {
      if (!grouped[type]) return;
      if (categoryTitle) {
        renderChangeItems(catGroup, grouped[type], type);
      }
    });

    parent.appendChild(catGroup);
}

// Phase 8: fetch the aggregated changelog from uds/CHANGELOG.json (built
// by scripts/aggregate-changelog.sh from per-component changelog.json files
// + uds/CHANGELOG.globalNotes.json) instead of reading from the in-memory
// CHANGELOG table. Per-component changelog.json files are the source of truth.
async function renderGlobalChangelog() {
    var container = document.getElementById('sg-global-changelog');
    if (!container) return;
    container.innerHTML = '<p class="sg-changelog-empty">Loading...</p>';

    let releases;
    try {
      await versionsReady;
      const res = await fetch(udsResolve('CHANGELOG.json'));
      if (!res.ok) throw new Error('CHANGELOG.json not found');
      releases = await res.json();
    } catch (e) {
      console.error('Failed to load uds/CHANGELOG.json:', e);
      container.innerHTML = '<p class="sg-changelog-empty">Failed to load changelog.</p>';
      return;
    }

    container.innerHTML = '';
    var typeOrder = ['added', 'changed', 'fixed', 'deprecated', 'removed'];

    releases.slice().reverse().forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + (release.date || '') + '</span>';
      section.appendChild(header);

      // Global (non-component) notes — group by type within the section
      if (release.globalNotes && release.globalNotes.length) {
        var notesGroup = document.createElement('div');
        notesGroup.className = 'sg-cl-group';
        var notesGroupTitle = document.createElement('div');
        notesGroupTitle.className = 'sg-cl-group-title sg-cl-group-title--added';
        notesGroupTitle.textContent = 'Release Notes';
        notesGroup.appendChild(notesGroupTitle);
        typeOrder.forEach(function (type) {
          var ofType = release.globalNotes.filter(function (e) { return e.type === type; });
          if (ofType.length) renderChangeItems(notesGroup, ofType, type);
        });
        section.appendChild(notesGroup);
      }

      // Per-component sections
      var components = release.byComponent || {};
      var compNames = Object.keys(components);
      if (compNames.length) {
        var compsGroup = document.createElement('div');
        compsGroup.className = 'sg-cl-group';
        var compsGroupTitle = document.createElement('div');
        compsGroupTitle.className = 'sg-cl-group-title sg-cl-group-title--added';
        compsGroupTitle.textContent = 'Components';
        compsGroup.appendChild(compsGroupTitle);

        compNames.forEach(function (name) {
          var entries = components[name];
          // Inject the component name as a "pill" prefix on each entry
          var entriesWithComp = entries.map(function (e) {
            return { type: e.type, text: e.text, component: name };
          });
          // Group by type within this component
          typeOrder.forEach(function (type) {
            var ofType = entriesWithComp.filter(function (e) { return e.type === type; });
            if (ofType.length) renderChangeItems(compsGroup, ofType, type);
          });
        });

        section.appendChild(compsGroup);
      }

      container.appendChild(section);
    });
}

// Legacy entry point preserved for back-compat. Wraps the renderer above.

function renderSiteChangelog() {
    var container = document.getElementById('sg-site-changelog');
    if (!container) return;
    container.innerHTML = '';

    SITE_CHANGELOG.slice().reverse().forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num" style="font-size:var(--uds-font-size-xl)">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + release.date + '</span>';
      section.appendChild(header);

      var typeOrder = ['added', 'changed', 'fixed', 'deprecated', 'removed'];
      var grouped = {};
      release.changes.forEach(function (c) {
        if (!grouped[c.type]) grouped[c.type] = [];
        grouped[c.type].push(c);
      });

      typeOrder.forEach(function (type) {
        if (!grouped[type]) return;
        renderChangeItems(section, grouped[type], type);
      });

      container.appendChild(section);
    });
}

// Phase 8: read per-component history from uds/components/<id>/changelog.json.
// The function STAYS sync (returns immediately) and renders async — kicks off
// the fetch and updates the panel when data arrives.
function renderComponentChangelog(pageId) {
    var panel = document.querySelector('[data-page="' + pageId + '"] [data-tab-panel="changelog"]');
    if (!panel) return;

    panel.innerHTML = '<p class="sg-changelog-empty">Loading...</p>';

    fetch(udsResolve('components/' + pageId + '/changelog.json')).then(function (r) {
      if (!r.ok) throw new Error('No changelog');
      return r.json();
    }).then(function (data) {
      _renderComponentChangelogEntries(panel, data.entries || [], pageId);
    }).catch(function () {
      panel.innerHTML = '<p class="sg-changelog-empty">No changes recorded yet. This component was introduced in the initial release.</p>';
    });
}

function _renderComponentChangelogEntries(panel, allEntries, pageId) {
    if (!allEntries.length) {
      panel.innerHTML = '<p class="sg-changelog-empty">No changes recorded yet.</p>';
      return;
    }

    // Group entries by version (newest version first for display)
    var byVersion = {};
    allEntries.forEach(function (e) {
      if (!byVersion[e.version]) byVersion[e.version] = [];
      byVersion[e.version].push({ type: e.type, text: e.text });
    });

    // Sort versions descending (newest first)
    var versions = Object.keys(byVersion).sort(function (a, b) {
      var pa = a.split(/[.\-]/).map(function (x) { return /^\d+$/.test(x) ? parseInt(x, 10) : 0; });
      var pb = b.split(/[.\-]/).map(function (x) { return /^\d+$/.test(x) ? parseInt(x, 10) : 0; });
      for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
      }
      return 0;
    });

    var entries = versions.map(function (v) {
      return { version: v, date: '', changes: byVersion[v] };
    });

    panel.innerHTML = '';
    entries.forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num" style="font-size:22px;">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + (release.date || '') + '</span>';
      section.appendChild(header);

      var typeOrder = ['added', 'changed', 'fixed', 'deprecated', 'removed'];
      typeOrder.forEach(function (type) {
        var ofType = release.changes.filter(function (c) { return c.type === type; });
        if (ofType.length) renderChangeItems(section, ofType, type);
      });

      panel.appendChild(section);
    });
}

// Legacy implementation preserved during migration; not called.

function renderStatusBadges() {
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      renderComponentProgress(id);
      updateSidebarMetadataTooltip(id);
    });
}

// Placeholder Storybook base URL — update when Storybook is live
var STORYBOOK_BASE_URL = 'https://storybook.example.com';
// Placeholder GitHub repo for issue reports
var GITHUB_REPO = 'sbajwa32/uds-docs';

// Render the page-link bar for a single component. Idempotent — if a bar
// already exists, it's replaced with a fresh one. Safe to call multiple times
// (e.g. once at boot with empty contentCache, then again per-component as
// each spec.json arrives).
function renderComponentLinksFor(id) {
    var page = document.querySelector('[data-page="' + id + '"]');
    if (!page) return;
    var desc = page.querySelector('.sg-page-desc');
    if (!desc) return;

    var bar = document.createElement('div');
    bar.className = 'sg-page-links';

    // View in Figma (variant deep-link when available)
    var data = contentCache[id] || {};
    var variantNode = data.figmaNodeId;
    var pageNode = data.figmaPageNodeId;
      var figmaLink = document.createElement('a');
      figmaLink.className = 'sg-page-link';
      var figmaLabel = variantNode ? 'Figma (variant)' : 'Figma';
      figmaLink.innerHTML = '<span class="material-symbols-outlined">design_services</span>' + figmaLabel;
      if (variantNode || pageNode) {
        figmaLink.href = 'https://www.figma.com/design/1XJoUJgtNpw4R0IIT3VjoK/UDS-Components?node-id=' + (variantNode || pageNode);
        figmaLink.target = '_blank';
        figmaLink.rel = 'noopener noreferrer';
      } else {
        figmaLink.setAttribute('aria-disabled', 'true');
      }
      bar.appendChild(figmaLink);

      // View in Storybook
      var sbLink = document.createElement('a');
      sbLink.className = 'sg-page-link';
      sbLink.innerHTML = '<span class="material-symbols-outlined">auto_awesome</span>Storybook';
      var slug = data.storybookSlug;
      sbLink.href = slug ? STORYBOOK_BASE_URL + '/?path=/story/' + slug : STORYBOOK_BASE_URL;
      sbLink.target = '_blank';
      sbLink.rel = 'noopener noreferrer';
      sbLink.setAttribute('title', 'Placeholder — update STORYBOOK_BASE_URL once Storybook is live');
      bar.appendChild(sbLink);

      // View on GitHub (disabled placeholder)
      var ghLink = document.createElement('a');
      ghLink.className = 'sg-page-link';
      ghLink.setAttribute('aria-disabled', 'true');
      ghLink.innerHTML = '<span class="material-symbols-outlined">code</span>GitHub';
      bar.appendChild(ghLink);

      // Report Issue — opens a GitHub issue template
      var issueLink = document.createElement('a');
      issueLink.className = 'sg-page-link';
      issueLink.innerHTML = '<span class="material-symbols-outlined">bug_report</span>Report Issue';
      var title = encodeURIComponent('[' + (data.title || id) + '] ');
      var body = encodeURIComponent('Component: ' + id + '\nPage: ' + location.href + '\n\nDescribe the issue or feedback:\n\n');
      issueLink.href = 'https://github.com/' + GITHUB_REPO + '/issues/new?title=' + title + '&body=' + body;
      issueLink.target = '_blank';
      issueLink.rel = 'noopener noreferrer';
      bar.appendChild(issueLink);

    var existing = page.querySelector(':scope > .sg-page-links');
    if (existing) {
      existing.replaceWith(bar);
    } else {
      desc.insertAdjacentElement('afterend', bar);
    }
}

function renderComponentLinks() {
    Object.keys(COMPONENT_STATUS).forEach(renderComponentLinksFor);
}

// "Not for production" banner + Last updated timestamp + Recent changes highlight
function renderComponentHeaderExtras() {
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      var info = COMPONENT_STATUS[id];
      var page = document.querySelector('[data-page="' + id + '"]');
      if (!page) return;

      // "Not for production" banner
      if (info.status !== 'production' && !page.querySelector('.sg-not-for-production')) {
        var banner = document.createElement('div');
        banner.className = 'sg-not-for-production';
        var label = STATUS_LABELS[info.status] ? STATUS_LABELS[info.status].label : info.status;
        banner.innerHTML = '<span class="material-symbols-outlined">warning_amber</span>' +
                           '<span><strong>Not production-ready.</strong> Status: ' + label + '. Specs and behavior may change. See the Storybook implementation for shippable code.</span>';
        var anchor = page.querySelector('.sg-page-links') || page.querySelector('.sg-page-desc');
        if (anchor) anchor.insertAdjacentElement('afterend', banner);
      }

      // Last updated timestamp + Recent changes highlight (from global CHANGELOG)
      if (!page.querySelector('.sg-recent-changes')) {
        var compEntries = collectComponentChangelog(id);
        if (compEntries.length > 0) {
          var last = compEntries[0];
          var box = document.createElement('details');
          box.className = 'sg-recent-changes';
          var summary = document.createElement('summary');
          summary.innerHTML = '<span class="sg-recent-label">Last updated:</span> <span class="sg-recent-version">' + last.version + '</span> <span class="sg-recent-date">(' + last.date + ')</span> <span class="sg-recent-toggle">Show recent changes</span>';
          box.appendChild(summary);

          var inner = document.createElement('div');
          inner.className = 'sg-recent-inner';
          compEntries.slice(0, 2).forEach(function (e) {
            var rel = document.createElement('div');
            rel.className = 'sg-recent-release';
            rel.innerHTML = '<div class="sg-recent-release-title">' + e.version + ' — ' + e.date + '</div>';
            var ul = document.createElement('ul');
            e.changes.forEach(function (c) {
              var li = document.createElement('li');
              li.innerHTML = '<span class="sg-recent-type sg-recent-type--' + c.type + '">' + c.type + '</span> ' + c.text;
              ul.appendChild(li);
            });
            rel.appendChild(ul);
            inner.appendChild(rel);
          });
          var link = document.createElement('a');
          link.className = 'sg-recent-full';
          link.href = '#/' + id + '?tab=changelog';
          link.textContent = 'View full changelog →';
          inner.appendChild(link);
          box.appendChild(inner);

          var anchor2 = page.querySelector('.sg-not-for-production') || page.querySelector('.sg-page-links') || page.querySelector('.sg-page-desc');
          if (anchor2) anchor2.insertAdjacentElement('afterend', box);
        }
      }
    });
}

/* ========================================================================
     4c. TOKEN SEARCH (modal: / or Cmd/Ctrl+K)
     Walks document.styleSheets at load, builds a search index of all
     --uds-* custom properties, and offers a fuzzy-match modal.
     ======================================================================== */
var TOKEN_INDEX = [];

function buildTokenIndex() {
    if (TOKEN_INDEX.length) return TOKEN_INDEX;
    var seen = {};

    function walkRules(rules) {
      if (!rules) return;
      Array.prototype.forEach.call(rules, function (rule) {
        // CSSImportRule — recurse into the imported stylesheet
        if (rule.type === 3 || (rule.styleSheet && rule.href)) {
          try { walkRules(rule.styleSheet && rule.styleSheet.cssRules); } catch (e) { /* cross-origin */ }
          return;
        }
        // CSSMediaRule / CSSSupportsRule / CSSLayerBlockRule — recurse
        if (rule.cssRules && !rule.style) {
          walkRules(rule.cssRules);
          return;
        }
        if (!rule.style) return;
        for (var i = 0; i < rule.style.length; i++) {
          var name = rule.style[i];
          if (name.indexOf('--uds-') !== 0) continue;
          if (seen[name]) continue;
          seen[name] = true;
          var value = rule.style.getPropertyValue(name).trim();
          TOKEN_INDEX.push({
            name: name,
            value: value,
            category: tokenCategory(name)
          });
        }
      });
    }

    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      var rules;
      try { rules = sheet.cssRules || sheet.rules; } catch (e) { return; }
      walkRules(rules);
    });

    // Fallback: read computed style on :root for any tokens we missed
    // (catches cases where a sheet's rules aren't introspectable but the
    // var() cascaded to the document).
    var computed = getComputedStyle(document.documentElement);
    for (var i = 0; i < computed.length; i++) {
      var name = computed[i];
      if (name.indexOf('--uds-') !== 0 || seen[name]) continue;
      seen[name] = true;
      TOKEN_INDEX.push({
        name: name,
        value: computed.getPropertyValue(name).trim(),
        category: tokenCategory(name)
      });
    }

    // Resolve values for any tokens whose recorded value is itself a var()
    // chain — helps the swatch render for color tokens.
    TOKEN_INDEX.forEach(function (t) {
      if (t.value && t.value.indexOf('var(') === 0) {
        var resolved = computed.getPropertyValue(t.name).trim();
        if (resolved) t.value = resolved;
      }
    });

    // Sort: semantic before primitive, then alphabetical.
    TOKEN_INDEX.sort(function (a, b) {
      var aPrim = a.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
      var bPrim = b.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
      if (aPrim !== bPrim) return aPrim - bPrim;
      return a.name.localeCompare(b.name);
    });
    return TOKEN_INDEX;
}

function tokenCategory(name) {
    if (name.indexOf('--uds-color-') === 0) return 'color';
    if (name.indexOf('--uds-space-') === 0) return 'space';
    if (name.indexOf('--uds-font-') === 0) return 'font';
    if (name.indexOf('--uds-border-') === 0) return 'border';
    if (name.indexOf('--uds-shadow-') === 0 || name.indexOf('--uds-overlay-') === 0) return 'shadow';
    if (name.indexOf('--uds-primitive-') === 0) return 'primitive';
    return 'other';
}

function isColorValue(v) {
    if (!v) return false;
    return /^#|^rgb|^hsl|^oklch|^color\(/i.test(v.trim());
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function searchTokens(query) {
    var idx = buildTokenIndex();
    if (!query) return idx.slice();
    var q = query.toLowerCase().replace(/^--/, '');
    return idx.filter(function (t) {
      return t.name.toLowerCase().indexOf(q) !== -1 ||
             t.value.toLowerCase().indexOf(q) !== -1;
    });
}

function highlightMatch(name, query) {
    if (!query) return name;
    var q = query.replace(/^--/, '');
    if (!q) return name;
    var re = new RegExp('(' + escapeRegex(q) + ')', 'gi');
    return name.replace(re, '<mark>$1</mark>');
}

function renderTokenSearchResults(query) {
    var resultsEl = document.getElementById('sg-token-search-results');
    if (!resultsEl) return;
    var results = searchTokens(query);
    var total = buildTokenIndex().length;

    if (!results.length) {
      resultsEl.innerHTML = '<div class="sg-token-search__empty">No tokens match "' + escapeHtml(query) + '" — searched ' + total + ' tokens.</div>';
      return;
    }

    // Group by category for visual structure
    var groups = {};
    results.forEach(function (t) {
      var g = t.category;
      if (!groups[g]) groups[g] = [];
      groups[g].push(t);
    });
    var order = ['color', 'font', 'space', 'border', 'shadow', 'primitive', 'other'];
    var countLabel = query
      ? 'Showing <strong>' + results.length + '</strong> of <strong>' + total + '</strong> tokens'
      : '<strong>' + total + '</strong> tokens · semantic first, primitives last · click to copy <code>var(--name)</code>';
    var html = '<div class="sg-token-search__count">' + countLabel + '</div>';
    var rowIndex = 0;
    order.forEach(function (g) {
      if (!groups[g] || !groups[g].length) return;
      html += '<div class="sg-token-search__group-title">' + g + ' <span class="sg-token-search__group-count">' + groups[g].length + '</span></div>';
      groups[g].forEach(function (t) {
        var swatch = isColorValue(t.value)
          ? '<span class="sg-token-search__swatch" style="background:' + t.value + '"></span>'
          : '<span class="sg-token-search__swatch" style="background:transparent;border:none;"></span>';
        html += '<div class="sg-token-search__row" data-token="' + escapeHtml(t.name) + '" data-row-index="' + rowIndex + '"' + (rowIndex === 0 ? ' data-active="true"' : '') + '>' +
                  swatch +
                  '<span class="sg-token-search__name">' + highlightMatch(t.name, query) + '</span>' +
                  '<span class="sg-token-search__value">' + escapeHtml(t.value || '') + '</span>' +
                  '<span class="sg-token-search__category">' + g + '</span>' +
                '</div>';
        rowIndex++;
      });
    });
    resultsEl.innerHTML = html;

    // Click to copy + close
    resultsEl.querySelectorAll('.sg-token-search__row').forEach(function (row) {
      row.addEventListener('click', function () {
        var name = row.getAttribute('data-token');
        if (name && navigator.clipboard) {
          navigator.clipboard.writeText('var(' + name + ')').catch(function () {});
        }
        closeTokenSearch();
      });
    });
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openTokenSearch() {
    var modal = document.getElementById('sg-token-search');
    if (!modal) return;
    modal.setAttribute('data-open', 'true');
    var input = document.getElementById('sg-token-search-input');
    if (input) {
      input.value = '';
      renderTokenSearchResults('');
      requestAnimationFrame(function () { input.focus(); });
    }
}

function closeTokenSearch() {
    var modal = document.getElementById('sg-token-search');
    if (modal) modal.setAttribute('data-open', 'false');
}

function moveTokenSearchActive(delta) {
    var resultsEl = document.getElementById('sg-token-search-results');
    if (!resultsEl) return;
    var rows = resultsEl.querySelectorAll('.sg-token-search__row');
    if (!rows.length) return;
    var current = -1;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute('data-active') === 'true') { current = i; break; }
    }
    var next = Math.max(0, Math.min(rows.length - 1, current + delta));
    rows.forEach(function (r) { r.removeAttribute('data-active'); });
    rows[next].setAttribute('data-active', 'true');
    rows[next].scrollIntoView({ block: 'nearest' });
}

function activateTokenSearchRow() {
    var resultsEl = document.getElementById('sg-token-search-results');
    if (!resultsEl) return;
    var active = resultsEl.querySelector('.sg-token-search__row[data-active="true"]');
    if (active) active.click();
}

function initTokenSearch() {
    if (!document.getElementById('sg-token-search')) return;

    document.addEventListener('keydown', function (e) {
      // Open on / (when not typing in another input) or Cmd/Ctrl+K
      var isCmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
      var isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      var target = e.target;
      var typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      var modal = document.getElementById('sg-token-search');
      var isOpen = modal && modal.getAttribute('data-open') === 'true';

      if (!isOpen && isCmdK) { e.preventDefault(); openTokenSearch(); return; }
      if (!isOpen && isSlash && !typing) { e.preventDefault(); openTokenSearch(); return; }
      if (isOpen) {
        if (e.key === 'Escape') { e.preventDefault(); closeTokenSearch(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); moveTokenSearchActive(1); return; }
        if (e.key === 'ArrowUp')   { e.preventDefault(); moveTokenSearchActive(-1); return; }
        if (e.key === 'Enter')     { e.preventDefault(); activateTokenSearchRow(); return; }
      }
    });

    // Wire input
    var input = document.getElementById('sg-token-search-input');
    if (input) {
      input.addEventListener('input', function () { renderTokenSearchResults(input.value); });
    }

    // Click outside panel closes
    var modal = document.getElementById('sg-token-search');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeTokenSearch();
      });
    }

    // Header search trigger (visible search box in the brand bar)
    var headerTrigger = document.getElementById('sg-header-search-trigger');
    if (headerTrigger) {
      headerTrigger.addEventListener('click', function () { openTokenSearch(); });
    }
}

/* ========================================================================
     4d. DRAFT MODE (?draft=1)
     Hides components/pages with data-draft="true" on production, shows them
     with a DRAFT watermark when ?draft=1 is in the URL.
     ======================================================================== */
function applyDraftMode() {
    var params = new URLSearchParams(window.location.search);
    var draftMode = params.get('draft') === '1';
    document.documentElement.setAttribute('data-draft-mode', draftMode ? 'true' : 'false');

    if (!draftMode) {
      // Hide draft pages and their sidebar links
      document.querySelectorAll('[data-page][data-draft="true"], .sg-sidebar-link[data-draft="true"]').forEach(function (el) {
        el.style.display = 'none';
      });
    }

    // Apply draft attribute to component page wrappers based on content JSON.
    // This runs after preloadAllContent populates contentCache.
    if (typeof COMPONENT_STATUS !== 'undefined') {
      var pending = Object.keys(COMPONENT_STATUS).length;
      var poll = setInterval(function () {
        Object.keys(COMPONENT_STATUS).forEach(function (id) {
          var data = contentCache[id];
          if (!data) return;
          if (data.draft === true) {
            var page = document.querySelector('[data-page="' + id + '"]');
            var link = document.querySelector('.sg-sidebar-link[href="#/' + id + '"]');
            if (page) page.setAttribute('data-draft', 'true');
            if (link) link.setAttribute('data-draft', 'true');
            if (!draftMode) {
              if (page) page.style.display = 'none';
              if (link) link.style.display = 'none';
            }
          }
        });
        // Stop polling once all content has loaded (or after 3 seconds)
        var loaded = Object.keys(COMPONENT_STATUS).filter(function (id) { return contentCache[id]; }).length;
        if (loaded >= pending) clearInterval(poll);
      }, 200);
      setTimeout(function () { clearInterval(poll); }, 3000);
    }
}

/* ========================================================================
     4e. REALISTIC DATA EXAMPLES (5 data-consuming components)
     ======================================================================== */
var REALISTIC_DATA = {
    'data-table': function () {
      var tinyHTML = '<div class="udc-data-table"><table>' +
        '<thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant</th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th></tr></thead>' +
        '<tbody><tr><td class="udc-dt-check"><input type="checkbox" /></td><td>Brian Smith</td><td><span class="udc-badge" data-variant="success">Active</span></td><td>Riverbend</td><td class="udc-dt-align-right">$0.00</td></tr></tbody>' +
        '</table></div>';
      var rows = '';
      var firstNames = ['Brian','Catherine','David','Eva','Frank','Grace','Hannah','Isaac','Julia','Kevin','Linda','Mike','Nadia','Owen','Paula','Quinn','Rachel','Sam','Tina','Umar','Viv','Wes','Xavier','Yara','Zane'];
      var lastNames = ['Smith','Lee','Brown','White','Garcia','Patel','Kim','Nguyen','O\'Connor','Schmidt','Hassan','Rivera','Tan','Park','Davis','Cohen'];
      var props = ['Riverbend Estates','Sunnyvale Towers','Cedar Hills','Oakwood Gardens','Maple Court','Lakeside Plaza','Ironwood Mills'];
      var statuses = [
        { l: 'Active', v: 'success', amt: '$0.00' },
        { l: 'Pending', v: 'warning', amt: '$1,200' },
        { l: 'Overdue', v: 'error', amt: '$3,450' }
      ];
      for (var i = 0; i < 50; i++) {
        var first = firstNames[i % firstNames.length];
        var last = lastNames[(i * 3) % lastNames.length];
        var prop = props[i % props.length];
        var s = statuses[i % statuses.length];
        rows += '<tr><td class="udc-dt-check"><input type="checkbox" /></td><td>' + first + ' ' + last + '</td><td><span class="udc-badge" data-variant="' + s.v + '">' + s.l + '</span></td><td>' + prop + '</td><td class="udc-dt-align-right">' + s.amt + '</td></tr>';
      }
      var largeHTML = '<div class="udc-data-table" style="max-height:300px;overflow-y:auto;"><table>' +
        '<thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant</th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
      var longHTML = '<div class="udc-data-table"><table>' +
        '<thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant</th><th>Property</th></tr></thead>' +
        '<tbody>' +
        '<tr><td class="udc-dt-check"><input type="checkbox" /></td><td>Aleksandra-Constance Wojciechowska-Nakamura</td><td>The Reserve at Ironwood Mills — Building 3, Penthouse Suite</td></tr>' +
        '<tr><td class="udc-dt-check"><input type="checkbox" /></td><td>陈伟 (Chen Wei)</td><td>Sunnyvale Towers — Unit 4B</td></tr>' +
        '<tr><td class="udc-dt-check"><input type="checkbox" /></td><td>عبد الله الخطيب (Abdullah Al-Khatib)</td><td>Riverbend Estates</td></tr>' +
        '</tbody></table></div>';
      var emptyHTML = '<div class="udc-data-table"><table>' +
        '<thead><tr><th>Tenant</th><th>Status</th><th>Property</th></tr></thead></table>' +
        '<div style="padding:48px 24px;text-align:center;color:var(--uds-color-text-tertiary);font-family:var(--uds-font-family);font-size:14px;">' +
        '<span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:8px;">inbox</span>' +
        'No tenants yet. <a href="#/" style="color:var(--uds-color-text-interactive);">Add your first tenant</a>.</div></div>';
      var loadingHTML = '<div class="udc-data-table"><table>' +
        '<thead><tr><th>Tenant</th><th>Status</th><th>Property</th></tr></thead>' +
        '<tbody>' +
          '<tr><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:140px;"></div></td><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:60px;"></div></td><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:160px;"></div></td></tr>' +
          '<tr><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:120px;"></div></td><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:50px;"></div></td><td><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:140px;"></div></td></tr>' +
        '</tbody></table></div>';
      return [
        { title: 'Tiny dataset (1 row)', desc: 'How the table looks with a single row.', html: tinyHTML },
        { title: 'Large dataset (50 rows, scrollable)', desc: 'Table behavior at scale. Production tables should virtualize at 200+ rows.', html: largeHTML },
        { title: 'Long content', desc: 'Names and properties stress-test truncation, including non-Latin scripts.', html: longHTML },
        { title: 'Empty state', desc: 'When there are no rows, show an empty state with a call to action.', html: emptyHTML },
        { title: 'Loading state', desc: 'Skeleton rows while data is fetching.', html: loadingHTML }
      ];
    },
    'list': function () {
      var tinyHTML = '<div class="udc-list" style="max-width:280px;"><div class="udc-list-item" tabindex="0"><span class="udc-list-item__label">Single item</span></div></div>';
      var largeRows = '';
      var labels = ['Dashboard','Leasing / CRM','People / Contacts','Property / Assets','Accounting','Maintenance','Inspections','Documents','Reports','Settings','Support','Audit Log','Integrations','Webhooks','API Keys','Team Members','Billing','Notifications','Saved Searches','Custom Fields','Workflows','Templates','Imports','Exports','Tasks'];
      labels.forEach(function (label, i) {
        largeRows += '<div class="udc-list-item" tabindex="0"' + (i === 0 ? ' aria-selected="true"' : '') + '><span class="udc-list-item__label">' + label + '</span></div>';
      });
      var largeHTML = '<div class="udc-list" style="max-width:280px;max-height:300px;overflow-y:auto;">' + largeRows + '</div>';
      var longHTML = '<div class="udc-list" style="max-width:280px;">' +
        '<div class="udc-list-item" tabindex="0"><span class="udc-list-item__label">A very long settings option name that overflows and needs ellipsis</span></div>' +
        '<div class="udc-list-item" tabindex="0"><span class="udc-list-item__label">非常に長いリスト項目テキスト</span></div>' +
        '</div>';
      var emptyHTML = '<div class="udc-list" style="max-width:280px;padding:32px 16px;text-align:center;color:var(--uds-color-text-tertiary);font-family:var(--uds-font-family);font-size:14px;">No items found.</div>';
      var loadingHTML = '<div class="udc-list" style="max-width:280px;">' +
        '<div class="udc-list-item"><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:160px;"></div></div>' +
        '<div class="udc-list-item"><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:120px;"></div></div>' +
        '<div class="udc-list-item"><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:140px;"></div></div>' +
        '</div>';
      return [
        { title: 'Tiny dataset (1 item)', desc: 'A list with a single item still renders cleanly.', html: tinyHTML },
        { title: 'Large dataset (25 items, scrollable)', desc: 'Lists over a viewport-worth of items should scroll within their container.', html: largeHTML },
        { title: 'Long content', desc: 'Long labels truncate; non-Latin scripts render correctly.', html: longHTML },
        { title: 'Empty state', desc: 'Show a helpful message rather than a blank container.', html: emptyHTML },
        { title: 'Loading state', desc: 'Skeleton rows while items are loading.', html: loadingHTML }
      ];
    },
    'dropdown': function () {
      var tinyHTML = '<div class="udc-dropdown" style="max-width:300px;"><label class="udc-dropdown__label">Status</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox"><span class="udc-dropdown__value">Active</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div></div>';
      var optionRows = '';
      var countries = ['Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bangladesh','Belarus','Belgium','Bolivia','Brazil','Bulgaria','Cambodia','Canada','Chile','China','Colombia','Croatia','Czech Republic','Denmark','Egypt','Finland','France','Germany','Ghana','Greece','Hungary','Iceland','India','Indonesia','Ireland','Israel','Italy','Japan','Jordan','Kenya','Korea','Lebanon','Mexico','Morocco','Netherlands','Norway','Pakistan','Peru','Poland','Portugal','Romania','Russia','Saudi Arabia','Singapore','Spain','Sweden','Switzerland','Thailand','Turkey','Ukraine','United Kingdom','United States','Vietnam'];
      countries.forEach(function (c) { optionRows += '<div class="udc-dropdown__item" role="option">' + c + '</div>'; });
      var largeHTML = '<div class="udc-dropdown" data-open="true" style="max-width:300px;"><label class="udc-dropdown__label">Country</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="true" aria-haspopup="listbox"><span class="udc-dropdown__value">United States</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox" style="max-height:240px;overflow-y:auto;">' + optionRows + '</div></div>';
      var longHTML = '<div class="udc-dropdown" style="max-width:300px;"><label class="udc-dropdown__label">Lease type</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox"><span class="udc-dropdown__value">Short-term residential lease with optional renewal clause</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div></div>';
      var emptyHTML = '<div class="udc-dropdown" data-open="true" style="max-width:300px;"><label class="udc-dropdown__label">Tags</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="true" aria-haspopup="listbox"><span class="udc-dropdown__value" data-placeholder>Select tags...</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox"><div style="padding:16px;text-align:center;color:var(--uds-color-text-tertiary);font-family:var(--uds-font-family);font-size:14px;">No tags available</div></div></div>';
      return [
        { title: 'Tiny option set', desc: 'A dropdown bound to a small fixed list.', html: tinyHTML },
        { title: 'Large option set (60+ countries, scrollable)', desc: 'Long option lists need internal scroll. Consider a typeahead/combobox at 100+ options.', html: largeHTML },
        { title: 'Long selected value', desc: 'Trigger truncates long selected values rather than wrapping.', html: longHTML },
        { title: 'Empty state', desc: 'When there are no options, show a helpful empty state inside the popover.', html: emptyHTML }
      ];
    },
    'search': function () {
      var emptyResultsHTML = '<div style="max-width:480px;"><div class="udc-search"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" value="zzzzzzz" placeholder="Search..." /><button class="udc-search__clear" aria-label="Clear"><span class="material-symbols-outlined">clear</span></button></div></div><div style="margin-top:16px;padding:32px;text-align:center;color:var(--uds-color-text-tertiary);font-family:var(--uds-font-family);font-size:14px;border:1px dashed var(--uds-color-border-secondary);border-radius:8px;"><span class="material-symbols-outlined" style="font-size:32px;display:block;margin-bottom:8px;">search_off</span>No results for "zzzzzzz". Try a different keyword.</div></div>';
      var withResultsHTML = '<div style="max-width:480px;"><div class="udc-search" data-has-value="true"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" value="riverbend" placeholder="Search..." /><button class="udc-search__clear" aria-label="Clear"><span class="material-symbols-outlined">clear</span></button></div></div><ul style="margin-top:8px;padding:0;list-style:none;border:1px solid var(--uds-color-border-secondary);border-radius:8px;overflow:hidden;font-family:var(--uds-font-family);font-size:14px;"><li style="padding:10px 14px;border-bottom:1px solid var(--uds-color-border-secondary);"><strong>Riverbend</strong> Estates — 24 units</li><li style="padding:10px 14px;border-bottom:1px solid var(--uds-color-border-secondary);"><strong>Riverbend</strong> Penthouse 4B</li><li style="padding:10px 14px;">Maintenance request at <strong>Riverbend</strong></li></ul></div>';
      var loadingHTML = '<div style="max-width:480px;"><div class="udc-search" data-has-value="true"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" value="loading..." placeholder="Search..." /><button class="udc-search__clear" aria-label="Clear"><span class="material-symbols-outlined">clear</span></button></div></div><div style="margin-top:8px;border:1px solid var(--uds-color-border-secondary);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:8px;"><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:80%;"></div><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:60%;"></div><div style="height:14px;background:var(--uds-color-surface-alt);border-radius:4px;width:70%;"></div></div></div>';
      return [
        { title: 'With results', desc: 'Typical search-with-suggestions pattern.', html: withResultsHTML },
        { title: 'Empty state (no matches)', desc: 'When the query returns nothing, show a helpful empty state.', html: emptyResultsHTML },
        { title: 'Loading state', desc: 'Skeleton suggestions while results stream in.', html: loadingHTML }
      ];
    },
    'breadcrumb': function () {
      var deepHTML = '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li><li><a href="#">Properties</a></li><li><a href="#">Riverbend Estates</a></li><li><a href="#">Building 3</a></li><li><a href="#">Floor 4</a></li><li aria-current="page">Penthouse 4B</li></ol></nav>';
      var longHTML = '<nav class="udc-breadcrumb" aria-label="Breadcrumb" style="max-width:480px;"><ol><li><a href="#">Home</a></li><li><a href="#">Some really long property collection name that needs truncation</a></li><li aria-current="page">Building with another lengthy name</li></ol></nav>';
      var rootHTML = '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol><li aria-current="page">Home</li></ol></nav>';
      return [
        { title: 'Deep hierarchy (6 levels)', desc: 'Breadcrumbs scale with depth. Wrap to multiple lines on narrow viewports.', html: deepHTML },
        { title: 'Long segment names', desc: 'Long names should truncate, not wrap awkwardly. Configure max-width on segments.', html: longHTML },
        { title: 'Root only', desc: 'When there is only one level, render just the current page (no separator).', html: rootHTML }
      ];
    }
};

function renderRealisticData() {
    Object.keys(REALISTIC_DATA).forEach(function (id) {
      var page = document.querySelector('[data-page="' + id + '"]');
      if (!page) return;
      var examplesPanel = page.querySelector('[data-tab-panel="examples"]');
      if (!examplesPanel) return;
      if (examplesPanel.querySelector('.sg-realistic-data')) return;

      var wrap = document.createElement('div');
      wrap.className = 'sg-realistic-data';
      var heading = document.createElement('h2');
      heading.className = 'sg-realistic-heading';
      heading.textContent = 'Realistic data examples';
      wrap.appendChild(heading);

      var lead = document.createElement('p');
      lead.className = 'sg-realistic-lead';
      lead.textContent = 'How this component looks with realistic content sizes, edge cases, and states.';
      wrap.appendChild(lead);

      var examples;
      try { examples = REALISTIC_DATA[id](); } catch (e) { examples = []; }
      examples.forEach(function (ex) {
        var sub = document.createElement('div');
        sub.className = 'sg-subsection';
        var t = document.createElement('h3');
        t.className = 'sg-subsection-title';
        t.textContent = ex.title;
        sub.appendChild(t);
        if (ex.desc) {
          var d = document.createElement('p');
          d.className = 'sg-subsection-desc';
          d.textContent = ex.desc;
          sub.appendChild(d);
        }
        var card = document.createElement('div');
        card.className = 'sg-example';
        var preview = document.createElement('div');
        preview.className = 'sg-example-preview';
        preview.style.display = 'block';
        preview.innerHTML = ex.html;
        card.appendChild(preview);
        sub.appendChild(card);
        wrap.appendChild(sub);
      });

      examplesPanel.appendChild(wrap);
    });
}

// Render the Roadmap > Components table from COMPONENT_STATUS.
function renderRoadmapComponents() {
    var slot = document.getElementById('sg-roadmap-components');
    if (!slot || typeof COMPONENT_STATUS === 'undefined') return;

    // Map stoplight status -> roadmap status tag
    var statusToTag = {
      'placeholder': 'proposed',
      'blocked':     'proposed',
      'in-progress': 'in-progress',
      'review':      'in-progress',
      'production':  'done',
      'deprecated':  'done'
    };

    var ids = Object.keys(COMPONENT_STATUS).sort();
    var html = '<table class="sg-roadmap-comp-table"><thead><tr>' +
               '<th>Component</th><th>Status</th><th>Since</th><th>Spec</th>' +
               '</tr></thead><tbody>';
    ids.forEach(function (id) {
      var info = COMPONENT_STATUS[id];
      var meta = STATUS_LABELS[info.status] || { label: info.status };
      var tagStatus = statusToTag[info.status] || 'proposed';
      var score = completenessScores[id];
      var scoreLabel = score ? score.filled + '/' + score.total : '—';
      html += '<tr>' +
              '<td><a href="#/' + id + '">' + (id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')) + '</a></td>' +
              '<td><span class="sg-roadmap-tag" data-status="' + tagStatus + '">' + meta.label + '</span></td>' +
              '<td>' + (info.since || '—') + '</td>' +
              '<td>' + scoreLabel + '</td>' +
              '</tr>';
    });
    html += '</tbody></table>';
    slot.innerHTML = html;
}

// Add an "Example only" banner to the top of every code-bearing tab panel.
function renderExampleOnlyBanners() {
    var bannerHTML = '<span class="material-symbols-outlined">code_blocks</span><span><strong>Example only.</strong> All code on this page is reference. Production components live in Storybook.</span>';
    var selectors = ['examples', 'code', 'playground'];
    selectors.forEach(function (which) {
      document.querySelectorAll('[data-tab-panel="' + which + '"]').forEach(function (panel) {
        if (panel.querySelector(':scope > .sg-example-only-banner')) return;
        var banner = document.createElement('div');
        banner.className = 'sg-example-only-banner';
        banner.innerHTML = bannerHTML;
        panel.insertBefore(banner, panel.firstChild);
      });
    });
}

// Phase 8: read per-component changelog from the warm cache populated by
// preloadComponentChangelog. Returns [{version, date, changes:[{type, text}]}]
// in newest-first order. Returns [] if the cache hasn't loaded yet — caller
// should be tolerant (the header panel just doesn't render until a re-render
// fires after the cache warms).
function collectComponentChangelog(componentId) {
    var data = _componentChangelogCache[componentId];
    if (!data || !data.entries || !data.entries.length) return [];

    // Group entries by version
    var byVersion = {};
    data.entries.forEach(function (e) {
      if (!byVersion[e.version]) byVersion[e.version] = [];
      byVersion[e.version].push({ type: e.type, text: e.text });
    });
    // Sort versions newest-first
    var versions = Object.keys(byVersion).sort(function (a, b) {
      var pa = a.split(/[.\-]/).map(function (x) { return /^\d+$/.test(x) ? parseInt(x, 10) : 0; });
      var pb = b.split(/[.\-]/).map(function (x) { return /^\d+$/.test(x) ? parseInt(x, 10) : 0; });
      for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
      }
      return 0;
    });
    return versions.map(function (v) {
      // Date intentionally empty — not stored per-entry. The "Last updated"
      // panel falls back to just version when date is missing.
      return { version: v, date: '', changes: byVersion[v] };
    });
}

// Phase 14: when viewing a historical archive (?uds=X.Y), show a banner
// at the top of the page and hide tabs/features that the archive doesn't
// carry.
function renderArchiveBanner() {
    var banner = document.getElementById('sg-archive-banner');
    if (!banner) return;
    if (!isViewingHistorical()) {
      banner.hidden = true;
      banner.innerHTML = '';
      return;
    }
    var v = viewingVersion();
    var current = currentVersion() || '';
    banner.hidden = false;
    banner.innerHTML =
      '<div class="sg-archive-banner__inner">' +
      '<span class="material-symbols-outlined sg-archive-banner__icon">history</span>' +
      '<div class="sg-archive-banner__text">' +
      '<strong>Viewing UDS ' + v + ' archive.</strong> ' +
      'Specs, status, CSS, and changelog are read from <code>versions/' + v + '/uds/</code>. ' +
      'Interactive features (Playground, Demo Builder, Implementation Reference) are disabled in archive view.' +
      '</div>' +
      '<a class="sg-archive-banner__exit" href="' + window.location.pathname + '#/changelog">' +
      'Return to UDS ' + current + ' (latest) →</a>' +
      '</div>';
    document.documentElement.setAttribute('data-archive-view', v);
}

// Hide tabs that historical archives don't carry. Called on each navigation.
function applyArchiveTabHiding() {
    if (!isViewingHistorical()) return;
    document.querySelectorAll('[data-tab="playground"], [data-tab-panel="playground"]').forEach(function (el) {
      el.style.display = 'none';
    });
}

function initVersionDropdown() {
    var dropdown = document.getElementById('sg-version-dropdown');
    if (!dropdown) return;

    // Phase 14: viewing a historical version is now controlled by the
    // ?uds=X.Y URL parameter, NOT a separate frozen folder. The current
    // docs site renders any archived version by reading data through
    // udsResolve(), which respects the param.
    var viewing = viewingVersion(); // null when on live current version

    if (isViewingHistorical()) {
      // Hide interactive features that the archive may not carry —
      // playground/demo-builder/preflight aren't ported to historical
      // snapshots since they're docs-site features, not UDS data.
      document.querySelectorAll('.sg-preflight-btn, .sg-demo-btn').forEach(function (btn) {
        var wrap = btn.closest('.udc-tooltip-wrapper');
        if (wrap) wrap.style.display = 'none';
      });
    }

    fetch('./versions.json').then(function (r) {
      if (!r.ok) throw new Error('no versions.json');
      return r.json();
    }).then(function (data) {
      var latestVersion = data.latest || currentVersion();
      var allVersions = data.versions || data;
      dropdown.innerHTML = '';

      allVersions.forEach(function (v) {
        var opt = document.createElement('option');
        var isLatest = v === latestVersion;
        opt.value = v;
        opt.textContent = 'UDS ' + v + (isLatest ? ' (latest)' : '');
        opt.selected = (viewing && v === viewing) || (!viewing && isLatest);
        dropdown.appendChild(opt);
      });

      dropdown.addEventListener('change', function () {
        if (!dropdown.value) return;
        var selected = dropdown.value;
        var params = new URLSearchParams(window.location.search);
        if (selected === latestVersion) {
          params.delete('uds');
        } else {
          params.set('uds', selected);
        }
        var qs = params.toString();
        var newUrl = window.location.pathname + (qs ? '?' + qs : '') + '#/changelog';
        window.location.href = newUrl;
      });
    }).catch(function () {
      var opt = document.createElement('option');
      opt.textContent = 'UDS ' + (currentVersion() || '');
      dropdown.appendChild(opt);
    });
}

function initAllChangelogs() {
    renderGlobalChangelog();
    renderSiteChangelog();
    var compPages = Object.keys(COMPONENT_STATUS);
    compPages.forEach(function (id) {
      renderComponentChangelog(id);
    });
}

// Run the changelog renderers AFTER the changelog page fragment loads,
// since their target slots (#sg-global-changelog, #sg-site-changelog) are
// inside the fragment HTML.
registerPageLoadHook('changelog', function () {
    renderGlobalChangelog();
    renderSiteChangelog();
});

registerPageLoadHook('roadmap', function () {
    componentsReady.then(renderRoadmapComponents);
});

// AI Assist page initialization (download buttons etc.) — runs once after
// the fragment loads.
registerPageLoadHook('ai-assist', function () {
    initAiAssistPage();
});

// Text Styles + Primitive Colors token reference pages were rendered by an
// inline <script> in index.html. After Phase 5, the slots are inside
// fragment files, so the renderers run on page load instead.
registerPageLoadHook('text-styles', function () {
    var c = document.getElementById('text-styles-content');
    if (!c) return;

    function makeRow(cls, label, spec) {
      return '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;"><span class="' + cls + '">' + label + '</span><span style="font-size:var(--uds-font-size-xs);color:var(--uds-color-text-secondary);white-space:nowrap;">.' + cls + ' &middot; ' + spec + '</span></div>';
    }

    var sections = [
      { title: 'Headings', desc: 'Always Bold weight.', items: [
        ['uds-text-heading-h1', 'Heading H1', '32/44 Bold'], ['uds-text-heading-h2', 'Heading H2', '24/32 Bold'],
        ['uds-text-heading-h3', 'Heading H3', '18/26 Bold'], ['uds-text-heading-h4', 'Heading H4', '16/24 Bold']
      ]},
      { title: 'Paragraphs', desc: '6 sizes x 3 weights = 18 styles.', items: [
        ['uds-text-paragraph-xl', 'Paragraph XL', '20/28 Regular'], ['uds-text-paragraph-xl-medium', 'Paragraph XL Medium', '20/28 Medium'], ['uds-text-paragraph-xl-bold', 'Paragraph XL Bold', '20/28 Bold'],
        ['uds-text-paragraph-lg', 'Paragraph LG', '18/26 Regular'], ['uds-text-paragraph-lg-medium', 'Paragraph LG Medium', '18/26 Medium'], ['uds-text-paragraph-lg-bold', 'Paragraph LG Bold', '18/26 Bold'],
        ['uds-text-paragraph-md', 'Paragraph MD', '16/24 Regular'], ['uds-text-paragraph-md-medium', 'Paragraph MD Medium', '16/24 Medium'], ['uds-text-paragraph-md-bold', 'Paragraph MD Bold', '16/24 Bold'],
        ['uds-text-paragraph-base', 'Paragraph Base', '14/20 Regular'], ['uds-text-paragraph-base-medium', 'Paragraph Base Medium', '14/20 Medium'], ['uds-text-paragraph-base-bold', 'Paragraph Base Bold', '14/20 Bold'],
        ['uds-text-paragraph-sm', 'Paragraph SM', '12/16 Regular'], ['uds-text-paragraph-sm-medium', 'Paragraph SM Medium', '12/16 Medium'], ['uds-text-paragraph-sm-bold', 'Paragraph SM Bold', '12/16 Bold'],
        ['uds-text-paragraph-xs', 'Paragraph XS', '10/12 Regular'], ['uds-text-paragraph-xs-medium', 'Paragraph XS Medium', '10/12 Medium'], ['uds-text-paragraph-xs-bold', 'Paragraph XS Bold', '10/12 Bold']
      ]},
      { title: 'Labels', desc: '2 sizes x 3 weights = 6 styles.', items: [
        ['uds-text-label-base', 'Label Base', '14/20 Regular'], ['uds-text-label-base-medium', 'Label Base Medium', '14/20 Medium'], ['uds-text-label-base-bold', 'Label Base Bold', '14/20 Bold'],
        ['uds-text-label-sm', 'Label SM', '12/16 Regular'], ['uds-text-label-sm-medium', 'Label SM Medium', '12/16 Medium'], ['uds-text-label-sm-bold', 'Label SM Bold', '12/16 Bold']
      ]},
      { title: 'Inputs', desc: 'Form input text styles.', items: [
        ['uds-text-input-base', 'Input Base', '14/20 Regular'], ['uds-text-input-base-medium', 'Input Base Medium', '14/20 Medium'], ['uds-text-input-base-bold', 'Input Base Bold', '14/20 Bold'],
        ['uds-text-input-helper', 'Input Helper', '10/12 Regular']
      ]},
      { title: 'Data', desc: 'Table cell styles.', items: [
        ['uds-text-data-cell', 'Data Cell', '14/20 Regular'], ['uds-text-data-cell-medium', 'Data Cell Medium', '14/20 Medium'], ['uds-text-data-cell-bold', 'Data Cell Bold', '14/20 Bold']
      ]}
    ];

    sections.forEach(function (s) {
      var html = '<div class="sg-subsection"><h3 class="sg-subsection-title">' + s.title + '</h3>';
      if (s.desc) html += '<p class="sg-subsection-desc">' + s.desc + '</p>';
      html += '<div class="sg-example"><div class="sg-example-preview" data-direction="column" style="gap:12px;">';
      s.items.forEach(function (i) { html += makeRow(i[0], i[1], i[2]); });
      html += '</div></div></div>';
      c.innerHTML += html;
    });
});

// Renders the per-family primitive color rows. Was eagerly run from
// app.js section 9 (POPULATE PRIMITIVE COLOR SWATCHES); now deferred until
// the primitive-colors fragment loads since the #prim-<family> slots only
// exist in that fragment.
registerPageLoadHook('primitive-colors', function () {
    var FAMILIES = [
      'slate','neutral','stone','blue','cyan','purple',
      'red','orange','amber','yellow','lime','green','emerald'
    ];
    var STEPS = [10,20,30,40,50,'60-M',70,80,90,100,110];

    document.querySelectorAll('#prim-special .sg-token-row').forEach(function (row) {
      var name = row.querySelector('.sg-token-name');
      if (name) row.appendChild(buildCopyButton(name.textContent));
    });

    FAMILIES.forEach(function (family) {
      var container = document.querySelector('#prim-' + family + ' .sg-token-list');
      if (!container) return;
      // Avoid double-render if hook fires twice
      if (container.children.length > 0) return;
      STEPS.forEach(function (step) {
        var varName = '--uds-primitive-color-' + family + '-' + step;
        var row = document.createElement('div');
        row.className = 'sg-token-row';
        row.innerHTML =
          '<div class="sg-token-swatch" style="background:var(' + varName + ')"></div>' +
          '<span class="sg-token-name">' + varName + '</span>' +
          '<span class="sg-token-value">' + family + '-' + step + '</span>';
        var copyBtn = buildCopyButton(varName);
        row.appendChild(copyBtn);
        container.appendChild(row);
      });
    });
});

/* ========================================================================
     13. INIT — navigate to current hash
     ========================================================================
     Phase 13: COMPONENT_STATUS is built asynchronously from per-component
     status.json files. Render calls that walk components must await
     componentsReady so the map is populated before they iterate.
     ======================================================================== */

// These don't depend on COMPONENT_STATUS — they can run synchronously.
renderRealisticData();
renderExampleOnlyBanners();
initTokenSearch();
initAllChangelogs();

// Phase 14: archive view banner + tab hiding. Wait for versionsReady so we
// know whether ?uds=X.Y is a real on-disk snapshot or a typo.
versionsReady.then(function () {
  initVersionDropdown();
  renderArchiveBanner();
  applyArchiveTabHiding();
});

// These walk Object.keys(COMPONENT_STATUS) — must wait for the map to populate.
componentsReady.then(function () {
  renderStatusBadges();
  renderComponentLinks();
  renderComponentHeaderExtras();
  preloadAllContent();
  applyDraftMode();
  // renderRoadmapComponents() — DEFERRED to roadmap page load hook (Phase 5)
});

function initAiAssistPage() {
    var tokenSlot = document.getElementById('sg-ai-tokens');
    if (tokenSlot) {
      var tokenGroups = {
        'Surface Colors': ['--uds-color-surface-main','--uds-color-surface-page-main','--uds-color-surface-subtle','--uds-color-surface-alt','--uds-color-surface-interactive-default','--uds-color-surface-interactive-hover','--uds-color-surface-info','--uds-color-surface-info-subtle','--uds-color-surface-success','--uds-color-surface-success-subtle','--uds-color-surface-warning','--uds-color-surface-warning-subtle','--uds-color-surface-error','--uds-color-surface-error-subtle'],
        'Text Colors': ['--uds-color-text-primary','--uds-color-text-secondary','--uds-color-text-inverse','--uds-color-text-interactive','--uds-color-text-disabled','--uds-color-text-info','--uds-color-text-success','--uds-color-text-warning','--uds-color-text-error'],
        'Border Colors': ['--uds-color-border-primary','--uds-color-border-secondary','--uds-color-border-interactive','--uds-color-border-error','--uds-color-border-outline-focus-visible'],
        'Icon Colors': ['--uds-color-icon-primary','--uds-color-icon-secondary','--uds-color-icon-inverse','--uds-color-icon-interactive'],
        'Spacing': ['--uds-space-050 (4px)','--uds-space-100 (8px)','--uds-space-150 (12px)','--uds-space-200 (16px)','--uds-space-250 (20px)','--uds-space-300 (24px)','--uds-space-400 (32px)','--uds-space-500 (40px)','--uds-space-600 (48px)','--uds-space-700 (56px)','--uds-space-800 (64px)','--uds-space-1000 (80px)'],
        'Font': ['--uds-font-family','--uds-font-size-xs (10px)','--uds-font-size-sm (12px)','--uds-font-size-base (14px)','--uds-font-size-md (16px)','--uds-font-size-lg (18px)','--uds-font-size-xl (20px)','--uds-font-size-2xl (24px)','--uds-font-size-3xl (28px)','--uds-font-size-5xl (36px)','--uds-font-weight-regular (400)','--uds-font-weight-medium (500)','--uds-font-weight-bold (700)'],
        'Border Radius': ['--uds-border-radius-container-sm (4px)','--uds-border-radius-input (8px)','--uds-border-radius-container-md (12px)','--uds-border-radius-container-xl (24px)','--uds-border-radius-container-full (9999px)'],
        'Shadows': ['--uds-shadow-depth-100','--uds-shadow-depth-300','--uds-shadow-depth-500','--uds-shadow-bento','--uds-overlay-backdrop']
      };
      var html = '';
      Object.keys(tokenGroups).forEach(function (group) {
        html += '<h3 class="sg-subsection-title">' + group + '</h3><div class="sg-token-table">';
        tokenGroups[group].forEach(function (t) {
          var name = t.split(' (')[0];
          var desc = t.indexOf('(') !== -1 ? t.split('(')[1].replace(')', '') : '';
          var resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
          var isColor = name.indexOf('color') !== -1;
          html += '<div class="sg-token-row">';
          if (isColor && resolved) html += '<div class="sg-token-swatch" style="background:' + resolved + ';"></div>';
          html += '<span class="sg-token-name">' + name + '</span>';
          html += '<span class="sg-token-value">' + (desc || resolved || '') + '</span>';
          html += '</div>';
        });
        html += '</div>';
      });
      tokenSlot.innerHTML = html;
    }

    var compSlot = document.getElementById('sg-ai-components');
    if (compSlot) {
      var compData = [
        { name: 'Button', cls: 'udc-button-primary / secondary / ghost', html: '<button class="udc-button-primary">Label</button>' },
        { name: 'Text Input', cls: 'udc-text-input', html: '<div class="udc-text-input"><label class="udc-text-input__label">Label</label><div class="udc-text-input__field"><input /></div></div>' },
        { name: 'Checkbox', cls: 'udc-checkbox', html: '<label class="udc-checkbox"><input type="checkbox" /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Label</span></label>' },
        { name: 'Radio', cls: 'udc-radio', html: '<label class="udc-radio"><input type="radio" /><span class="udc-radio__control"></span><span class="udc-radio__label">Label</span></label>' },
        { name: 'Dropdown', cls: 'udc-dropdown', html: '<div class="udc-dropdown"><div class="udc-dropdown__trigger" role="combobox">...</div><div class="udc-dropdown__list" role="listbox">...</div></div>' },
        { name: 'Search', cls: 'udc-search', html: '<div class="udc-search"><div class="udc-search__field"><span class="udc-search__icon">...</span><input type="search" /></div></div>' },
        { name: 'Badge', cls: 'udc-badge', html: '<span class="udc-badge" data-variant="success">Active</span>' },
        { name: 'Chip', cls: 'udc-chip', html: '<button class="udc-chip" data-variant="filter"><span class="udc-chip__label">Filter</span></button>' },
        { name: 'Tabs', cls: 'udc-tabs + udc-tab', html: '<div class="udc-tabs" role="tablist"><button class="udc-tab" role="tab">Tab</button></div>' },
        { name: 'Data Table', cls: 'udc-data-table', html: '<div class="udc-data-table"><table>...</table></div>' },
        { name: 'Tile', cls: 'udc-tile', html: '<div class="udc-tile" tabindex="0"><div class="udc-tile__content"><div class="udc-tile__label">Label</div></div></div>' },
        { name: 'List', cls: 'udc-list + udc-list-item', html: '<div class="udc-list"><div class="udc-list-item" tabindex="0">...</div></div>' },
        { name: 'Notification', cls: 'udc-notification', html: '<div class="udc-notification" data-variant="info"><span class="udc-notification__icon">...</span><span class="udc-notification__text">Msg</span></div>' },
        { name: 'Dialog', cls: 'udc-dialog-backdrop + udc-dialog', html: '<div class="udc-dialog-backdrop" data-open="false"><div class="udc-dialog" role="dialog">...</div></div>' },
        { name: 'Tooltip', cls: 'udc-tooltip-wrapper + udc-tooltip', html: '<span class="udc-tooltip-wrapper"><button>Trigger</button><span class="udc-tooltip" role="tooltip">Text</span></span>' },
        { name: 'Breadcrumb', cls: 'udc-breadcrumb', html: '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol><li>...</li></ol></nav>' },
        { name: 'Nav Header', cls: 'udc-nav-header', html: '<div class="udc-nav-header"><div class="udc-nav-header__left">...</div></div>' },
        { name: 'Nav Vertical', cls: 'udc-nav-vertical + udc-nav-button', html: '<nav class="udc-nav-vertical"><button class="udc-nav-button">...</button></nav>' },
        { name: 'Divider', cls: 'udc-divider-horizontal', html: '<hr class="udc-divider-horizontal" />' },
        { name: 'Spacer', cls: 'udc-spacer', html: '<div class="udc-spacer" data-size="200"></div>' },
        { name: 'Icon Wrapper', cls: 'udc-icon-wrapper', html: '<span class="udc-icon-wrapper" data-size="24"><span class="material-symbols-outlined">info</span></span>' }
      ];
      var tbl = '<table class="sg-api-table"><thead><tr><th>Component</th><th>CSS Class</th><th>Minimal HTML</th></tr></thead><tbody>';
      compData.forEach(function (c) {
        tbl += '<tr><td><strong>' + c.name + '</strong></td><td><code>' + c.cls + '</code></td><td><code style="font-size:11px;word-break:break-all;">' + c.html.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></td></tr>';
      });
      tbl += '</tbody></table>';
      compSlot.innerHTML = tbl;
    }

    var mdcBtn = document.getElementById('sg-download-mdc-btn');
    if (mdcBtn) {
      mdcBtn.addEventListener('click', function () {
        var base = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
        fetch(base + '/uds-design-system.mdc').then(function (r) { return r.text(); }).then(function (text) {
          var blob = new Blob([text], { type: 'text/plain' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = 'uds-design-system.mdc';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });
    }
}

// initAiAssistPage() — DEFERRED to ai-assist page load hook (Phase 5)

const { pageId, tab } = parseHash();
navigate(pageId, tab);

