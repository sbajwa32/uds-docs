// =====================================================================
// UDS Figma Component Card Builder — Phase 1b-A: Top-of-Card Sections
// =====================================================================
//
// Second of four scripts that together build the component spec card
// and its companion workspace card. Each script fits comfortably under
// the use_figma `code` parameter limit (50k chars) and represents a
// focused, atomic operation:
//
//   Phase 1a   (build-card-inventory.js)    Inventory + park + teardown
//   Phase 1b-A (THIS FILE)                  Outer wrapper + HEADER +
//                                           ANATOMY + VARIANTS
//   Phase 1b-B (build-card-sections-B.js)   SUB-COMPONENTS + USAGE +
//                                           ACCESSIBILITY + META + cleanup
//   Phase 2    (build-workspace-card.js)    Workspace card at (2900, 0)
//
// Why split phase 1b in two:
//
//   The full 7-section build is too large to fit a single use_figma
//   `code` payload (~50k char limit) when authored with full comment
//   density. Splitting at the natural mid-card boundary (after VARIANTS,
//   before SUB-COMPONENTS) produces two scripts that are each ~35–45k
//   with rich documentation, and lets each phase render an atomic batch
//   of nodes within Figma's plugin guidelines.
//
//   Phase 1b-A creates the wrapper at (0, 0) and renders the upper
//   three sections. Phase 1b-B looks the wrapper up by ID (returned
//   in this script's result) and continues building from where 1b-A
//   left off. The two halves share the same status-driven token
//   resolvers + helper definitions, declared inline in each script.
//
// Atomicity:
//
//   Each phase is its own atomic Figma transaction. If 1b-A throws
//   the wrapper isn't created and you can re-run after fixing. If
//   1b-B throws the wrapper is left with the top three sections only,
//   which is recoverable by re-running 1b-B (it appends to the
//   existing content frame; it doesn't recreate it).
//
// What this script does:
//
//   1. Rehydrates the classification payload phase 1a returned
//      (primary set, variant sets, sub sets, state instances). The
//      `inventory` object is injected via CONFIG.
//   2. Creates the `udc-<id>-page` outer wrapper at (0, 0) with the
//      status-colored top accent strip and the inner content frame.
//   3. Renders HEADER (dark card, eyebrow 01) — title, description,
//      status pill, CSS chip, hero preview with default-variant clone.
//   4. Renders ANATOMY (light card, eyebrow 02) when at least Default
//      plus one other state variant exists in the primary set.
//   5. Renders VARIANTS (light card, eyebrow 03) — HORIZONTAL row of
//      FIXED-width stages, even-split across 2544px inner card width
//      minus 32px gaps, mirroring the canonical _TEMPLATE.
//
//   Reparents COMPONENT_SETs from `inventory.variantSetIds` into the
//   VARIANTS card (one per stage). The primary set's defaultVariant
//   is cloned for the HEADER hero. Sub-component COMPONENT_SETs
//   stay parked at (5000, -5000) for phase 1b-B to claim.
//
// Returns:
//
//   { pageId, componentId, outerFrameId, contentFrameId,
//     sectionIds:    { HEADER, ANATOMY?, VARIANTS? },
//     primarySet, variantSetIds, subSetIds, stateInstancesDiscovered,
//     reparented,    // [{id, name, type, parent}]
//     droppedNodes,  // any nodes that failed to reparent
//     existingWorkspaceFrameId,  // pass-through to phase 2
//     adhocFrameIds }            // pass-through to phase 1b-B → phase 2
//
//   Phase 1b-B injects this object into its own CONFIG as
//   `CONFIG.fromPhase1bA` and looks up the wrapper by `outerFrameId`.
//
// =====================================================================

// ----- BATCH CONFIG -----
//
// Inject `const BATCH = [{ ... }, ...]` before sending to use_figma.
// Each CONFIG entry needs:
//
//   pageId          Figma page id, e.g. '5445:5057' for radio
//   componentId     Kebab-case slug, e.g. 'radio'
//   componentTitle  Display title for HEADER (defaults to json.title)
//   status          One of: in-progress | review | blocked |
//                   production | placeholder
//   udsVersion      e.g. '0.3' (currently unused but recorded)
//   docsUrl         Link target for the META "UDS Docs page" card
//   storybookUrl    Link target for the META "Open in Storybook" card
//   json            Parsed spec.json (only the fields HEADER reads)
//   statusJson      Parsed status.json (only `current` is read)
//   inventory       The full return value from phase 1a — the agent
//                   passes phase 1a's result through verbatim.
//
// Example (single component, radio):
//
//   const BATCH = [{
//     pageId: '5445:5057', componentId: 'radio',
//     componentTitle: 'Radio', status: 'in-progress', udsVersion: '0.3',
//     docsUrl: 'https://uds.urban.com/?#radio',
//     storybookUrl: 'https://storybook/?path=/story/radio (placeholder)',
//     json: { title: 'Radio', description: '…', dependencies: { … },
//             whenToUse: '…', whenNotToUse: '…',
//             accessibility: { keyboard: [ … ] },
//             owner: { designer: '…', developer: '…' } },
//     statusJson: { current: 'in-progress' },
//     inventory: { /* phase 1a return */ },
//   }];
//
// =====================================================================


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

const STATUS_TOKENS = {
  'in-progress': { color: 'warning', label: 'IN PROGRESS' },
  'review':      { color: 'warning', label: 'IN REVIEW' },
  'blocked':     { color: 'error',   label: 'BLOCKED' },
  'production':  { color: 'success', label: 'PRODUCTION READY' },
  'placeholder': { color: 'tertiary',label: 'NOT STARTED' },
};

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

for (const style of ['Bold', 'Semi Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Inter', style });
}
for (const style of ['Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Geist Mono', style });
}

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

const bind = (variable, color) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color }, 'color', variable);
const bindOpacity = (variable, color, opacity) =>
  figma.variables.setBoundVariableForPaint({ type: 'SOLID', color, opacity }, 'color', variable);

// Bind all four corner radii on a node to a single radius variable.
// Equivalent to four separate setBoundVariable calls; deduplicates
// the pattern that appears in every card / chip / pill / stage. Pass
// the variable (V.radius.xl etc.), not its key.
const setRadii = (node, variable) => {
  for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
    node.setBoundVariable(r, variable);
  }
};

// Bind all four padding sides on an auto-layout node to a single space
// variable. Equivalent to four separate setBoundVariable calls.
const setPad = (node, variable) => {
  for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) {
    node.setBoundVariable(k, variable);
  }
};

// Set layoutSizingHorizontal + layoutSizingVertical in a single call.
// Replaces the two-line idiom that appears ~50 times across the
// section builders. Both args are 'FILL' | 'HUG' | 'FIXED'. Note: this
// must be called AFTER the node has been appended to its auto-layout
// parent, per the figma-use rule "Set layoutSizingHorizontal/Vertical
// AFTER appendChild".
const setSize = (node, h, v) => {
  node.layoutSizingHorizontal = h;
  node.layoutSizingVertical = v;
};

// Set all four padding sides to the same literal pixel value. Used
// when the design calls for a symmetric padding that's NOT bound to
// a space token (rare — most paddings should be bound via setPad).
const setLitPad = (node, px) => {
  node.paddingTop = px; node.paddingBottom = px;
  node.paddingLeft = px; node.paddingRight = px;
};

// Set asymmetric literal padding (top, bottom, left, right). Used when
// the design calls for different values per side and binding to a token
// would lose the intent. Most paddings should still bind to space tokens
// via setPad — this helper is for one-off cases like the keyboard-table
// row's [16, 24, 16, 24].
const setLitPad4 = (node, t, b, l, r) => {
  node.paddingTop = t; node.paddingBottom = b;
  node.paddingLeft = l; node.paddingRight = r;
};

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

  // -------- Rehydrate inventory + classification from phase 1a --------
  //
  // Phase 1a (build-card-inventory.js) walked the page, classified every
  // preservable node, parked them at (5000, -5000), and tore down the old
  // `udc-<id>-page` wrapper. It returned a JSON payload that the agent
  // injects into this script's CONFIG as `CONFIG.inventory`. We rebuild
  // the working data structures (primarySet, variantSets, subSets,
  // stateInstances) from those IDs by looking each node up via
  // `figma.getNodeById`. Library bindings, variant references, and Code
  // Connect mappings all survive the cross-call hop because Figma node
  // IDs are stable.
  //
  // This script does NOT re-walk the page. The contract is: phase 1a
  // ran successfully and produced a `CONFIG.inventory` block, OR the
  // user is invoking phase 1b manually with a hand-built CONFIG (testing).
  const cid = CONFIG.componentId;
  const inv = CONFIG.inventory || {};
  const wrapperName = `udc-${cid}-page`;

  const existingWorkspace = inv.existingWorkspaceFrameId
    ? figma.getNodeById(inv.existingWorkspaceFrameId)
    : null;

  // Primary set + its variant + sub set entries. Each entry is
  // { id, name, node } so the section builders can reach the live node.
  const lookupEntry = (id) => {
    const node = figma.getNodeById(id);
    return node ? { id, name: node.name, type: node.type, node } : null;
  };

  const primarySet = inv.primary
    ? lookupEntry(inv.primary.id)
    : null;
  const variantSets = (inv.variantSetIds || []).map(lookupEntry).filter(Boolean);
  const subSets     = (inv.subSetIds     || []).map(lookupEntry).filter(Boolean);
  const stateInstances = inv.stateInstances || {};

  // Inventory map used only for the legacy `inventoryPreserved` return
  // field (kept for back-compat with existing audit tooling).
  const inventoryMap = new Map();
  for (const id of (inv.inventory && inv.inventory.preservedNodeIds) || []) {
    const node = figma.getNodeById(id);
    if (node) inventoryMap.set(id, { id, name: node.name, type: node.type, sources: ['phase-1a'] });
  }
  const allNodes = Array.from(inventoryMap.values())
    .map(e => ({ ...e, node: figma.getNodeById(e.id) }))
    .filter(e => e.node);

  // Ad-hoc top-level non-component frames (SECTIONs / FRAMEs / RECTANGLEs)
  // that phase 1a captured. Used in the workspaceHandoff at the end of
  // this script. Phase 2 (build-workspace-card.js) reparents them into
  // the workspace card's W03 SCRATCH section.
  const sectionLessTop = ((inv.inventory && inv.inventory.adhocFrameIds) || []).map(id => {
    const n = figma.getNodeById(id);
    return n ? { id, name: n.name, type: n.type } : { id, name: '(missing)', type: null };
  }).filter(e => e.type !== null);

  // The droppedNodes accumulator collects any node that fails to
  // reparent during section construction. Phase 1a may also have
  // populated it; we merge.
  const droppedNodes = Array.isArray(inv.droppedNodes) ? [...inv.droppedNodes] : [];

  // Reporting only — was a wrapper torn down by phase 1a?
  const operationFromPhase1a = inv.operation || (existingWorkspace ? 'update' : 'create');


  // 5. BUILD outer wrapper + status accent + content frame
  const outer = figma.createAutoLayout('VERTICAL', { name: wrapperName, itemSpacing: 0 });
  outer.x = 0; outer.y = 0;
  outer.resize(2800, 100);
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'FIXED';
  outer.fills = [bind(V.surface.subtle, COLORS.light)];
  setRadii(outer, V.radius.xl);
  outer.clipsContent = true;

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
  setSize(content, 'FILL', 'HUG');
  content.setBoundVariable('itemSpacing', V.space['1000']);
  setPad(content, V.space['800']);

  // 6. SHARED CARD / EYEBROW HELPERS
  // eyebrow: renders [NUM | 1×bar | KICKER (+ optional sub-label)]
  const eyebrow = (parent, num, kicker, sublabel, opts) => {
    const isDark = opts && opts.dark;
    const large = opts && opts.large;
    const eb = figma.createAutoLayout('HORIZONTAL', { name: 'eyebrow', itemSpacing: 16, counterAxisAlignItems: 'CENTER', fills: [] });
    parent.appendChild(eb);
    setSize(eb, 'HUG', 'HUG');
    // Reference cards space NUMBER → BAR → COLUMN with 16px (space/200).
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
    setSize(col, 'HUG', 'HUG');
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
    setSize(card, 'FILL', 'HUG');
    card.fills = [bind(V.surface.main, COLORS.white)];
    card.strokes = [bind(V.border.tertiary, COLORS.light)];
    card.strokeWeight = 1;
    setRadii(card, V.radius.xl);
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
    setSize(card, 'FILL', 'HUG');
    card.fills = [bind(V.surface.xxbold, COLORS.darkBg)];
    card.strokes = [bind(V.border.inverse, COLORS.darkBorder)];
    card.strokeWeight = 1;
    setRadii(card, V.radius.xl);
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
    setSize(inner, 'FILL', 'HUG');
    inner.setBoundVariable('itemSpacing', V.space[gapKey]);
    setPad(inner, V.space[padKey]);
    return inner;
  };

  // Creates [eyebrow | title | description?] sec-head block — used by ANATOMY,
  // VARIANTS, SUB-COMPONENTS, USAGE, ACCESSIBILITY.
  const secHead = (parent, num, kicker, sublabel, title, description) => {
    const head = figma.createAutoLayout('VERTICAL', { name: 'sec-head', itemSpacing: 12, fills: [] });
    parent.appendChild(head);
    setSize(head, 'FILL', 'HUG');
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
    setSize(pill, 'HUG', 'HUG');
    setLitPad4(pill, 8, 8, 14, 16);
    pill.setBoundVariable('itemSpacing', V.space['100']);
    if (status.color === 'tertiary') {
      pill.fills = [bindOpacity(V.surface.subtle, COLORS.light, 0.18)];
    } else {
      pill.fills = [bindOpacity(V.surface[status.color], statusColorLiteral, 0.18)];
    }
    pill.strokes = [sBorder()];
    pill.strokeWeight = 1;
    setRadii(pill, V.radius.full);
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

  // 7a. HEADER (dark card, eyebrow 01)
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
    setSize(inner, 'FILL', 'HUG');
    inner.setBoundVariable('itemSpacing', V.space['600']);
    setPad(inner, V.space['1000']);

    // left-col: VERTICAL, FILL/HUG, gap 32 (space/400)
    const left = figma.createAutoLayout('VERTICAL', { name: 'left-col', itemSpacing: 32, fills: [] });
    inner.appendChild(left);
    setSize(left, 'FILL', 'HUG');
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
    setSize(pillRow, 'FILL', 'HUG');
    pillRow.setBoundVariable('itemSpacing', V.space['150']);

    statusPill(pillRow);

    // CSS chip
    const css = (CONFIG.json.dependencies && CONFIG.json.dependencies.css && CONFIG.json.dependencies.css[0])
      || `uds/components/${cid}/${cid}.css`;
    {
      const chip = figma.createAutoLayout('HORIZONTAL', { name: 'css-chip', itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
      pillRow.appendChild(chip);
      setSize(chip, 'HUG', 'HUG');
      setLitPad4(chip, 8, 8, 12, 14);
      chip.setBoundVariable('itemSpacing', V.space['100']);
      chip.fills = [bindOpacity(V.surface.main, COLORS.white, 0.06)];
      chip.strokes = [bindOpacity(V.border.inverse, COLORS.white, 0.1)];
      chip.strokeWeight = 1;
      setRadii(chip, V.radius.full);
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
    setSize(sp, 'FILL', 'HUG');

    // hero-preview: 720×380 FIXED, status-tinted surface gradient
    const hero = figma.createAutoLayout('VERTICAL', { name: 'hero-preview', itemSpacing: 24, counterAxisAlignItems: 'CENTER', primaryAxisAlignItems: 'CENTER' });
    inner.appendChild(hero);
    hero.resize(720, 380);
    hero.primaryAxisSizingMode = 'FIXED';
    hero.counterAxisSizingMode = 'FIXED';
    setSize(hero, 'FIXED', 'FIXED');
    hero.setBoundVariable('itemSpacing', V.space['300']);
    setLitPad(hero, 56);
    // Background — status-tinted subtle surface (solid, bound)
    hero.fills = [sSurfaceSubtle()];
    setRadii(hero, V.radius.lg);
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

  // 7b. ANATOMY (light card, eyebrow 02) — omit if no state variants found
  const buildAnatomy = () => {
    const states = ['Default', 'Hover', 'Active', 'Disabled'];
    const have = states.filter(s => stateInstances[s]);
    if (have.length < 2 || !stateInstances.Default) return false; // need at least Default + one more
    const card = lightCard(content, 'ANATOMY');
    sectionIds.ANATOMY = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '02', 'STATES & VISUAL', '· / anatomy',
      'States',
      'Interaction states for the primary medium variant. Each state has its own visual treatment to communicate affordance.'
    );

    const grid = figma.createAutoLayout('HORIZONTAL', { name: 'state-grid', itemSpacing: 16, fills: [] });
    inner.appendChild(grid);
    setSize(grid, 'FILL', 'HUG');
    grid.setBoundVariable('itemSpacing', V.space['200']);

    for (const stName of have) {
      const cell = figma.createAutoLayout('VERTICAL', { name: `state-${stName}`, itemSpacing: 16, counterAxisAlignItems: 'CENTER' });
      grid.appendChild(cell);
      // Resize FIRST to set both dimensions to FIXED, then re-apply layout sizing
      cell.resize(400, 220);
      setSize(cell, 'FILL', 'FIXED');
      cell.setBoundVariable('itemSpacing', V.space['200']);
      setLitPad4(cell, 48, 24, 24, 24);
      cell.fills = [sSurfaceSubtle()];
      // ANATOMY state cells use radius/container-md (12) per the canonical
      // _TEMPLATE page (UDS Components, id 7481:14). Inner stage cards
      // across ANATOMY/VARIANTS/SUB-COMPONENTS all use md; only the outer
      // wrappers (HEADER, USAGE columns, META link cards, the keyboard-
      // table) use lg.
      setRadii(cell, V.radius.md);

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
      setSize(spc, 'FILL', 'FILL');

      // Label chip
      const chip = figma.createAutoLayout('HORIZONTAL', { name: 'label-chip', itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
      cell.appendChild(chip);
      setSize(chip, 'HUG', 'HUG');
      setLitPad4(chip, 4, 4, 10, 10);
      chip.setBoundVariable('itemSpacing', V.space['100']);
      chip.fills = [bind(V.surface.main, COLORS.white)];
      chip.strokes = [bind(V.border.tertiary, COLORS.light)];
      chip.strokeWeight = 1;
      setRadii(chip, V.radius.full);
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

  // 7c. VARIANTS (light card, eyebrow 03) — omit if no variant sets
  const buildVariants = () => {
    if (variantSets.length === 0) return false;
    const card = lightCard(content, 'VARIANTS');
    sectionIds.VARIANTS = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '03', 'COMPONENT VARIANTS', '· / variants',
      'Variant matrix',
      'Each variant shows the full state matrix — destructive on/off, sizes, icon options, and interaction states.'
    );

    // variants-row — HORIZONTAL with FIXED-width stages, even-split across
    // the inner card width (2544) minus 32px gaps. This matches the
    // canonical _TEMPLATE page (UDS Components, id 7481:14, frame 7687:46),
    // where stages live side-by-side rather than stacked. Earlier iteration
    // used VERTICAL/FILL; that contradicted the template and lost the
    // variant-matrix-at-a-glance affordance the design relies on. See
    // references/card-rollout-drift-report.md drift #1 for context.
    const row = figma.createAutoLayout('HORIZONTAL', { name: 'variants-row', itemSpacing: 32, fills: [] });
    inner.appendChild(row);
    setSize(row, 'FILL', 'HUG');
    row.setBoundVariable('itemSpacing', V.space['400']);

    const VARIANT_INNER_WIDTH = 2544;
    const stageGap = 32;
    const stageCount = variantSets.length;
    const stageWidth = Math.max(200, Math.floor((VARIANT_INNER_WIDTH - stageGap * (stageCount - 1)) / stageCount));

    for (const e of variantSets) {
      const stage = figma.createAutoLayout('VERTICAL', { name: `stage-${e.node.name}`, itemSpacing: 24, fills: [] });
      row.appendChild(stage);
      // Resize FIRST so both axes go to FIXED, then promote the vertical axis
      // back to HUG so the stage sizes to its content (instance height varies
      // per component). Per references/gotchas.md "Resize before sizing modes".
      stage.resize(stageWidth, 200);
      setSize(stage, 'FIXED', 'HUG');
      stage.setBoundVariable('itemSpacing', V.space['300']);
      setLitPad4(stage, 32, 40, 40, 40);
      stage.fills = [bind(V.surface.subtle, COLORS.light)];
      setRadii(stage, V.radius.md);

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


  // -------- Dispatch the three top-of-card sections --------
  //
  // We render HEADER, then ANATOMY (if state variants exist), then
  // VARIANTS (if any non-underscore COMPONENT_SETs exist). Phase 1b-B
  // continues with SUB-COMPONENTS / USAGE / ACCESSIBILITY / META by
  // looking up `outerFrameId` + `contentFrameId` from this script's
  // return value. Eyebrow numbers stay assigned by section identity,
  // not by render order — so a page that omits SUB-COMPONENTS will
  // render `01 → 02 → 03 → 05 → 06 → 07` (skipping 04).
  const dispatched = {
    HEADER:   true,
    ANATOMY:  buildAnatomy(),
    VARIANTS: buildVariants(),
  };

  // Categorize remaining inventory at the partial-card boundary so
  // phase 1b-B (which walks the same set after appending its sections)
  // can pick up where we left off. We don't compute unclassifiedNodeIds
  // here — that's phase 1b-B's job after ALL sections have been
  // rendered and reparented.

  return {
    pageId: page.id,
    pageName: page.name,
    componentId: cid,
    status: CONFIG.status,
    operation: operationFromPhase1a,
    outerFrameId: outer.id,
    contentFrameId: content.id,
    outerDim: { w: Math.round(outer.width), h: Math.round(outer.height) },
    sectionIds,
    sectionsRendered: dispatched,
    primarySet: primarySet ? { id: primarySet.id, name: primarySet.name } : null,
    stateInstancesDiscovered: Object.keys(stateInstances),
    variantSetIds: variantSets.map(e => e.id),
    subSetIds: subSets.map(e => e.id),
    inventoryPreserved: Array.from(inventoryMap.values()),
    reparented,
    droppedNodes,
    // Existing workspace, if any. Phase 2 (build-workspace-card.js)
    // owns its lifecycle.
    existingWorkspaceFrameId: existingWorkspace ? existingWorkspace.id : null,
    // Top-level ad-hoc non-component nodes captured by phase 1a.
    // Phase 1b-B passes these through to phase 2's adhocFrameIds.
    adhocFrameIds: sectionLessTop.map(n => n.id),
  };
}

const results = [];
for (const cfg of BATCH) {
  try {
    results.push(await buildOne(cfg));
  } catch (err) {
    results.push({ componentId: cfg.componentId, error: err.message, stack: String(err.stack || '').slice(0, 1000) });
  }
}
return { batchCount: BATCH.length, results };
