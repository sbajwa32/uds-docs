// docs/modules/playground/index.js
//
// Playground engine — renders interactive component playgrounds on each
// component page's "Playground" tab. Dynamically imports the per-component
// playground.js config at first tab-click time, builds the controls
// (select/checkbox/text/icon-search), wires the live update loop between
// state changes and the preview/code output, and appends the
// Implementation Reference accordion underneath.
//
// Phase 15b: extracted from app.js. The factory pattern lets us pull the
// engine out without also extracting buildCopyButton, buildIconPicker, and
// the impl-section helpers — those are passed in via a context object so
// the module stays decoupled from app.js's lexical scope.

/**
 * createPlaygroundEngine(ctx) — returns { initPlayground, refreshPlaygrounds,
 * loadPlaygroundConfig }. The engine remembers per-page initialization
 * state so re-clicking the Playground tab is a no-op, and caches loaded
 * playground modules.
 *
 * ctx must provide:
 *   - buildCopyButton(getText) — DOM helper that returns a copy button
 *   - buildIconPicker(defaultIcon, onChange) — DOM helper for icon-search controls
 *   - loadImplData(pageId) — Promise<impl.json data | null>
 *   - buildImplSection(pageId) — synchronous DOM <details> for Implementation Reference
 *   - refreshImplSections() — refreshes existing impl sections after a state change
 *   - udsResolve(path) — version-aware path resolver
 */
export function createPlaygroundEngine(ctx) {
  const playgroundInited = {};
  const playgroundCache = {};

  function loadPlaygroundConfig(pageId) {
    if (playgroundCache[pageId] !== undefined) {
      return Promise.resolve(playgroundCache[pageId]);
    }
    // Phase 14: when viewing a historical archive, the snapshot may not
    // include playground.js. Resolve to udsResolve()-style URL anchored
    // at the site root via document.baseURI so dynamic import works
    // either way.
    const url = new URL(
      ctx.udsResolve('components/' + pageId + '/playground.js'),
      document.baseURI
    ).href;
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
    Object.keys(playgroundInited).forEach(function (id) {
      const cfg = playgroundCache[id];
      if (cfg && cfg._update) cfg._update();
    });
    if (typeof ctx.refreshImplSections === 'function') {
      ctx.refreshImplSections();
    }
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
    const pgBanner = document.createElement('div');
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
    const copyBtn = ctx.buildCopyButton(function () { return codeEl.textContent; });
    codeWrap.appendChild(copyBtn);
    codeWrap.appendChild(codeEl);
    right.appendChild(codeWrap);

    layout.appendChild(left);
    layout.appendChild(right);
    panel.appendChild(layout);

    const state = {};
    cfg.controls.forEach(function (c) { state[c.key] = c.default; });

    function update() {
      const result = cfg.render(state);
      previewEl.innerHTML = result.html;
      codeEl.textContent = result.code;
    }

    cfg.controls.forEach(function (ctrl) {
      const row = document.createElement('div');
      row.className = 'sg-pg-control';

      const label = document.createElement('label');
      label.className = 'sg-pg-label';
      label.textContent = ctrl.label;
      row.appendChild(label);

      if (ctrl.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'sg-pg-select';
        ctrl.options.forEach(function (o) {
          const opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          if (o.value === ctrl.default) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', function () { state[ctrl.key] = sel.value; update(); });
        row.appendChild(sel);
      } else if (ctrl.type === 'checkbox') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sg-pg-checkbox';
        cb.checked = !!ctrl.default;
        cb.addEventListener('change', function () { state[ctrl.key] = cb.checked; update(); });
        row.appendChild(cb);
      } else if (ctrl.type === 'text') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'sg-pg-input';
        inp.value = ctrl.default || '';
        inp.addEventListener('input', function () { state[ctrl.key] = inp.value; update(); });
        row.appendChild(inp);
      } else if (ctrl.type === 'icon-search') {
        row.appendChild(ctx.buildIconPicker(ctrl.default || 'info', function (val) {
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
    ctx.loadImplData(pageId).then(function (data) {
      if (!data) return;
      const implSection = ctx.buildImplSection(pageId);
      if (implSection) right.appendChild(implSection);
    });

    playgroundInited[pageId] = true;
  }

  return { initPlayground, refreshPlaygrounds, loadPlaygroundConfig };
}
