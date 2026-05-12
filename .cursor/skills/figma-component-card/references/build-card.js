// =====================================================================
// UDS Figma Component Card Builder
// =====================================================================
//
// Canonical builder for the seven-section component card layout, per
// `.cursor/rules/uds-figma-component-card.mdc` and the update-mode rule
// `.cursor/rules/uds-figma-component-card-update.mdc`. Copy this entire
// file into the `code` parameter of `use_figma`, with the CONFIG block
// (or BATCH array) at the top filled in for the target component(s).
// The builder is a single atomic operation — if it fails, no changes
// are made to the file and you can safely retry after fixing the cause.
//
// Required pre-flight (see SKILL.md):
//   - UDS Tokens library subscribed to the file (`get_libraries`)
//   - Spec JSON read from `uds-docs/uds/components/<id>/spec.json`,
//     status from `uds-docs/uds/components/<id>/status.json`,
//     both injected into CONFIG.json + CONFIG.statusJson
//   - User-explicit invocation (no Figma writes without it; see
//     `uds-figma-write-safety.mdc`)
//   - Inter Bold/Semi Bold/Medium/Regular and Geist Mono Bold/Medium/Regular
//     are loaded by this script automatically
//
// Returns: per component { pageId, componentId, status, outerFrameId,
//   sectionIds, reparented, unreparented, droppedNodes, summary }.
// =====================================================================

// ----- BATCH CONFIG -----
// Provide BATCH as an array of per-component CONFIG objects. Each CONFIG
// supplies: pageId, componentId, componentTitle, status, udsVersion,
// docsUrl, storybookUrl, json (parsed spec.json), statusJson (parsed
// status.json). The builder loops the batch in a single use_figma call.
//
// const BATCH = [ { pageId:'…', componentId:'badge', … }, … ];
//
// For convenience when running a single component, set BATCH = [CONFIG].

// ----- TOKEN KEY MAP (DO NOT EDIT — see token-map.json) -----
const KEYS = {
  text: {
    primary:   'f5a3ae409e24defe81a3ccbeba0ab5e2c09979d1',
    secondary: '96997351d5ceaa1fbc4dd9a899955e66ba8cc530',
    disabled:  'af48047b5e222762d9ab11dee658501a62ee066b',
    warning:   '3479470213f4939afa288b2b9cefe921b8fa3872',
    success:   '82e829c8a57a30b1353803953e3f8ba4c60c6a61',
    error:     '5087f33cc61bef6dc94ae0ad4431a1dc9144e151',
    info:      '930a3c4ba5600d99a953c46b39c4d0b261d30475',
    inverse:   'c3d0c76272400932235c808161118490985ecc07',
  },
  surface: {
    main:          '929a0f30897b12884c1848b5071f7ab3e0a31b72',
    alt:           'd42911ee04e7227d6058c18e410ccf70c750ce33',
    subtle:        '15cb1c4345ec1d9765099ca75012a4df3be0b0ee',
    bold:          '18b0c1f45b52f6777464de95c523612f55dc7885',
    xbold:         'c48f688a3153c1bf7a16b635fb9accb29774a8fc',
    xxbold:        '7a4c0f3ef4a0c5dcbbe5b2ddf35883b2e670602a',
    inverse:       '874f1e009d0e5a10ec31376a561bef71347522be',
    pageMain:      '6d6cdb813de786e9463b8a720ac612eb01c1434e',
    pageSubtle:    '8e741579507ed611ee7799a8b4b7a242a898b555',
    warning:       'a3403de09a15bb6631040f5c0bf2a53c94046c8e',
    warningSubtle: '8dfade28315d60ab5ce01ec8d03262f29d03b809',
    successSubtle: 'da3a13c384795382d7d382dbe261940bf9785fc7',
    errorSubtle:   'a95a51677a276e176398cef0964712ad2888912a',
  },
  border: {
    primary:   'f4b910ed348d20c1718dd6dd931bbe842476d669',
    secondary: 'ad15bcf93e58eb189fa4ea000b5b30f178725b30',
    tertiary:  '4b5b4b8634b4ffab2973b268fd3abb2afa4fdab3',
    warning:   'ae378dce787169c5c217eb162c98352248c585c8',
    success:   '6c476d9bf9b9ef9fe73e567bd5df3dab72baa900',
    error:     '03e65086fe8048fbd914f94f9ee891f25a8a2278',
    inverse:   '7e206b401133055335d505380407a7b581b3509f',
  },
  icon: {
    warning:   '2eb55aaa5cc2d0ee82a247c9c5fd556474e430d2',
    success:   '38a52b0c4c1a23e37d0b9baef788e6c55fd98d98',
    error:     '5ebf9c22ec9164dc863c86f15a6fa179a58539c7',
    secondary: '8e49e4fd8e1ada3295b207bb6b2d82d1380999ef',
    inverse:   'a09a8fd7e6aef1a9642ee185cf41f1190b58861b',
  },
  space: {
    '0':    '13b3cd9b9bf547bfb9bc5a01a421b5f61124bc43',
    '050':  'd57c22a4dbcb967fb354c4c25aca0347dd504908',
    '100':  '29032578d5d46bc95048b1253b344e47f3285eed',
    '150':  '0dfe69e370d9d4f7c5d8baff9a4d0c5ac75e8c95',
    '200':  'b7345e548fde2c3df0c839521b64580dab1d5ee1',
    '250':  '52c87fcd6d39a3a0e6cd56af8d94b5e3b054a88b',
    '300':  '3793a751fc882450d12db3437f29027bceefc4c6',
    '400':  'd7f2cfa27379c4e034bb7b84140a1864ce816088',
    '500':  'b40ec2e2a18939369ed2059004018a119f1cab14',
    '600':  '1d3642a57002fd5b2bd785e26a2cfe9a3242a450',
    '700':  '30c7f0ecbd03f1750c106be97340b2d3a99cc604',
    '800':  'cf4a3b05190c11603f24e38aea14c3f61abf32bb',
    '1000': 'b398603cd7cd6ef46f6a6659cdc68f85102fe705',
    '1200': 'e3eb477edb94587ce144ebd5536643372a1faee1',
  },
  radius: {
    sm:   '5b9a5c362d9741929aa9dcb031109cee1856c934',
    md:   '2b1f70b62e82d711274209d6d1c7763dcb63752f',
    lg:   'd27395d9b45c18b11eec3168fd02337f589d5844',
    xl:   '90ef1b511f2ba8710bb1366d855d4382dad79fc7',
    full: '2f5e24bb23151523f549b042e6239383eb38b545',
  },
};

// ----- STATUS → TOKEN GROUP MAP -----
const STATUS_TOKENS = {
  'in-progress': { color: 'warning', label: 'IN PROGRESS' },
  'review':      { color: 'warning', label: 'IN REVIEW' },
  'blocked':     { color: 'error',   label: 'BLOCKED' },
  'production':  { color: 'success', label: 'PRODUCTION READY' },
  'placeholder': { color: 'tertiary',label: 'NOT STARTED' },
};

// ----- COLOR LITERALS (resolved default-mode values) -----
const COLORS = {
  dark:        { r: 0.09, g: 0.09, b: 0.09 },
  mid:         { r: 0.4,  g: 0.4,  b: 0.4 },
  white:       { r: 1,    g: 1,    b: 1 },
  light:       { r: 0.96, g: 0.96, b: 0.96 },
  warn:        { r: 0.95, g: 0.6,  b: 0.1 },
  warnText:    { r: 0.78, g: 0.46, b: 0.04 },
  success:     { r: 0.1,  g: 0.5,  b: 0.3 },
  error:       { r: 0.7,  g: 0.18, b: 0.18 },
  darkBg:      { r: 0.04, g: 0.04, b: 0.04 },
  darkBorder:  { r: 0.15, g: 0.15, b: 0.15 },
  warningSubtle: { r: 1, g: 0.93, b: 0.83 },
  successSubtleC: { r: 0.94, g: 0.99, b: 0.96 },
  errorSubtleC: { r: 0.99, g: 0.95, b: 0.95 },
};

// =====================================================================
// MAIN — load fonts + variables once, then loop the batch
// =====================================================================

// Preload all fonts up front (one preload per call regardless of batch size)
for (const style of ['Bold', 'Semi Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Inter', style });
}
for (const style of ['Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Geist Mono', style });
}

// Import all variables fresh (re-import per call — see gotchas.md)
const V = {};
const importGroup = async (groupKey) => {
  V[groupKey] = {};
  for (const [name, key] of Object.entries(KEYS[groupKey])) {
    V[groupKey][name] = await figma.variables.importVariableByKeyAsync(key);
  }
};
await importGroup('text');
await importGroup('surface');
await importGroup('border');
await importGroup('icon');
await importGroup('space');
await importGroup('radius');

// Helper: bind a paint to a variable, with a real default-mode color literal
const bind = (variable, color) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color }, 'color', variable);

const bindOpacity = (variable, color, opacity) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color, opacity }, 'color', variable);

// =====================================================================
// Per-component builder
// =====================================================================
async function buildOne(CONFIG) {
  const page = figma.root.children.find(p => p.id === CONFIG.pageId);
  if (!page) throw new Error(`Page ${CONFIG.pageId} not found`);
  await figma.setCurrentPageAsync(page);

  const status = STATUS_TOKENS[CONFIG.status];
  if (!status) throw new Error(`Unknown status ${CONFIG.status}`);

  // Status-driven token resolvers (one set per call, captured in closures)
  const statusColorLiteral = (() => {
    if (status.color === 'tertiary') return COLORS.mid;
    if (status.color === 'warning')  return COLORS.warn;
    if (status.color === 'error')    return COLORS.error;
    if (status.color === 'success')  return COLORS.success;
    return COLORS.mid;
  })();
  const statusTextLiteral = (() => {
    if (status.color === 'tertiary') return COLORS.mid;
    if (status.color === 'warning')  return COLORS.warnText;
    if (status.color === 'error')    return COLORS.error;
    if (status.color === 'success')  return COLORS.success;
    return COLORS.mid;
  })();
  const sText = () => bind(
    status.color === 'tertiary' ? V.text.secondary : V.text[status.color],
    statusTextLiteral
  );
  const sBorder = () => bind(
    status.color === 'tertiary' ? V.border.tertiary : V.border[status.color],
    statusColorLiteral
  );
  const sIcon = () => bind(
    status.color === 'tertiary' ? V.icon.secondary : V.icon[status.color],
    statusColorLiteral
  );
  const sSurfaceSubtle = () => {
    if (status.color === 'warning')  return bind(V.surface.warningSubtle, COLORS.warningSubtle);
    if (status.color === 'success')  return bind(V.surface.successSubtle, COLORS.successSubtleC);
    if (status.color === 'error')    return bind(V.surface.errorSubtle, COLORS.errorSubtleC);
    return bind(V.surface.subtle, COLORS.light);
  };
  const sSurface = () => {
    if (status.color === 'warning')  return bind(V.surface.warning, COLORS.warn);
    if (status.color === 'success')  return bind(V.surface.successSubtle, COLORS.successSubtleC);
    if (status.color === 'error')    return bind(V.surface.errorSubtle, COLORS.errorSubtleC);
    return bind(V.surface.subtle, COLORS.light);
  };

  // -------- 1. INVENTORY (no-content-loss) --------
  const wrapperName = `udc-${CONFIG.componentId}-page`;
  const existingWrapper = page.children.find(c => c.name === wrapperName);

  // Walk every descendant collecting preservable nodes (COMPONENT_SET / COMPONENT /
  // INSTANCE). We stop descending into COMPONENT_SETs because reparenting the set
  // carries its variant children with it.
  const inventoryPreservable = (root) => {
    const found = [];
    const visit = (n) => {
      if (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT' || n.type === 'INSTANCE') {
        found.push({ id: n.id, name: n.name, type: n.type });
        if (n.type === 'COMPONENT_SET') return;
      }
      if ('children' in n && n.children) for (const c of n.children) visit(c);
    };
    for (const c of root.children) visit(c);
    return found;
  };

  const inventoryMap = new Map();
  const sectionLessTop = []; // ad-hoc top-level nodes that aren't COMPONENT/COMPONENT_SET/INSTANCE
  const addToInv = (entry, source) => {
    if (!inventoryMap.has(entry.id)) inventoryMap.set(entry.id, { ...entry, sources: [source] });
    else inventoryMap.get(entry.id).sources.push(source);
  };

  if (existingWrapper) {
    for (const e of inventoryPreservable(existingWrapper)) addToInv(e, 'wrapper');
  }
  for (const c of page.children) {
    if (c === existingWrapper) continue;
    if (c.type === 'COMPONENT_SET' || c.type === 'COMPONENT' || c.type === 'INSTANCE') {
      addToInv({ id: c.id, name: c.name, type: c.type }, 'top-level');
    } else {
      // SECTION / FRAME / RECTANGLE etc. — ad-hoc page content. Capture for the report.
      sectionLessTop.push({ id: c.id, name: c.name, type: c.type, x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) });
    }
  }

  // Look INSIDE SECTIONs at top-level — if a SECTION wraps a COMPONENT_SET, surface
  // the inner COMPONENT_SET to inventory (special-case for button's `udc-button`
  // SECTION). The SECTION itself stays at page level and will be flagged.
  for (const node of sectionLessTop.slice()) {
    const n = figma.getNodeById(node.id);
    if (!n || n.type !== 'SECTION') continue;
    for (const child of (n.children || [])) {
      if (child.type === 'COMPONENT_SET' || child.type === 'COMPONENT' || child.type === 'INSTANCE') {
        addToInv({ id: child.id, name: child.name, type: child.type }, 'inside-section');
      }
    }
  }

  // -------- 2. CLASSIFY preservable nodes --------
  const cid = CONFIG.componentId;
  const isUnderscoreName = (n) => /^_/.test(n.name);
  const isExactPrimaryName = (n) => n.name === `udc-${cid}` || n.name === `udc-${cid}-base`;
  const isComponentSet = (n) => n.type === 'COMPONENT_SET';

  const allNodes = Array.from(inventoryMap.values()).map(e => ({ ...e, node: figma.getNodeById(e.id) })).filter(e => e.node);
  const componentSets = allNodes.filter(e => e.node.type === 'COMPONENT_SET');

  // Primary set: exact-name match → first non-underscore set → first set overall
  let primarySet = componentSets.find(e => isExactPrimaryName(e.node));
  if (!primarySet) primarySet = componentSets.find(e => !isUnderscoreName(e.node));
  if (!primarySet) primarySet = componentSets[0];

  const variantSets = componentSets.filter(e => !isUnderscoreName(e.node));
  const subSets = componentSets.filter(e => isUnderscoreName(e.node));

  // Discover state variants inside the primary set by parsing variant property names.
  // The primary set may have many variants; we pick one per state where the OTHER
  // variant properties (size, destructive, leading icon, etc.) take their "default"
  // value so the state row stays apples-to-apples.
  const stateInstances = {}; // { Default: nodeId, Hover: nodeId, Active: nodeId, Disabled: nodeId }
  const parseVariantProps = (name) => {
    const out = {};
    for (const part of name.split(',').map(s => s.trim())) {
      const m = /^([^=]+)=(.+)$/.exec(part);
      if (m) out[m[1].trim()] = m[2].trim();
    }
    return out;
  };
  if (primarySet && primarySet.node) {
    const ps = primarySet.node;
    const variants = ps.children.filter(c => c.type === 'COMPONENT');
    // First pass: figure out which non-State props exist + their default values
    // (the values present on the set's defaultVariant, if any).
    const defaultV = ps.defaultVariant || variants[0];
    const defaultProps = defaultV ? parseVariantProps(defaultV.name) : {};
    const STATE_NAMES = ['Default', 'Hover', 'Active', 'Pressed', 'Focus', 'Focus-Visible', 'Selected', 'Disabled', 'Error', 'Open'];
    for (const v of variants) {
      const props = parseVariantProps(v.name);
      const stateRaw = props.State || props.state || null;
      if (!stateRaw) continue;
      const state = STATE_NAMES.find(s => s.toLowerCase() === stateRaw.toLowerCase());
      if (!state) continue;
      // Match all OTHER props to the default variant (so we don't render Hover-large-leading-icon next to Default-default-default).
      let matchesDefaults = true;
      for (const [k, val] of Object.entries(props)) {
        if (/^state$/i.test(k)) continue;
        if (defaultProps[k] !== undefined && defaultProps[k] !== val) { matchesDefaults = false; break; }
      }
      if (!matchesDefaults) continue;
      if (!stateInstances[state]) stateInstances[state] = v.id;
    }
  }

  // -------- 3. PARK preservable nodes at (5000, -5000) --------
  const droppedNodes = [];
  for (const e of allNodes) {
    try {
      page.appendChild(e.node);
      e.node.x = 5000; e.node.y = -5000;
    } catch (err) {
      droppedNodes.push({ id: e.id, name: e.name, reason: `appendChild failed: ${err.message}` });
    }
  }

  // -------- 4. TEAR DOWN old wrapper (atomic; safe because nodes are parked) --------
  if (existingWrapper) {
    try { existingWrapper.remove(); } catch (err) { /* already detached */ }
  }

  // =====================================================================
  // 5. BUILD outer wrapper + status accent + content frame
  // =====================================================================
  const outer = figma.createAutoLayout('VERTICAL', { name: wrapperName, itemSpacing: 0 });
  outer.x = 0; outer.y = 0;
  outer.resize(2800, 100);
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'FIXED';
  outer.fills = [bind(V.surface.subtle, COLORS.light)];

  // 8px top accent strip on the outer wrapper
  const statusAccent = figma.createRectangle();
  statusAccent.name = 'status-accent';
  statusAccent.resize(2800, 8);
  if (status.color === 'tertiary') {
    statusAccent.fills = [bind(V.border.tertiary, COLORS.light)];
  } else {
    statusAccent.fills = [{
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 0.3 }, position: 0 },
        { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 1 },   position: 0.5 },
        { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 0.3 }, position: 1 },
      ],
    }];
  }
  outer.appendChild(statusAccent);
  statusAccent.layoutSizingHorizontal = 'FILL';

  // Content frame — VERTICAL, FILL/HUG, gap 80, padding 64
  const content = figma.createAutoLayout('VERTICAL', { name: 'content', fills: [], itemSpacing: 80 });
  outer.appendChild(content);
  content.layoutSizingHorizontal = 'FILL';
  content.layoutSizingVertical = 'HUG';
  content.setBoundVariable('itemSpacing', V.space['1000']);
  for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) content.setBoundVariable(k, V.space['800']);

  // =====================================================================
  // 6. SHARED CARD / EYEBROW HELPERS
  // =====================================================================

  // eyebrow: renders [NUM | 1×bar | KICKER (+ optional sub-label)]
  const eyebrow = (parent, num, kicker, sublabel, opts) => {
    const isDark = opts && opts.dark;
    const large = opts && opts.large;
    const eb = figma.createAutoLayout('HORIZONTAL', { name: 'eyebrow', itemSpacing: 16, counterAxisAlignItems: 'CENTER', fills: [] });
    parent.appendChild(eb);
    eb.layoutSizingHorizontal = 'HUG';
    eb.layoutSizingVertical = 'HUG';
    eb.setBoundVariable('itemSpacing', V.space['200']);

    const n = figma.createText();
    n.fontName = { family: 'Geist Mono', style: 'Medium' };
    n.fontSize = large ? 56 : 48;
    n.lineHeight = { unit: 'PIXELS', value: large ? 56 : 48 };
    n.characters = num;
    n.fills = [sText()];
    eb.appendChild(n);

    const sep = figma.createRectangle();
    sep.name = 'bar';
    sep.resize(1, large ? 40 : 32);
    sep.fills = [sBorder()];
    sep.opacity = 0.4;
    eb.appendChild(sep);

    const col = figma.createAutoLayout('VERTICAL', { name: 'eb-col', itemSpacing: 4, fills: [] });
    eb.appendChild(col);
    col.layoutSizingHorizontal = 'HUG';
    col.layoutSizingVertical = 'HUG';
    col.setBoundVariable('itemSpacing', V.space['050']);

    const k = figma.createText();
    k.fontName = { family: 'Geist Mono', style: 'Medium' };
    k.fontSize = 11;
    k.characters = kicker;
    k.letterSpacing = { unit: 'PERCENT', value: 8 };
    k.fills = [sText()];
    col.appendChild(k);

    if (sublabel) {
      const s = figma.createText();
      s.fontName = { family: 'Geist Mono', style: 'Regular' };
      s.fontSize = 11;
      s.characters = sublabel;
      if (isDark) {
        s.fills = [bindOpacity(V.text.inverse, COLORS.white, 0.5)];
      } else {
        s.fills = [bind(V.text.secondary, COLORS.mid)];
      }
      col.appendChild(s);
    }
  };

  const lightCard = (parent, name) => {
    const card = figma.createAutoLayout('VERTICAL', { name, itemSpacing: 0 });
    parent.appendChild(card);
    card.layoutSizingHorizontal = 'FILL';
    card.layoutSizingVertical = 'HUG';
    card.fills = [bind(V.surface.main, COLORS.white)];
    card.strokes = [bind(V.border.tertiary, COLORS.light)];
    card.strokeWeight = 1;
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) card.setBoundVariable(r, V.radius.xl);
    card.effects = [
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: 'NORMAL' },
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 12 }, radius: 32, spread: -4, visible: true, blendMode: 'NORMAL' },
    ];
    card.clipsContent = true;
    return card;
  };

  const darkCard = (parent, name) => {
    const card = figma.createAutoLayout('VERTICAL', { name, itemSpacing: 0 });
    parent.appendChild(card);
    card.layoutSizingHorizontal = 'FILL';
    card.layoutSizingVertical = 'HUG';
    card.fills = [bind(V.surface.xxbold, COLORS.darkBg)];
    card.strokes = [bind(V.border.inverse, COLORS.darkBorder)];
    card.strokeWeight = 1;
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) card.setBoundVariable(r, V.radius.xl);
    card.effects = [
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: 'NORMAL' },
      { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 24 }, radius: 60, spread: -8, visible: true, blendMode: 'NORMAL' },
    ];
    card.clipsContent = true;
    return card;
  };

  const innerPad = (card, direction, gapKey, padKey) => {
    const inner = figma.createAutoLayout(direction, { name: 'inner', itemSpacing: 0, fills: [] });
    card.appendChild(inner);
    inner.layoutSizingHorizontal = 'FILL';
    inner.layoutSizingVertical = 'HUG';
    inner.setBoundVariable('itemSpacing', V.space[gapKey]);
    for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) inner.setBoundVariable(k, V.space[padKey]);
    return inner;
  };

  // Creates [eyebrow | title | description?] sec-head block — used by ANATOMY,
  // VARIANTS, SUB-COMPONENTS, USAGE, ACCESSIBILITY.
  const secHead = (parent, num, kicker, sublabel, title, description) => {
    const head = figma.createAutoLayout('VERTICAL', { name: 'sec-head', itemSpacing: 12, fills: [] });
    parent.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    head.layoutSizingVertical = 'HUG';
    head.setBoundVariable('itemSpacing', V.space['150']);
    eyebrow(head, num, kicker, sublabel, {});
    if (title) {
      const t = figma.createText();
      t.fontName = { family: 'Inter', style: 'Bold' };
      t.fontSize = 32;
      t.lineHeight = { unit: 'PIXELS', value: 40 };
      t.characters = title;
      t.fills = [bind(V.text.primary, COLORS.dark)];
      head.appendChild(t);
    }
    if (description) {
      const d = figma.createText();
      d.fontName = { family: 'Inter', style: 'Regular' };
      d.fontSize = 16;
      d.lineHeight = { unit: 'PIXELS', value: 24 };
      d.characters = description;
      d.fills = [bind(V.text.secondary, COLORS.mid)];
      head.appendChild(d);
      d.layoutSizingHorizontal = 'FILL';
    }
    return head;
  };

  // Status pill recipe — used in HEADER pill-row and META meta-row
  const statusPill = (parent) => {
    const pill = figma.createAutoLayout('HORIZONTAL', { name: 'status-pill', itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
    parent.appendChild(pill);
    pill.layoutSizingHorizontal = 'HUG';
    pill.layoutSizingVertical = 'HUG';
    pill.paddingTop = 8; pill.paddingBottom = 8; pill.paddingLeft = 14; pill.paddingRight = 16;
    pill.setBoundVariable('itemSpacing', V.space['100']);
    if (status.color === 'tertiary') {
      pill.fills = [bindOpacity(V.surface.subtle, COLORS.light, 0.18)];
    } else {
      pill.fills = [bindOpacity(V.surface[status.color], statusColorLiteral, 0.18)];
    }
    pill.strokes = [sBorder()];
    pill.strokeWeight = 1;
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) pill.setBoundVariable(r, V.radius.full);
    const dot = figma.createEllipse();
    dot.name = 'dot';
    dot.resize(8, 8);
    dot.fills = [sIcon()];
    pill.appendChild(dot);
    const label = figma.createText();
    label.fontName = { family: 'Geist Mono', style: 'Medium' };
    label.fontSize = 12;
    label.characters = status.label;
    label.letterSpacing = { unit: 'PERCENT', value: 8 };
    label.fills = [sText()];
    pill.appendChild(label);
    return pill;
  };

  const sectionIds = {};
  const reparented = []; // [{id, name, type, parent}]

  // =====================================================================
  // 7a. HEADER (dark card, eyebrow 01)
  // =====================================================================
  const buildHeader = () => {
    const card = darkCard(content, 'HEADER');
    sectionIds.HEADER = card.id;

    // Inner 4px gradient strip (inside the HEADER card)
    const topAccent = figma.createRectangle();
    topAccent.name = 'top-accent';
    topAccent.resize(2672, 4);
    if (status.color === 'tertiary') {
      topAccent.fills = [bind(V.border.tertiary, COLORS.light)];
    } else {
      topAccent.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: [
          { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 0.3 }, position: 0 },
          { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 1 },   position: 0.5 },
          { color: { r: statusColorLiteral.r, g: statusColorLiteral.g, b: statusColorLiteral.b, a: 0.3 }, position: 1 },
        ],
      }];
    }
    card.appendChild(topAccent);
    topAccent.layoutSizingHorizontal = 'FILL';

    // inner — HORIZONTAL, gap 48 (space/600), padding 80 (space/1000)
    const inner = figma.createAutoLayout('HORIZONTAL', { name: 'inner', itemSpacing: 0, fills: [] });
    card.appendChild(inner);
    inner.layoutSizingHorizontal = 'FILL';
    inner.layoutSizingVertical = 'HUG';
    inner.setBoundVariable('itemSpacing', V.space['600']);
    for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) inner.setBoundVariable(k, V.space['1000']);

    // left-col: VERTICAL, FILL/HUG, gap 32 (space/400)
    const left = figma.createAutoLayout('VERTICAL', { name: 'left-col', itemSpacing: 32, fills: [] });
    inner.appendChild(left);
    left.layoutSizingHorizontal = 'FILL';
    left.layoutSizingVertical = 'HUG';
    left.setBoundVariable('itemSpacing', V.space['400']);

    // eyebrow 01 (large) — kicker COMPONENT, no sublabel (per reference)
    eyebrow(left, '01', 'COMPONENT', null, { dark: true, large: true });

    // Component title (Inter Bold 112, ls -3%)
    const title = figma.createText();
    title.fontName = { family: 'Inter', style: 'Bold' };
    title.fontSize = 112;
    title.lineHeight = { unit: 'PIXELS', value: 112 };
    title.letterSpacing = { unit: 'PERCENT', value: -3 };
    title.characters = CONFIG.componentTitle || CONFIG.json.title || CONFIG.componentId;
    title.fills = [bind(V.text.inverse, COLORS.white)];
    left.appendChild(title);

    // Description (Inter Regular 22, lh 34) — FILL width
    if (CONFIG.json.description) {
      const desc = figma.createText();
      desc.fontName = { family: 'Inter', style: 'Regular' };
      desc.fontSize = 22;
      desc.lineHeight = { unit: 'PIXELS', value: 34 };
      desc.characters = CONFIG.json.description;
      desc.fills = [bindOpacity(V.text.inverse, COLORS.white, 0.8)];
      left.appendChild(desc);
      desc.layoutSizingHorizontal = 'FILL';
    }

    // pill-row — HORIZONTAL, FILL/HUG, gap 12 (space/150)
    const pillRow = figma.createAutoLayout('HORIZONTAL', { name: 'pill-row', itemSpacing: 12, counterAxisAlignItems: 'CENTER', fills: [] });
    left.appendChild(pillRow);
    pillRow.layoutSizingHorizontal = 'FILL';
    pillRow.layoutSizingVertical = 'HUG';
    pillRow.setBoundVariable('itemSpacing', V.space['150']);

    statusPill(pillRow);

    // CSS chip
    const css = (CONFIG.json.dependencies && CONFIG.json.dependencies.css && CONFIG.json.dependencies.css[0])
      || `uds/components/${cid}/${cid}.css`;
    {
      const chip = figma.createAutoLayout('HORIZONTAL', { name: 'css-chip', itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
      pillRow.appendChild(chip);
      chip.layoutSizingHorizontal = 'HUG';
      chip.layoutSizingVertical = 'HUG';
      chip.paddingTop = 8; chip.paddingBottom = 8; chip.paddingLeft = 12; chip.paddingRight = 14;
      chip.setBoundVariable('itemSpacing', V.space['100']);
      chip.fills = [bindOpacity(V.surface.main, COLORS.white, 0.06)];
      chip.strokes = [bindOpacity(V.border.inverse, COLORS.white, 0.1)];
      chip.strokeWeight = 1;
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) chip.setBoundVariable(r, V.radius.full);
      const t = figma.createText();
      t.fontName = { family: 'Geist Mono', style: 'Regular' };
      t.fontSize = 12;
      t.characters = css;
      t.fills = [bindOpacity(V.text.inverse, COLORS.white, 0.7)];
      chip.appendChild(t);
    }

    // spacer
    const sp = figma.createAutoLayout('HORIZONTAL', { name: 'spacer', itemSpacing: 0, fills: [] });
    pillRow.appendChild(sp);
    sp.layoutSizingHorizontal = 'FILL';
    sp.layoutSizingVertical = 'HUG';

    // hero-preview: 720×380 FIXED, status-tinted surface gradient
    const hero = figma.createAutoLayout('VERTICAL', { name: 'hero-preview', itemSpacing: 24, counterAxisAlignItems: 'CENTER', primaryAxisAlignItems: 'CENTER' });
    inner.appendChild(hero);
    hero.resize(720, 380);
    hero.primaryAxisSizingMode = 'FIXED';
    hero.counterAxisSizingMode = 'FIXED';
    hero.layoutSizingHorizontal = 'FIXED';
    hero.layoutSizingVertical = 'FIXED';
    hero.setBoundVariable('itemSpacing', V.space['300']);
    hero.paddingTop = 56; hero.paddingBottom = 56; hero.paddingLeft = 56; hero.paddingRight = 56;
    // Background — status-tinted subtle surface (solid, bound)
    hero.fills = [sSurfaceSubtle()];
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) hero.setBoundVariable(r, V.radius.lg);
    hero.clipsContent = true;

    // Default-variant instance clone (if primary set has a default variant)
    let heroLabel = 'PLACEHOLDER · NOT YET BUILT';
    if (primarySet && primarySet.node && primarySet.node.defaultVariant) {
      try {
        const inst = primarySet.node.defaultVariant.createInstance();
        hero.appendChild(inst);
        heroLabel = `DEFAULT · ${primarySet.node.name.toUpperCase()}`;
      } catch (err) {
        heroLabel = `DEFAULT · ${primarySet.node.name.toUpperCase()} (instance failed)`;
      }
    }
    const cap = figma.createText();
    cap.fontName = { family: 'Geist Mono', style: 'Medium' };
    cap.fontSize = 12;
    cap.characters = heroLabel;
    cap.letterSpacing = { unit: 'PERCENT', value: 8 };
    cap.fills = [sText()];
    hero.appendChild(cap);
  };

  // =====================================================================
  // 7b. ANATOMY (light card, eyebrow 02) — omit if no state variants found
  // =====================================================================
  const buildAnatomy = () => {
    const states = ['Default', 'Hover', 'Active', 'Disabled'];
    const have = states.filter(s => stateInstances[s]);
    if (have.length < 2 || !stateInstances.Default) return false; // need at least Default + one more
    const card = lightCard(content, 'ANATOMY');
    sectionIds.ANATOMY = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '02', 'STATES & VISUAL', '· / anatomy',
      'States',
      `Interaction states for ${primarySet ? primarySet.node.name : 'the primary variant'}. Each state has its own visual treatment to communicate affordance.`
    );

    const grid = figma.createAutoLayout('HORIZONTAL', { name: 'state-grid', itemSpacing: 16, fills: [] });
    inner.appendChild(grid);
    grid.layoutSizingHorizontal = 'FILL';
    grid.layoutSizingVertical = 'HUG';
    grid.setBoundVariable('itemSpacing', V.space['200']);

    for (const stName of have) {
      const cell = figma.createAutoLayout('VERTICAL', { name: `state-${stName}`, itemSpacing: 16, counterAxisAlignItems: 'CENTER' });
      grid.appendChild(cell);
      // Resize FIRST to set both dimensions to FIXED, then re-apply layout sizing
      cell.resize(400, 220);
      cell.layoutSizingHorizontal = 'FILL';
      cell.layoutSizingVertical = 'FIXED';
      cell.setBoundVariable('itemSpacing', V.space['200']);
      cell.paddingTop = 48; cell.paddingBottom = 24; cell.paddingLeft = 24; cell.paddingRight = 24;
      cell.fills = [sSurfaceSubtle()];
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) cell.setBoundVariable(r, V.radius.lg);

      // Instance of the state variant
      try {
        const variant = figma.getNodeById(stateInstances[stName]);
        if (variant) {
          const inst = variant.createInstance();
          cell.appendChild(inst);
        }
      } catch (err) { /* skip on failure */ }

      // Flexible spacer between instance and label chip — pushes chip to bottom
      const spc = figma.createAutoLayout('HORIZONTAL', { name: 'spc', itemSpacing: 0, fills: [] });
      cell.appendChild(spc);
      spc.layoutSizingHorizontal = 'FILL';
      spc.layoutSizingVertical = 'FILL';

      // Label chip
      const chip = figma.createAutoLayout('HORIZONTAL', { name: 'label-chip', itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
      cell.appendChild(chip);
      chip.layoutSizingHorizontal = 'HUG';
      chip.layoutSizingVertical = 'HUG';
      chip.paddingTop = 4; chip.paddingBottom = 4; chip.paddingLeft = 10; chip.paddingRight = 10;
      chip.setBoundVariable('itemSpacing', V.space['100']);
      chip.fills = [bind(V.surface.main, COLORS.white)];
      chip.strokes = [bind(V.border.tertiary, COLORS.light)];
      chip.strokeWeight = 1;
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) chip.setBoundVariable(r, V.radius.full);
      const lbl = figma.createText();
      lbl.fontName = { family: 'Geist Mono', style: 'Medium' };
      lbl.fontSize = 12;
      lbl.characters = stName.toUpperCase();
      lbl.letterSpacing = { unit: 'PERCENT', value: 8 };
      lbl.fills = [bind(V.text.secondary, COLORS.mid)];
      chip.appendChild(lbl);
    }

    return true;
  };

  // =====================================================================
  // 7c. VARIANTS (light card, eyebrow 03) — omit if no variant sets
  // =====================================================================
  const buildVariants = () => {
    if (variantSets.length === 0) return false;
    const card = lightCard(content, 'VARIANTS');
    sectionIds.VARIANTS = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    const titleText = variantSets.length === 1
      ? 'All variants'
      : `${variantSets.length} variants`;
    secHead(inner, '03', 'COMPONENT VARIANTS', '· / variants',
      titleText,
      'Every visual variation of the component, organized by its variant properties.'
    );

    const row = figma.createAutoLayout('HORIZONTAL', { name: 'variants-row', itemSpacing: 32, fills: [], counterAxisAlignItems: 'MIN' });
    inner.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    row.layoutSizingVertical = 'HUG';
    row.setBoundVariable('itemSpacing', V.space['400']);
    row.layoutWrap = 'WRAP';

    for (const e of variantSets) {
      const stage = figma.createAutoLayout('VERTICAL', { name: `stage-${e.node.name}`, itemSpacing: 24, fills: [] });
      row.appendChild(stage);
      stage.layoutSizingHorizontal = 'HUG';
      stage.layoutSizingVertical = 'HUG';
      stage.setBoundVariable('itemSpacing', V.space['300']);
      stage.paddingTop = 32; stage.paddingBottom = 40; stage.paddingLeft = 40; stage.paddingRight = 40;
      stage.fills = [bind(V.surface.subtle, COLORS.light)];
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) stage.setBoundVariable(r, V.radius.lg);

      const lbl = figma.createText();
      lbl.fontName = { family: 'Inter', style: 'Bold' };
      lbl.fontSize = 18;
      lbl.characters = e.node.name;
      lbl.fills = [bind(V.text.primary, COLORS.dark)];
      stage.appendChild(lbl);

      // Reparent the COMPONENT_SET into this stage
      try {
        stage.appendChild(e.node);
        e.node.x = 0; e.node.y = 0; // grid set keeps its own internal coords
        reparented.push({ id: e.id, name: e.name, type: 'COMPONENT_SET', parent: 'VARIANTS' });
      } catch (err) {
        droppedNodes.push({ id: e.id, name: e.name, reason: `reparent to VARIANTS failed: ${err.message}` });
      }
    }

    return true;
  };

  // =====================================================================
  // 7d. SUB-COMPONENTS (light card, eyebrow 04) — omit if no sub sets
  // =====================================================================
  const buildSubComponents = () => {
    if (subSets.length === 0) return false;
    const card = lightCard(content, 'SUB-COMPONENTS');
    sectionIds.SUB_COMPONENTS = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '04', 'COMPOSITION', '· / sub-components',
      'Sub-components',
      'Internal building blocks used to compose this component. Reusable but not typically instanced standalone.'
    );

    const row = figma.createAutoLayout('HORIZONTAL', { name: 'subcomp-row', itemSpacing: 32, fills: [], counterAxisAlignItems: 'MIN' });
    inner.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    row.layoutSizingVertical = 'HUG';
    row.setBoundVariable('itemSpacing', V.space['400']);
    row.layoutWrap = 'WRAP';

    for (const e of subSets) {
      const stage = figma.createAutoLayout('VERTICAL', { name: `stage-${e.node.name}`, itemSpacing: 24, fills: [] });
      row.appendChild(stage);
      stage.layoutSizingHorizontal = 'HUG';
      stage.layoutSizingVertical = 'HUG';
      stage.setBoundVariable('itemSpacing', V.space['300']);
      stage.paddingTop = 32; stage.paddingBottom = 40; stage.paddingLeft = 40; stage.paddingRight = 40;
      stage.fills = [bind(V.surface.subtle, COLORS.light)];
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) stage.setBoundVariable(r, V.radius.lg);

      const lbl = figma.createText();
      lbl.fontName = { family: 'Inter', style: 'Bold' };
      lbl.fontSize = 18;
      lbl.characters = e.node.name;
      lbl.fills = [bind(V.text.primary, COLORS.dark)];
      stage.appendChild(lbl);

      try {
        stage.appendChild(e.node);
        e.node.x = 0; e.node.y = 0;
        reparented.push({ id: e.id, name: e.name, type: 'COMPONENT_SET', parent: 'SUB-COMPONENTS' });
      } catch (err) {
        droppedNodes.push({ id: e.id, name: e.name, reason: `reparent to SUB-COMPONENTS failed: ${err.message}` });
      }
    }

    return true;
  };

  // =====================================================================
  // 7e. USAGE (light card, eyebrow 05)
  // =====================================================================
  const buildUsage = () => {
    const wtu = CONFIG.json.whenToUse;
    const wnt = CONFIG.json.whenNotToUse;
    if (!wtu && !wnt) return false;
    const card = lightCard(content, 'USAGE');
    sectionIds.USAGE = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '05', 'GUIDELINES', '· / usage',
      'When to use, when not to',
      'Guidance from the component spec on appropriate usage.'
    );

    const cols = figma.createAutoLayout('HORIZONTAL', { name: 'use-cols', itemSpacing: 32, fills: [], counterAxisAlignItems: 'MIN' });
    inner.appendChild(cols);
    cols.layoutSizingHorizontal = 'FILL';
    cols.layoutSizingVertical = 'HUG';
    cols.setBoundVariable('itemSpacing', V.space['400']);

    const makeCol = (kicker, body) => {
      const col = figma.createAutoLayout('VERTICAL', { name: kicker, itemSpacing: 12, fills: [] });
      cols.appendChild(col);
      col.layoutSizingHorizontal = 'FILL';
      col.layoutSizingVertical = 'HUG';
      col.setBoundVariable('itemSpacing', V.space['150']);
      col.paddingTop = 24; col.paddingBottom = 24; col.paddingLeft = 24; col.paddingRight = 24;
      col.fills = [bind(V.surface.subtle, COLORS.light)];
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) col.setBoundVariable(r, V.radius.lg);
      const k = figma.createText();
      k.fontName = { family: 'Geist Mono', style: 'Medium' };
      k.fontSize = 11;
      k.characters = kicker;
      k.letterSpacing = { unit: 'PERCENT', value: 8 };
      k.fills = [bind(V.text.secondary, COLORS.mid)];
      col.appendChild(k);
      const t = figma.createText();
      t.fontName = { family: 'Inter', style: 'Regular' };
      t.fontSize = 18;
      t.lineHeight = { unit: 'PIXELS', value: 28 };
      t.characters = body;
      t.fills = [bind(V.text.primary, COLORS.dark)];
      col.appendChild(t);
      t.layoutSizingHorizontal = 'FILL';
    };
    if (wtu) makeCol('WHEN TO USE', wtu);
    if (wnt) makeCol('WHEN NOT TO USE', wnt);
    return true;
  };

  // =====================================================================
  // 7f. ACCESSIBILITY (light card, eyebrow 06)
  // =====================================================================
  const buildAccessibility = () => {
    const kbd = CONFIG.json.accessibility && CONFIG.json.accessibility.keyboard;
    if (!kbd || kbd.length === 0) return false;
    const card = lightCard(content, 'ACCESSIBILITY');
    sectionIds.ACCESSIBILITY = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '06', 'A11Y / WCAG', '· / accessibility',
      'Keyboard & screen reader',
      'Keyboard interactions defined by the component spec.'
    );

    const table = figma.createAutoLayout('VERTICAL', { name: 'kbd-table', itemSpacing: 0, fills: [] });
    inner.appendChild(table);
    table.layoutSizingHorizontal = 'FILL';
    table.layoutSizingVertical = 'HUG';
    table.strokes = [bind(V.border.tertiary, COLORS.light)];
    table.strokeWeight = 1;
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) table.setBoundVariable(r, V.radius.lg);
    table.clipsContent = true;

    // Header row
    const headerRow = figma.createAutoLayout('HORIZONTAL', { name: 'kbd-head', itemSpacing: 16, fills: [] });
    table.appendChild(headerRow);
    headerRow.layoutSizingHorizontal = 'FILL';
    headerRow.layoutSizingVertical = 'HUG';
    headerRow.paddingTop = 16; headerRow.paddingBottom = 16; headerRow.paddingLeft = 24; headerRow.paddingRight = 24;
    headerRow.setBoundVariable('itemSpacing', V.space['200']);
    headerRow.fills = [bind(V.surface.subtle, COLORS.light)];
    const headKey = figma.createText();
    headKey.fontName = { family: 'Geist Mono', style: 'Medium' };
    headKey.fontSize = 11;
    headKey.characters = 'KEY';
    headKey.letterSpacing = { unit: 'PERCENT', value: 8 };
    headKey.fills = [bind(V.text.secondary, COLORS.mid)];
    headerRow.appendChild(headKey);
    headKey.resize(280, headKey.height);
    headKey.layoutSizingHorizontal = 'FIXED';
    const headAct = figma.createText();
    headAct.fontName = { family: 'Geist Mono', style: 'Medium' };
    headAct.fontSize = 11;
    headAct.characters = 'ACTION';
    headAct.letterSpacing = { unit: 'PERCENT', value: 8 };
    headAct.fills = [bind(V.text.secondary, COLORS.mid)];
    headerRow.appendChild(headAct);
    headAct.layoutSizingHorizontal = 'FILL';

    for (const row of kbd) {
      const r = figma.createAutoLayout('HORIZONTAL', { name: 'kbd-row', itemSpacing: 16, fills: [] });
      table.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
      r.layoutSizingVertical = 'HUG';
      r.paddingTop = 16; r.paddingBottom = 16; r.paddingLeft = 24; r.paddingRight = 24;
      r.setBoundVariable('itemSpacing', V.space['200']);
      r.strokes = [bind(V.border.tertiary, COLORS.light)];
      r.strokeWeight = 1;
      r.strokeTopWeight = 1; r.strokeRightWeight = 0; r.strokeBottomWeight = 0; r.strokeLeftWeight = 0;
      const keyT = figma.createText();
      keyT.fontName = { family: 'Geist Mono', style: 'Medium' };
      keyT.fontSize = 14;
      keyT.characters = row.key || '';
      keyT.fills = [bind(V.text.primary, COLORS.dark)];
      r.appendChild(keyT);
      keyT.resize(280, keyT.height);
      keyT.layoutSizingHorizontal = 'FIXED';
      const actT = figma.createText();
      actT.fontName = { family: 'Inter', style: 'Regular' };
      actT.fontSize = 16;
      actT.lineHeight = { unit: 'PIXELS', value: 24 };
      actT.characters = row.action || '';
      actT.fills = [bind(V.text.primary, COLORS.dark)];
      r.appendChild(actT);
      actT.layoutSizingHorizontal = 'FILL';
    }
    return true;
  };

  // =====================================================================
  // 7g. META (dark card, eyebrow 07) — always rendered
  // =====================================================================
  const buildMeta = () => {
    const card = darkCard(content, 'META');
    sectionIds.META = card.id;
    // META inner — VERTICAL, gap 40 (space/500), padding 80 (space/1000)
    const inner = innerPad(card, 'VERTICAL', '500', '1000');

    // sec-head: eyebrow + "Where to go from here" (36pt)
    const head = figma.createAutoLayout('VERTICAL', { name: 'sec-head', itemSpacing: 16, fills: [] });
    inner.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    head.layoutSizingVertical = 'HUG';
    head.setBoundVariable('itemSpacing', V.space['200']);
    eyebrow(head, '07', 'RESOURCES & OWNERS', '· / meta', { dark: true });
    const title = figma.createText();
    title.fontName = { family: 'Inter', style: 'Bold' };
    title.fontSize = 36;
    title.lineHeight = { unit: 'PIXELS', value: 44 };
    title.letterSpacing = { unit: 'PERCENT', value: -1 };
    title.characters = 'Where to go from here';
    title.fills = [bind(V.text.inverse, COLORS.white)];
    head.appendChild(title);

    // links-row
    const links = figma.createAutoLayout('HORIZONTAL', { name: 'links-row', itemSpacing: 24, fills: [] });
    inner.appendChild(links);
    links.layoutSizingHorizontal = 'FILL';
    links.layoutSizingVertical = 'HUG';
    links.setBoundVariable('itemSpacing', V.space['300']);

    const makeLink = (cardName, kicker, titleText, url, primary) => {
      const lc = figma.createAutoLayout('VERTICAL', { name: cardName, itemSpacing: 16, fills: [] });
      links.appendChild(lc);
      lc.layoutSizingHorizontal = 'FILL';
      lc.layoutSizingVertical = 'HUG';
      lc.setBoundVariable('itemSpacing', V.space['200']);
      lc.paddingTop = 32; lc.paddingBottom = 32; lc.paddingLeft = 32; lc.paddingRight = 32;
      if (primary) {
        lc.fills = [bind(V.surface.main, COLORS.white)];
      } else {
        lc.fills = [bindOpacity(V.surface.main, COLORS.white, 0.04)];
        lc.strokes = [bindOpacity(V.border.inverse, COLORS.white, 0.15)];
        lc.strokeWeight = 1;
      }
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) lc.setBoundVariable(r, V.radius.lg);

      const top = figma.createAutoLayout('HORIZONTAL', { name: 'top', itemSpacing: 8, fills: [], counterAxisAlignItems: 'CENTER' });
      lc.appendChild(top);
      top.layoutSizingHorizontal = 'FILL';
      top.layoutSizingVertical = 'HUG';
      top.setBoundVariable('itemSpacing', V.space['100']);
      const k = figma.createText();
      k.fontName = { family: 'Geist Mono', style: 'Medium' };
      k.fontSize = 11;
      k.characters = kicker;
      k.letterSpacing = { unit: 'PERCENT', value: 8 };
      k.fills = [primary ? bind(V.text.secondary, COLORS.mid) : bindOpacity(V.text.inverse, COLORS.white, 0.6)];
      top.appendChild(k);
      const sp = figma.createAutoLayout('HORIZONTAL', { name: 'sp', itemSpacing: 0, fills: [] });
      top.appendChild(sp);
      sp.layoutSizingHorizontal = 'FILL';
      sp.layoutSizingVertical = 'HUG';
      const arrow = figma.createText();
      arrow.fontName = { family: 'Geist Mono', style: 'Bold' };
      arrow.fontSize = 22;
      arrow.characters = '↗';
      arrow.fills = [primary ? bind(V.text.primary, COLORS.dark) : bind(V.text.inverse, COLORS.white)];
      top.appendChild(arrow);

      const t = figma.createText();
      t.fontName = { family: 'Inter', style: 'Bold' };
      t.fontSize = 28;
      t.lineHeight = { unit: 'PIXELS', value: 32 };
      t.letterSpacing = { unit: 'PERCENT', value: -1 };
      t.characters = titleText;
      t.fills = [primary ? bind(V.text.primary, COLORS.dark) : bind(V.text.inverse, COLORS.white)];
      lc.appendChild(t);

      const u = figma.createText();
      u.fontName = { family: 'Geist Mono', style: 'Regular' };
      u.fontSize = 12;
      u.characters = url;
      u.fills = [primary ? bind(V.text.secondary, COLORS.mid) : bindOpacity(V.text.inverse, COLORS.white, 0.6)];
      lc.appendChild(u);
      u.layoutSizingHorizontal = 'FILL';
    };
    makeLink('link-UDS Docs page', 'SPEC', 'UDS Docs page', CONFIG.docsUrl || `https://udsdocs.com/?#${cid}`, true);
    makeLink('link-Open in Storybook', 'CODE', 'Open in Storybook', CONFIG.storybookUrl || `https://storybook/?path=/story/${cid} (placeholder)`, false);

    // Divider — 1px FILL/FIXED rectangle, white@8%
    const div = figma.createRectangle();
    div.name = 'divider';
    div.resize(2512, 1);
    div.fills = [bindOpacity(V.border.inverse, COLORS.white, 0.08)];
    inner.appendChild(div);
    div.layoutSizingHorizontal = 'FILL';

    // meta-row
    const metaRow = figma.createAutoLayout('HORIZONTAL', { name: 'meta-row', itemSpacing: 40, fills: [], counterAxisAlignItems: 'CENTER' });
    inner.appendChild(metaRow);
    metaRow.layoutSizingHorizontal = 'FILL';
    metaRow.layoutSizingVertical = 'HUG';
    metaRow.setBoundVariable('itemSpacing', V.space['500']);

    const makeMetaCol = (kicker, value) => {
      const col = figma.createAutoLayout('VERTICAL', { name: kicker, itemSpacing: 8, fills: [] });
      metaRow.appendChild(col);
      col.layoutSizingHorizontal = 'HUG';
      col.layoutSizingVertical = 'HUG';
      col.setBoundVariable('itemSpacing', V.space['100']);
      const k = figma.createText();
      k.fontName = { family: 'Geist Mono', style: 'Medium' };
      k.fontSize = 11;
      k.characters = kicker;
      k.letterSpacing = { unit: 'PERCENT', value: 8 };
      k.fills = [bindOpacity(V.text.inverse, COLORS.white, 0.5)];
      col.appendChild(k);
      const v = figma.createText();
      v.fontName = (kicker === 'CSS' || kicker === 'SPEC JSON' || kicker === 'GENERATED') ? { family: 'Geist Mono', style: 'Regular' } : { family: 'Inter', style: 'Semi Bold' };
      v.fontSize = 13;
      v.characters = value;
      v.fills = [bind(V.text.inverse, COLORS.white)];
      col.appendChild(v);
    };
    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    const tsLocal = `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}-${pad2(now.getUTCDate())} ${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())} UTC`;
    makeMetaCol('GENERATED', tsLocal);
    makeMetaCol('CSS', `uds/components/${cid}/${cid}.css`);
    makeMetaCol('SPEC JSON', `uds/components/${cid}/spec.json`);
    const ownerD = CONFIG.json.owner && CONFIG.json.owner.designer ? CONFIG.json.owner.designer : 'Unassigned';
    const ownerDev = CONFIG.json.owner && CONFIG.json.owner.developer ? CONFIG.json.owner.developer : 'Unassigned';
    makeMetaCol('DESIGNER', ownerD);
    makeMetaCol('DEVELOPER', ownerDev);

    // spacer
    const sp2 = figma.createAutoLayout('HORIZONTAL', { name: 'sp2', itemSpacing: 0, fills: [] });
    metaRow.appendChild(sp2);
    sp2.layoutSizingHorizontal = 'FILL';
    sp2.layoutSizingVertical = 'HUG';

    statusPill(metaRow);
  };

  // =====================================================================
  // 8. Section dispatch — render in fixed order; eyebrow numbers stay assigned
  // =====================================================================
  buildHeader();
  buildAnatomy();
  buildVariants();
  buildSubComponents();
  buildUsage();
  buildAccessibility();
  buildMeta();

  // =====================================================================
  // 9. Verify no inventoried node was lost. Anything still parked at
  //    (5000, -5000) that isn't inside the wrapper is unreparented; move
  //    it to a visible spot below the wrapper for designer review.
  // =====================================================================
  const unreparented = [];
  // After the wrapper is built, get its height so we can place stragglers below.
  const wrapperBottom = outer.height + 100;
  let strayX = 0;
  for (const e of allNodes) {
    const n = figma.getNodeById(e.id);
    if (!n) {
      droppedNodes.push({ id: e.id, name: e.name, reason: 'node disappeared during build' });
      continue;
    }
    // Walk up: is the node now a descendant of the new wrapper?
    let p = n.parent;
    let inside = false;
    while (p) {
      if (p === outer) { inside = true; break; }
      p = p.parent;
    }
    if (!inside) {
      // Move to page level, visible
      try {
        page.appendChild(n);
        n.x = strayX;
        n.y = wrapperBottom;
        strayX += (n.width || 200) + 80;
        unreparented.push({ id: e.id, name: e.name, type: e.type, reason: 'no auto-classification rule matched' });
      } catch (err) {
        droppedNodes.push({ id: e.id, name: e.name, reason: `move-stray failed: ${err.message}` });
      }
    }
  }

  // Also resurface any ad-hoc top-level non-COMPONENT nodes (SECTIONs, FRAMEs,
  // RECTANGLEs, etc.) so the report can flag them. They stay at page level.
  const adhocPreserved = sectionLessTop.map(n => ({ ...n, reason: 'ad-hoc top-level node preserved for designer review' }));

  return {
    pageId: page.id,
    pageName: page.name,
    componentId: cid,
    status: CONFIG.status,
    operation: existingWrapper ? 'update' : 'create',
    outerFrameId: outer.id,
    contentFrameId: content.id,
    outerDim: { w: Math.round(outer.width), h: Math.round(outer.height) },
    sectionIds,
    primarySet: primarySet ? { id: primarySet.id, name: primarySet.name } : null,
    stateInstancesDiscovered: Object.keys(stateInstances),
    variantSetIds: variantSets.map(e => e.id),
    subSetIds: subSets.map(e => e.id),
    inventoryPreserved: Array.from(inventoryMap.values()),
    reparented,
    unreparented,
    adhocPreserved,
    droppedNodes,
  };
}

// =====================================================================
// Run the batch
// =====================================================================
const results = [];
for (const cfg of BATCH) {
  try {
    const r = await buildOne(cfg);
    results.push(r);
  } catch (err) {
    results.push({ componentId: cfg.componentId, error: err.message, stack: String(err.stack || '').slice(0, 1000) });
  }
}
return { batchCount: BATCH.length, results };
