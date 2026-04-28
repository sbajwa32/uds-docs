/* ==========================================================================
   UDS Design System — SPA Application Logic
   Router, tab system, playground engine, theme switcher
   ========================================================================== */

(function () {
  'use strict';

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

  function navigate(pageId, tab) {
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

    var defaultTab = page ? (page.getAttribute('data-default-tab') || 'examples') : 'examples';
    switchTab(pageId, tab || defaultTab);
    document.querySelector('.sg-main').scrollTo(0, 0);
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
  const COMPLETENESS_FIELDS = [
    'description', 'whenToUse', 'whenNotToUse',
    'acceptanceCriteria', 'dependencies.css',
    'props', 'events', 'slots', 'states',
    'contentGuidelines', 'commonlyPairedWith', 'dosDonts',
    'accessibility.keyboard', 'accessibility.screenReader',
    'accessibility.wcag', 'accessibility.contrast',
    'knownIssues',
    'visualHierarchy', 'densityBehavior',
    'owner', 'figmaNodeId', 'storybookSlug'
  ];

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
    COMPLETENESS_FIELDS.forEach(function (path) {
      if (isFilled(getField(data, path))) filled++;
    });
    var total = COMPLETENESS_FIELDS.length;
    return { filled: filled, total: total, pct: Math.round((filled / total) * 100) };
  }

  function loadContent(componentId) {
    if (contentCache[componentId]) return Promise.resolve(contentCache[componentId]);
    return fetch('./content/' + componentId + '.json').then(function (r) {
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
    p.innerHTML = text;
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
        li.innerHTML = '<span class="sg-gl-check" aria-hidden="true"></span><span>' + item + '</span>';
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
      li.innerHTML = '<code>' + it.path + '</code> <span class="sg-gl-kind">' + it.kind + '</span>';
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
      tr.innerHTML = '<td><code>' + p.name + '</code></td><td>' + esc(typeStr) + '</td><td>' + (def ? '<code>' + esc(def) + '</code>' : '') + '</td><td>' + (p.required ? '<strong>yes</strong>' : 'no') + '</td><td>' + esc(p.description || '') + '</td>';
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
      tr.innerHTML = '<td><code>' + e.name + '</code></td><td>' + esc(e.payload || '') + '</td><td>' + esc(e.description || '') + '</td>';
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
      tr.innerHTML = '<td><code>' + s.name + '</code></td><td>' + esc(s.description || '') + '</td>';
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
      tr.innerHTML = '<td><code>' + s.name + '</code></td><td>' + (s.hasVisual ? 'yes' : 'no') + '</td><td>' + esc(s.description || '') + '</td>';
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
    var level = score.pct >= 80 ? 'high' : (score.pct >= 50 ? 'med' : 'low');

    // Update / create pill next to component page title
    var title = document.querySelector('[data-page="' + pageId + '"] .sg-page-title');
    if (title) {
      var pill = title.parentNode.querySelector('.sg-spec-completeness');
      if (!pill) {
        pill = document.createElement('span');
        pill.className = 'sg-spec-completeness';
        title.appendChild(pill);
      }
      pill.textContent = 'Spec ' + score.filled + '/' + score.total;
      pill.setAttribute('data-level', level);
      pill.setAttribute('title', score.pct + '% complete');
    }

    // Update / create sidebar dot
    var link = document.querySelector('.sg-sidebar-link[href="#/' + pageId + '"]');
    if (link) {
      var dot = link.querySelector('.sg-sidebar-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'sg-sidebar-dot';
        link.appendChild(dot);
      }
      dot.setAttribute('data-level', level);
      dot.setAttribute('title', score.pct + '% spec complete');
    }
  }

  // Preload content and completeness for all component JSONs so sidebar dots
  // and header pills can render immediately without waiting for tab open.
  // Only attempts to load for known component IDs (skips Foundations, Reference,
  // and Patterns pages which have no content JSON).
  function preloadAllContent() {
    if (typeof COMPONENT_STATUS === 'undefined') return;
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      loadContent(id).then(function (data) {
        if (data) updateCompletenessIndicator(id);
      });
    });
  }

  /* ========================================================================
     5. PLAYGROUND ENGINE
     ======================================================================== */
  const playgroundInited = {};

  function refreshPlaygrounds() {
    Object.keys(playgroundInited).forEach(id => {
      const cfg = PLAYGROUNDS[id];
      if (cfg && cfg._update) cfg._update();
    });
    refreshImplSections();
  }

  function initPlayground(pageId) {
    if (playgroundInited[pageId]) return;
    const cfg = PLAYGROUNDS[pageId];
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

    var implSection = buildImplSection(pageId);
    if (implSection) right.appendChild(implSection);

    playgroundInited[pageId] = true;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ========================================================================
     6. PLAYGROUND CONFIGS
     ======================================================================== */
  /* -------------------------------------------------------------------------
     Shared indenter — wraps code lines inside a Vue <template>
     ------------------------------------------------------------------------- */
  // vueWrap removed — all Vue code must be proper SFCs

  const PLAYGROUNDS = {
    button: {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'primary', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'destructive', label: 'Destructive', type: 'checkbox', default: false },
        { key: 'showLeadingIcon', label: 'Show Leading Icon', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'add' },
        { key: 'showTrailingIcon', label: 'Show Trailing Icon', type: 'checkbox', default: false },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'arrow_forward' },
        { key: 'iconOnly', label: 'Icon Only', type: 'checkbox', default: false },
        { key: 'iconOnlyName', label: 'Icon', type: 'icon-search', default: 'add' },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
        { key: 'label', label: 'Label', type: 'text', default: 'Button label' }
      ],
      render(s) {
        const cls = 'udc-button-' + s.variant;
        const btnAttrs = [];
        if (s.size === 'sm') btnAttrs.push('data-size="sm"');
        if (s.disabled) btnAttrs.push('disabled');
        if (s.selected) btnAttrs.push('aria-selected="true"');

        if (s.iconOnly) {
          btnAttrs.push('data-icon-only');
          btnAttrs.push('aria-label="' + esc(s.label) + '"');
          const iconName = esc(s.iconOnlyName || 'add');
          const inner = '<span class="material-symbols-outlined">' + iconName + '</span>';
          const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';
          const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
          const wrapClose = s.destructive ? '\n</div>' : '';
          const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
          const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
          const code = wrapOpen + tag + wrapClose;

          var rAttrs = [];
          rAttrs.push('className="' + cls + '"');
          if (s.size === 'sm') rAttrs.push('data-size="sm"');
          if (s.disabled) rAttrs.push('disabled');
          if (s.selected) rAttrs.push('aria-selected="true"');
          rAttrs.push('data-icon-only');
          rAttrs.push('aria-label="' + esc(s.label) + '"');
          var rBtn = '<button ' + rAttrs.join(' ') + '>\n  <span className="material-symbols-outlined">' + iconName + '</span>\n</button>';
          if (s.destructive) rBtn = '<div data-btn-color="danger">\n  ' + rBtn + '\n</div>';
          var reactCode = 'function IconButton() {\n  return (\n' + rBtn.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

          var vueLines = ['<script setup>', '// CSS-only — button has no interactive state to manage', '</script>', '', '<template>'];
          if (s.destructive) vueLines.push('  <div data-btn-color="danger">');
          vueLines.push((s.destructive ? '    ' : '  ') + '<button class="' + cls + '"' + attrStr + ' aria-label="' + esc(s.label) + '">');
          vueLines.push((s.destructive ? '      ' : '    ') + '<span class="material-symbols-outlined">' + iconName + '</span>');
          vueLines.push((s.destructive ? '    ' : '  ') + '</button>');
          if (s.destructive) vueLines.push('  </div>');
          vueLines.push('</template>');
          var vueCode = vueLines.join('\n');
          return { html, code };
        }

        if (s.showLeadingIcon) btnAttrs.push('data-leading-icon');
        if (s.showTrailingIcon) btnAttrs.push('data-trailing-icon');
        const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';

        let inner = '';
        if (s.showLeadingIcon) inner += '<span class="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span> ';
        inner += esc(s.label);
        if (s.showTrailingIcon) inner += ' <span class="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';

        const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
        const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
        const wrapClose = s.destructive ? '\n</div>' : '';
        const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
        const code = wrapOpen + tag + wrapClose;

        var rAttrs2 = [];
        rAttrs2.push('className="' + cls + '"');
        if (s.size === 'sm') rAttrs2.push('data-size="sm"');
        if (s.disabled) rAttrs2.push('disabled');
        if (s.selected) rAttrs2.push('aria-selected="true"');
        if (s.showLeadingIcon) rAttrs2.push('data-leading-icon');
        if (s.showTrailingIcon) rAttrs2.push('data-trailing-icon');
        var rInner = '';
        if (s.showLeadingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span>';
        rInner += '\n  ' + esc(s.label);
        if (s.showTrailingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';
        var rBtn2 = '<button ' + rAttrs2.join(' ') + '>' + rInner + '\n</button>';
        if (s.destructive) rBtn2 = '<div data-btn-color="danger">\n  ' + rBtn2 + '\n</div>';
        var reactCode2 = 'function MyButton() {\n  return (\n' + rBtn2.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

        var vL = ['<script setup>', '// CSS-only — button has no interactive state to manage', '</script>', '', '<template>'];
        if (s.destructive) vL.push('  <div data-btn-color="danger">');
        var vBtnInner = '';
        if (s.showLeadingIcon) vBtnInner += '<span class="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span> ';
        vBtnInner += esc(s.label);
        if (s.showTrailingIcon) vBtnInner += ' <span class="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';
        var vBtnAttrs = 'class="' + cls + '"';
        if (s.size === 'sm') vBtnAttrs += ' data-size="sm"';
        if (s.disabled) vBtnAttrs += ' disabled';
        if (s.showLeadingIcon) vBtnAttrs += ' data-leading-icon';
        if (s.showTrailingIcon) vBtnAttrs += ' data-trailing-icon';
        vL.push((s.destructive ? '    ' : '  ') + '<button ' + vBtnAttrs + '>' + vBtnInner + '</button>');
        if (s.destructive) vL.push('  </div>');
        vL.push('</template>');
        var vueCode2 = vL.join('\n');
        return { html, code };
      }
    },

    'text-input': {
      controls: [
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
        { key: 'label', label: 'Label text', type: 'text', default: 'Field label' },
        { key: 'required', label: 'Required', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: false },
        { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'search' },
        { key: 'trailingBtn', label: 'Trailing button', type: 'checkbox', default: false },
        { key: 'trailingName', label: 'Trailing icon', type: 'icon-search', default: 'close' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Enter value...' },
        { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
        { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text here' },
        { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
        { key: 'counterText', label: 'Counter text', type: 'text', default: '0/20' }
      ],
      render(s) {
        const stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const leadingIcon = '<span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span>';
        const trailingIcon = '<span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>';
        let h = '<div class="udc-text-input"' + stateAttr + ' style="max-width:340px;">\n';
        if (s.showLabel) {
          h += '  <label class="udc-text-input__label">' + esc(s.label);
          if (s.required) h += '\n    <span class="udc-text-input__required"></span>';
          h += '</label>\n';
        }
        h += '  <div class="udc-text-input__field">\n';
        if (s.leadingIcon) h += '    <span class="udc-text-input__leading-icon">' + leadingIcon + '</span>\n';
        h += '    <input type="text" placeholder="' + esc(s.placeholder) + '"' + disAttr + ' />\n';
        if (s.trailingBtn) h += '    <button class="udc-text-input__trailing-btn" type="button">' + trailingIcon + '</button>\n';
        h += '  </div>\n';
        if (s.showHelper || s.showCounter) {
          h += '  <div class="udc-text-input__helper">';
          if (s.showHelper) h += '<span>' + esc(s.helper) + '</span>';
          if (s.showCounter) h += '<span class="udc-text-input__counter">' + esc(s.counterText) + '</span>';
          h += '</div>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function TextInput() {');
        rLines.push('  const [value, setValue] = useState(\'\');');
        if (s.state === 'error') rLines.push('  const [error, setError] = useState(true);');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-text-input"' + (s.state === 'error' ? ' data-state={error ? "error" : undefined}' : '') + '>');
        if (s.showLabel) {
          var reqJsx = s.required ? '<span className="udc-text-input__required" />' : '';
          rLines.push('      <label className="udc-text-input__label">' + esc(s.label) + reqJsx + '</label>');
        }
        rLines.push('      <div className="udc-text-input__field">');
        if (s.leadingIcon) rLines.push('        <span className="udc-text-input__leading-icon"><span className="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        rLines.push('        <input');
        rLines.push('          type="text"');
        rLines.push('          placeholder="' + esc(s.placeholder) + '"');
        rLines.push('          value={value}');
        rLines.push('          onChange={(e) => setValue(e.target.value)}');
        if (s.disabled) rLines.push('          disabled');
        rLines.push('        />');
        if (s.trailingBtn) {
          rLines.push('        <button');
          rLines.push('          className="udc-text-input__trailing-btn"');
          rLines.push('          type="button"');
          rLines.push('          onClick={() => setValue(\'\')}');
          rLines.push('        >');
          rLines.push('          <span className="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          rLines.push('        </button>');
        }
        rLines.push('      </div>');
        if (s.showHelper || s.showCounter) {
          rLines.push('      <div className="udc-text-input__helper">');
          if (s.showHelper) rLines.push('        <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) rLines.push('        <span className="udc-text-input__counter">{value.length}/20</span>');
          rLines.push('      </div>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');
        var reactCode = rLines.join('\n');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const value = ref('');");
        if (s.state === 'error') vLines.push('const error = ref(true);');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-text-input"' + (s.state === 'error' ? ' :data-state="error ? \'error\' : undefined"' : '') + '>');
        if (s.showLabel) {
          var reqVue = s.required ? '<span class="udc-text-input__required" />' : '';
          vLines.push('    <label class="udc-text-input__label">' + esc(s.label) + reqVue + '</label>');
        }
        vLines.push('    <div class="udc-text-input__field">');
        if (s.leadingIcon) vLines.push('      <span class="udc-text-input__leading-icon"><span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        var vInputAttrs = 'type="text" placeholder="' + esc(s.placeholder) + '" v-model="value"';
        if (s.disabled) vInputAttrs += ' disabled';
        vLines.push('      <input ' + vInputAttrs + ' />');
        if (s.trailingBtn) {
          vLines.push('      <button class="udc-text-input__trailing-btn" type="button" @click="value = \'\'">');
          vLines.push('        <span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          vLines.push('      </button>');
        }
        vLines.push('    </div>');
        if (s.showHelper || s.showCounter) {
          vLines.push('    <div class="udc-text-input__helper">');
          if (s.showHelper) vLines.push('      <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) vLines.push('      <span class="udc-text-input__counter">{{ value.length }}/20</span>');
          vLines.push('    </div>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');
        var vueCode = vLines.join('\n');

        return { html: h, code: h };
      }
    },

    dropdown: {
      controls: [
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
        { key: 'label', label: 'Label text', type: 'text', default: 'Select option' },
        { key: 'required', label: 'Required', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: true },
        { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'add_circle_outline' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Choose...' },
        { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
        { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text' },
        { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
        { key: 'counterText', label: 'Counter text', type: 'text', default: '0/1' },
        { key: 'itemCount', label: 'Options count', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]}
      ],
      render(s) {
        var stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        var disClass = s.disabled ? ' disabled' : '';
        var disAria = s.disabled ? ' aria-disabled="true"' : '';
        var tabIdx = s.disabled ? ' tabindex="-1"' : ' tabindex="0"';
        var iconHtml = '<span class="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span>';
        var n = parseInt(s.itemCount, 10);
        var optionLabels = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];

        var h = '<div class="udc-dropdown"' + stateAttr + ' style="max-width:340px;">\n';
        if (s.showLabel) {
          h += '  <label class="udc-dropdown__label">' + esc(s.label);
          if (s.required) h += '\n    <span class="udc-dropdown__required"></span>';
          h += '</label>\n';
        }
        h += '  <div class="udc-dropdown__trigger' + disClass + '"' + tabIdx + ' role="combobox" aria-expanded="false" aria-haspopup="listbox"' + disAria + '>\n';
        if (s.leadingIcon) h += '    <span class="udc-dropdown__leading-icon">' + iconHtml + '</span>\n';
        h += '    <span class="udc-dropdown__value" data-placeholder>' + esc(s.placeholder) + '</span>\n';
        h += '    <span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span>\n';
        h += '  </div>\n';
        if (s.showHelper || s.showCounter) {
          h += '  <div class="udc-dropdown__helper">';
          if (s.showHelper) h += '<span>' + esc(s.helper) + '</span>';
          if (s.showCounter) h += '<span class="udc-dropdown__counter">' + esc(s.counterText) + '</span>';
          h += '</div>\n';
        }
        h += '  <div class="udc-dropdown__list" role="listbox">\n';
        for (var i = 0; i < n; i++) {
          h += '    <div class="udc-dropdown__item" role="option">' + optionLabels[i] + '</div>\n';
        }
        h += '  </div>\n';
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState, useRef, useEffect } from 'react';");
        rLines.push('');
        rLines.push('function Dropdown() {');
        rLines.push('  const [open, setOpen] = useState(false);');
        rLines.push("  const [selected, setSelected] = useState('');");
        if (s.state === 'error') rLines.push('  const [error, setError] = useState(true);');
        rLines.push('  const ref = useRef(null);');
        rLines.push('');
        rLines.push('  useEffect(() => {');
        rLines.push('    const handler = (e) => {');
        rLines.push('      if (ref.current && !ref.current.contains(e.target)) setOpen(false);');
        rLines.push('    };');
        rLines.push("    document.addEventListener('click', handler);");
        rLines.push("    return () => document.removeEventListener('click', handler);");
        rLines.push('  }, []);');
        rLines.push('');
        var optArr = [];
        for (var i2 = 0; i2 < n; i2++) optArr.push("'" + optionLabels[i2] + "'");
        rLines.push('  const options = [' + optArr.join(', ') + '];');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-dropdown" ref={ref}' + (s.state === 'error' ? ' data-state={error ? "error" : undefined}' : '') + ' data-open={open}>');
        if (s.showLabel) {
          var reqJsx = s.required ? '<span className="udc-dropdown__required" />' : '';
          rLines.push('      <label className="udc-dropdown__label">' + esc(s.label) + reqJsx + '</label>');
        }
        rLines.push('      <div');
        rLines.push('        className="udc-dropdown__trigger"');
        rLines.push('        tabIndex={0}');
        rLines.push('        role="combobox"');
        rLines.push('        aria-expanded={open}');
        rLines.push('        aria-haspopup="listbox"');
        if (s.disabled) rLines.push('        aria-disabled="true"');
        rLines.push('        onClick={() => setOpen(!open)}');
        rLines.push('      >');
        if (s.leadingIcon) rLines.push('        <span className="udc-dropdown__leading-icon"><span className="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span></span>');
        rLines.push('        <span className="udc-dropdown__value" data-placeholder={!selected || undefined}>');
        rLines.push("          {selected || '" + esc(s.placeholder) + "'}");
        rLines.push('        </span>');
        rLines.push('        <span className="udc-dropdown__chevron"><span className="material-symbols-outlined">keyboard_arrow_down</span></span>');
        rLines.push('      </div>');
        if (s.showHelper || s.showCounter) {
          rLines.push('      <div className="udc-dropdown__helper">');
          if (s.showHelper) rLines.push('        <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) rLines.push('        <span className="udc-dropdown__counter">' + esc(s.counterText) + '</span>');
          rLines.push('      </div>');
        }
        rLines.push('      {open && (');
        rLines.push('        <div className="udc-dropdown__list" role="listbox">');
        rLines.push('          {options.map((opt) => (');
        rLines.push('            <div');
        rLines.push('              key={opt}');
        rLines.push('              className="udc-dropdown__item"');
        rLines.push('              role="option"');
        rLines.push('              aria-selected={selected === opt}');
        rLines.push('              onClick={() => { setSelected(opt); setOpen(false); }}');
        rLines.push('            >');
        rLines.push('              {opt}');
        rLines.push('            </div>');
        rLines.push('          ))}');
        rLines.push('        </div>');
        rLines.push('      )}');
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');
        var reactCode = rLines.join('\n');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const open = ref(false);');
        vLines.push("const selected = ref('');");
        if (s.state === 'error') vLines.push('const error = ref(true);');
        vLines.push('const options = [' + optArr.join(', ') + '];');
        vLines.push('');
        vLines.push('function select(opt) {');
        vLines.push('  selected.value = opt;');
        vLines.push('  open.value = false;');
        vLines.push('}');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-dropdown"' + (s.state === 'error' ? ' :data-state="error ? \'error\' : undefined"' : '') + ' :data-open="open">');
        if (s.showLabel) {
          var reqVue = s.required ? '<span class="udc-dropdown__required" />' : '';
          vLines.push('    <label class="udc-dropdown__label">' + esc(s.label) + reqVue + '</label>');
        }
        vLines.push('    <div');
        vLines.push('      class="udc-dropdown__trigger"');
        vLines.push('      tabindex="0"');
        vLines.push('      role="combobox"');
        vLines.push('      :aria-expanded="open"');
        vLines.push('      aria-haspopup="listbox"');
        if (s.disabled) vLines.push('      aria-disabled="true"');
        vLines.push('      @click="open = !open"');
        vLines.push('    >');
        if (s.leadingIcon) vLines.push('      <span class="udc-dropdown__leading-icon"><span class="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span></span>');
        vLines.push('      <span class="udc-dropdown__value" :data-placeholder="!selected || undefined">');
        vLines.push("        {{ selected || '" + esc(s.placeholder) + "' }}");
        vLines.push('      </span>');
        vLines.push('      <span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span>');
        vLines.push('    </div>');
        if (s.showHelper || s.showCounter) {
          vLines.push('    <div class="udc-dropdown__helper">');
          if (s.showHelper) vLines.push('      <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) vLines.push('      <span class="udc-dropdown__counter">' + esc(s.counterText) + '</span>');
          vLines.push('    </div>');
        }
        vLines.push('    <div v-if="open" class="udc-dropdown__list" role="listbox">');
        vLines.push('      <div');
        vLines.push('        v-for="opt in options"');
        vLines.push('        :key="opt"');
        vLines.push('        class="udc-dropdown__item"');
        vLines.push('        role="option"');
        vLines.push('        :aria-selected="selected === opt"');
        vLines.push('        @click="select(opt)"');
        vLines.push('      >');
        vLines.push('        {{ opt }}');
        vLines.push('      </div>');
        vLines.push('    </div>');
        vLines.push('  </div>');
        vLines.push('</template>');
        var vueCode = vLines.join('\n');

        return { html: h, code: h };
      }
    },

    checkbox: {
      controls: [
        { key: 'checked', label: 'Checked', type: 'checkbox', default: false },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false },
        { key: 'label', label: 'Label text', type: 'text', default: 'Option label' }
      ],
      render(s) {
        const errAttr = s.error ? ' data-state="error"' : '';
        const chkAttr = s.checked ? ' checked' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const code = '<label class="udc-checkbox"' + errAttr + '>\n  <input type="checkbox"' + chkAttr + disAttr + ' />\n  <span class="udc-checkbox__control"></span>\n  <span class="udc-checkbox__label">' + esc(s.label) + '</span>\n</label>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function MyCheckbox() {');
        rLines.push('  const [checked, setChecked] = useState(' + (s.checked ? 'true' : 'false') + ');');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <label className="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        rLines.push('      <input');
        rLines.push('        type="checkbox"');
        rLines.push('        checked={checked}');
        rLines.push('        onChange={(e) => setChecked(e.target.checked)}');
        if (s.disabled) rLines.push('        disabled');
        rLines.push('      />');
        rLines.push('      <span className="udc-checkbox__control" />');
        rLines.push('      <span className="udc-checkbox__label">' + esc(s.label) + '</span>');
        rLines.push('    </label>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const checked = ref(' + (s.checked ? 'true' : 'false') + ');');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <label class="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        var vChkAttrs = 'type="checkbox" v-model="checked"';
        if (s.disabled) vChkAttrs += ' disabled';
        vLines.push('    <input ' + vChkAttrs + ' />');
        vLines.push('    <span class="udc-checkbox__control" />');
        vLines.push('    <span class="udc-checkbox__label">' + esc(s.label) + '</span>');
        vLines.push('  </label>');
        vLines.push('</template>');

        return { html: code, code };
      }
    },

    radio: {
      controls: [
        { key: 'count', label: 'Options', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Option A', 'Option B', 'Option C', 'Option D'];
        const errAttr = s.error ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        let h = '<div class="udc-radio-group" role="radiogroup" aria-labelledby="pg-radio-legend">\n';
        h += '  <span class="udc-radio-group__legend" id="pg-radio-legend">Choose one</span>\n';
        for (let i = 0; i < n; i++) {
          const chk = i === 0 ? ' checked' : '';
          h += '  <label class="udc-radio"' + errAttr + '>\n    <input type="radio" name="pg-radio" value="' + i + '"' + chk + disAttr + ' />\n    <span class="udc-radio__control"></span>\n    <span class="udc-radio__label">' + labels[i] + '</span>\n  </label>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function RadioGroup() {');
        rLines.push("  const [selected, setSelected] = useState('0');");
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        rLines.push('      <span className="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var ri = 0; ri < n; ri++) {
          rLines.push('      <label className="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          rLines.push('        <input');
          rLines.push('          type="radio"');
          rLines.push('          name="choice"');
          rLines.push('          value="' + ri + '"');
          rLines.push("          checked={selected === '" + ri + "'}");
          rLines.push("          onChange={() => setSelected('" + ri + "')}");
          if (s.disabled) rLines.push('          disabled');
          rLines.push('        />');
          rLines.push('        <span className="udc-radio__control" />');
          rLines.push('        <span className="udc-radio__label">' + labels[ri] + '</span>');
          rLines.push('      </label>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const selected = ref('0');");
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        vLines.push('    <span class="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var vi = 0; vi < n; vi++) {
          vLines.push('    <label class="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          var vRadioAttrs = 'type="radio" name="choice" value="' + vi + '" v-model="selected"';
          if (s.disabled) vRadioAttrs += ' disabled';
          vLines.push('      <input ' + vRadioAttrs + ' />');
          vLines.push('      <span class="udc-radio__control" />');
          vLines.push('      <span class="udc-radio__label">' + labels[vi] + '</span>');
          vLines.push('    </label>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    },

    badge: {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default (Info)' }, { value: 'secondary', label: 'Secondary' },
          { value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]},
        { key: 'prominent', label: 'Prominent', type: 'checkbox', default: true },
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'label', label: 'Label', type: 'text', default: 'Badge' }
      ],
      render(s) {
        const attrs = [];
        if (s.variant !== 'default') attrs.push('data-variant="' + s.variant + '"');
        if (!s.prominent) attrs.push('data-prominent="false"');
        if (s.size === 'sm') attrs.push('data-size="sm"');
        const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
        const code = '<span class="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>';

        var rCode = 'function StatusBadge() {\n  return <span className="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>;\n}';
        var vCode = '<template>\n  <span class="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>\n</template>\n\n<script setup>\n// CSS-only — no script needed\n</script>';
        return { html: code, code };
      }
    },

    breadcrumb: {
      controls: [
        { key: 'items', label: 'Items', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'frameless', label: 'Frameless', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.items, 10);
        const names = ['Home', 'Products', 'Category', 'Sub-category', 'Current Page'];
        const fl = s.frameless ? ' data-frameless' : '';
        let h = '<nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">\n  <ol>\n';
        for (let i = 0; i < n; i++) {
          if (i < n - 1) h += '    <li><a href="#">' + names[i] + '</a></li>\n';
          else h += '    <li aria-current="page">' + names[i] + '</li>\n';
        }
        h += '  </ol>\n</nav>';

        var rLines = [];
        rLines.push('function Breadcrumb() {');
        rLines.push('  const items = [');
        for (var bi = 0; bi < n; bi++) {
          if (bi < n - 1) rLines.push("    { label: '" + names[bi] + "', href: '#' },");
          else rLines.push("    { label: '" + names[bi] + "' },");
        }
        rLines.push('  ];');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <nav className="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        rLines.push('      <ol>');
        rLines.push('        {items.map((item, i) => (');
        rLines.push('          <li key={i} aria-current={i === items.length - 1 ? "page" : undefined}>');
        rLines.push('            {item.href ? <a href={item.href}>{item.label}</a> : item.label}');
        rLines.push('          </li>');
        rLines.push('        ))}');
        rLines.push('      </ol>');
        rLines.push('    </nav>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push('const items = [');
        for (var bv = 0; bv < n; bv++) {
          if (bv < n - 1) vLines.push("  { label: '" + names[bv] + "', href: '#' },");
          else vLines.push("  { label: '" + names[bv] + "' },");
        }
        vLines.push('];');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        vLines.push('    <ol>');
        vLines.push('      <li');
        vLines.push('        v-for="(item, i) in items"');
        vLines.push('        :key="i"');
        vLines.push('        :aria-current="i === items.length - 1 ? \'page\' : undefined"');
        vLines.push('      >');
        vLines.push('        <a v-if="item.href" :href="item.href">{{ item.label }}</a>');
        vLines.push('        <template v-else>{{ item.label }}</template>');
        vLines.push('      </li>');
        vLines.push('    </ol>');
        vLines.push('  </nav>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    },

    tabs: {
      controls: [
        { key: 'count', label: 'Tab count', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'disabledIdx', label: 'Disabled tab', type: 'select', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: '1', label: 'Tab 2' }, { value: '2', label: 'Tab 3' }, { value: '3', label: 'Tab 4' }
        ]}
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Overview', 'Details', 'History', 'Settings', 'Admin'];
        const sizeAttr = s.size === 'sm' ? ' data-size="sm"' : '';
        const disIdx = s.disabledIdx === 'none' ? -1 : parseInt(s.disabledIdx, 10);
        let h = '<div class="udc-tabs" role="tablist"' + sizeAttr + '>\n';
        for (let i = 0; i < n; i++) {
          const sel = i === 0 ? ' aria-selected="true"' : '';
          const dis = i === disIdx ? ' disabled' : '';
          h += '  <button class="udc-tab" role="tab"' + sel + dis + '>' + labels[i] + '</button>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function Tabs() {');
        rLines.push('  const [active, setActive] = useState(0);');
        rLines.push("  const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) rLines.push('  const disabledIdx = ' + disIdx + ';');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-tabs" role="tablist"' + sizeAttr + '>');
        rLines.push('      {tabs.map((label, i) => (');
        rLines.push('        <button');
        rLines.push('          key={i}');
        rLines.push('          className="udc-tab"');
        rLines.push('          role="tab"');
        rLines.push('          aria-selected={i === active}');
        rLines.push('          onClick={() => setActive(i)}');
        if (disIdx >= 0) rLines.push('          disabled={i === disabledIdx}');
        rLines.push('        >');
        rLines.push('          {label}');
        rLines.push('        </button>');
        rLines.push('      ))}');
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const active = ref(0);');
        vLines.push("const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) vLines.push('const disabledIdx = ' + disIdx + ';');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-tabs" role="tablist"' + sizeAttr + '>');
        vLines.push('    <button');
        vLines.push('      v-for="(label, i) in tabs"');
        vLines.push('      :key="i"');
        vLines.push('      class="udc-tab"');
        vLines.push('      role="tab"');
        vLines.push('      :aria-selected="i === active"');
        vLines.push('      @click="active = i"');
        if (disIdx >= 0) vLines.push('      :disabled="i === disabledIdx"');
        vLines.push('    >');
        vLines.push('      {{ label }}');
        vLines.push('    </button>');
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    },

    divider: {
      controls: [
        { key: 'padding', label: 'Padding', type: 'select', default: 'default', options: [
          { value: 'default', label: 'sm (default)' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }, { value: 'xl', label: 'xl' }
        ]}
      ],
      render(s) {
        const padAttr = s.padding !== 'default' ? ' data-padding="' + s.padding + '"' : '';
        const code = '<hr class="udc-divider-horizontal"' + padAttr + ' />';
        const html = '<div style="width:100%;"><p style="font-size:13px;color:var(--uds-color-text-secondary);">Content above</p>' + code + '<p style="font-size:13px;color:var(--uds-color-text-secondary);">Content below</p></div>';
        var reactCode = 'function Divider() {\n  return <hr className="udc-divider-horizontal"' + padAttr + ' />;\n}';
        var vueCode = '<template>\n  <hr class="udc-divider-horizontal"' + padAttr + ' />\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html, code };
      }
    },

    'icon-wrapper': {
      controls: [
        { key: 'icon', label: 'Icon', type: 'icon-search', default: 'info' },
        { key: 'size', label: 'Size', type: 'select', default: '24', options: [
          { value: '16', label: '16' }, { value: '20', label: '20' }, { value: '24', label: '24 (default)' },
          { value: '32', label: '32' }, { value: '48', label: '48' }, { value: '64', label: '64' }
        ]},
        { key: 'color', label: 'Color', type: 'select', default: 'interactive', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
          { value: 'interactive', label: 'Interactive' }, { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]}
      ],
      render(s) {
        const sizeAttr = s.size !== '24' ? ' data-size="' + s.size + '"' : '';
        const colorToken = 'var(--uds-color-icon-' + s.color + ')';
        const icon = '<span class="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>';
        const code = '<span class="udc-icon-wrapper"' + sizeAttr + ' style="color:' + colorToken + ';">\n  ' + icon + '\n</span>';
        var reactCode = 'function Icon() {\n  return (\n    <span\n      className="udc-icon-wrapper"\n' + (sizeAttr ? '      ' + sizeAttr + '\n' : '') + '      style={{ color: \'' + colorToken + '\' }}\n    >\n      <span className="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>\n    </span>\n  );\n}';
        var vueCode = '<template>\n  <span class="udc-icon-wrapper"' + sizeAttr + ' :style="{ color: \'' + colorToken + '\' }">\n    <span class="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>\n  </span>\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html: code, code };
      }
    },

    spacer: {
      controls: [
        { key: 'size', label: 'Size', type: 'select', default: '200', options: [
          { value: '050', label: '050 (4px)' }, { value: '075', label: '075 (6px)' }, { value: '100', label: '100 (8px)' },
          { value: '150', label: '150 (12px)' }, { value: '200', label: '200 (16px)' }, { value: '300', label: '300 (24px)' },
          { value: '400', label: '400 (32px)' }, { value: '600', label: '600 (48px)' }
        ]}
      ],
      render(s) {
        const code = '<div class="udc-spacer" data-size="' + s.size + '"></div>';
        const html = '<div style="display:flex;align-items:center;gap:0;"><span class="udc-badge">Before</span><div class="udc-spacer" data-size="' + s.size + '" style="background:var(--uds-color-surface-info-subtle);outline:1px dashed var(--uds-color-border-interactive);"></div><span class="udc-badge" data-variant="success">After</span></div>';
        var reactCode = 'function Spacer() {\n  return <div className="udc-spacer" data-size="' + s.size + '" />;\n}';
        var vueCode = '<template>\n  <div class="udc-spacer" data-size="' + s.size + '"></div>\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html, code };
      }
    },

    'nav-header': {
      controls: [
        { key: 'showSearch', label: 'Show search', type: 'checkbox', default: true },
        { key: 'showMyWork', label: 'Show My Work', type: 'checkbox', default: true },
        { key: 'showBento', label: 'Show bento dropdown', type: 'checkbox', default: false },
        { key: 'showTiles', label: 'Bento tiles', type: 'checkbox', default: true },
        { key: 'appName', label: 'App name', type: 'text', default: 'Boardroom' }
      ],
      render(s) {
        var appName = esc(s.appName || 'Boardroom');
        var hl = ['<div class="udc-nav-header">'];
        hl.push('  <div class="udc-nav-header__left">');
        hl.push('    <div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span></div>');
        hl.push('    <div class="udc-nav-bento-wrapper">');
        hl.push('      <button class="udc-nav-bento-button" aria-expanded="' + (s.showBento ? 'true' : 'false') + '">');
        hl.push('        <span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>');
        hl.push('        ' + appName);
        hl.push('        <span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>');
        hl.push('      </button>');
        if (s.showBento) {
          hl.push('      <div class="udc-nav-bento" data-open="true" style="position:relative;top:auto;">');
          if (s.showTiles) {
            hl.push('        <div class="udc-nav-bento__tiles">');
            hl.push('          <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">home</span>Transaction</a>');
            hl.push('          <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">assignment</span>Leads</a>');
            hl.push('        </div>');
          }
          hl.push('        <div class="udc-nav-bento__list">');
          hl.push('          <button class="udc-nav-button" aria-selected="true"><span class="material-symbols-outlined">space_dashboard</span><span class="udc-nav-button__label">Dashboard</span></button>');
          hl.push('          <button class="udc-nav-button"><span class="material-symbols-outlined">book</span><span class="udc-nav-button__label">Leasing / CRM</span></button>');
          hl.push('        </div>');
          hl.push('      </div>');
        }
        hl.push('    </div>');
        hl.push('  </div>');
        if (s.showSearch) {
          hl.push('  <div class="udc-nav-header__center">');
          hl.push('    <div class="udc-nav-search">');
          hl.push('      <span class="material-symbols-outlined">auto_awesome</span>');
          hl.push('      <input class="udc-nav-search__input" type="text" placeholder="Search or ask a question">');
          hl.push('    </div>');
          hl.push('  </div>');
        }
        hl.push('  <div class="udc-nav-header__right">');
        if (s.showMyWork) {
          hl.push('    <button class="udc-nav-mywork"><span class="material-symbols-outlined">notifications_active</span> My Work <span class="udc-badge" data-variant="warning" style="width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;">5</span></button>');
        }
        hl.push('    <div class="udc-nav-account">');
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">settings</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>');
        hl.push('    </div>');
        hl.push('  </div>');
        hl.push('</div>');
        var code = hl.join('\n');
        var html = '<div style="background:var(--uds-color-surface-page);border-radius:8px;overflow:hidden;">' + code + '</div>';
        var rL = ["import { useState, useRef, useEffect } from 'react';", '', 'function NavHeader() {'];
        rL.push('  const [bentoOpen, setBentoOpen] = useState(false);');
        rL.push('  const bentoRef = useRef(null);');
        rL.push('  useEffect(() => {');
        rL.push('    const close = (e) => { if (bentoRef.current && !bentoRef.current.contains(e.target)) setBentoOpen(false); };');
        rL.push('    document.addEventListener("click", close);');
        rL.push('    return () => document.removeEventListener("click", close);');
        rL.push('  }, []);');
        rL.push('  return (');
        rL.push('    <div className="udc-nav-header">');
        rL.push('      <div className="udc-nav-header__left">');
        rL.push('        <div className="udc-nav-logo"><span className="material-symbols-outlined">apartment</span><span className="udc-nav-logo__text">Boardroom</span></div>');
        if (s.showBento) {
          rL.push('        <div className="udc-nav-bento-wrapper" ref={bentoRef}>');
          rL.push('          <button className="udc-nav-bento-button" aria-expanded={bentoOpen} onClick={() => setBentoOpen(!bentoOpen)}>');
          rL.push('            <span className="material-symbols-outlined">dashboard</span> Apps');
          rL.push('            <span className="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>');
          rL.push('          </button>');
          rL.push('        </div>');
        }
        rL.push('      </div>');
        rL.push('      <div className="udc-nav-header__right">');
        rL.push('        <button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">notifications</span></button>');
        rL.push('        <button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">account_circle</span></button>');
        rL.push('      </div>');
        rL.push('    </div>');
        rL.push('  );');
        rL.push('}');
        var reactCode = rL.join('\n');

        var vL = ['<script setup>', "import { ref, onMounted, onUnmounted } from 'vue';", '', 'const bentoOpen = ref(false);', '</script>', '', '<template>'];
        vL.push('  <div class="udc-nav-header">');
        vL.push('    <div class="udc-nav-header__left">');
        vL.push('      <div class="udc-nav-logo"><span class="material-symbols-outlined">apartment</span><span class="udc-nav-logo__text">Boardroom</span></div>');
        vL.push('    </div>');
        vL.push('    <div class="udc-nav-header__right">');
        vL.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>');
        vL.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>');
        vL.push('    </div>');
        vL.push('  </div>');
        vL.push('</template>');
        var vueCode = vL.join('\n');
        return { html: html, code: code };
      }
    },

    'nav-vertical': {
      controls: [
        { key: 'leadingIcons', label: 'Leading Icons', type: 'checkbox', default: true },
        { key: 'itemCount', label: 'Item count', type: 'select', default: '5', options: [
          { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '7', label: '7' }
        ]},
        { key: 'selectedIdx', label: 'Selected item', type: 'select', default: '0', options: [
          { value: '0', label: '1st' }, { value: '1', label: '2nd' }, { value: '2', label: '3rd' }, { value: 'none', label: 'None' }
        ]},
        { key: 'style', label: 'Style', type: 'select', default: 'list', options: [
          { value: 'list', label: 'List (default)' }, { value: 'rail', label: 'Rail (compact)' }
        ]}
      ],
      render(s) {
        var items = [
          { icon: 'space_dashboard', label: 'Dashboard' },
          { icon: 'book', label: 'Leasing / CRM' },
          { icon: 'contact_phone', label: 'People / Contacts' },
          { icon: 'home_work', label: 'Property / Assets' },
          { icon: 'monetization_on', label: 'Accounting / Finance' },
          { icon: 'summarize', label: 'Compliance / Reporting' },
          { icon: 'admin_panel_settings', label: 'Admin / Settings' }
        ].slice(0, parseInt(s.itemCount, 10));
        var selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
        var html = '', code = '', reactCode = '', vueCode = '';
        var liAttr = s.leadingIcons ? '' : ' data-leading-icons="false"';

        if (s.style === 'rail') {
          var vbl = [];
          items.slice(0, 3).forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            vbl.push('<button class="udc-nav-button-vertical"' + sel + '>');
            vbl.push('  <span class="material-symbols-outlined">' + item.icon + '</span>');
            vbl.push('  ' + item.label.split(' / ')[0]);
            vbl.push('</button>');
          });
          code = vbl.join('\n');
          html = '<div style="display:flex;gap:8px;">' + code + '</div>';
          var rRail = ["import { useState } from 'react';", '', 'function NavRail() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '  const items = ['];
          items.slice(0, 3).forEach(function (item) { rRail.push("    { icon: '" + item.icon + "', label: '" + item.label.split(' / ')[0] + "' },"); });
          rRail.push('  ];', '', '  return (', '    <div style={{ display: "flex", gap: 8 }}>');
          rRail.push('      {items.map((item, i) => (', '        <button key={i} className="udc-nav-button-vertical" aria-selected={selected === i} onClick={() => setSelected(i)}>');
          rRail.push('          <span className="material-symbols-outlined">{item.icon}</span>');
          rRail.push('          {item.label}', '        </button>', '      ))}', '    </div>', '  );', '}');
          reactCode = rRail.join('\n');
          var vRailItems = items.slice(0, 3);
          var vRailItemsStr = vRailItems.map(function(it) { return "  { icon: '" + it.icon + "', label: '" + it.label.split(' / ')[0] + "' }"; }).join(',\n');
          vueCode = "<script setup>\nimport { ref } from 'vue';\n\nconst selected = ref(" + (selIdx >= 0 ? selIdx : 'null') + ");\nconst items = [\n" + vRailItemsStr + "\n];\n</script>\n\n<template>\n  <div style=\"display:flex;gap:8px;\">\n    <button v-for=\"(item, i) in items\" :key=\"i\" class=\"udc-nav-button-vertical\" :aria-selected=\"selected === i\" @click=\"selected = i\">\n      <span class=\"material-symbols-outlined\">{{ item.icon }}</span>\n      {{ item.label }}\n    </button>\n  </div>\n</template>";
        } else {
          var lines = ['<nav class="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">'];
          items.forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            lines.push('  <button class="udc-nav-button"' + sel + '>');
            if (s.leadingIcons) {
              lines.push('    <span class="material-symbols-outlined">' + item.icon + '</span>');
            }
            lines.push('    <span class="udc-nav-button__label">' + item.label + '</span>');
            lines.push('  </button>');
          });
          lines.push('</nav>');
          code = lines.join('\n');
          html = '<div style="max-width:240px;">' + code + '</div>';

          var rL = ["import { useState } from 'react';", '', 'const navItems = ['];
          items.forEach(function (item) { rL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          rL.push('];', '', 'function NavVertical() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '', '  return (', '    <nav className="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">');
          rL.push('      {navItems.map((item, i) => (', '        <button', '          key={i}', '          className="udc-nav-button"', '          aria-selected={selected === i}', '          onClick={() => setSelected(i)}', '        >');
          if (s.leadingIcons) rL.push('          <span className="material-symbols-outlined">{item.icon}</span>');
          rL.push('          <span className="udc-nav-button__label">{item.label}</span>', '        </button>', '      ))}', '    </nav>', '  );', '}');
          reactCode = rL.join('\n');

          var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const selected = ref(' + (selIdx >= 0 ? selIdx : 'null') + ');', 'const navItems = ['];
          items.forEach(function (item) { vL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          vL.push('];', '</script>', '', '<template>', '  <nav class="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">', '    <button', '      v-for="(item, i) in navItems" :key="i"', '      class="udc-nav-button"', '      :aria-selected="selected === i"', '      @click="selected = i"', '    >');
          if (s.leadingIcons) vL.push('      <span class="material-symbols-outlined">{{ item.icon }}</span>');
          vL.push('      <span class="udc-nav-button__label">{{ item.label }}</span>', '    </button>', '  </nav>', '</template>');
          vueCode = vL.join('\n');
        }

        return { html: html, code: code };
      }
    },

    'notification': {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'info', options: [
          { value: 'info', label: 'Info' }, { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]},
        { key: 'style', label: 'Style', type: 'select', default: 'subtle', options: [
          { value: 'subtle', label: 'Subtle (default)' }, { value: 'prominent', label: 'Prominent' },
          { value: 'inline', label: 'Inline' }
        ]},
        { key: 'message', label: 'Message', type: 'text', default: 'This is a notification message.' },
        { key: 'dismissible', label: 'Show close button', type: 'checkbox', default: false },
        { key: 'icon', label: 'Icon', type: 'icon-search', default: '' }
      ],
      render(s) {
        var variantIcons = { info: 'info', success: 'check_circle', error: 'error_outline', warning: 'warning_amber' };
        var icon = s.icon || variantIcons[s.variant] || 'info';
        var styleAttr = '';
        if (s.style === 'prominent') styleAttr = ' data-prominent="true"';
        else if (s.style === 'inline') styleAttr = ' data-inline="true"';

        var closeHtml = s.dismissible ? '\n  <button class="udc-notification__close" aria-label="Dismiss">\n    <span class="material-symbols-outlined">close</span>\n  </button>' : '';
        var closeCode = s.dismissible ? '\n  <button class="udc-notification__close" aria-label="Dismiss">\n    <span class="material-symbols-outlined">close</span>\n  </button>' : '';

        var code = '<div class="udc-notification" data-variant="' + s.variant + '"' + styleAttr + '>\n  <span class="udc-notification__icon">\n    <span class="material-symbols-outlined">' + icon + '</span>\n  </span>\n  <span class="udc-notification__text">' + s.message + '</span>' + closeCode + '\n</div>';
        var html = code;

        var reactCode = "import { useState } from 'react';\n\nfunction Notification() {\n  const [visible, setVisible] = useState(true);\n  if (!visible) return null;\n\n  return (\n    <div className=\"udc-notification\" data-variant=\"" + s.variant + "\"" + styleAttr + ">\n      <span className=\"udc-notification__icon\">\n        <span className=\"material-symbols-outlined\">" + icon + "</span>\n      </span>\n      <span className=\"udc-notification__text\">" + s.message + "</span>" + (s.dismissible ? "\n      <button className=\"udc-notification__close\" aria-label=\"Dismiss\" onClick={() => setVisible(false)}>\n        <span className=\"material-symbols-outlined\">close</span>\n      </button>" : "") + "\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref } from 'vue';\nconst visible = ref(true);\n</script>\n\n<template>\n  <div v-if=\"visible\" class=\"udc-notification\" data-variant=\"" + s.variant + "\"" + styleAttr + ">\n    <span class=\"udc-notification__icon\">\n      <span class=\"material-symbols-outlined\">" + icon + "</span>\n    </span>\n    <span class=\"udc-notification__text\">" + s.message + "</span>" + (s.dismissible ? "\n    <button class=\"udc-notification__close\" aria-label=\"Dismiss\" @click=\"visible = false\">\n      <span class=\"material-symbols-outlined\">close</span>\n    </button>" : "") + "\n  </div>\n</template>";

        return { html: html, code: code };
      }
    },

    'dialog': {
      controls: [
        { key: 'title', label: 'Title', type: 'text', default: 'Dialog title' },
        { key: 'slots', label: 'Content slots', type: 'select', default: '1', options: [
          { value: '1', label: '1 slot' }, { value: '2', label: '2 slots' },
          { value: '3', label: '3 slots' }, { value: '4', label: '4 slots' }
        ]},
        { key: 'primaryLabel', label: 'Primary button', type: 'text', default: 'Confirm' },
        { key: 'secondaryLabel', label: 'Secondary button', type: 'text', default: 'Cancel' }
      ],
      render(s) {
        var count = parseInt(s.slots, 10);
        var slotLines = '';
        for (var i = 0; i < count; i++) {
          slotLines += '\n    <div style="background:var(--uds-color-surface-alt);padding:var(--uds-space-300);text-align:center;font-size:12px;border-radius:4px;">Slot ' + (count === 1 ? '– Replace This' : (i + 1)) + '</div>';
        }

        var code = '<div class="udc-dialog-backdrop" data-open="true">\n  <div class="udc-dialog" role="dialog" aria-modal="true">\n    <div class="udc-dialog__header">\n      <h2 class="udc-dialog__title">' + s.title + '</h2>\n      <button class="udc-dialog__close" aria-label="Close">\n        <span class="material-symbols-outlined">close</span>\n      </button>\n    </div>\n    <div class="udc-dialog__body">' + slotLines + '\n    </div>\n    <div class="udc-dialog__footer">\n      <button class="udc-button-secondary">' + s.secondaryLabel + '</button>\n      <button class="udc-button-primary">' + s.primaryLabel + '</button>\n    </div>\n  </div>\n</div>';

        var previewHtml = '<div style="display:flex;justify-content:center;"><div class="udc-dialog" role="dialog" aria-modal="false" style="position:relative;box-shadow:0 10px 20px 2px rgba(0,0,0,0.2);">\n  <div class="udc-dialog__header">\n    <h2 class="udc-dialog__title">' + s.title + '</h2>\n    <button class="udc-dialog__close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>\n  </div>\n  <div class="udc-dialog__body">' + slotLines + '\n  </div>\n  <div class="udc-dialog__footer">\n    <button class="udc-button-secondary">' + s.secondaryLabel + '</button>\n    <button class="udc-button-primary">' + s.primaryLabel + '</button>\n  </div>\n</div></div>';

        var reactCode = "import { useState } from 'react';\n\nfunction MyDialog({ open, onClose }) {\n  if (!open) return null;\n\n  return (\n    <div className=\"udc-dialog-backdrop\" data-open=\"true\" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>\n      <div className=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n        <div className=\"udc-dialog__header\">\n          <h2 className=\"udc-dialog__title\">" + s.title + "</h2>\n          <button className=\"udc-dialog__close\" aria-label=\"Close\" onClick={onClose}>\n            <span className=\"material-symbols-outlined\">close</span>\n          </button>\n        </div>\n        <div className=\"udc-dialog__body\">\n          {/* Your content here */}\n        </div>\n        <div className=\"udc-dialog__footer\">\n          <button className=\"udc-button-secondary\" onClick={onClose}>" + s.secondaryLabel + "</button>\n          <button className=\"udc-button-primary\">" + s.primaryLabel + "</button>\n        </div>\n      </div>\n    </div>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ open: Boolean });\nconst emit = defineEmits(['close']);\n</script>\n\n<template>\n  <div v-if=\"open\" class=\"udc-dialog-backdrop\" data-open=\"true\" @click.self=\"emit('close')\">\n    <div class=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"udc-dialog__header\">\n        <h2 class=\"udc-dialog__title\">" + s.title + "</h2>\n        <button class=\"udc-dialog__close\" aria-label=\"Close\" @click=\"emit('close')\">\n          <span class=\"material-symbols-outlined\">close</span>\n        </button>\n      </div>\n      <div class=\"udc-dialog__body\">\n        <slot />\n      </div>\n      <div class=\"udc-dialog__footer\">\n        <button class=\"udc-button-secondary\" @click=\"emit('close')\">" + s.secondaryLabel + "</button>\n        <button class=\"udc-button-primary\">" + s.primaryLabel + "</button>\n      </div>\n    </div>\n  </div>\n</template>";

        return { html: previewHtml, code: code };
      }
    },

    'data-table': {
      controls: [
        { key: 'rows', label: 'Rows', type: 'select', default: '5', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '5', label: '5' },
          { value: '8', label: '8' }, { value: '10', label: '10' }
        ]},
        { key: 'columns', label: 'Data columns', type: 'select', default: 'standard', options: [
          { value: 'minimal', label: 'Minimal (Name + Amount)' },
          { value: 'standard', label: 'Standard (Name, Status, Property, Amount)' },
          { value: 'full', label: 'Full (+ Invoice #, Due Date)' }
        ]},
        { key: 'showCheck', label: 'Checkbox column', type: 'checkbox', default: true },
        { key: 'showAction', label: 'Action column (⋮)', type: 'checkbox', default: true },
        { key: 'sortCol', label: 'Sort column', type: 'select', default: 'name-asc', options: [
          { value: 'none', label: 'None' },
          { value: 'name-asc', label: 'Name ↑' }, { value: 'name-desc', label: 'Name ↓' },
          { value: 'amount-asc', label: 'Amount ↑' }, { value: 'amount-desc', label: 'Amount ↓' }
        ]},
        { key: 'showFilter', label: 'Filter icon on Status', type: 'checkbox', default: false },
        { key: 'striped', label: 'Striped rows', type: 'checkbox', default: false },
        { key: 'highlightError', label: 'Error highlight row', type: 'select', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: '1', label: 'Row 1' },
          { value: '2', label: 'Row 2' }, { value: '3', label: 'Row 3' }
        ]},
        { key: 'prominentName', label: 'Prominent name text', type: 'checkbox', default: false },
        { key: 'amountAlign', label: 'Amount alignment', type: 'select', default: 'right', options: [
          { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
        ]},
        { key: 'cellDividers', label: 'Column dividers', type: 'checkbox', default: false }
      ],
      render(s) {
        var count = parseInt(s.rows, 10);
        var data = [
          { name: 'Brian Smith',     status: 'Low Confidence',      sv: 'warning', prop: 'Riverbend Estates',    inv: 'INV-002', due: 'Feb 20, 2024', amt: '$75' },
          { name: 'Catherine Lee',   status: 'Delivered',           sv: 'success', prop: 'Sunnyvale Towers',     inv: 'INV-003', due: 'Mar 5, 2024',  amt: '$100' },
          { name: 'David Brown',     status: 'Delivery Failed',     sv: 'error',   prop: 'Cedar Hills Residence',inv: 'INV-004', due: 'Apr 12, 2024', amt: '$150' },
          { name: 'Eva White',       status: 'Suspected Duplicate', sv: 'warning', prop: 'Oakwood Gardens',      inv: 'INV-005', due: 'May 30, 2024', amt: '$200' },
          { name: 'Frank Garcia',    status: 'Delivered',           sv: 'success', prop: 'Birchwood Apartments', inv: 'INV-006', due: 'Jun 18, 2024', amt: '$250' },
          { name: 'Grace Kim',       status: 'Delivered',           sv: 'success', prop: 'Silver Lake Apartments',inv: 'INV-007', due: 'Jul 25, 2024', amt: '$300' },
          { name: 'Henry Martinez',  status: 'Low Confidence',      sv: 'warning', prop: 'Pine Crest Estates',   inv: 'INV-008', due: 'Aug 14, 2024', amt: '$400' },
          { name: 'Isabella Wang',   status: 'Delivered',           sv: 'success', prop: 'Elmwood Place',        inv: 'INV-009', due: 'Sep 22, 2024', amt: '$500' },
          { name: 'Jack Thompson',   status: 'Delivered',           sv: 'success', prop: 'Hillside Meadows',     inv: 'INV-010', due: 'Oct 11, 2024', amt: '$750' },
          { name: 'Katherine Patel', status: 'Delivered',           sv: 'success', prop: 'Willow Creek',         inv: 'INV-011', due: 'Nov 3, 2024',  amt: '$1000' }
        ];
        var rows = data.slice(0, count);

        var isStd = s.columns === 'standard' || s.columns === 'full';
        var isFull = s.columns === 'full';
        var amtCls = s.amountAlign === 'right' ? 'udc-dt-align-right' : s.amountAlign === 'center' ? 'udc-dt-align-center' : '';
        var divAttr = s.cellDividers ? ' data-right-divider="true"' : '';

        var nameSortAttr = '';
        var amtSortHtml = '';
        if (s.sortCol === 'name-asc') nameSortAttr = ' data-dir="asc"';
        else if (s.sortCol === 'name-desc') nameSortAttr = ' data-dir="desc"';
        var nameSort = s.sortCol.startsWith('name') ? '<span class="udc-dt-sort"' + nameSortAttr + '></span>' : '<span class="udc-dt-sort"></span>';
        if (s.sortCol === 'amount-asc') amtSortHtml = ' <span class="udc-dt-sort" data-dir="asc"></span>';
        else if (s.sortCol === 'amount-desc') amtSortHtml = ' <span class="udc-dt-sort" data-dir="desc"></span>';
        else amtSortHtml = '';

        var filterHtml = s.showFilter ? ' <span class="udc-dt-filter"></span>' : '';
        var stripedAttr = s.striped ? ' data-striped="true"' : '';
        var errIdx = s.highlightError === 'none' ? -1 : parseInt(s.highlightError, 10) - 1;

        var L = [];
        L.push('<div class="udc-data-table"' + stripedAttr + '>');
        L.push('  <table>');

        L.push('    <thead>');
        L.push('      <tr>');
        if (s.showCheck) L.push('        <th class="udc-dt-check"><input type="checkbox" /></th>');
        L.push('        <th' + divAttr + '>Uploaded By ' + nameSort + '</th>');
        if (isStd) L.push('        <th' + divAttr + '>Invoice Status' + filterHtml + '</th>');
        if (isStd) L.push('        <th' + divAttr + '>Property</th>');
        if (isFull) L.push('        <th' + divAttr + '>Invoice Number</th>');
        if (isFull) L.push('        <th' + divAttr + '>Due Date</th>');
        L.push('        <th' + (amtCls ? ' class="' + amtCls + '"' : '') + '>Amount' + amtSortHtml + '</th>');
        if (s.showAction) L.push('        <th class="udc-dt-action"></th>');
        L.push('      </tr>');
        L.push('    </thead>');

        L.push('    <tbody>');
        rows.forEach(function (r, i) {
          var trAttr = i === errIdx ? ' data-highlight="error"' : '';
          L.push('      <tr' + trAttr + '>');
          if (s.showCheck) L.push('        <td class="udc-dt-check"><input type="checkbox" /></td>');
          var nameWrap = s.prominentName ? '<span class="udc-dt-prominent">' + r.name + '</span>' : r.name;
          L.push('        <td' + divAttr + '>' + nameWrap + '</td>');
          if (isStd) L.push('        <td' + divAttr + '><span class="udc-badge" data-variant="' + r.sv + '">' + r.status + '</span></td>');
          if (isStd) L.push('        <td' + divAttr + '>' + r.prop + '</td>');
          if (isFull) L.push('        <td' + divAttr + '>' + r.inv + '</td>');
          if (isFull) L.push('        <td' + divAttr + '>' + r.due + '</td>');
          L.push('        <td' + (amtCls ? ' class="' + amtCls + '"' : '') + '>' + r.amt + '</td>');
          if (s.showAction) L.push('        <td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td>');
          L.push('      </tr>');
        });
        L.push('    </tbody>');
        L.push('  </table>');
        L.push('</div>');

        var code = L.join('\n');
        var html = code;

        var rCols = [];
        rCols.push("              <td>{row.name}</td>");
        if (isStd) rCols.push("              <td><span className=\"udc-badge\" data-variant={row.sv}>{row.status}</span></td>");
        if (isStd) rCols.push("              <td>{row.property}</td>");
        if (isFull) rCols.push("              <td>{row.inv}</td>");
        if (isFull) rCols.push("              <td>{row.due}</td>");
        rCols.push("              <td" + (amtCls ? " className=\"" + amtCls + "\"" : "") + ">{row.amount}</td>");

        var rL = ["import { useState } from 'react';", '', 'const rows = [', "  { name: 'Brian Smith', status: 'Delivered', sv: 'success', property: 'Riverbend', inv: 'INV-002', due: 'Feb 20', amount: '$75' },", "  { name: 'Catherine Lee', status: 'Low Confidence', sv: 'warning', property: 'Sunnyvale', inv: 'INV-003', due: 'Mar 5', amount: '$100' },", '];', '', 'function InvoiceTable() {', '  const [checked, setChecked] = useState(new Set());'];
        if (s.sortCol !== 'none') rL.push("  const [sortDir, setSortDir] = useState('" + (s.sortCol.includes('asc') ? 'asc' : 'desc') + "');");
        rL.push('', '  function toggleRow(idx) {', '    setChecked(prev => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });', '  }', '  function toggleAll() {', '    setChecked(prev => prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)));', '  }', '', '  return (', '    <div className="udc-data-table"' + stripedAttr + '>', '      <table>', '        <thead><tr>');
        if (s.showCheck) rL.push('          <th className="udc-dt-check"><input type="checkbox" checked={checked.size === rows.length} onChange={toggleAll} /></th>');
        rL.push('          <th>Uploaded By <span className="udc-dt-sort"' + nameSortAttr + ' /></th>');
        if (isStd) rL.push('          <th>Invoice Status</th>');
        if (isStd) rL.push('          <th>Property</th>');
        if (isFull) rL.push('          <th>Invoice Number</th>', '          <th>Due Date</th>');
        rL.push('          <th' + (amtCls ? ' className="' + amtCls + '"' : '') + '>Amount</th>');
        if (s.showAction) rL.push('          <th className="udc-dt-action" />');
        rL.push('        </tr></thead>', '        <tbody>', '          {rows.map((row, i) => (', '            <tr key={i}>');
        if (s.showCheck) rL.push('              <td className="udc-dt-check"><input type="checkbox" checked={checked.has(i)} onChange={() => toggleRow(i)} /></td>');
        rL.push('              <td>{row.name}</td>');
        if (isStd) rL.push('              <td><span className="udc-badge" data-variant={row.sv}>{row.status}</span></td>', '              <td>{row.property}</td>');
        if (isFull) rL.push('              <td>{row.inv}</td>', '              <td>{row.due}</td>');
        rL.push('              <td' + (amtCls ? ' className="' + amtCls + '"' : '') + '>{row.amount}</td>');
        if (s.showAction) rL.push('              <td className="udc-dt-action"><button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">more_vert</span></button></td>');
        rL.push('            </tr>', '          ))}', '        </tbody>', '      </table>', '    </div>', '  );', '}');
        var reactCode = rL.join('\n');

        var vCols = [];
        vCols.push("          <td>{{ row.name }}</td>");
        if (isStd) vCols.push("          <td><span class=\"udc-badge\" :data-variant=\"row.sv\">{{ row.status }}</span></td>");
        if (isStd) vCols.push("          <td>{{ row.property }}</td>");
        if (isFull) vCols.push("          <td>{{ row.inv }}</td>");
        if (isFull) vCols.push("          <td>{{ row.due }}</td>");
        vCols.push("          <td" + (amtCls ? " class=\"" + amtCls + "\"" : "") + ">{{ row.amount }}</td>");

        var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const rows = [', "  { name: 'Brian Smith', status: 'Delivered', sv: 'success', property: 'Riverbend', inv: 'INV-002', due: 'Feb 20', amount: '$75' },", "  { name: 'Catherine Lee', status: 'Low Confidence', sv: 'warning', property: 'Sunnyvale', inv: 'INV-003', due: 'Mar 5', amount: '$100' },", '];', 'const checked = ref(new Set());', '', 'function toggleRow(i) { const s = new Set(checked.value); s.has(i) ? s.delete(i) : s.add(i); checked.value = s; }', 'function toggleAll() { checked.value = checked.value.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)); }', '</script>', '', '<template>', '  <div class="udc-data-table"' + stripedAttr + '>', '    <table>', '      <thead><tr>'];
        if (s.showCheck) vL.push('        <th class="udc-dt-check"><input type="checkbox" :checked="checked.size === rows.length" @change="toggleAll" /></th>');
        vL.push('        <th>Uploaded By <span class="udc-dt-sort"' + nameSortAttr + ' /></th>');
        if (isStd) vL.push('        <th>Invoice Status</th>');
        if (isStd) vL.push('        <th>Property</th>');
        if (isFull) vL.push('        <th>Invoice Number</th>', '        <th>Due Date</th>');
        vL.push('        <th' + (amtCls ? ' class="' + amtCls + '"' : '') + '>Amount</th>');
        if (s.showAction) vL.push('        <th class="udc-dt-action" />');
        vL.push('      </tr></thead>', '      <tbody>', '        <tr v-for="(row, i) in rows" :key="i">');
        if (s.showCheck) vL.push('          <td class="udc-dt-check"><input type="checkbox" :checked="checked.has(i)" @change="toggleRow(i)" /></td>');
        vL.push('          <td>{{ row.name }}</td>');
        if (isStd) vL.push('          <td><span class="udc-badge" :data-variant="row.sv">{{ row.status }}</span></td>', '          <td>{{ row.property }}</td>');
        if (isFull) vL.push('          <td>{{ row.inv }}</td>', '          <td>{{ row.due }}</td>');
        vL.push('          <td' + (amtCls ? ' class="' + amtCls + '"' : '') + '>{{ row.amount }}</td>');
        if (s.showAction) vL.push('          <td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td>');
        vL.push('        </tr>', '      </tbody>', '    </table>', '  </div>', '</template>');
        var vueCode = vL.join('\n');

        return { html: html, code: code };
      }
    },

    'tile': {
      controls: [
        { key: 'label', label: 'Label', type: 'text', default: 'Upload CSV' },
        { key: 'body1', label: 'Body line 1', type: 'text', default: 'Import residents from a spreadsheet' },
        { key: 'body2', label: 'Body line 2', type: 'text', default: '' },
        { key: 'required', label: 'Required dot', type: 'checkbox', default: true },
        { key: 'showChevron', label: 'Show chevron', type: 'checkbox', default: true },
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'selected', label: 'Selected' }, { value: 'disabled', label: 'Disabled' }
        ]}
      ],
      render(s) {
        var reqDot = s.required ? '\n    <span class="udc-tile__required"></span>' : '';
        var bodyLines = '<div class="udc-tile__body">' + s.body1 + '</div>';
        if (s.body2) bodyLines += '\n    <div class="udc-tile__body">' + s.body2 + '</div>';
        var chevron = s.showChevron ? '\n  <span class="udc-tile__chevron">\n    <span class="material-symbols-outlined">chevron_right</span>\n  </span>' : '';
        var attrs = ' tabindex="0"';
        if (s.state === 'selected') attrs += ' aria-selected="true"';
        if (s.state === 'disabled') attrs = ' tabindex="-1" aria-disabled="true"';

        var code = '<div class="udc-tile"' + attrs + '>\n  <div class="udc-tile__content">\n    <div class="udc-tile__label">' + s.label + reqDot + '</div>\n    ' + bodyLines + '\n  </div>' + chevron + '\n</div>';
        var html = '<div style="max-width:280px;">' + code + '</div>';

        var reactCode = "import { useState } from 'react';\n\nfunction Tile({ label, body, required, showChevron = true, disabled }) {\n  const [selected, setSelected] = useState(false);\n\n  return (\n    <div\n      className=\"udc-tile\"\n      tabIndex={disabled ? -1 : 0}\n      aria-selected={selected}\n      aria-disabled={disabled || undefined}\n      onClick={() => !disabled && setSelected(!selected)}\n    >\n      <div className=\"udc-tile__content\">\n        <div className=\"udc-tile__label\">\n          {label}\n          {required && <span className=\"udc-tile__required\" />}\n        </div>\n        {body.map((line, i) => (\n          <div key={i} className=\"udc-tile__body\">{line}</div>\n        ))}\n      </div>\n      {showChevron && (\n        <span className=\"udc-tile__chevron\">\n          <span className=\"material-symbols-outlined\">chevron_right</span>\n        </span>\n      )}\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref } from 'vue';\n\nconst props = defineProps({\n  label: String,\n  body: Array,\n  required: Boolean,\n  showChevron: { type: Boolean, default: true },\n  disabled: Boolean\n});\nconst selected = ref(false);\nfunction toggle() { if (!props.disabled) selected.value = !selected.value; }\n</script>\n\n<template>\n  <div class=\"udc-tile\" :tabindex=\"disabled ? -1 : 0\"\n    :aria-selected=\"selected\" :aria-disabled=\"disabled || undefined\"\n    @click=\"toggle\">\n    <div class=\"udc-tile__content\">\n      <div class=\"udc-tile__label\">\n        {{ label }}\n        <span v-if=\"required\" class=\"udc-tile__required\" />\n      </div>\n      <div v-for=\"(line, i) in body\" :key=\"i\" class=\"udc-tile__body\">{{ line }}</div>\n    </div>\n    <span v-if=\"showChevron\" class=\"udc-tile__chevron\">\n      <span class=\"material-symbols-outlined\">chevron_right</span>\n    </span>\n  </div>\n</template>";

        return { html: html, code: code };
      }
    },

    'list': {
      controls: [
        { key: 'itemCount', label: 'Items', type: 'select', default: '5', options: [
          { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '7', label: '7' }, { value: '10', label: '10' }
        ]},
        { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: '' },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: '' },
        { key: 'selectedIdx', label: 'Selected item', type: 'select', default: '0', options: [
          { value: '0', label: '1st' }, { value: '1', label: '2nd' }, { value: '2', label: '3rd' }, { value: 'none', label: 'None' }
        ]}
      ],
      render(s) {
        var count = parseInt(s.itemCount, 10);
        var labels = ['Dashboard','Leasing / CRM','People / Contacts','Property / Assets','Accounting / Finance','Compliance / Reporting','Admin / Settings','Reports','Integrations','Support'];
        var selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
        var leadingHtml = s.leadingIcon ? '<span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + s.leadingIcon + '</span></span>' : '';
        var trailingHtml = s.trailingIcon ? '<span class="udc-list-item__trailing-icon"><span class="material-symbols-outlined">' + s.trailingIcon + '</span></span>' : '';

        var lines = ['<div class="udc-list">'];
        for (var i = 0; i < count; i++) {
          var sel = i === selIdx ? ' aria-selected="true"' : '';
          lines.push('  <div class="udc-list-item" tabindex="0"' + sel + '>');
          if (leadingHtml) lines.push('    ' + leadingHtml);
          lines.push('    <span class="udc-list-item__label">' + labels[i % labels.length] + '</span>');
          if (trailingHtml) lines.push('    ' + trailingHtml);
          lines.push('  </div>');
        }
        lines.push('</div>');
        var code = lines.join('\n');
        var html = '<div style="max-width:320px;">' + code + '</div>';

        var rL = ["import { useState } from 'react';", '', 'const items = ['];
        for (var j = 0; j < count; j++) rL.push("  '" + labels[j % labels.length] + "',");
        rL.push('];', '', 'function MyList() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '', '  return (', '    <div className="udc-list">');
        rL.push('      {items.map((label, i) => (', '        <div', '          key={i}', '          className="udc-list-item"', '          tabIndex={0}', '          aria-selected={selected === i}', '          onClick={() => setSelected(i)}', '        >');
        if (s.leadingIcon) rL.push('          <span className="udc-list-item__leading-icon"><span className="material-symbols-outlined">' + s.leadingIcon + '</span></span>');
        rL.push('          <span className="udc-list-item__label">{label}</span>');
        if (s.trailingIcon) rL.push('          <span className="udc-list-item__trailing-icon"><span className="material-symbols-outlined">' + s.trailingIcon + '</span></span>');
        rL.push('        </div>', '      ))}', '    </div>', '  );', '}');
        var reactCode = rL.join('\n');

        var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const selected = ref(' + (selIdx >= 0 ? selIdx : 'null') + ');', 'const items = ['];
        for (var k = 0; k < count; k++) vL.push("  '" + labels[k % labels.length] + "',");
        vL.push('];', '</script>', '', '<template>', '  <div class="udc-list">', '    <div', '      v-for="(label, i) in items" :key="i"', '      class="udc-list-item"', '      tabindex="0"', '      :aria-selected="selected === i"', '      @click="selected = i"', '    >');
        if (s.leadingIcon) vL.push('      <span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + s.leadingIcon + '</span></span>');
        vL.push('      <span class="udc-list-item__label">{{ label }}</span>');
        if (s.trailingIcon) vL.push('      <span class="udc-list-item__trailing-icon"><span class="material-symbols-outlined">' + s.trailingIcon + '</span></span>');
        vL.push('    </div>', '  </div>', '</template>');
        var vueCode = vL.join('\n');

        return { html: html, code: code };
      }
    },

    'chip': {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'filter', options: [
          { value: 'default', label: 'Default' }, { value: 'filter', label: 'Filter' },
          { value: 'input', label: 'Input' }, { value: 'dropdown', label: 'Dropdown' }
        ]},
        { key: 'label', label: 'Label', type: 'text', default: 'Chip label' },
        { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: true },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'checkbox', default: true }
      ],
      render(s) {
        var selAttr = s.selected ? ' aria-selected="true"' : '';
        var varAttr = s.variant !== 'default' ? ' data-variant="' + s.variant + '"' : '';
        var trailingName = s.variant === 'dropdown' ? 'keyboard_arrow_down' : 'close';
        var lead = s.leadingIcon ? '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span>' : '';
        var trail = s.trailingIcon ? '<span class="udc-chip__trailing-icon"><span class="material-symbols-outlined">' + trailingName + '</span></span>' : '';

        var code = '<button class="udc-chip"' + varAttr + selAttr + '>\n  ' + lead + '\n  <span class="udc-chip__label">' + s.label + '</span>\n  ' + trail + '\n</button>';
        code = code.replace(/\n  \n/g, '\n');
        var html = code;

        var reactCode = "function Chip({ label, variant, selected, onToggle, onDismiss }) {\n  return (\n    <button\n      className=\"udc-chip\"\n      data-variant={variant}\n      aria-selected={selected}\n      onClick={variant === 'input' && selected ? onDismiss : onToggle}\n    >\n" + (s.leadingIcon ? "      <span className=\"udc-chip__leading-icon\"><span className=\"material-symbols-outlined\">check</span></span>\n" : "") + "      <span className=\"udc-chip__label\">{label}</span>\n" + (s.trailingIcon ? "      <span className=\"udc-chip__trailing-icon\"><span className=\"material-symbols-outlined\">" + trailingName + "</span></span>\n" : "") + "    </button>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ label: String, variant: String, selected: Boolean });\nconst emit = defineEmits(['toggle', 'dismiss']);\n</script>\n\n<template>\n  <button class=\"udc-chip\"" + varAttr + "\n    :aria-selected=\"selected\"\n    @click=\"variant === 'input' && selected ? emit('dismiss') : emit('toggle')\">\n" + (s.leadingIcon ? "    <span class=\"udc-chip__leading-icon\"><span class=\"material-symbols-outlined\">check</span></span>\n" : "") + "    <span class=\"udc-chip__label\">{{ label }}</span>\n" + (s.trailingIcon ? "    <span class=\"udc-chip__trailing-icon\"><span class=\"material-symbols-outlined\">" + trailingName + "</span></span>\n" : "") + "  </button>\n</template>";

        return { html: html, code: code };
      }
    },

    'search': {
      controls: [
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Search...' },
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]}
      ],
      render(s) {
        var stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        var code = '<div class="udc-search"' + stateAttr + '>\n  <div class="udc-search__field">\n    <span class="udc-search__icon">\n      <span class="material-symbols-outlined">search</span>\n    </span>\n    <input type="search" placeholder="' + s.placeholder + '" />\n    <button class="udc-search__clear" aria-label="Clear">\n      <span class="material-symbols-outlined">clear</span>\n    </button>\n  </div>\n</div>';
        var html = '<div style="max-width:400px;">' + code + '</div>';

        var reactCode = "import { useState, useCallback } from 'react';\n\nfunction SearchBar({ placeholder = '" + s.placeholder + "', onSearch }) {\n  const [value, setValue] = useState('');\n\n  const clear = useCallback(() => {\n    setValue('');\n    onSearch?.('');\n  }, [onSearch]);\n\n  return (\n    <div className=\"udc-search\"" + stateAttr + " data-has-value={value.length > 0 ? 'true' : 'false'}>\n      <div className=\"udc-search__field\">\n        <span className=\"udc-search__icon\">\n          <span className=\"material-symbols-outlined\">search</span>\n        </span>\n        <input\n          type=\"search\"\n          placeholder={placeholder}\n          value={value}\n          onChange={(e) => { setValue(e.target.value); onSearch?.(e.target.value); }}\n        />\n        <button className=\"udc-search__clear\" aria-label=\"Clear\" onClick={clear}>\n          <span className=\"material-symbols-outlined\">clear</span>\n        </button>\n      </div>\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref, computed } from 'vue';\n\nconst props = defineProps({ placeholder: { type: String, default: '" + s.placeholder + "' } });\nconst emit = defineEmits(['search']);\nconst value = ref('');\nconst hasValue = computed(() => value.value.length > 0);\n\nfunction clear() { value.value = ''; emit('search', ''); }\nfunction onInput(e) { value.value = e.target.value; emit('search', e.target.value); }\n</script>\n\n<template>\n  <div class=\"udc-search\"" + stateAttr + " :data-has-value=\"hasValue ? 'true' : 'false'\">\n    <div class=\"udc-search__field\">\n      <span class=\"udc-search__icon\">\n        <span class=\"material-symbols-outlined\">search</span>\n      </span>\n      <input type=\"search\" :placeholder=\"placeholder\" :value=\"value\" @input=\"onInput\" />\n      <button class=\"udc-search__clear\" aria-label=\"Clear\" @click=\"clear\">\n        <span class=\"material-symbols-outlined\">clear</span>\n      </button>\n    </div>\n  </div>\n</template>";

        return { html: html, code: code };
      }
    },

    'tooltip': {
      controls: [
        { key: 'text', label: 'Tooltip text', type: 'text', default: 'Helpful tooltip information' },
        { key: 'position', label: 'Position', type: 'select', default: 'top', options: [
          { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }
        ]}
      ],
      render(s) {
        var posAttr = s.position !== 'top' ? ' data-position="' + s.position + '"' : '';
        var code = '<span class="udc-tooltip-wrapper">\n  <button class="udc-button-secondary">Hover me</button>\n  <span class="udc-tooltip" role="tooltip"' + posAttr + '>' + s.text + '</span>\n</span>';
        var padStyle = s.position === 'top' ? 'padding-top:60px;' : s.position === 'bottom' ? 'padding-bottom:60px;' : s.position === 'left' ? 'padding-left:160px;' : 'padding-right:160px;';
        var html = '<div style="display:flex;justify-content:center;' + padStyle + '">' + code + '</div>';

        var reactCode = "function TooltipDemo() {\n  return (\n    <span className=\"udc-tooltip-wrapper\">\n      <button className=\"udc-button-secondary\">Hover me</button>\n      <span className=\"udc-tooltip\" role=\"tooltip\"" + posAttr + ">\n        " + s.text + "\n      </span>\n    </span>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ text: String, position: String });\n</script>\n\n<template>\n  <span class=\"udc-tooltip-wrapper\">\n    <slot />\n    <span class=\"udc-tooltip\" role=\"tooltip\"" + posAttr + ">\n      " + s.text + "\n    </span>\n  </span>\n</template>";

        return { html: html, code: code };
      }
    }
  };

  /* ========================================================================
     6b. IMPLEMENTATION REFERENCE DATA
     ======================================================================== */
  var IMPL_DATA = {
    button: {
      cssFile: 'uds/components/button.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-interactive-default','--uds-color-surface-interactive-hover',
          '--uds-color-surface-interactive-active','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover',
          '--uds-color-surface-interactive-subtle-active',
          '--uds-color-surface-interactive-red','--uds-color-surface-interactive-red-hover',
          '--uds-color-surface-interactive-red-active','--uds-color-surface-interactive-red-subtle-hover',
          '--uds-color-surface-interactive-red-subtle-active','--uds-color-surface-white',
          '--uds-color-text-inverse','--uds-color-text-brand','--uds-color-text-disabled-bold',
          '--uds-color-text-error',
          '--uds-color-border-interactive','--uds-color-border-error',
          '--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium'],
        'Space': ['--uds-space-075','--uds-space-100','--uds-space-150','--uds-space-200'],
        'Border': ['--uds-border-radius-input']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <!-- Primary -->\n  <button class="udc-button-primary">Save changes</button>\n\n  <!-- Secondary -->\n  <button class="udc-button-secondary">Cancel</button>\n\n  <!-- Ghost -->\n  <button class="udc-button-ghost">Learn more</button>\n\n  <!-- With leading icon -->\n  <button class="udc-button-primary" data-icon-position="leading">\n    <span class="material-symbols-outlined">add</span>\n    New item\n  </button>\n\n  <!-- Small + destructive -->\n  <div data-btn-color="danger">\n    <button class="udc-button-primary" data-size="sm">Delete</button>\n  </div>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Button({ variant = \'primary\', size, destructive, icon, iconPosition, disabled, children }) {\n  const cls = \'udc-button-\' + variant;\n  const attrs = {};\n  if (size) attrs[\'data-size\'] = size;\n  if (iconPosition) attrs[\'data-icon-position\'] = iconPosition;\n  if (disabled) attrs.disabled = true;\n\n  const btn = (\n    <button className={cls} {...attrs}>\n      {icon && iconPosition === \'leading\' && <span className=\"material-symbols-outlined\">{icon}</span>}\n      {children}\n      {icon && iconPosition === \'trailing\' && <span className=\"material-symbols-outlined\">{icon}</span>}\n    </button>\n  );\n\n  return destructive ? <div data-btn-color=\"danger\">{btn}</div> : btn;\n}\n\nexport default Button;\n\n/* Usage:\n  <Button variant=\"primary\" icon=\"add\" iconPosition=\"leading\">New item</Button>\n  <Button variant=\"secondary\">Cancel</Button>\n  <Button variant=\"primary\" destructive>Delete</Button>\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  variant: { type: String, default: \'primary\' },\n  size: String,\n  destructive: Boolean,\n  icon: String,\n  iconPosition: String,\n  disabled: Boolean,\n});\n</script>\n\n<template>\n  <div v-if=\"destructive\" data-btn-color=\"danger\">\n    <button :class=\"\'udc-button-\' + variant\" :data-size=\"size\" :data-icon-position=\"iconPosition\" :disabled=\"disabled\">\n      <span v-if=\"icon && iconPosition === \'leading\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n      <slot />\n      <span v-if=\"icon && iconPosition === \'trailing\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n    </button>\n  </div>\n  <button v-else :class=\"\'udc-button-\' + variant\" :data-size=\"size\" :data-icon-position=\"iconPosition\" :disabled=\"disabled\">\n    <span v-if=\"icon && iconPosition === \'leading\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n    <slot />\n    <span v-if=\"icon && iconPosition === \'trailing\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n  </button>\n</template>';
      }
    },

    'text-input': {
      cssFile: 'uds/components/text-input.css',
      jsFunc: 'initTextInput',
      tokens: {
        'Color': [
          '--uds-color-surface-main','--uds-color-surface-white',
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active',
          '--uds-color-text-primary','--uds-color-text-secondary','--uds-color-text-disabled',
          '--uds-color-text-disabled-bold','--uds-color-text-error',
          '--uds-color-border-primary','--uds-color-border-error',
          '--uds-color-border-outline-focus-visible',
          '--uds-color-icon-secondary','--uds-color-icon-error'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-xs','--uds-font-size-sm','--uds-font-size-base',
          '--uds-font-line-height-xs','--uds-font-line-height-sm','--uds-font-line-height-base',
          '--uds-font-weight-regular','--uds-font-weight-medium','--uds-font-weight-bold'
        ],
        'Space': ['--uds-space-050','--uds-space-075','--uds-space-100'],
        'Border': ['--uds-border-radius-input']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-text-input">\n    <label class="udc-text-input__label">Email address</label>\n    <div class="udc-text-input__field">\n      <input type="email" placeholder="you@example.com" required />\n    </div>\n    <div class="udc-text-input__helper">\n      <span>We\'ll never share your email</span>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState, useRef, useCallback } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction TextInput({ label, helper, placeholder, required, maxLength, disabled, state }) {\n  const [value, setValue] = useState(\'\');\n  const [error, setError] = useState(\'\');\n  const inputRef = useRef(null);\n\n  const validate = useCallback(() => {\n    if (required && !value.trim()) {\n      setError(\'This field is required\');\n      return;\n    }\n    setError(\'\');\n  }, [value, required]);\n\n  const dataState = error ? \'error\' : state;\n\n  return (\n    <div className=\"udc-text-input\" data-state={dataState || undefined}>\n      {label && <label className=\"udc-text-input__label\">{label}</label>}\n      <div className=\"udc-text-input__field\">\n        <input\n          ref={inputRef}\n          value={value}\n          onChange={e => setValue(e.target.value)}\n          onBlur={validate}\n          placeholder={placeholder}\n          required={required}\n          maxLength={maxLength}\n          disabled={disabled}\n        />\n      </div>\n      <div className=\"udc-text-input__helper\">\n        <span>{error || helper}</span>\n        {maxLength && <span className=\"udc-text-input__counter\">{value.length}/{maxLength}</span>}\n      </div>\n    </div>\n  );\n}\n\nexport default TextInput;';
      },
      vue: function () {
        return '<script setup>\nimport { ref, computed } from \'vue\';\n\nconst props = defineProps({\n  label: String,\n  helper: String,\n  placeholder: String,\n  required: Boolean,\n  maxLength: Number,\n  disabled: Boolean,\n  state: String,\n});\n\nconst value = ref(\'\');\nconst error = ref(\'\');\n\nfunction validate() {\n  if (props.required && !value.value.trim()) {\n    error.value = \'This field is required\';\n    return;\n  }\n  error.value = \'\';\n}\n\nconst dataState = computed(() => error.value ? \'error\' : props.state);\n</script>\n\n<template>\n  <div class=\"udc-text-input\" :data-state=\"dataState || undefined\">\n    <label v-if=\"label\" class=\"udc-text-input__label\">{{ label }}</label>\n    <div class=\"udc-text-input__field\">\n      <input\n        v-model=\"value\"\n        @blur=\"validate\"\n        :placeholder=\"placeholder\"\n        :required=\"required\"\n        :maxlength=\"maxLength\"\n        :disabled=\"disabled\"\n      />\n    </div>\n    <div class=\"udc-text-input__helper\">\n      <span>{{ error || helper }}</span>\n      <span v-if=\"maxLength\" class=\"udc-text-input__counter\">{{ value.length }}/{{ maxLength }}</span>\n    </div>\n  </div>\n</template>';
      }
    },

    dropdown: {
      cssFile: 'uds/components/dropdown.css',
      jsFunc: 'initDropdown',
      tokens: {
        'Color': [
          '--uds-color-surface-interactive-neutral','--uds-color-surface-interactive-none',
          '--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active',
          '--uds-color-surface-white',
          '--uds-color-text-primary','--uds-color-text-secondary','--uds-color-text-interactive',
          '--uds-color-text-disabled-bold','--uds-color-text-error',
          '--uds-color-icon-interactive','--uds-color-icon-error','--uds-color-icon-disabled',
          '--uds-color-border-primary','--uds-color-border-interactive',
          '--uds-color-border-error','--uds-color-border-disabled',
          '--uds-color-border-outline-focus-visible'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-xs','--uds-font-size-sm','--uds-font-size-base',
          '--uds-font-line-height-xs','--uds-font-line-height-sm','--uds-font-line-height-base',
          '--uds-font-weight-regular','--uds-font-weight-medium','--uds-font-weight-bold'
        ],
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-150','--uds-space-200'],
        'Border': ['--uds-border-radius-input']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-dropdown">\n    <label class="udc-dropdown__label">Favourite fruit</label>\n    <div class="udc-dropdown__trigger" tabindex="0" role="combobox"\n         aria-expanded="false" aria-haspopup="listbox">\n      <span class="udc-dropdown__leading-icon">\n        <span class="material-symbols-outlined">add_circle_outline</span>\n      </span>\n      <span class="udc-dropdown__value" data-placeholder>Choose...</span>\n      <span class="udc-dropdown__chevron">\n        <span class="material-symbols-outlined">keyboard_arrow_down</span>\n      </span>\n    </div>\n    <div class="udc-dropdown__helper"><span>Pick one fruit</span></div>\n    <div class="udc-dropdown__list" role="listbox">\n      <div class="udc-dropdown__item" role="option">Apple</div>\n      <div class="udc-dropdown__item" role="option">Banana</div>\n      <div class="udc-dropdown__item" role="option">Cherry</div>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState, useRef, useEffect } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction Dropdown({ label, helper, placeholder, options, required, disabled, state }) {\n  const [open, setOpen] = useState(false);\n  const [selected, setSelected] = useState(\'\');\n  const ref = useRef(null);\n\n  useEffect(() => {\n    const handler = (e) => {\n      if (ref.current && !ref.current.contains(e.target)) setOpen(false);\n    };\n    document.addEventListener(\'click\', handler);\n    return () => document.removeEventListener(\'click\', handler);\n  }, []);\n\n  return (\n    <div className=\"udc-dropdown\" ref={ref} data-state={state || undefined} data-open={open}>\n      {label && <label className=\"udc-dropdown__label\">{label}{required && <span className=\"udc-dropdown__required\" />}</label>}\n      <div\n        className=\"udc-dropdown__trigger\"\n        tabIndex={disabled ? -1 : 0}\n        role=\"combobox\"\n        aria-expanded={open}\n        aria-haspopup=\"listbox\"\n        aria-disabled={disabled || undefined}\n        onClick={() => !disabled && setOpen(!open)}\n      >\n        <span className=\"udc-dropdown__value\" data-placeholder={!selected || undefined}>\n          {selected || placeholder}\n        </span>\n        <span className=\"udc-dropdown__chevron\">\n          <span className=\"material-symbols-outlined\">keyboard_arrow_down</span>\n        </span>\n      </div>\n      {helper && <div className=\"udc-dropdown__helper\"><span>{helper}</span></div>}\n      {open && (\n        <div className=\"udc-dropdown__list\" role=\"listbox\">\n          {options.map((opt) => (\n            <div\n              key={opt}\n              className=\"udc-dropdown__item\"\n              role=\"option\"\n              aria-selected={selected === opt}\n              onClick={() => { setSelected(opt); setOpen(false); }}\n            >\n              {opt}\n            </div>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}\n\nexport default Dropdown;\n\n/* Usage:\n  <Dropdown\n    label=\"Fruit\"\n    placeholder=\"Choose...\"\n    options={[\'Apple\', \'Banana\', \'Cherry\']}\n    helper=\"Pick one\"\n  />\n*/';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  label: String,\n  helper: String,\n  placeholder: String,\n  options: Array,\n  required: Boolean,\n  disabled: Boolean,\n  state: String,\n});\n\nconst open = ref(false);\nconst selected = ref(\'\');\n\nfunction select(opt) {\n  selected.value = opt;\n  open.value = false;\n}\n</script>\n\n<template>\n  <div class=\"udc-dropdown\" :data-state=\"state || undefined\" :data-open=\"open\">\n    <label v-if=\"label\" class=\"udc-dropdown__label\">\n      {{ label }}\n      <span v-if=\"required\" class=\"udc-dropdown__required\" />\n    </label>\n    <div\n      class=\"udc-dropdown__trigger\"\n      :tabindex=\"disabled ? -1 : 0\"\n      role=\"combobox\"\n      :aria-expanded=\"open\"\n      aria-haspopup=\"listbox\"\n      :aria-disabled=\"disabled || undefined\"\n      @click=\"!disabled && (open = !open)\"\n    >\n      <span class=\"udc-dropdown__value\" :data-placeholder=\"!selected || undefined\">\n        {{ selected || placeholder }}\n      </span>\n      <span class=\"udc-dropdown__chevron\">\n        <span class=\"material-symbols-outlined\">keyboard_arrow_down</span>\n      </span>\n    </div>\n    <div v-if=\"helper\" class=\"udc-dropdown__helper\"><span>{{ helper }}</span></div>\n    <div v-if=\"open\" class=\"udc-dropdown__list\" role=\"listbox\">\n      <div\n        v-for=\"opt in options\"\n        :key=\"opt\"\n        class=\"udc-dropdown__item\"\n        role=\"option\"\n        :aria-selected=\"selected === opt\"\n        @click=\"select(opt)\"\n      >\n        {{ opt }}\n      </div>\n    </div>\n  </div>\n</template>';
      }
    },

    checkbox: {
      cssFile: 'uds/components/checkbox.css',
      jsFunc: 'initCheckbox',
      tokens: {
        'Color': [
          '--uds-color-surface-interactive-default','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-red-subtle',
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-error',
          '--uds-color-icon-inverse','--uds-color-icon-error',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-error',
          '--uds-color-border-interactive','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium','--uds-font-weight-bold'],
        'Space': ['--uds-space-100']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <label class="udc-checkbox">\n    <input type="checkbox" />\n    <span class="udc-checkbox__control"></span>\n    <span class="udc-checkbox__label">Accept terms</span>\n  </label>\n\n  <!-- Required -->\n  <label class="udc-checkbox" data-required="true">\n    <input type="checkbox" required />\n    <span class="udc-checkbox__control"></span>\n    <span class="udc-checkbox__label">I agree</span>\n    <span class="udc-checkbox__required"></span>\n  </label>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction Checkbox({ label, checked: initial = false, required, disabled, error, onChange }) {\n  const [checked, setChecked] = useState(initial);\n\n  function handleChange(e) {\n    setChecked(e.target.checked);\n    onChange?.(e.target.checked);\n  }\n\n  return (\n    <label className=\"udc-checkbox\" data-state={error ? \'error\' : undefined} data-required={required || undefined}>\n      <input type=\"checkbox\" checked={checked} onChange={handleChange} disabled={disabled} required={required} />\n      <span className=\"udc-checkbox__control\" />\n      <span className=\"udc-checkbox__label\">{label}</span>\n      {required && <span className=\"udc-checkbox__required\" />}\n    </label>\n  );\n}\n\nexport default Checkbox;';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  label: String,\n  required: Boolean,\n  disabled: Boolean,\n  error: Boolean,\n  modelValue: Boolean,\n});\n\nconst emit = defineEmits([\'update:modelValue\']);\nconst checked = ref(props.modelValue);\n\nfunction toggle(e) {\n  checked.value = e.target.checked;\n  emit(\'update:modelValue\', checked.value);\n}\n</script>\n\n<template>\n  <label class=\"udc-checkbox\" :data-state=\"error ? \'error\' : undefined\" :data-required=\"required || undefined\">\n    <input type=\"checkbox\" :checked=\"checked\" @change=\"toggle\" :disabled=\"disabled\" :required=\"required\" />\n    <span class=\"udc-checkbox__control\" />\n    <span class=\"udc-checkbox__label\">{{ label }}</span>\n    <span v-if=\"required\" class=\"udc-checkbox__required\" />\n  </label>\n</template>';
      }
    },

    radio: {
      cssFile: 'uds/components/radio.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-error',
          '--uds-color-text-interactive',
          '--uds-color-icon-error','--uds-color-icon-interactive',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-error',
          '--uds-color-border-interactive','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-sm','--uds-font-size-base','--uds-font-line-height-sm','--uds-font-line-height-base','--uds-font-weight-medium','--uds-font-weight-bold'],
        'Space': ['--uds-space-050','--uds-space-100']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <fieldset class="udc-radio-group">\n    <legend class="udc-radio-group__legend">Preferred contact</legend>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="email" checked />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">Email</span>\n    </label>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="phone" />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">Phone</span>\n    </label>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="sms" />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">SMS</span>\n    </label>\n  </fieldset>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction RadioGroup({ legend, name, options, value: initial, disabled, error, onChange }) {\n  const [value, setValue] = useState(initial || options[0]?.value);\n\n  function handleChange(v) {\n    setValue(v);\n    onChange?.(v);\n  }\n\n  return (\n    <fieldset className=\"udc-radio-group\" data-state={error ? \'error\' : undefined}>\n      {legend && <legend className=\"udc-radio-group__legend\">{legend}</legend>}\n      {options.map(opt => (\n        <label key={opt.value} className=\"udc-radio\">\n          <input\n            type=\"radio\" name={name} value={opt.value}\n            checked={value === opt.value}\n            onChange={() => handleChange(opt.value)}\n            disabled={disabled}\n          />\n          <span className=\"udc-radio__control\" />\n          <span className=\"udc-radio__label\">{opt.label}</span>\n        </label>\n      ))}\n    </fieldset>\n  );\n}\n\nexport default RadioGroup;\n\n/* Usage:\n  <RadioGroup\n    legend=\"Contact method\"\n    name=\"contact\"\n    options={[\n      { value: \'email\', label: \'Email\' },\n      { value: \'phone\', label: \'Phone\' },\n    ]}\n  />\n*/';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  legend: String,\n  name: String,\n  options: Array,\n  modelValue: String,\n  disabled: Boolean,\n  error: Boolean,\n});\n\nconst emit = defineEmits([\'update:modelValue\']);\nconst selected = ref(props.modelValue || props.options?.[0]?.value);\n\nfunction pick(val) {\n  selected.value = val;\n  emit(\'update:modelValue\', val);\n}\n</script>\n\n<template>\n  <fieldset class=\"udc-radio-group\" :data-state=\"error ? \'error\' : undefined\">\n    <legend v-if=\"legend\" class=\"udc-radio-group__legend\">{{ legend }}</legend>\n    <label v-for=\"opt in options\" :key=\"opt.value\" class=\"udc-radio\">\n      <input type=\"radio\" :name=\"name\" :value=\"opt.value\" :checked=\"selected === opt.value\" @change=\"pick(opt.value)\" :disabled=\"disabled\" />\n      <span class=\"udc-radio__control\" />\n      <span class=\"udc-radio__label\">{{ opt.label }}</span>\n    </label>\n  </fieldset>\n</template>';
      }
    },

    badge: {
      cssFile: 'uds/components/badge.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-alt','--uds-color-surface-bold',
          '--uds-color-surface-info','--uds-color-surface-info-subtle',
          '--uds-color-surface-success','--uds-color-surface-success-subtle',
          '--uds-color-surface-error','--uds-color-surface-error-subtle',
          '--uds-color-surface-warning','--uds-color-surface-warning-subtle',
          '--uds-color-text-inverse','--uds-color-text-secondary',
          '--uds-color-text-info','--uds-color-text-success','--uds-color-text-error','--uds-color-text-warning'
        ],
        'Font': ['--uds-font-family','--uds-font-size-xs','--uds-font-size-base','--uds-font-line-height-sm','--uds-font-line-height-base','--uds-font-weight-regular'],
        'Space': ['--uds-space-025','--uds-space-050','--uds-space-100'],
        'Border': ['--uds-border-radius-container-sm']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <span class="udc-badge">Default</span>\n  <span class="udc-badge" data-variant="success">Active</span>\n  <span class="udc-badge" data-variant="error">Failed</span>\n  <span class="udc-badge" data-variant="warning">Pending</span>\n  <span class="udc-badge" data-variant="secondary">Draft</span>\n\n  <!-- Subtle / tinted -->\n  <span class="udc-badge" data-prominent="false">Info</span>\n  <span class="udc-badge" data-variant="success" data-prominent="false">Active</span>\n\n  <!-- Small -->\n  <span class="udc-badge" data-size="sm">Sm</span>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Badge({ variant, prominent = true, size, children }) {\n  return (\n    <span\n      className=\"udc-badge\"\n      data-variant={variant || undefined}\n      data-prominent={prominent === false ? \'false\' : undefined}\n      data-size={size || undefined}\n    >\n      {children}\n    </span>\n  );\n}\n\nexport default Badge;\n\n/* Usage:\n  <Badge>Default</Badge>\n  <Badge variant=\"success\">Active</Badge>\n  <Badge variant=\"error\" prominent={false}>Failed</Badge>\n  <Badge size=\"sm\">Sm</Badge>\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  variant: String,\n  prominent: { type: Boolean, default: true },\n  size: String,\n});\n</script>\n\n<template>\n  <span\n    class=\"udc-badge\"\n    :data-variant=\"variant || undefined\"\n    :data-prominent=\"prominent === false ? \'false\' : undefined\"\n    :data-size=\"size || undefined\"\n  >\n    <slot />\n  </span>\n</template>';
      }
    },

    breadcrumb: {
      cssFile: 'uds/components/breadcrumb.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-main','--uds-color-text-primary','--uds-color-text-interactive-neutral',
          '--uds-color-icon-secondary','--uds-color-border-tertiary'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-regular','--uds-font-weight-bold'],
        'Space': ['--uds-space-150','--uds-space-200','--uds-space-300'],
        'Border': ['--uds-border-radius-container-xl']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <nav class="udc-breadcrumb" aria-label="Breadcrumb">\n    <ol>\n      <li><a href="/">Home</a></li>\n      <li><a href="/products">Products</a></li>\n      <li><a href="/products/widgets" aria-current="page">Widgets</a></li>\n    </ol>\n  </nav>\n\n  <!-- Frameless variant -->\n  <nav class="udc-breadcrumb" data-frameless aria-label="Breadcrumb">\n    <ol>\n      <li><a href="/">Home</a></li>\n      <li><a href="/settings" aria-current="page">Settings</a></li>\n    </ol>\n  </nav>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Breadcrumb({ items, frameless }) {\n  return (\n    <nav className=\"udc-breadcrumb\" data-frameless={frameless || undefined} aria-label=\"Breadcrumb\">\n      <ol>\n        {items.map((item, i) => (\n          <li key={item.href}>\n            <a href={item.href} aria-current={i === items.length - 1 ? \'page\' : undefined}>\n              {item.label}\n            </a>\n          </li>\n        ))}\n      </ol>\n    </nav>\n  );\n}\n\nexport default Breadcrumb;\n\n/* Usage:\n  <Breadcrumb items={[\n    { href: \'/\', label: \'Home\' },\n    { href: \'/products\', label: \'Products\' },\n    { href: \'/products/widgets\', label: \'Widgets\' },\n  ]} />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  items: Array,\n  frameless: Boolean,\n});\n</script>\n\n<template>\n  <nav class=\"udc-breadcrumb\" :data-frameless=\"frameless || undefined\" aria-label=\"Breadcrumb\">\n    <ol>\n      <li v-for=\"(item, i) in items\" :key=\"item.href\">\n        <a :href=\"item.href\" :aria-current=\"i === items.length - 1 ? \'page\' : undefined\">\n          {{ item.label }}\n        </a>\n      </li>\n    </ol>\n  </nav>\n</template>';
      }
    },

    tabs: {
      cssFile: 'uds/components/tab-horizontal.css',
      jsFunc: 'initTabs',
      tokens: {
        'Color': [
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-interactive',
          '--uds-color-surface-interactive-subtle-hover',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-interactive',
          '--uds-color-border-interactive-hover','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium'],
        'Space': ['--uds-space-100','--uds-space-200','--uds-space-300']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-tabs" role="tablist">\n    <button class="udc-tab" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Overview</button>\n    <button class="udc-tab" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Details</button>\n    <button class="udc-tab" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" disabled>Disabled</button>\n  </div>\n\n  <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Overview content</div>\n  <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Details content</div>\n  <div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Disabled content</div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction Tabs({ tabs, size }) {\n  const [active, setActive] = useState(tabs[0]?.id);\n\n  return (\n    <>\n      <div className=\"udc-tabs\" role=\"tablist\" data-size={size || undefined}>\n        {tabs.map(tab => (\n          <button\n            key={tab.id}\n            className=\"udc-tab\"\n            role=\"tab\"\n            aria-selected={active === tab.id}\n            onClick={() => !tab.disabled && setActive(tab.id)}\n            disabled={tab.disabled}\n          >\n            {tab.label}\n          </button>\n        ))}\n      </div>\n      {tabs.map(tab => (\n        <div key={tab.id} role=\"tabpanel\" hidden={active !== tab.id}>\n          {tab.content}\n        </div>\n      ))}\n    </>\n  );\n}\n\nexport default Tabs;\n\n/* Usage:\n  <Tabs tabs={[\n    { id: \'overview\', label: \'Overview\', content: <p>Overview content</p> },\n    { id: \'details\', label: \'Details\', content: <p>Details content</p> },\n    { id: \'disabled\', label: \'Disabled\', content: null, disabled: true },\n  ]} />\n*/';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  tabs: Array,\n  size: String,\n});\n\nconst active = ref(props.tabs?.[0]?.id);\n</script>\n\n<template>\n  <div class=\"udc-tabs\" role=\"tablist\" :data-size=\"size || undefined\">\n    <button\n      v-for=\"tab in tabs\" :key=\"tab.id\"\n      class=\"udc-tab\" role=\"tab\"\n      :aria-selected=\"active === tab.id\"\n      @click=\"!tab.disabled && (active = tab.id)\"\n      :disabled=\"tab.disabled\"\n    >\n      {{ tab.label }}\n    </button>\n  </div>\n  <div v-for=\"tab in tabs\" :key=\"tab.id\" role=\"tabpanel\" :hidden=\"active !== tab.id\">\n    <slot :name=\"tab.id\" />\n  </div>\n</template>';
      }
    },

    divider: {
      cssFile: 'uds/components/divider.css',
      jsFunc: null,
      tokens: {
        'Color': ['--uds-color-border-tertiary'],
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-150','--uds-space-200'],
        'Border': ['--uds-border-radius-full']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <p>Content above</p>\n  <hr class="udc-divider-horizontal" />\n  <p>Content below</p>\n\n  <!-- With padding variants -->\n  <hr class="udc-divider-horizontal" data-padding="md" />\n  <hr class="udc-divider-horizontal" data-padding="lg" />\n  <hr class="udc-divider-horizontal" data-padding="xl" />\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Divider({ padding }) {\n  return <hr className=\"udc-divider-horizontal\" data-padding={padding || undefined} />;\n}\n\nexport default Divider;\n\n/* Usage:\n  <Divider />\n  <Divider padding=\"md\" />\n  <Divider padding=\"lg\" />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({ padding: String });\n</script>\n\n<template>\n  <hr class=\"udc-divider-horizontal\" :data-padding=\"padding || undefined\" />\n</template>';
      }
    },

    'icon-wrapper': {
      cssFile: 'uds/components/icon-wrapper.css',
      jsFunc: null,
      tokens: {},
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <span class="udc-icon-wrapper" data-size="16"><span class="material-symbols-outlined">info</span></span>\n  <span class="udc-icon-wrapper" data-size="24"><span class="material-symbols-outlined">info</span></span>\n  <span class="udc-icon-wrapper" data-size="48"><span class="material-symbols-outlined">info</span></span>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Icon({ name, size = 24 }) {\n  return (\n    <span className=\"udc-icon-wrapper\" data-size={size}>\n      <span className=\"material-symbols-outlined\">{name}</span>\n    </span>\n  );\n}\n\nexport default Icon;\n\n/* Usage:\n  <Icon name=\"info\" size={16} />\n  <Icon name=\"settings\" />\n  <Icon name=\"home\" size={48} />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  name: String,\n  size: { type: [String, Number], default: 24 },\n});\n</script>\n\n<template>\n  <span class=\"udc-icon-wrapper\" :data-size=\"size\">\n    <span class=\"material-symbols-outlined\">{{ name }}</span>\n  </span>\n</template>';
      }
    },

    spacer: {
      cssFile: 'uds/components/spacer.css',
      jsFunc: null,
      tokens: {
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-150','--uds-space-200','--uds-space-300','--uds-space-400','--uds-space-500','--uds-space-600']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div style="display:flex; flex-direction:column;">\n    <p>First section</p>\n    <div class="udc-spacer" data-size="200"></div>\n    <p>Second section</p>\n    <div class="udc-spacer" data-size="400"></div>\n    <p>Third section</p>\n  </div>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Spacer({ size = \'200\' }) {\n  return <div className=\"udc-spacer\" data-size={size} />;\n}\n\nexport default Spacer;\n\n/* Usage:\n  <Spacer size=\"100\" />\n  <Spacer />            {/* 200 default */}\n  <Spacer size=\"400\" />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({ size: { type: String, default: \'200\' } });\n</script>\n\n<template>\n  <div class=\"udc-spacer\" :data-size=\"size\" />\n</template>';
      }
    },

    'nav-header': {
      cssFile: 'uds/components/nav-header.css',
      jsFunc: 'initNavBento',
      tokens: {
        'Surface': [
          '--uds-color-surface-main','--uds-color-surface-interactive-subtle-hover',
          '--uds-color-surface-interactive-active','--uds-color-surface-interactive-hover',
          '--uds-color-surface-page'
        ],
        'Text': [
          '--uds-color-text-primary','--uds-color-text-inverse','--uds-color-text-secondary',
          '--uds-color-text-interactive'
        ],
        'Icon': [
          '--uds-color-icon-secondary','--uds-color-icon-interactive'
        ],
        'Border': [
          '--uds-color-border-secondary',
          '--uds-border-radius-container-full','--uds-border-radius-container-lg',
          '--uds-border-radius-container-xl','--uds-border-radius-input'
        ],
        'Space': [
          '--uds-space-025','--uds-space-050','--uds-space-075','--uds-space-100',
          '--uds-space-150','--uds-space-200','--uds-space-250','--uds-space-300'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-line-height-base',
          '--uds-font-weight-medium','--uds-font-weight-bold'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-nav-header">\n    <div class="udc-nav-header__left">\n      <div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;">apartment</span></div>\n      <div class="udc-nav-bento-wrapper">\n        <button class="udc-nav-bento-button" aria-expanded="false">\n          <span class="material-symbols-outlined">dashboard</span>\n          Boardroom\n          <span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>\n        </button>\n        <div class="udc-nav-bento" data-open="false">\n          <div class="udc-nav-bento__list">\n            <button class="udc-nav-button" aria-selected="true"><span class="material-symbols-outlined">space_dashboard</span><span class="udc-nav-button__label">Dashboard</span></button>\n            <button class="udc-nav-button"><span class="material-symbols-outlined">book</span><span class="udc-nav-button__label">Leasing / CRM</span></button>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="udc-nav-header__center">\n      <div class="udc-nav-search">\n        <span class="material-symbols-outlined">auto_awesome</span>\n        <input class="udc-nav-search__input" type="text" placeholder="Search or ask a question">\n      </div>\n    </div>\n    <div class="udc-nav-header__right">\n      <div class="udc-nav-account">\n        <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>\n        <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">settings</span></button>\n        <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>\n      </div>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState, useRef, useEffect } from 'react';\nimport './uds/uds.css';\n\nfunction NavBento({ appName, open, onToggle }) {\n  const ref = useRef(null);\n\n  useEffect(() => {\n    function close(e) {\n      if (ref.current && !ref.current.contains(e.target)) onToggle(false);\n    }\n    document.addEventListener('click', close);\n    return () => document.removeEventListener('click', close);\n  }, [onToggle]);\n\n  return (\n    <div className=\"udc-nav-bento-wrapper\" ref={ref}>\n      <button className=\"udc-nav-bento-button\" aria-expanded={open} onClick={() => onToggle(!open)}>\n        <span className=\"material-symbols-outlined\">dashboard</span>\n        {appName}\n        <span className=\"material-symbols-outlined udc-nav-bento-button__chevron\">keyboard_arrow_down</span>\n      </button>\n      <div className=\"udc-nav-bento\" data-open={open}>\n        <div className=\"udc-nav-bento__list\">\n          <button className=\"udc-nav-button\" aria-selected=\"true\">\n            <span className=\"material-symbols-outlined\">space_dashboard</span>\n            <span className=\"udc-nav-button__label\">Dashboard</span>\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nexport default function NavHeader() {\n  const [bentoOpen, setBentoOpen] = useState(false);\n  return (\n    <div className=\"udc-nav-header\">\n      <div className=\"udc-nav-header__left\">\n        <div className=\"udc-nav-logo\"><span className=\"material-symbols-outlined\">apartment</span></div>\n        <NavBento appName=\"Boardroom\" open={bentoOpen} onToggle={setBentoOpen} />\n      </div>\n      <div className=\"udc-nav-header__right\">\n        <button className=\"udc-button-ghost\" data-icon-only><span className=\"material-symbols-outlined\">notifications</span></button>\n        <button className=\"udc-button-ghost\" data-icon-only><span className=\"material-symbols-outlined\">account_circle</span></button>\n      </div>\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\nconst bentoOpen = ref(false);\n</script>\n\n<template>\n  <div class=\"udc-nav-header\">\n    <div class=\"udc-nav-header__left\">\n      <div class=\"udc-nav-logo\">…</div>\n      <div class=\"udc-nav-bento-wrapper\">\n        <button class=\"udc-nav-bento-button\" :aria-expanded=\"bentoOpen\" @click=\"bentoOpen = !bentoOpen\">\n          <span class=\"material-symbols-outlined\">dashboard</span>\n          Boardroom\n          <span class=\"material-symbols-outlined udc-nav-bento-button__chevron\">keyboard_arrow_down</span>\n        </button>\n        <div class=\"udc-nav-bento\" :data-open=\"bentoOpen\">…</div>\n      </div>\n    </div>\n    <div class=\"udc-nav-header__center\">…</div>\n    <div class=\"udc-nav-header__right\">…</div>\n  </div>\n</template>";
      }
    },

    'data-table': {
      cssFile: 'uds/components/data-table.css',
      jsFunc: 'initDataTable',
      tokens: {
        'Surface': [
          '--uds-color-surface-alt','--uds-color-surface-interactive-none',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-info-subtle',
          '--uds-color-surface-interactive-red-subtle'
        ],
        'Text': ['--uds-color-text-primary'],
        'Icon': ['--uds-color-icon-secondary','--uds-color-icon-interactive'],
        'Border': ['--uds-color-border-secondary','--uds-border-radius-container-sm'],
        'Space': ['--uds-space-075','--uds-space-100','--uds-space-200'],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-weight-bold',
          '--uds-font-weight-regular','--uds-font-line-height-base'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-data-table">\n    <table>\n      <thead>\n        <tr>\n          <th class="udc-dt-check"><input type="checkbox" /></th>\n          <th>Name <span class="udc-dt-sort"></span></th>\n          <th>Status</th>\n          <th class="udc-dt-align-right">Amount</th>\n          <th class="udc-dt-action"></th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td class="udc-dt-check"><input type="checkbox" /></td>\n          <td>Brian Smith</td>\n          <td><span class="udc-badge" data-variant="success">Delivered</span></td>\n          <td class="udc-dt-align-right">$75</td>\n          <td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nconst rows = [\n  { name: 'Brian Smith', status: 'Delivered', statusVariant: 'success', amount: '$75' },\n  { name: 'Catherine Lee', status: 'Low Confidence', statusVariant: 'warning', amount: '$100' },\n];\n\nexport default function DataTable() {\n  const [checked, setChecked] = useState(new Set());\n\n  function toggleRow(i) { setChecked(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; }); }\n  function toggleAll() { setChecked(prev => prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i))); }\n\n  return (\n    <div className=\"udc-data-table\">\n      <table>\n        <thead><tr>\n          <th className=\"udc-dt-check\"><input type=\"checkbox\" checked={checked.size === rows.length} onChange={toggleAll} /></th>\n          <th>Name</th><th>Status</th><th className=\"udc-dt-align-right\">Amount</th>\n        </tr></thead>\n        <tbody>\n          {rows.map((row, i) => (\n            <tr key={i}>\n              <td className=\"udc-dt-check\"><input type=\"checkbox\" checked={checked.has(i)} onChange={() => toggleRow(i)} /></td>\n              <td>{row.name}</td>\n              <td><span className=\"udc-badge\" data-variant={row.statusVariant}>{row.status}</span></td>\n              <td className=\"udc-dt-align-right\">{row.amount}</td>\n            </tr>\n          ))}\n        </tbody>\n      </table>\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\nconst rows = [\n  { name: 'Brian Smith', status: 'Delivered', statusVariant: 'success', amount: '$75' },\n  { name: 'Catherine Lee', status: 'Low Confidence', statusVariant: 'warning', amount: '$100' },\n];\nconst checked = ref(new Set());\n\nfunction toggleRow(i) { const s = new Set(checked.value); s.has(i) ? s.delete(i) : s.add(i); checked.value = s; }\nfunction toggleAll() { checked.value = checked.value.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)); }\n</script>\n\n<template>\n  <div class=\"udc-data-table\">\n    <table>\n      <thead><tr>\n        <th class=\"udc-dt-check\"><input type=\"checkbox\" :checked=\"checked.size === rows.length\" @change=\"toggleAll\" /></th>\n        <th>Name</th><th>Status</th><th class=\"udc-dt-align-right\">Amount</th>\n      </tr></thead>\n      <tbody>\n        <tr v-for=\"(row, i) in rows\" :key=\"i\">\n          <td class=\"udc-dt-check\"><input type=\"checkbox\" :checked=\"checked.has(i)\" @change=\"toggleRow(i)\" /></td>\n          <td>{{ row.name }}</td>\n          <td><span class=\"udc-badge\" :data-variant=\"row.statusVariant\">{{ row.status }}</span></td>\n          <td class=\"udc-dt-align-right\">{{ row.amount }}</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</template>";
      }
    },
    'tile': {
      cssFile: 'uds/components/tile.css',
      jsFunc: 'initTile',
      tokens: {
        'Surface': [
          '--uds-color-surface-main','--uds-color-surface-interactive-subtle',
          '--uds-color-surface-info-subtle'
        ],
        'Text': ['--uds-color-text-primary','--uds-color-text-error'],
        'Icon': ['--uds-color-icon-secondary'],
        'Border': [
          '--uds-color-border-primary','--uds-color-border-interactive','--uds-color-border-disabled',
          '--uds-color-border-outline-focus-visible','--uds-border-radius-input'
        ],
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-200'],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-weight-bold',
          '--uds-font-weight-regular','--uds-font-line-height-base'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-tile" tabindex="0">\n    <div class="udc-tile__content">\n      <div class="udc-tile__label">Upload CSV<span class="udc-tile__required"></span></div>\n      <div class="udc-tile__body">Import residents from a spreadsheet</div>\n    </div>\n    <span class="udc-tile__chevron">\n      <span class="material-symbols-outlined">chevron_right</span>\n    </span>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nexport default function Tile({ label, body = [], required, showChevron = true, disabled }) {\n  const [selected, setSelected] = useState(false);\n\n  return (\n    <div\n      className=\"udc-tile\"\n      tabIndex={disabled ? -1 : 0}\n      aria-selected={selected}\n      aria-disabled={disabled || undefined}\n      onClick={() => !disabled && setSelected(!selected)}\n    >\n      <div className=\"udc-tile__content\">\n        <div className=\"udc-tile__label\">\n          {label}\n          {required && <span className=\"udc-tile__required\" />}\n        </div>\n        {body.map((line, i) => <div key={i} className=\"udc-tile__body\">{line}</div>)}\n      </div>\n      {showChevron && (\n        <span className=\"udc-tile__chevron\">\n          <span className=\"material-symbols-outlined\">chevron_right</span>\n        </span>\n      )}\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\nconst props = defineProps({\n  label: String,\n  body: { type: Array, default: () => [] },\n  required: Boolean,\n  showChevron: { type: Boolean, default: true },\n  disabled: Boolean\n});\nconst selected = ref(false);\n</script>\n\n<template>\n  <div class=\"udc-tile\" :tabindex=\"disabled ? -1 : 0\"\n    :aria-selected=\"selected\" :aria-disabled=\"disabled || undefined\"\n    @click=\"!disabled && (selected = !selected)\">\n    <div class=\"udc-tile__content\">\n      <div class=\"udc-tile__label\">\n        {{ label }}\n        <span v-if=\"required\" class=\"udc-tile__required\" />\n      </div>\n      <div v-for=\"(line, i) in body\" :key=\"i\" class=\"udc-tile__body\">{{ line }}</div>\n    </div>\n    <span v-if=\"showChevron\" class=\"udc-tile__chevron\">\n      <span class=\"material-symbols-outlined\">chevron_right</span>\n    </span>\n  </div>\n</template>";
      }
    },
    'list': {
      cssFile: 'uds/components/list.css',
      jsFunc: 'initList',
      tokens: {
        'Surface': [
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active',
          '--uds-color-surface-interactive-active'
        ],
        'Text': ['--uds-color-text-primary','--uds-color-text-inverse'],
        'Icon': ['--uds-color-icon-primary','--uds-color-icon-inverse'],
        'Border': [
          '--uds-color-border-outline-focus-visible','--uds-border-radius-input'
        ],
        'Space': ['--uds-space-100','--uds-space-150','--uds-space-200'],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-weight-medium',
          '--uds-font-line-height-base'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-list">\n    <div class="udc-list-item" tabindex="0" aria-selected="true">\n      <span class="udc-list-item__label">Dashboard</span>\n    </div>\n    <div class="udc-list-item" tabindex="0">\n      <span class="udc-list-item__label">Leasing / CRM</span>\n    </div>\n    <div class="udc-list-item" tabindex="0">\n      <span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">add_circle_outline</span></span>\n      <span class="udc-list-item__label">Add new</span>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nconst items = [\n  { label: 'Dashboard' },\n  { label: 'Leasing / CRM' },\n  { label: 'People / Contacts' },\n];\n\nexport default function List({ leadingIcon, trailingIcon }) {\n  const [selected, setSelected] = useState(0);\n\n  return (\n    <div className=\"udc-list\">\n      {items.map((item, i) => (\n        <div\n          key={i}\n          className=\"udc-list-item\"\n          tabIndex={0}\n          aria-selected={selected === i}\n          onClick={() => setSelected(i)}\n        >\n          {leadingIcon && (\n            <span className=\"udc-list-item__leading-icon\">\n              <span className=\"material-symbols-outlined\">{leadingIcon}</span>\n            </span>\n          )}\n          <span className=\"udc-list-item__label\">{item.label}</span>\n          {trailingIcon && (\n            <span className=\"udc-list-item__trailing-icon\">\n              <span className=\"material-symbols-outlined\">{trailingIcon}</span>\n            </span>\n          )}\n        </div>\n      ))}\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\ndefineProps({ leadingIcon: String, trailingIcon: String });\nconst selected = ref(0);\nconst items = [\n  { label: 'Dashboard' },\n  { label: 'Leasing / CRM' },\n  { label: 'People / Contacts' },\n];\n</script>\n\n<template>\n  <div class=\"udc-list\">\n    <div\n      v-for=\"(item, i) in items\" :key=\"i\"\n      class=\"udc-list-item\" tabindex=\"0\"\n      :aria-selected=\"selected === i\"\n      @click=\"selected = i\">\n      <span v-if=\"leadingIcon\" class=\"udc-list-item__leading-icon\">\n        <span class=\"material-symbols-outlined\">{{ leadingIcon }}</span>\n      </span>\n      <span class=\"udc-list-item__label\">{{ item.label }}</span>\n      <span v-if=\"trailingIcon\" class=\"udc-list-item__trailing-icon\">\n        <span class=\"material-symbols-outlined\">{{ trailingIcon }}</span>\n      </span>\n    </div>\n  </div>\n</template>";
      }
    },
    'notification': {
      cssFile: 'uds/components/notification.css',
      jsFunc: 'initNotification',
      tokens: {
        'Surface': [
          '--uds-color-surface-info-subtle','--uds-color-surface-info',
          '--uds-color-surface-success-subtle','--uds-color-surface-success',
          '--uds-color-surface-error-subtle','--uds-color-surface-error',
          '--uds-color-surface-warning-subtle','--uds-color-surface-warning'
        ],
        'Text': [
          '--uds-color-text-info','--uds-color-text-success','--uds-color-text-error',
          '--uds-color-text-warning','--uds-color-text-inverse'
        ],
        'Icon': [
          '--uds-color-icon-info','--uds-color-icon-success','--uds-color-icon-error',
          '--uds-color-icon-warning'
        ],
        'Border': ['--uds-border-radius-container-sm'],
        'Space': ['--uds-space-100','--uds-space-150','--uds-space-200'],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-weight-medium','--uds-font-line-height-base']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-notification" data-variant="info">\n    <span class="udc-notification__icon"><span class="material-symbols-outlined">info</span></span>\n    <span class="udc-notification__text">Informational message</span>\n  </div>\n\n  <div class="udc-notification" data-variant="success" data-prominent="true">\n    <span class="udc-notification__icon"><span class="material-symbols-outlined">check_circle</span></span>\n    <span class="udc-notification__text">Success!</span>\n  </div>\n\n  <div class="udc-notification" data-variant="error" data-inline="true">\n    <span class="udc-notification__icon"><span class="material-symbols-outlined">error_outline</span></span>\n    <span class="udc-notification__text">Something went wrong</span>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nexport default function Notification({ variant = 'info', prominent, inline, message, dismissible }) {\n  const [visible, setVisible] = useState(true);\n  if (!visible) return null;\n\n  const variantIcons = { info: 'info', success: 'check_circle', error: 'error_outline', warning: 'warning_amber' };\n\n  return (\n    <div\n      className=\"udc-notification\"\n      data-variant={variant}\n      data-prominent={prominent || undefined}\n      data-inline={inline || undefined}\n    >\n      <span className=\"udc-notification__icon\">\n        <span className=\"material-symbols-outlined\">{variantIcons[variant]}</span>\n      </span>\n      <span className=\"udc-notification__text\">{message}</span>\n      {dismissible && (\n        <button className=\"udc-notification__close\" aria-label=\"Dismiss\" onClick={() => setVisible(false)}>\n          <span className=\"material-symbols-outlined\">close</span>\n        </button>\n      )}\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\nconst props = defineProps({\n  variant: { type: String, default: 'info' },\n  prominent: Boolean,\n  inline: Boolean,\n  message: String,\n  dismissible: Boolean\n});\n\nconst visible = ref(true);\nconst icons = { info: 'info', success: 'check_circle', error: 'error_outline', warning: 'warning_amber' };\n</script>\n\n<template>\n  <div v-if=\"visible\" class=\"udc-notification\"\n    :data-variant=\"variant\"\n    :data-prominent=\"prominent || undefined\"\n    :data-inline=\"inline || undefined\">\n    <span class=\"udc-notification__icon\">\n      <span class=\"material-symbols-outlined\">{{ icons[variant] }}</span>\n    </span>\n    <span class=\"udc-notification__text\">{{ message }}</span>\n    <button v-if=\"dismissible\" class=\"udc-notification__close\" aria-label=\"Dismiss\" @click=\"visible = false\">\n      <span class=\"material-symbols-outlined\">close</span>\n    </button>\n  </div>\n</template>";
      }
    },
    'dialog': {
      cssFile: 'uds/components/dialog.css',
      jsFunc: 'initDialog',
      tokens: {
        'Surface': [
          '--uds-color-surface-main','--uds-color-surface-subtle','--uds-color-surface-alt',
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover'
        ],
        'Text': ['--uds-color-text-primary','--uds-color-text-inverse'],
        'Icon': ['--uds-color-icon-secondary'],
        'Border': [
          '--uds-color-border-interactive','--uds-border-radius-container-xl','--uds-border-radius-input'
        ],
        'Space': ['--uds-space-075','--uds-space-100','--uds-space-200','--uds-space-300'],
        'Font': ['--uds-font-family','--uds-font-size-xl','--uds-font-weight-bold','--uds-font-line-height-400'],
        'Effect': ['elevation depth-500: 0 10px 20px 2px rgba(0,0,0,0.2)']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <button class="udc-button-primary" onclick="document.getElementById(\'my-dialog\').setAttribute(\'data-open\',\'true\');UDS.init();">Open Dialog</button>\n\n  <div class="udc-dialog-backdrop" id="my-dialog" data-open="false">\n    <div class="udc-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">\n      <div class="udc-dialog__header">\n        <h2 class="udc-dialog__title" id="dlg-title">Dialog title</h2>\n        <button class="udc-dialog__close" aria-label="Close">\n          <span class="material-symbols-outlined">close</span>\n        </button>\n      </div>\n      <div class="udc-dialog__body">\n        <p>Your content goes here.</p>\n      </div>\n      <div class="udc-dialog__footer">\n        <button class="udc-button-secondary">Cancel</button>\n        <button class="udc-button-primary">Confirm</button>\n      </div>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nexport default function Dialog({ open, onClose, title, children, primaryLabel = 'Confirm', secondaryLabel = 'Cancel', onConfirm }) {\n  if (!open) return null;\n\n  return (\n    <div className=\"udc-dialog-backdrop\" data-open=\"true\" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>\n      <div className=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n        <div className=\"udc-dialog__header\">\n          <h2 className=\"udc-dialog__title\">{title}</h2>\n          <button className=\"udc-dialog__close\" aria-label=\"Close\" onClick={onClose}>\n            <span className=\"material-symbols-outlined\">close</span>\n          </button>\n        </div>\n        <div className=\"udc-dialog__body\">{children}</div>\n        <div className=\"udc-dialog__footer\">\n          <button className=\"udc-button-secondary\" onClick={onClose}>{secondaryLabel}</button>\n          <button className=\"udc-button-primary\" onClick={onConfirm}>{primaryLabel}</button>\n        </div>\n      </div>\n    </div>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\ndefineProps({\n  open: Boolean,\n  title: { type: String, default: 'Dialog title' },\n  primaryLabel: { type: String, default: 'Confirm' },\n  secondaryLabel: { type: String, default: 'Cancel' }\n});\nconst emit = defineEmits(['close', 'confirm']);\n</script>\n\n<template>\n  <div v-if=\"open\" class=\"udc-dialog-backdrop\" data-open=\"true\" @click.self=\"emit('close')\">\n    <div class=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"udc-dialog__header\">\n        <h2 class=\"udc-dialog__title\">{{ title }}</h2>\n        <button class=\"udc-dialog__close\" aria-label=\"Close\" @click=\"emit('close')\">\n          <span class=\"material-symbols-outlined\">close</span>\n        </button>\n      </div>\n      <div class=\"udc-dialog__body\"><slot /></div>\n      <div class=\"udc-dialog__footer\">\n        <button class=\"udc-button-secondary\" @click=\"emit('close')\">{{ secondaryLabel }}</button>\n        <button class=\"udc-button-primary\" @click=\"emit('confirm')\">{{ primaryLabel }}</button>\n      </div>\n    </div>\n  </div>\n</template>";
      }
    },
    'nav-vertical': {
      cssFile: 'uds/components/nav-vertical.css',
      jsFunc: 'initNavVertical',
      tokens: {
        'Surface': [
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover',
          '--uds-color-surface-interactive-subtle-active','--uds-color-surface-interactive-active',
          '--uds-color-surface-interactive-default'
        ],
        'Text': [
          '--uds-color-text-primary','--uds-color-text-inverse','--uds-color-text-interactive',
          '--uds-color-text-interactive-hover','--uds-color-text-disabled'
        ],
        'Icon': [
          '--uds-color-icon-primary','--uds-color-icon-interactive','--uds-color-icon-inverse',
          '--uds-color-icon-disabled'
        ],
        'Border': [
          '--uds-color-border-outline-focus-visible','--uds-border-radius-input',
          '--uds-border-radius-container-full'
        ],
        'Space': [
          '--uds-space-075','--uds-space-100','--uds-space-150','--uds-space-200'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-line-height-base',
          '--uds-font-weight-medium'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <nav class="udc-nav-vertical" aria-label="Main navigation">\n    <button class="udc-nav-button" aria-selected="true">\n      <span class="material-symbols-outlined">space_dashboard</span>\n      <span class="udc-nav-button__label">Dashboard</span>\n    </button>\n    <button class="udc-nav-button">\n      <span class="material-symbols-outlined">book</span>\n      <span class="udc-nav-button__label">Leasing / CRM</span>\n    </button>\n  </nav>\n\n  <!-- Without leading icons -->\n  <nav class="udc-nav-vertical" data-leading-icons="false">\n    <button class="udc-nav-button" aria-selected="true">\n      <span class="udc-nav-button__label">Dashboard</span>\n    </button>\n  </nav>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState } from 'react';\nimport './uds/uds.css';\n\nconst navItems = [\n  { icon: 'space_dashboard', label: 'Dashboard' },\n  { icon: 'book', label: 'Leasing / CRM' },\n  { icon: 'contact_phone', label: 'People / Contacts' },\n  { icon: 'home_work', label: 'Property / Assets' },\n  { icon: 'monetization_on', label: 'Accounting / Finance' },\n];\n\nexport default function NavVertical({ leadingIcons = true }) {\n  const [selected, setSelected] = useState(0);\n\n  return (\n    <nav className=\"udc-nav-vertical\" data-leading-icons={leadingIcons ? undefined : 'false'} aria-label=\"Main navigation\">\n      {navItems.map((item, i) => (\n        <button key={i} className=\"udc-nav-button\" aria-selected={selected === i} onClick={() => setSelected(i)}>\n          {leadingIcons && <span className=\"material-symbols-outlined\">{item.icon}</span>}\n          <span className=\"udc-nav-button__label\">{item.label}</span>\n        </button>\n      ))}\n    </nav>\n  );\n}";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\ndefineProps({ leadingIcons: { type: Boolean, default: true } });\n\nconst selected = ref(0);\nconst navItems = [\n  { icon: 'space_dashboard', label: 'Dashboard' },\n  { icon: 'book', label: 'Leasing / CRM' },\n  { icon: 'contact_phone', label: 'People / Contacts' },\n  { icon: 'home_work', label: 'Property / Assets' },\n  { icon: 'monetization_on', label: 'Accounting / Finance' },\n];\n</script>\n\n<template>\n  <nav class=\"udc-nav-vertical\" :data-leading-icons=\"leadingIcons ? undefined : 'false'\" aria-label=\"Main navigation\">\n    <button v-for=\"(item, i) in navItems\" :key=\"i\" class=\"udc-nav-button\" :aria-selected=\"selected === i\" @click=\"selected = i\">\n      <span v-if=\"leadingIcons\" class=\"material-symbols-outlined\">{{ item.icon }}</span>\n      <span class=\"udc-nav-button__label\">{{ item.label }}</span>\n    </button>\n  </nav>\n</template>";
      }
    },
    'chip': {
      cssFile: 'uds/components/chip.css',
      jsFunc: 'initChip',
      tokens: {
        'Surface': ['--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active','--uds-color-surface-interactive-active','--uds-color-surface-interactive-hover','--uds-color-surface-main'],
        'Text': ['--uds-color-text-primary','--uds-color-text-inverse'],
        'Icon': ['--uds-color-icon-inverse'],
        'Border': ['--uds-color-border-primary','--uds-color-border-outline-focus-visible','--uds-border-radius-container'],
        'Space': ['--uds-space-050','--uds-space-100'],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-size-lg','--uds-font-size-md','--uds-font-weight-regular','--uds-font-line-height-base']
      },
      html: function () { return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <button class="udc-chip" data-variant="filter">Chip</button>\n  <button class="udc-chip" data-variant="filter" aria-selected="true">\n    <span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span>\n    <span class="udc-chip__label">Active</span>\n  </button>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>'; },
      react: function () { return "import { useState } from 'react';\nimport './uds/uds.css';\n\nconst filters = ['All', 'Active', 'Pending', 'Closed'];\n\nexport default function ChipGroup() {\n  const [selected, setSelected] = useState(new Set(['Active']));\n\n  function toggle(label) {\n    setSelected(prev => {\n      const next = new Set(prev);\n      next.has(label) ? next.delete(label) : next.add(label);\n      return next;\n    });\n  }\n\n  return (\n    <div style={{ display: 'flex', gap: 8 }}>\n      {filters.map(f => (\n        <button\n          key={f}\n          className=\"udc-chip\"\n          data-variant=\"filter\"\n          aria-selected={selected.has(f)}\n          onClick={() => toggle(f)}\n        >\n          {selected.has(f) && <span className=\"udc-chip__leading-icon\"><span className=\"material-symbols-outlined\">check</span></span>}\n          <span className=\"udc-chip__label\">{f}</span>\n        </button>\n      ))}\n    </div>\n  );\n}"; },
      vue: function () { return "<script setup>\nimport { ref } from 'vue';\n\nconst filters = ['All', 'Active', 'Pending', 'Closed'];\nconst selected = ref(new Set(['Active']));\n\nfunction toggle(label) {\n  const s = new Set(selected.value);\n  s.has(label) ? s.delete(label) : s.add(label);\n  selected.value = s;\n}\n</script>\n\n<template>\n  <div style=\"display: flex; gap: 8px;\">\n    <button\n      v-for=\"f in filters\" :key=\"f\"\n      class=\"udc-chip\" data-variant=\"filter\"\n      :aria-selected=\"selected.has(f)\"\n      @click=\"toggle(f)\">\n      <span v-if=\"selected.has(f)\" class=\"udc-chip__leading-icon\"><span class=\"material-symbols-outlined\">check</span></span>\n      <span class=\"udc-chip__label\">{{ f }}</span>\n    </button>\n  </div>\n</template>"; }
    },
    'search': {
      cssFile: 'uds/components/search.css',
      jsFunc: 'initSearch',
      tokens: {
        'Surface': ['--uds-color-surface-main','--uds-color-surface-subtle','--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover'],
        'Text': ['--uds-color-text-primary','--uds-color-text-secondary'],
        'Icon': ['--uds-color-icon-secondary'],
        'Border': ['--uds-color-border-primary','--uds-color-border-outline-focus-visible','--uds-color-border-error','--uds-border-radius-input'],
        'Space': ['--uds-space-025','--uds-space-050','--uds-space-075','--uds-space-100','--uds-space-600'],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-size-2xl','--uds-font-weight-regular','--uds-font-line-height-base']
      },
      html: function () { return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-search">\n    <div class="udc-search__field">\n      <span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span>\n      <input type="search" placeholder="Search..." />\n      <button class="udc-search__clear" aria-label="Clear"><span class="material-symbols-outlined">clear</span></button>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>'; },
      react: function () { return "import { useState, useCallback } from 'react';\nimport './uds/uds.css';\n\nexport default function SearchBar({ placeholder = 'Search...', onSearch }) {\n  const [value, setValue] = useState('');\n  const hasValue = value.length > 0;\n\n  const clear = useCallback(() => {\n    setValue('');\n    onSearch?.('');\n  }, [onSearch]);\n\n  return (\n    <div className=\"udc-search\" data-has-value={hasValue ? 'true' : 'false'}>\n      <div className=\"udc-search__field\">\n        <span className=\"udc-search__icon\">\n          <span className=\"material-symbols-outlined\">search</span>\n        </span>\n        <input\n          type=\"search\"\n          placeholder={placeholder}\n          value={value}\n          onChange={(e) => { setValue(e.target.value); onSearch?.(e.target.value); }}\n        />\n        <button className=\"udc-search__clear\" aria-label=\"Clear\" onClick={clear}>\n          <span className=\"material-symbols-outlined\">clear</span>\n        </button>\n      </div>\n    </div>\n  );\n}"; },
      vue: function () { return "<script setup>\nimport { ref, computed } from 'vue';\n\ndefineProps({ placeholder: { type: String, default: 'Search...' } });\nconst emit = defineEmits(['search']);\nconst value = ref('');\nconst hasValue = computed(() => value.value.length > 0);\n\nfunction clear() { value.value = ''; emit('search', ''); }\n</script>\n\n<template>\n  <div class=\"udc-search\" :data-has-value=\"hasValue ? 'true' : 'false'\">\n    <div class=\"udc-search__field\">\n      <span class=\"udc-search__icon\"><span class=\"material-symbols-outlined\">search</span></span>\n      <input type=\"search\" :placeholder=\"placeholder\" :value=\"value\" @input=\"value = $event.target.value; emit('search', value)\" />\n      <button class=\"udc-search__clear\" aria-label=\"Clear\" @click=\"clear\">\n        <span class=\"material-symbols-outlined\">clear</span>\n      </button>\n    </div>\n  </div>\n</template>"; }
    },
    'tooltip': {
      cssFile: 'uds/components/tooltip.css',
      jsFunc: null,
      tokens: {
        'Surface': ['--uds-color-surface-main'],
        'Text': ['--uds-color-text-primary'],
        'Border': ['--uds-border-radius-container'],
        'Shadow': ['--uds-shadow-depth-300'],
        'Space': ['--uds-space-100','--uds-space-150','--uds-space-200'],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-weight-regular','--uds-font-line-height-base']
      },
      html: function () { return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body style="padding:80px;">\n\n  <span class="udc-tooltip-wrapper">\n    <button class="udc-button-secondary">Hover me</button>\n    <span class="udc-tooltip" role="tooltip">This is a tooltip</span>\n  </span>\n\n</body>\n</html>'; },
      react: function () { return "import './uds/uds.css';\n\nfunction Tooltip({ children, text, position }) {\n  return (\n    <span className=\"udc-tooltip-wrapper\">\n      {children}\n      <span className=\"udc-tooltip\" role=\"tooltip\" data-position={position || undefined}>\n        {text}\n      </span>\n    </span>\n  );\n}\n\n/* Usage:\n  <Tooltip text=\"Helpful info\" position=\"bottom\">\n    <button className=\"udc-button-secondary\">Hover me</button>\n  </Tooltip>\n*/\n\nexport default Tooltip;"; },
      vue: function () { return "<script setup>\ndefineProps({\n  text: String,\n  position: { type: String, default: undefined }\n});\n</script>\n\n<template>\n  <span class=\"udc-tooltip-wrapper\">\n    <slot />\n    <span class=\"udc-tooltip\" role=\"tooltip\" :data-position=\"position\">\n      {{ text }}\n    </span>\n  </span>\n</template>"; }
    }
  };

  /* ========================================================================
     6c. BUILD IMPLEMENTATION REFERENCE SECTION
     ======================================================================== */
  var jsBehaviorCache = {};

  var JS_FUNC_TO_FILE = {
    initTextInput:    'uds/components/text-input.js',
    initTabs:         'uds/components/tabs.js',
    initCheckbox:     'uds/components/checkbox.js',
    initNavBento:     'uds/components/nav-header.js',
    initNavVertical:  'uds/components/nav-vertical.js',
    initDropdown:     'uds/components/dropdown.js',
    initNotification: 'uds/components/notification.js',
    initDialog:       'uds/components/dialog.js',
    initTile:         'uds/components/tile.js',
    initList:         'uds/components/list.js',
    initDataTable:    'uds/components/data-table.js',
    initChip:         'uds/components/chip.js',
    initSearch:       'uds/components/search.js'
  };

  function fetchJsBehavior(funcName, callback) {
    if (jsBehaviorCache[funcName] !== undefined) {
      callback(jsBehaviorCache[funcName]);
      return;
    }
    var file = JS_FUNC_TO_FILE[funcName] || 'uds/uds.js';
    fetch(file).then(function (r) { return r.text(); }).then(function (text) {
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

  function buildImplSection(pageId) {
    var data = IMPL_DATA[pageId];
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
        fetchCssFile(data.cssFile, function (text) { pre2.textContent = text; });
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
    pre.textContent = data.html();
  }

  function updateBehaviorTab(panel, data) {
    var pre = panel._pre;
    if (!pre) return;
    if (data.jsFunc) {
      fetchJsBehavior(data.jsFunc, function (code) { pre.textContent = code; });
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
  var PRIM_FAMILIES = [
    'slate','neutral','stone','blue','cyan','purple',
    'red','orange','amber','yellow','lime','green','emerald'
  ];
  var PRIM_STEPS = [10,20,30,40,50,'60-M',70,80,90,100,110];

  document.querySelectorAll('#prim-special .sg-token-row').forEach(function (row) {
    var name = row.querySelector('.sg-token-name');
    if (name) row.appendChild(buildCopyButton(name.textContent));
  });

  PRIM_FAMILIES.forEach(function (family) {
    var container = document.querySelector('#prim-' + family + ' .sg-token-list');
    if (!container) return;
    PRIM_STEPS.forEach(function (step) {
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
        'components/text-input.css',
        'components/text-input.js',
        'components/checkbox.css',
        'components/checkbox.js',
        'components/radio.css',
        'components/badge.css',
        'components/divider.css',
        'components/icon-wrapper.css',
        'components/spacer.css',
        'components/breadcrumb.css',
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

  var CHANGELOG = [
    {
      version: '0.1',
      date: '2026-04-01',
      changes: [
        { type: 'added', category: null, component: null, text: 'Initial release: primitive + semantic tokens, 6 color modes, 4 font families, 3 font scales, 2 density modes' },
        { type: 'added', category: 'tokens', component: null, text: '249 primitive tokens (color, font, text, space, border, style)' },
        { type: 'added', category: 'tokens', component: null, text: '93 semantic color tokens across 6 modes (Base Light, Base Dark, ResMan Light, ResMan Dark, AnyoneHome Light, Inhabit Light)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic font tokens with 4 font families (Inter, Poppins, Roboto, Lexend)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic font-scale tokens with 3 scales (default, smaller, larger)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic space tokens with 2 density modes (default, comfortable)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic border tokens (radius + width)' },
        { type: 'added', category: 'tokens', component: null, text: 'Text styles for headings, body, labels, inputs, data cells' },
        { type: 'added', category: 'components', component: 'Button', text: 'Primary, secondary, ghost variants; small + default sizes; icon support; disabled + loading states' },
        { type: 'added', category: 'components', component: 'Text Input', text: 'Label, helper text, error state, character counter, leading/trailing icons' },
        { type: 'added', category: 'components', component: 'Checkbox', text: 'Label, disabled, and error states' },
        { type: 'added', category: 'components', component: 'Radio', text: 'Label, disabled, and error states' },
        { type: 'added', category: 'components', component: 'Badge', text: 'Status variants and sizes' },
        { type: 'added', category: 'components', component: 'Breadcrumb', text: 'Navigation component' },
        { type: 'added', category: 'components', component: 'Tabs', text: 'Horizontal tab component with keyboard navigation' },
        { type: 'added', category: 'components', component: 'Divider', text: 'Horizontal and vertical orientations' },
        { type: 'added', category: 'components', component: 'Icon Wrapper', text: 'Size and color variants for Material Symbols' },
        { type: 'added', category: 'components', component: 'Spacer', text: 'Spacing utility component' },
        { type: 'added', category: 'components', component: 'Nav', text: 'Navigation system: header bar, vertical sidebar, bento dropdown, rail buttons, search, and account actions' }
      ]
    },
    {
      version: '0.2',
      date: '2026-04-02',
      changes: [
        { type: 'changed', category: 'components', component: 'Nav', text: 'Split Nav into two separate components: Nav Header and Nav Vertical' },
        { type: 'added', category: 'components', component: 'Nav Header', text: 'Standalone header bar with logo, bento dropdown, search, My Work, and account actions' },
        { type: 'added', category: 'components', component: 'Nav Vertical', text: 'Sidebar navigation with two variants: Leading Icons (default) and text-only' },
        { type: 'deprecated', category: 'components', component: 'Nav', text: 'Replaced by Nav Header and Nav Vertical — update imports to nav-header.css + nav-vertical.css' },
        { type: 'added', category: 'components', component: 'Dropdown', text: 'Single-select dropdown with label, helper text, leading icon, error/disabled states, keyboard navigation' },
        { type: 'added', category: 'components', component: 'Notification', text: 'Status banners with info, success, error, warning variants; subtle, prominent, and inline styles; optional dismiss' },
        { type: 'added', category: 'components', component: 'Dialog', text: 'Modal overlay with title, scrollable body, action footer; backdrop click and Escape to close; 1-4 content slots' },
        { type: 'added', category: 'components', component: 'Tile', text: 'Selectable card with label, body text, optional chevron; default/hover/selected/focused/disabled states' },
        { type: 'added', category: 'components', component: 'List', text: 'Vertical list with single-select, optional leading/trailing icons, keyboard navigation; 5 interaction states' },
        { type: 'added', category: 'components', component: 'Data Table', text: 'Data grid with sortable headers, checkbox selection, badge/action cell types, striped rows, error highlighting' },
        { type: 'added', category: 'components', component: 'Chip', text: 'Compact filter/input/dropdown chips with selected state, leading/trailing icons, removable input tags' },
        { type: 'added', category: 'components', component: 'Search', text: 'Search input with leading icon, auto-show clear button, hover/focused/error states' },
        { type: 'added', category: 'components', component: 'Tooltip', text: 'CSS-only text popover on hover/focus with top/bottom/left/right positioning' }
      ]
    }
  ];

  var SITE_CHANGELOG = [
    {
      version: 'SITE 2026.04.01.1',
      date: '2026-04-01',
      changes: [
        { type: 'added', text: 'Initial documentation site with SPA routing, hash-based navigation, and tabbed component pages' },
        { type: 'added', text: 'Getting Started page with download, file structure, and framework setup guides' },
        { type: 'added', text: 'Primitive Colors and Semantic Colors pages with Preview and Code tabs' },
        { type: 'added', text: 'Interactive Playgrounds for all components with live preview and code generation' },
        { type: 'added', text: 'Framework selector (HTML/CSS, React, Vue) across Code tabs and Playgrounds' },
        { type: 'added', text: 'Searchable Material Icons picker in playgrounds' },
        { type: 'added', text: 'Copy-to-clipboard buttons on all code blocks' },
        { type: 'added', text: 'Appearance bar with color mode, brand, font, and scale switching' },
        { type: 'added', text: 'UDS package ZIP download with JSZip' },
        { type: 'added', text: 'Version dropdown in header bar (UDS 0.1)' }
      ]
    },
    {
      version: 'SITE 2026.04.02.1',
      date: '2026-04-02',
      changes: [
        { type: 'added', text: 'Component status badges (stoplight system from Figma)' },
        { type: 'added', text: 'Figma and GitHub link buttons on every component page' },
        { type: 'added', text: 'Global Changelog page with categorized Tokens/Components sections' },
        { type: 'added', text: 'Per-component Changelog tabs' },
        { type: 'added', text: 'Changelog prefixes (ADDED, CHANGED, DEPRECATED, etc.) with colored labels' },
        { type: 'added', text: 'Version snapshots — older versions served from /versions/0.1/' },
        { type: 'added', text: 'Version dropdown always shows all versions (even in snapshots)' },
        { type: 'changed', text: 'Changelogs now sorted newest-first' },
        { type: 'added', text: 'Implementation Reference expandable section below playground code (CSS, JS, tokens)' },
        { type: 'added', text: 'Side-by-side playground layout at wider viewports' }
      ]
    },
    {
      version: 'SITE 2026.04.06.1',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Notification component page (Examples, Code, Usage, Playground)' },
        { type: 'added', text: 'Dialog component page with interactive demo' },
        { type: 'added', text: 'Tile component page' },
        { type: 'added', text: 'List component page' },
        { type: 'added', text: 'Data Table component page with full-featured playground (11 controls)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.2',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Split monolithic uds.js into per-component JS files mirroring CSS architecture' },
        { type: 'changed', text: 'uds.js rewritten as lightweight orchestrator that auto-loads component scripts' },
        { type: 'changed', text: 'Updated Getting Started file tree to show new JS structure' },
        { type: 'changed', text: 'Updated download ZIP to include all component JS files' }
      ]
    },
    {
      version: 'SITE 2026.04.06.3',
      date: '2026-04-06',
      changes: [
        { type: 'fixed', text: 'Replaced ~25+ hardcoded hex colors in doc shell CSS with semantic tokens' },
        { type: 'fixed', text: 'Replaced ~15 hardcoded font-family declarations with var(--uds-font-family)' },
        { type: 'fixed', text: 'Replaced ~50+ hardcoded font-size px values with --uds-font-size-* tokens' },
        { type: 'fixed', text: 'Replaced ~100+ hardcoded spacing px values with --uds-space-* tokens' },
        { type: 'fixed', text: 'Replaced hardcoded icon sizes (24px), heights (48px), required dots (4px) across component CSS' },
        { type: 'added', text: 'Elevation/shadow tokens (depth-100, depth-300, depth-500, bento, overlay-backdrop) in semantic.css' },
        { type: 'fixed', text: 'Dialog, dropdown, nav-header CSS now use shadow tokens instead of raw rgba' },
        { type: 'fixed', text: 'Playground icon controls for Notification and List now use searchable icon-search picker' },
        { type: 'added', text: 'Keyboard activation (Space/Enter) for Tile component' },
        { type: 'added', text: 'Keyboard access + focus-visible for Data Table sortable headers' },
        { type: 'added', text: 'Focus trap in Dialog (auto-focus on open, Tab/Shift+Tab cycling, focus restore on close)' },
        { type: 'added', text: ':focus-visible styles for dialog close, notification close, nav bento, breadcrumb links, text-input trailing button, nav-vertical rail buttons' },
        { type: 'added', text: 'React hooks and Vue composables for all 11 interactive components in Behavior tab' },
        { type: 'added', text: 'Proper ARIA on doc site tabs (role=tab, aria-controls, tabpanel, arrow key navigation)' },
        { type: 'added', text: 'Skip to main content link for keyboard accessibility' }
      ]
    },
    {
      version: 'SITE 2026.04.06.5',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Changelog colors updated: blue subtitles, green for Added, orange for Changed, red for Deprecated/Removed' },
        { type: 'changed', text: 'Component names in changelog now use UDS badge component (secondary, prominent, small)' },
        { type: 'added', text: 'Changelog page split into UDS and Site tabs' }
      ]
    },
    {
      version: 'SITE 2026.04.06.6',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Increased main content area max-width from 880px to 1200px' }
      ]
    },
    {
      version: 'SITE 2026.04.06.7',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Master pre-flight checklist rule (uds-master-preflight.mdc) — ensures all rules are run before completing any task' },
        { type: 'added', text: 'Site changelog rule (uds-site-changelog.mdc) — enforces SITE version bump, SITE_CHANGELOG entry, and cache busting on every change' }
      ]
    },
    {
      version: 'SITE 2026.04.06.8',
      date: '2026-04-06',
      changes: [
        { type: 'fixed', text: 'Appearance bar: Color scheme "Base" renamed to "Light" to match Figma mode names' },
        { type: 'fixed', text: 'Appearance bar: Brand "Default" renamed to "Base" to match Figma mode names' }
      ]
    },
    {
      version: 'SITE 2026.04.06.9',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Chip component page — filter, input (removable tags), and dropdown chip variants' },
        { type: 'added', text: 'Search component page — search bar with auto-show clear button and error state' },
        { type: 'added', text: 'Tooltip component page — CSS-only popover with 4 position options' }
      ]
    },
    {
      version: 'SITE 2026.04.06.10',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Pre-flight checklist button (cogwheel) in top-right header bar with tooltip' },
        { type: 'added', text: 'Pre-flight checklist dialog showing all 5 rule categories with descriptions' }
      ]
    },
    {
      version: 'SITE 2026.04.06.11',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Demo Site Builder — build icon in header bar opens component picker dialog' },
        { type: 'added', text: 'Framework selection (HTML/CSS, React, Vue) for demo output' },
        { type: 'added', text: 'Live Preview opens realistic demo page in new tab via Blob URL' },
        { type: 'added', text: 'Download ZIP generates Vite project scaffold for React/Vue, or simple HTML bundle' },
        { type: 'added', text: 'Build history — last 2 builds stored in localStorage with timestamp, size, theme, and re-open button' },
        { type: 'added', text: 'Component checkbox grid with Select All/Deselect All toggle' },
        { type: 'added', text: 'Auto-layout: full app shell when nav components selected, centered page otherwise' },
        { type: 'added', text: 'Spinner + disabled state on buttons during build/package' }
      ]
    },
    {
      version: 'SITE 2026.04.06.12',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Moved checklist and build icons to the left, next to UDS branding' },
        { type: 'changed', text: 'Pre-flight checklist icon changed from cogwheel to checklist icon' },
        { type: 'changed', text: 'Demo builder framework selection changed from toggle buttons to UDS radio buttons' },
        { type: 'changed', text: 'Removed external window icon from Preview button (demo opens in overlay, not new tab)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.13',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Component status dots in demo builder dialog — colored dots after each label matching Figma stoplight status' }
      ]
    },
    {
      version: 'SITE 2026.04.06.14',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Pre-flight checklist and demo builder buttons only visible on latest UDS version (hidden in version snapshots)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.15',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Default landing page is now Changelog' },
        { type: 'changed', text: 'UDS version dropdown navigates to changelog page on version switch' }
      ]
    },
    {
      version: 'SITE 2026.04.06.16',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Changelog page defaults to UDS tab instead of none' }
      ]
    },
    {
      version: 'SITE 2026.04.06.17',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'React demo rewritten with real JSX components, useState hooks, native event handlers — no dangerouslySetInnerHTML or uds.js' },
        { type: 'changed', text: 'Vue demo rewritten with real SFC template, ref() composables, native event binding — no v-html or uds.js' }
      ]
    },
    {
      version: 'SITE 2026.04.06.18',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'ALL playground React code rewritten as proper function components with hooks — removed all class→className string replacement hacks' },
        { type: 'changed', text: 'ALL playground Vue code rewritten as proper SFCs with <script setup> and ref() — removed vueWrap() HTML wrapper' }
      ]
    },
    {
      version: 'SITE 2026.04.06.19',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Framework Code Quality rule (uds-framework-code-quality.mdc) — bans dangerouslySetInnerHTML, v-html, class→className hacks, uds.js in framework builds' },
        { type: 'fixed', text: 'Fixed all remaining playground React/Vue violations: button, nav-header, nav-vertical rail, chip, tooltip, data-table, dialog, dropdown' },
        { type: 'fixed', text: 'Fixed CODE_TAB_CONFIGS: text-input, dropdown, checkbox, radio, tabs, data-table now have proper state management' },
        { type: 'fixed', text: 'Fixed IMPL_DATA: nav-header React imports, data-table checkbox handlers' },
        { type: 'fixed', text: 'Demo builder ZIP generators rewritten — React uses real JSX, Vue uses real SFC template, no uds.js' }
      ]
    },
    {
      version: 'SITE 2026.04.14.1',
      date: '2026-04-14',
      changes: [
        { type: 'fixed', text: 'Demo preview CSS/JS URLs now use dynamic base path — fixes broken styling on GitHub Pages subdirectory hosting' },
        { type: 'fixed', text: 'Site version date corrected to 2026-04-07' }
      ]
    },
    {
      version: 'SITE 2026.04.14.2',
      date: '2026-04-14',
      changes: [
        { type: 'added', text: 'Cache-busting: no-cache meta tags on index.html to prevent browser caching of the HTML page' },
        { type: 'added', text: 'Auto-reload: inline version check script fetches version.txt on every page load and reloads if a newer version is deployed' }
      ]
    },
    {
      version: 'SITE 2026.04.14.3',
      date: '2026-04-14',
      changes: [
        { type: 'added', text: 'AI Assist page — token reference, component catalog, framework patterns, do/donts, theming, full example, and download Cursor rule button' },
        { type: 'added', text: 'ai-context.json — machine-readable endpoint with complete UDS context for AI tools' },
        { type: 'added', text: 'Downloadable uds-design-system.mdc — self-contained Cursor rule with framework detection, token ref, component catalog' },
        { type: 'added', text: 'npm package.json for uds-core — ready for npm publish' },
        { type: 'added', text: 'CDN section on Getting Started with GitHub Pages URLs and version pinning' },
        { type: 'added', text: 'npm install section on Getting Started with import examples' },
        { type: 'added', text: 'AI Assist link in sidebar with smart_toy icon' }
      ]
    },
    {
      version: 'SITE 2026.04.14.4',
      date: '2026-04-14',
      changes: [
        { type: 'fixed', text: 'Cursor rule (.mdc): added Google Fonts link tags, project boilerplate for React/Vue/HTML, app shell composition pattern' },
        { type: 'fixed', text: 'Cursor rule (.mdc): expanded data-table, dropdown, search with full BEM element markup' },
        { type: 'fixed', text: 'Cursor rule (.mdc): added custom CSS guidance — use UDS tokens even for non-component layouts' },
        { type: 'fixed', text: 'ai-context.json: added React/Vue patterns for ALL 21 components, required_fonts, app_shell, custom_css_rule' },
        { type: 'fixed', text: 'Fixed search component emoji in .mdc — now uses Material Symbols Outlined icons' }
      ]
    },
    {
      version: 'SITE 2026.04.15.1',
      date: '2026-04-15',
      changes: [
        { type: 'fixed', text: 'Site versioning permanently fixed — bump-site.sh script uses system date command, updates all 3 locations automatically' },
        { type: 'fixed', text: 'Corrected all wrongly-dated changelog entries from 2026.04.07 to 2026.04.14' },
        { type: 'added', text: 'bump-site.sh — automated version bumping script, eliminates manual date/version errors' },
        { type: 'changed', text: 'Master workflow and site-changelog rules now mandate using bump-site.sh instead of manual edits' }
      ]
    },
    {
      version: 'SITE 2026.04.15.2',
      date: '2026-04-15',
      changes: [
        { type: 'added', text: 'Token Architecture section — explains primitive vs semantic token cascade, bans --uds-primitive-* in components' },
        { type: 'added', text: 'Theming Mechanism section — explains HOW data attributes change token values, with before/after examples' },
        { type: 'added', text: 'Token Usage Guide — when to use surface-main vs surface-subtle vs surface-alt, text-primary vs text-secondary etc.' },
        { type: 'added', text: 'Text style utility classes reference (.uds-text-heading-xl, .uds-text-paragraph-base etc.)' },
        { type: 'added', text: 'Component decision guide — Tile vs List, Chip vs Badge, Dropdown vs Radio etc.' },
        { type: 'added', text: 'Keyboard interaction patterns for React/Vue (dropdown, dialog, tabs, list, tile, data-table)' },
        { type: 'added', text: 'Error/validation patterns — validate on blur, data-state error, helper text replacement' },
        { type: 'added', text: 'Common icon reference with Material Symbols names by category' },
        { type: 'fixed', text: 'All token references now use full variable names (no ambiguous shorthand)' }
      ]
    },
    {
      version: 'SITE 2026.04.15.3',
      date: '2026-04-15',
      changes: [
        { type: 'added', text: 'Critical rules repeated at top AND bottom of .mdc for maximum AI compliance' },
        { type: 'added', text: 'udc- naming convention section explaining BEM prefix pattern' },
        { type: 'added', text: 'Common UI Pattern → UDS Component mapping table (13 patterns)' },
        { type: 'added', text: 'Icon wrapper vs bare icon guidance' },
        { type: 'added', text: 'All 21 components expanded to multi-line code blocks (was compressed single-line)' },
        { type: 'added', text: 'Common Mistakes section with 7 wrong→right code pairs' },
        { type: 'added', text: 'Compliance Checklist at end of .mdc — 9-point pre-output verification' },
        { type: 'added', text: 'Machine-readable summary block at top of AI Assist page for URL-based AI consumption' },
        { type: 'added', text: 'ai-context.json: namingConvention, patternMapping, complianceChecklist, criticalRules, iconGuidance' }
      ]
    },
    {
      version: 'SITE 2026.04.15.4',
      date: '2026-04-15',
      changes: [
        { type: 'fixed', text: 'Typography section in .mdc now uses full variable names (--uds-font-size-sm instead of sm shorthand)' },
        { type: 'fixed', text: 'Status container tokens in .mdc now use full variable names instead of shorthand' },
        { type: 'added', text: 'Icon color tokens section (--uds-color-icon-*) added to .mdc token reference' },
        { type: 'added', text: 'Line-height tokens (--uds-font-line-height-*) added to .mdc typography section' },
        { type: 'added', text: 'Border color tokens section (--uds-color-border-*) added to .mdc with 6 tokens including disabled' },
        { type: 'changed', text: 'Project Boilerplate section moved higher in .mdc — now directly after Framework Detection for faster AI discovery' }
      ]
    },
    {
      version: 'SITE 2026.04.21.1',
      date: '2026-04-21',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 1: pivoting to design-to-engineering handoff spec. Storybook will now handle framework-specific (React/Vue) component implementations.' },
        { type: 'removed', text: 'All React/Vue code generation stripped from Playgrounds, Code tabs, Implementation Reference, and Demo Builder. Doc site now shows vanilla HTML/CSS/JS only.' },
        { type: 'removed', text: 'Framework selector bar removed from component pages (CODE_TAB_CONFIGS, buildFrameworkBar, currentFramework, setFramework, getReactBehavior, getVueBehavior)' },
        { type: 'removed', text: 'Demo Builder simplified to vanilla HTML only. Vite ZIP scaffolds for React/Vue removed.' },
        { type: 'removed', text: 'versions/0.1/ snapshot directory deleted — fresh start for next release' }
      ]
    },
    {
      version: 'SITE 2026.04.21.2',
      date: '2026-04-21',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 2: per-component spec content moved from hand-coded HTML to JSON files (content/*.json) with schema and client-side renderer.' },
        { type: 'added', text: 'content/schema.json — JSON schema for per-component spec data (description, props, events, slots, states, accessibility, owner, etc.)' },
        { type: 'added', text: 'content/<component>.json — 21 initial JSON files populated from existing Usage content and IMPL_DATA' },
        { type: 'added', text: 'Guidelines tab (renamed from Usage) rendered by renderGuidelines() from JSON. Empty sections are hidden automatically.' },
        { type: 'added', text: 'Spec completeness indicator: "Spec X/Y" pill next to each component title + colored dot in sidebar (green ≥80%, yellow 50–80%, red <50%)' }
      ]
    },
    {
      version: 'SITE 2026.04.28.1',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 3: component page header enhancements.' },
        { type: 'added', text: '"View in Storybook" button on every component page (placeholder URL until Storybook is live)' },
        { type: 'added', text: '"Report Issue" button — opens a GitHub issue template prefilled with component context' },
        { type: 'added', text: '"Not production-ready" banner appears on any component whose status is not "production"' },
        { type: 'added', text: '"Last updated" collapsible box at the top of every component page showing the last 1-2 changelog entries with type pills (added/changed/fixed/removed)' },
        { type: 'added', text: '"Example only" banner at the top of Examples / Code / Playground tab panels — reinforces that the doc site is reference, Storybook is production' },
        { type: 'changed', text: 'Figma button now reads "Figma (variant)" when a per-variant node ID is present in the JSON content' }
      ]
    },
    {
      version: 'SITE 2026.04.28.2',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 4: 8 new pages and reorganized sidebar.' },
        { type: 'added', text: 'Composition Recipes page — curated multi-component patterns (Modal form, Searchable data table, Settings panel, App shell)' },
        { type: 'added', text: 'Layout Templates page — starter page structures (App shell, Settings, Data browsing, Marketing landing)' },
        { type: 'added', text: 'Glossary page — UDS terminology reference (15+ definitions)' },
        { type: 'added', text: 'FAQ page — 10 placeholder Q&A covering theming, tokens, requests, versioning' },
        { type: 'added', text: 'How to Contribute page — 9-step workflow for designers proposing new components, plus draft and editing guidance' },
        { type: 'added', text: 'Roadmap page — Foundation prerequisites, auto-rendered components table from COMPONENT_STATUS, and site-feature roadmap' },
        { type: 'added', text: 'Platform Support page — browser compatibility, performance baseline, web component lifecycle, SSR notes (replaces per-component Browser Compat / Performance sections)' },
        { type: 'added', text: 'Migration Guides page — per-version upgrade notes, starting with 0.1 → 0.2' },
        { type: 'changed', text: 'Sidebar reorganized: existing groups + new Patterns and Reference groups at the bottom' }
      ]
    },
    {
      version: 'SITE 2026.04.28.3',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 5: token search, draft mode, and realistic data examples.' },
        { type: 'added', text: 'Token search modal — open with / or Cmd/Ctrl+K. Indexes every --uds-* custom property, fuzzy-matches name+value, click a result to copy var(--name) to the clipboard.' },
        { type: 'added', text: 'Draft mode — set "draft": true in content/<component>.json to hide a component from production. Append ?draft=1 to any URL to view drafts with a DRAFT watermark.' },
        { type: 'added', text: 'Realistic data examples on data-consuming components (Data Table, List, Dropdown, Search, Breadcrumb): tiny / large / long-content / empty / loading-state previews showing how the component handles real-world content.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.4',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 6: AI context, Cursor rules, pre-flight, and Getting Started updated for the doc-site-as-spec model.' },
        { type: 'changed', text: 'ai-context.json: dropped framework_rules.react/vue and per-component react/vue snippets. Added storybookUrl, exampleOnlyNote, specSourceOfTruth (links to per-component JSON), and tokenArchitecture/criticalRules now point at Storybook for production component code.' },
        { type: 'changed', text: 'uds-design-system.mdc: removed Framework Detection, React/Vue boilerplate, and React/Vue compliance items. Added Storybook reference, "for production code use Storybook" guidance, and "When You Need More Detail" section pointing to per-component JSON spec.' },
        { type: 'changed', text: 'AI Assist page: removed Framework Patterns tab. Updated Rules tab to "For Production Code". Updated machine-readable summary block to describe the two-layer architecture (tokens + Storybook components).' },
        { type: 'removed', text: 'Cursor rule uds-framework-code-quality.mdc — banned React/Vue patterns no longer apply.' },
        { type: 'added', text: 'Cursor rule uds-content-schema.mdc — enforces JSON-driven spec editing (never re-introduce component HTML to index.html).' },
        { type: 'changed', text: 'Cursor rules uds-master-preflight, uds-component-checklist, uds-site-changelog, uds-token-first-css, uds-release-workflow: paths updated from uds-prototype/ to uds-docs/. Component checklist rewritten around JSON content, vanilla-only playgrounds, and Guidelines tab being JSON-rendered.' },
        { type: 'changed', text: 'Pre-flight dialog: replaced "Sample Code Standards" section with "Content Schema" section.' },
        { type: 'changed', text: 'Getting Started page: rewrote Setup section as "Two Layers" (tokens + Storybook web components). Removed React/Vue per-framework setup. Updated tab descriptions to mention Guidelines tab and realistic data examples. Added token search shortcut hint.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.5',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 7 (final cleanup): uds/package.json description rewritten to reflect tokens-only scope (with pointer to Storybook for components). Stale "(React/Vue)" labels removed from remaining headings and copy. End of the reshape — site has fully pivoted to the design-to-engineering handoff spec model.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.6',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Cursor Workflows page (#/cursor-workflows) — explains Rules, Skills, and Subagents and lists what is configured for the project.' },
        { type: 'added', text: 'new-component skill (.cursor/skills/new-component/SKILL.md) — scaffolds a new UDS component end to end (content/<id>.json, empty CSS, sidebar entry, page section, COMPONENT_STATUS entry, SITE bump).' },
        { type: 'added', text: 'spec-audit subagent (.cursor/agents/spec-audit.md, read-only) — reports per-component spec completeness against the same 22-field scoring used by the "Spec X/22" pill, recommends top 3 highest-impact fields to fill in next.' },
        { type: 'changed', text: '.gitignore now tracks .cursor/rules/, .cursor/skills/, and .cursor/agents/ while keeping .cursor/settings.json and other ephemeral IDE state local. Side effect: the 6 existing project Cursor rules are now committed to the repo for the first time and ship with every clone.' }
      ]
    }
  ];

  var STATUS_LABELS = {
    'placeholder':  { label: 'Not Started',       css: 'placeholder'  },
    'blocked':      { label: 'Blocked',            css: 'blocked'      },
    'in-progress':  { label: 'In Progress',        css: 'in-progress'  },
    'review':       { label: 'In Review',          css: 'review'       },
    'production':   { label: 'Production Ready',   css: 'production'   },
    'deprecated':   { label: 'Deprecated',         css: 'deprecated'   }
  };

  var COMPONENT_STATUS = {
    button:         { status: 'in-progress', since: '0.1' },
    'text-input':   { status: 'blocked',     since: '0.1' },
    dropdown:       { status: 'in-progress', since: '0.2' },
    checkbox:       { status: 'in-progress', since: '0.1' },
    radio:          { status: 'in-progress', since: '0.1' },
    badge:          { status: 'in-progress', since: '0.1' },
    breadcrumb:     { status: 'blocked',     since: '0.1' },
    tabs:           { status: 'blocked',     since: '0.1' },
    divider:        { status: 'blocked',     since: '0.1' },
    'icon-wrapper': { status: 'in-progress', since: '0.1' },
    spacer:         { status: 'in-progress', since: '0.1' },
    'nav-header':   { status: 'blocked',     since: '0.1' },
    'nav-vertical': { status: 'blocked',     since: '0.1' },
    notification:   { status: 'blocked',     since: '0.2' },
    dialog:         { status: 'blocked',     since: '0.2' },
    tile:           { status: 'blocked',     since: '0.2' },
    list:           { status: 'blocked',     since: '0.2' },
    'data-table':   { status: 'in-progress', since: '0.2' },
    chip:           { status: 'blocked',     since: '0.2' },
    search:         { status: 'blocked',     since: '0.2' },
    tooltip:        { status: 'blocked',     since: '0.2' }
  };

  var UDS_VERSION = '0.2';

  window.COMPONENT_STATUS_MAP = {};
  Object.keys(COMPONENT_STATUS).forEach(function (id) {
    window.COMPONENT_STATUS_MAP[id] = COMPONENT_STATUS[id].status;
  });

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

  function renderGlobalChangelog() {
    var container = document.getElementById('sg-global-changelog');
    if (!container) return;
    container.innerHTML = '';

    CHANGELOG.slice().reverse().forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + release.date + '</span>';
      section.appendChild(header);

      if (release.migration) {
        var mig = document.createElement('div');
        mig.className = 'sg-cl-migration';
        mig.innerHTML = '<div class="sg-cl-migration-title">Migration Guide</div>' + release.migration;
        section.appendChild(mig);
      }

      var typeOrder = ['added', 'changed', 'fixed', 'deprecated', 'removed'];

      var general = release.changes.filter(function (c) { return !c.category; });
      var tokens = release.changes.filter(function (c) { return c.category === 'tokens'; });
      var components = release.changes.filter(function (c) { return c.category === 'components'; });

      if (general.length) {
        general.forEach(function (entry) {
          var item = document.createElement('div');
          item.className = 'sg-cl-item';
          item.style.fontSize = '15px';
          item.style.fontWeight = '500';
          item.innerHTML = entry.text;
          section.appendChild(item);
        });
      }

      if (tokens.length) {
        renderCategorySection(section, 'Tokens', tokens, typeOrder);
      }

      if (components.length) {
        renderCategorySection(section, 'Components', components, typeOrder);
      }

      container.appendChild(section);
    });
  }

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

  function renderComponentChangelog(pageId) {
    var panel = document.querySelector('[data-page="' + pageId + '"] [data-tab-panel="changelog"]');
    if (!panel) return;

    var pageName = pageId.split('-').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    var entries = [];
    CHANGELOG.forEach(function (release) {
      var matching = release.changes.filter(function (c) {
        if (!c.component) return false;
        if (Array.isArray(c.component)) {
          return c.component.some(function (comp) { return comp.toLowerCase() === pageName.toLowerCase(); });
        }
        return c.component.toLowerCase() === pageName.toLowerCase();
      });
      if (matching.length > 0) {
        entries.push({ version: release.version, date: release.date, changes: matching });
      }
    });

    if (entries.length === 0) {
      panel.innerHTML = '<p class="sg-changelog-empty">No changes recorded yet. This component was introduced in the initial release.</p>';
      return;
    }

    panel.innerHTML = '';
    entries.reverse().forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num" style="font-size:22px;">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + release.date + '</span>';
      section.appendChild(header);

      release.changes.forEach(function (c) {
        var item = document.createElement('div');
        item.className = 'sg-cl-item' + (c.type === 'deprecated' || c.type === 'removed' ? ' sg-cl-item--' + c.type : '');
        var typeLabel = '<span class="udc-badge sg-cl-component" data-variant="secondary" data-prominent="true" data-size="sm">' + c.type + '</span>';
        item.innerHTML = typeLabel + c.text;
        section.appendChild(item);
      });

      panel.appendChild(section);
    });
  }

  var FIGMA_LINKS = {
    button:         '5055-139',
    'text-input':   '5002-1178',
    dropdown:       '5122-68',
    checkbox:       '5445-5056',
    radio:          '5445-5057',
    badge:          '5440-5049',
    breadcrumb:     '5574-5423',
    tabs:           '5264-299',
    divider:        '5621-7292',
    'icon-wrapper': '5657-6776',
    spacer:         null,
    'nav-header':   '5373-972',
    'nav-vertical': '6598-8553',
    notification:   '5452-5855',
    dialog:         '5264-298',
    tile:           '5264-297',
    list:           '5510-5779',
    'data-table':   '5122-870',
    chip:           '5502-7753',
    search:         '5603-3307',
    tooltip:        '5476-2091'
  };

  function renderStatusBadges() {
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      var info = COMPONENT_STATUS[id];
      var meta = STATUS_LABELS[info.status];
      if (!meta) return;
      var titleEl = document.querySelector('[data-page="' + id + '"] .sg-page-title');
      if (!titleEl) return;
      if (titleEl.querySelector('.sg-status-badge')) return;
      var badge = document.createElement('span');
      badge.className = 'sg-status-badge sg-status-badge--' + meta.css;
      badge.innerHTML = meta.label + '<span class="sg-status-since">since ' + info.since + '</span>';
      titleEl.appendChild(badge);
    });
  }

  // Placeholder Storybook base URL — update when Storybook is live
  var STORYBOOK_BASE_URL = 'https://storybook.example.com';
  // Placeholder GitHub repo for issue reports
  var GITHUB_REPO = 'sbajwa32/uds-docs';

  function renderComponentLinks() {
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      var page = document.querySelector('[data-page="' + id + '"]');
      if (!page) return;
      var desc = page.querySelector('.sg-page-desc');
      if (!desc || page.querySelector('.sg-page-links')) return;

      var bar = document.createElement('div');
      bar.className = 'sg-page-links';

      // View in Figma (variant deep-link when available)
      var data = contentCache[id] || {};
      var variantNode = data.figmaNodeId;
      var pageNode = FIGMA_LINKS[id];
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

      desc.insertAdjacentElement('afterend', bar);
    });
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
    if (!query) return idx.slice(0, 50);
    var q = query.toLowerCase().replace(/^--/, '');
    return idx.filter(function (t) {
      return t.name.toLowerCase().indexOf(q) !== -1 ||
             t.value.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 100);
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
    var countEl = document.getElementById('sg-token-search-count');
    if (!resultsEl) return;
    var results = searchTokens(query);
    if (countEl) countEl.textContent = String(buildTokenIndex().length);

    if (!results.length) {
      resultsEl.innerHTML = '<div class="sg-token-search__empty">No tokens match "' + escapeHtml(query) + '"</div>';
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
    var html = '';
    var rowIndex = 0;
    order.forEach(function (g) {
      if (!groups[g] || !groups[g].length) return;
      html += '<div class="sg-token-search__group-title">' + g + '</div>';
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

  // Extract per-component changelog entries from the global CHANGELOG array.
  function collectComponentChangelog(componentId) {
    if (typeof CHANGELOG === 'undefined') return [];
    var out = [];
    CHANGELOG.slice().forEach(function (release) {
      var matches = (release.changes || []).filter(function (c) {
        return c.category === 'components' && c.component &&
               c.component.toLowerCase().replace(/\s+/g, '-') === componentId;
      });
      if (matches.length) {
        out.push({ version: release.version, date: release.date, changes: matches });
      }
    });
    // newest first
    return out.slice().reverse();
  }

  function initVersionDropdown() {
    var dropdown = document.getElementById('sg-version-dropdown');
    if (!dropdown) return;

    var path = window.location.pathname;
    var snapshotMatch = path.match(/\/versions\/([^/]+)\//);
    var basePath = snapshotMatch
      ? path.substring(0, path.indexOf('/versions/')) + '/'
      : path.substring(0, path.lastIndexOf('/') + 1);
    var viewingVersion = snapshotMatch ? snapshotMatch[1] : UDS_VERSION;

    if (snapshotMatch) {
      document.querySelectorAll('.sg-preflight-btn, .sg-demo-btn').forEach(function (btn) {
        btn.closest('.udc-tooltip-wrapper').style.display = 'none';
      });
    }

    fetch(basePath + 'versions.json').then(function (r) {
      if (!r.ok) throw new Error('no versions.json');
      return r.json();
    }).then(function (data) {
      var latestVersion = data.latest || UDS_VERSION;
      var allVersions = data.versions || data;
      dropdown.innerHTML = '';

      allVersions.forEach(function (v) {
        var opt = document.createElement('option');
        var isLatest = v === latestVersion;
        opt.value = isLatest
          ? basePath + 'index.html'
          : basePath + 'versions/' + v + '/index.html';
        opt.textContent = 'UDS ' + v + (isLatest ? ' (latest)' : '');
        opt.selected = v === viewingVersion;
        dropdown.appendChild(opt);
      });

      dropdown.addEventListener('change', function () {
        if (dropdown.value) {
          window.location.href = dropdown.value + '#/changelog';
        }
      });
    }).catch(function () {
      var opt = document.createElement('option');
      opt.textContent = 'UDS ' + UDS_VERSION;
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

  /* ========================================================================
     13. INIT — navigate to current hash
     ======================================================================== */
  renderStatusBadges();
  renderComponentLinks();
  renderComponentHeaderExtras();
  renderRealisticData();
  renderExampleOnlyBanners();
  preloadAllContent();
  renderRoadmapComponents();
  initTokenSearch();
  applyDraftMode();
  initVersionDropdown();
  initAllChangelogs();

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

  initAiAssistPage();

  const { pageId, tab } = parseHash();
  navigate(pageId, tab);

})();
