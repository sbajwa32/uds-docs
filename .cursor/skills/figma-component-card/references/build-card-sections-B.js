// =====================================================================
// UDS Figma Component Card Builder — Phase 1b-B: Bottom-of-Card Sections
// =====================================================================
//
// Third of four scripts. Phase 1a + 1b-A ran first; this script
// continues building the spec card from where 1b-A left off, then
// runs the cleanup pass that produces the workspaceHandoff payload
// for phase 2.
//
//   Phase 1a   (build-card-inventory.js)    Inventory + park + teardown
//   Phase 1b-A (build-card-sections-A.js)   Outer wrapper + HEADER +
//                                           ANATOMY + VARIANTS
//   Phase 1b-B (THIS FILE)                  SUB-COMPONENTS + USAGE +
//                                           ACCESSIBILITY + META + cleanup
//   Phase 2    (build-workspace-card.js)    Workspace card at (2900, 0)
//
// What this script does:
//
//   1. Looks up the `udc-<id>-page` outer wrapper + content frame from
//      phase 1b-A's return (CONFIG.fromPhase1bA.outerFrameId +
//      contentFrameId). Throws if either is missing — that means 1b-A
//      didn't run or its result wasn't wired into our CONFIG.
//   2. Rehydrates the same classification payload phase 1a returned
//      (primary set is referenced for clean-up only here; sub sets are
//      what this script actually reparents).
//   3. Renders SUB-COMPONENTS (light card, eyebrow 04) when underscore-
//      prefixed COMPONENT_SETs exist in the inventory.
//   4. Renders USAGE (light card, eyebrow 05) when spec.json has
//      whenToUse and/or whenNotToUse text.
//   5. Renders ACCESSIBILITY (light card, eyebrow 06) when spec.json
//      has at least one accessibility.keyboard entry.
//   6. Renders META (dark card, eyebrow 07) — always rendered.
//   7. Runs the cleanup pass: walks every preserved node from phase 1a
//      and checks whether it landed inside the wrapper. Anything
//      stranded (still parked at (5000, -5000) outside the wrapper)
//      goes to `workspaceHandoff.unclassifiedNodeIds`. Adhoc top-level
//      frames go to `workspaceHandoff.adhocFrameIds`. Phase 2 reparents
//      both into the workspace card's W02 / W03 sections.
//
// Atomicity:
//
//   This phase is its own atomic Figma transaction. If 1b-B throws
//   the wrapper is left with whatever sections 1b-A produced; you can
//   re-run 1b-B after fixing the cause. The script is idempotent at
//   the section-creation level — re-running on a wrapper that already
//   has SUB-COMPONENTS / USAGE / ACCESSIBILITY / META will append
//   duplicates, so don't run twice without first re-running 1a + 1b-A.
//
// Returns:
//
//   { pageId, componentId, outerFrameId,
//     sectionIds: { HEADER, ANATOMY?, VARIANTS?, SUB_COMPONENTS?,
//                   USAGE?, ACCESSIBILITY?, META },
//     reparented,         // accumulated across 1b-A + 1b-B
//     droppedNodes,
//     workspaceHandoff: { existingWorkspaceFrameId,
//                         unclassifiedNodeIds, adhocFrameIds } }
//
//   Phase 2 (build-workspace-card.js) reads workspaceHandoff to build
//   the workspace card at (2900, 0).
//
// =====================================================================

// ----- BATCH CONFIG -----
//
// Inject `const BATCH = [{ ... }, ...]` before sending. Each entry needs
// the same fields phase 1b-A took, PLUS the `fromPhase1bA` field which
// is phase 1b-A's return value passed through verbatim:
//
//   ...                same as phase 1b-A
//   inventory          phase 1a's return (also in 1b-A's CONFIG)
//   fromPhase1bA       phase 1b-A's return; must include outerFrameId,
//                      contentFrameId, sectionIds, reparented[]
//
// Example:
//
//   const BATCH = [{
//     pageId: '5445:5057', componentId: 'radio',
//     componentTitle: 'Radio', status: 'in-progress', udsVersion: '0.3',
//     docsUrl: '…', storybookUrl: '…',
//     json: { … }, statusJson: { current: 'in-progress' },
//     inventory:    { /* phase 1a return */ },
//     fromPhase1bA: { /* phase 1b-A return */ },
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


  // -------- Look up outer wrapper + content frame from phase 1b-A --------
  //
  // Phase 1b-A (build-card-sections-A.js) created the `udc-<id>-page`
  // wrapper at (0, 0), the status accent rectangle, and the inner
  // content frame, then rendered HEADER + ANATOMY + VARIANTS into
  // content. It returned `outerFrameId` and `contentFrameId` so this
  // script can keep appending sections to the same content frame.
  //
  // The figma node IDs are stable across use_figma calls, so a simple
  // `figma.getNodeById` lookup re-acquires the live nodes. If the IDs
  // resolve to nothing, phase 1b-A didn't run (or its result wasn't
  // wired into our CONFIG) — we throw to surface the error early.
  const fromA = CONFIG.fromPhase1bA || {};
  if (!fromA.outerFrameId || !fromA.contentFrameId) {
    throw new Error(
      'Phase 1b-B requires CONFIG.fromPhase1bA.outerFrameId and ' +
      'CONFIG.fromPhase1bA.contentFrameId from a prior phase 1b-A run.'
    );
  }
  const outer = figma.getNodeById(fromA.outerFrameId);
  const content = figma.getNodeById(fromA.contentFrameId);
  if (!outer || !content) {
    throw new Error(
      `Phase 1b-A frames not found: outer=${fromA.outerFrameId}, ` +
      `content=${fromA.contentFrameId}. Did the wrapper get deleted ` +
      'between phase 1b-A and 1b-B?'
    );
  }
  const sectionIds = (fromA.sectionIds && typeof fromA.sectionIds === 'object')
    ? Object.assign({}, fromA.sectionIds)
    : {};
  const reparented = Array.isArray(fromA.reparented) ? [...fromA.reparented] : [];


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

  // sectionIds and reparented were already initialized from
  // CONFIG.fromPhase1bA in the lookup block above.

  // 7d. SUB-COMPONENTS (light card, eyebrow 04) — omit if no sub sets
  const buildSubComponents = () => {
    if (subSets.length === 0) return false;
    const card = lightCard(content, 'SUB-COMPONENTS');
    sectionIds.SUB_COMPONENTS = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '04', 'COMPOSITION', '· / sub-components',
      'Component groups',
      'Sub-component sets that compose with the primary set — like button groups or input add-ons. Reparented in as their own stages.'
    );

    // subs-row — HORIZONTAL with FIXED-width stages, mirroring VARIANTS.
    // The canonical _TEMPLATE (UDS Components, id 7481:14, frame 7687:70)
    // places sub-components side-by-side rather than stacked. See
    // references/card-rollout-drift-report.md drift #2 for the prior
    // VERTICAL/FILL regression and why HORIZONTAL/FIXED is the correct
    // match.
    const row = figma.createAutoLayout('HORIZONTAL', { name: 'subs-row', itemSpacing: 32, fills: [] });
    inner.appendChild(row);
    setSize(row, 'FILL', 'HUG');
    row.setBoundVariable('itemSpacing', V.space['400']);

    const SUB_INNER_WIDTH = 2544;
    const subGap = 32;
    const subCount = subSets.length;
    const subStageWidth = Math.max(200, Math.floor((SUB_INNER_WIDTH - subGap * (subCount - 1)) / subCount));

    for (const e of subSets) {
      const stage = figma.createAutoLayout('VERTICAL', { name: `stage-${e.node.name}`, itemSpacing: 16, fills: [] });
      row.appendChild(stage);
      stage.resize(subStageWidth, 200);
      setSize(stage, 'FIXED', 'HUG');
      stage.setBoundVariable('itemSpacing', V.space['200']);
      setLitPad4(stage, 32, 40, 40, 40);
      stage.fills = [bind(V.surface.subtle, COLORS.light)];
      setRadii(stage, V.radius.md);

      // stage-head: name (Geist Mono Medium 14) + sub-line (Inter Regular 13, FILL/HUG)
      const head = figma.createAutoLayout('VERTICAL', { name: 'stage-head', itemSpacing: 8, fills: [] });
      stage.appendChild(head);
      setSize(head, 'FILL', 'HUG');
      head.setBoundVariable('itemSpacing', V.space['100']);

      const nameLbl = figma.createText();
      nameLbl.fontName = { family: 'Geist Mono', style: 'Medium' };
      nameLbl.fontSize = 14;
      nameLbl.characters = e.node.name;
      nameLbl.fills = [bind(V.text.primary, COLORS.dark)];
      head.appendChild(nameLbl);

      const sub = figma.createText();
      sub.fontName = { family: 'Inter', style: 'Regular' };
      sub.fontSize = 13;
      // Derive a tiny variant description from the set's children count
      let variantCount = 0;
      try { variantCount = (e.node.children || []).filter(c => c.type === 'COMPONENT').length; } catch (_) {}
      sub.characters = variantCount > 0
        ? `${variantCount} variant${variantCount === 1 ? '' : 's'}`
        : 'Sub-component set';
      sub.fills = [bind(V.text.secondary, COLORS.mid)];
      head.appendChild(sub);
      sub.layoutSizingHorizontal = 'FILL';

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

  // 7e. USAGE (light card, eyebrow 05)
  const buildUsage = () => {
    const wtu = CONFIG.json.whenToUse;
    const wnt = CONFIG.json.whenNotToUse;
    if (!wtu && !wnt) return false;
    const card = lightCard(content, 'USAGE');
    sectionIds.USAGE = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '05', 'GUIDELINES', '· / usage',
      'When to use, when not to',
      null
    );

    // usage-row — HORIZONTAL, gap 24 (space/300), FILL/HUG.
    const cols = figma.createAutoLayout('HORIZONTAL', { name: 'usage-row', itemSpacing: 24, fills: [], counterAxisAlignItems: 'MIN' });
    inner.appendChild(cols);
    setSize(cols, 'FILL', 'HUG');
    cols.setBoundVariable('itemSpacing', V.space['300']);

    // Each column: vertical, FILL/HUG, gap 16 (space/200), padding 32 (space/400),
    // fill surface-subtle, radius container-lg. Header row has icon-circle + title.
    const makeCol = (colName, glyph, glyphTone, title, body) => {
      const col = figma.createAutoLayout('VERTICAL', { name: colName, itemSpacing: 16, fills: [] });
      cols.appendChild(col);
      setSize(col, 'FILL', 'HUG');
      col.setBoundVariable('itemSpacing', V.space['200']);
      setLitPad(col, 32);
      col.fills = [bind(V.surface.subtle, COLORS.light)];
      setRadii(col, V.radius.lg);

      // col-head: HORIZONTAL, HUG/HUG, gap 12 (space/150), icon-circle + Inter Bold 20 title
      const head = figma.createAutoLayout('HORIZONTAL', { name: 'col-head', itemSpacing: 12, counterAxisAlignItems: 'CENTER', fills: [] });
      col.appendChild(head);
      setSize(head, 'HUG', 'HUG');
      head.setBoundVariable('itemSpacing', V.space['150']);

      // icon-circle: 28×28 FIXED, padding 6, full radius, fill bound to status surface
      const icon = figma.createAutoLayout('HORIZONTAL', { name: 'icon-circle', itemSpacing: 0, counterAxisAlignItems: 'CENTER', primaryAxisAlignItems: 'CENTER', fills: [] });
      head.appendChild(icon);
      icon.resize(28, 28);
      setSize(icon, 'FIXED', 'FIXED');
      setLitPad(icon, 6);
      setRadii(icon, V.radius.full);
      // Bind the circle fill to the appropriate success/error surface so it picks up mode flips
      if (glyphTone === 'success') {
        icon.fills = [bind(V.surface.successSubtle, COLORS.successSubtleC)];
      } else {
        icon.fills = [bind(V.surface.errorSubtle, COLORS.errorSubtleC)];
      }
      // Stroke matches the tone for crispness
      icon.strokes = [bind(glyphTone === 'success' ? V.border.success : V.border.error,
                            glyphTone === 'success' ? COLORS.success : COLORS.error)];
      icon.strokeWeight = 1;

      const glyphText = figma.createText();
      glyphText.fontName = { family: 'Inter', style: 'Bold' };
      glyphText.fontSize = 14;
      glyphText.characters = glyph;
      glyphText.fills = [bind(glyphTone === 'success' ? V.text.success : V.text.error,
                              glyphTone === 'success' ? COLORS.success : COLORS.error)];
      icon.appendChild(glyphText);

      const ttl = figma.createText();
      ttl.fontName = { family: 'Inter', style: 'Bold' };
      ttl.fontSize = 20;
      ttl.lineHeight = { unit: 'PIXELS', value: 28 };
      ttl.characters = title;
      ttl.fills = [bind(V.text.primary, COLORS.dark)];
      head.appendChild(ttl);

      // Body text — Inter Regular 16, lh 24, FILL/HUG
      const t = figma.createText();
      t.fontName = { family: 'Inter', style: 'Regular' };
      t.fontSize = 16;
      t.lineHeight = { unit: 'PIXELS', value: 24 };
      t.characters = body;
      t.fills = [bind(V.text.primary, COLORS.dark)];
      col.appendChild(t);
      t.layoutSizingHorizontal = 'FILL';
    };
    if (wtu) makeCol('When to use', '\u2713', 'success', 'When to use', wtu);
    if (wnt) makeCol('When not to use', '\u2715', 'error', 'When not to use', wnt);
    return true;
  };

  // 7f. ACCESSIBILITY (light card, eyebrow 06)
  const buildAccessibility = () => {
    const kbd = CONFIG.json.accessibility && CONFIG.json.accessibility.keyboard;
    if (!kbd || kbd.length === 0) return false;
    const card = lightCard(content, 'ACCESSIBILITY');
    sectionIds.ACCESSIBILITY = card.id;
    const inner = innerPad(card, 'VERTICAL', '400', '800');
    secHead(inner, '06', 'A11Y / WCAG', '· / accessibility',
      'Keyboard & screen reader',
      'How keyboard users and assistive technology interact with this component.'
    );

    // Table: VERTICAL, gap 0, no outer stroke (rows carry their own bottom
    // borders). The canonical _TEMPLATE (UDS Components, id 7481:14, frame
    // 7688:42) wraps the table in a 16-radius (container-lg) frame so the
    // corners round visually around the row stack. clipsContent ensures
    // the rounded corners actually mask the row borders at the bottom edge.
    const table = figma.createAutoLayout('VERTICAL', { name: 'keyboard-table', itemSpacing: 0, fills: [] });
    inner.appendChild(table);
    setSize(table, 'FILL', 'HUG');
    setRadii(table, V.radius.lg);
    table.clipsContent = true;

    // thead — HORIZONTAL, FILL/HUG, gap 24 (space/300), padding [16, 24, 16, 24]
    const thead = figma.createAutoLayout('HORIZONTAL', { name: 'thead', itemSpacing: 24, fills: [] });
    table.appendChild(thead);
    setSize(thead, 'FILL', 'HUG');
    setLitPad4(thead, 16, 16, 24, 24);
    thead.setBoundVariable('itemSpacing', V.space['300']);
    thead.strokes = [bind(V.border.tertiary, COLORS.light)];
    thead.strokeBottomWeight = 1; thead.strokeTopWeight = 0; thead.strokeLeftWeight = 0; thead.strokeRightWeight = 0;

    const headKey = figma.createText();
    headKey.fontName = { family: 'Geist Mono', style: 'Medium' };
    headKey.fontSize = 11;
    headKey.characters = 'KEY';
    headKey.letterSpacing = { unit: 'PERCENT', value: 8 };
    headKey.fills = [bind(V.text.secondary, COLORS.mid)];
    thead.appendChild(headKey);
    headKey.resize(220, headKey.height);
    headKey.layoutSizingHorizontal = 'FIXED';

    const headAct = figma.createText();
    headAct.fontName = { family: 'Geist Mono', style: 'Medium' };
    headAct.fontSize = 11;
    headAct.characters = 'ACTION';
    headAct.letterSpacing = { unit: 'PERCENT', value: 8 };
    headAct.fills = [bind(V.text.secondary, COLORS.mid)];
    thead.appendChild(headAct);
    headAct.layoutSizingHorizontal = 'FILL';

    // Rows
    for (const row of kbd) {
      const tr = figma.createAutoLayout('HORIZONTAL', { name: 'tr', itemSpacing: 24, fills: [], counterAxisAlignItems: 'CENTER' });
      table.appendChild(tr);
      setSize(tr, 'FILL', 'HUG');
      setLitPad4(tr, 16, 16, 24, 24);
      tr.setBoundVariable('itemSpacing', V.space['300']);
      tr.strokes = [bind(V.border.tertiary, COLORS.light)];
      tr.strokeBottomWeight = 1; tr.strokeTopWeight = 0; tr.strokeLeftWeight = 0; tr.strokeRightWeight = 0;

      // key-col — FIXED 220w / HUG height, contains a kbd-pill
      const keyCol = figma.createAutoLayout('HORIZONTAL', { name: 'key-col', itemSpacing: 8, fills: [] });
      tr.appendChild(keyCol);
      keyCol.resize(220, 25);
      setSize(keyCol, 'FIXED', 'HUG');
      keyCol.setBoundVariable('itemSpacing', V.space['100']);

      const kbdPill = figma.createAutoLayout('HORIZONTAL', { name: 'kbd', itemSpacing: 0, counterAxisAlignItems: 'CENTER', fills: [] });
      keyCol.appendChild(kbdPill);
      setSize(kbdPill, 'HUG', 'HUG');
      setLitPad4(kbdPill, 4, 4, 10, 10);
      setRadii(kbdPill, V.radius.sm);
      kbdPill.fills = [bind(V.surface.subtle, COLORS.light)];
      kbdPill.strokes = [bind(V.border.tertiary, COLORS.light)];
      kbdPill.strokeWeight = 1;

      const keyT = figma.createText();
      keyT.fontName = { family: 'Geist Mono', style: 'Medium' };
      keyT.fontSize = 13;
      keyT.characters = row.key || '';
      keyT.fills = [bind(V.text.primary, COLORS.dark)];
      kbdPill.appendChild(keyT);

      const actT = figma.createText();
      actT.fontName = { family: 'Inter', style: 'Regular' };
      actT.fontSize = 15;
      actT.lineHeight = { unit: 'PIXELS', value: 22 };
      actT.characters = row.action || '';
      actT.fills = [bind(V.text.primary, COLORS.dark)];
      tr.appendChild(actT);
      actT.layoutSizingHorizontal = 'FILL';
    }
    return true;
  };

  // 7g. META (dark card, eyebrow 07) — always rendered
  const buildMeta = () => {
    const card = darkCard(content, 'META');
    sectionIds.META = card.id;
    // META inner — VERTICAL, gap 40 (space/500), padding 80 (space/1000)
    const inner = innerPad(card, 'VERTICAL', '500', '1000');

    // sec-head: eyebrow + "Where to go from here" (36pt)
    const head = figma.createAutoLayout('VERTICAL', { name: 'sec-head', itemSpacing: 16, fills: [] });
    inner.appendChild(head);
    setSize(head, 'FILL', 'HUG');
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
    setSize(links, 'FILL', 'HUG');
    links.setBoundVariable('itemSpacing', V.space['300']);

    const makeLink = (cardName, kicker, titleText, url, primary) => {
      const lc = figma.createAutoLayout('VERTICAL', { name: cardName, itemSpacing: 16, fills: [] });
      links.appendChild(lc);
      setSize(lc, 'FILL', 'HUG');
      lc.setBoundVariable('itemSpacing', V.space['200']);
      setLitPad(lc, 32);
      if (primary) {
        lc.fills = [bind(V.surface.main, COLORS.white)];
      } else {
        lc.fills = [bindOpacity(V.surface.main, COLORS.white, 0.04)];
        lc.strokes = [bindOpacity(V.border.inverse, COLORS.white, 0.15)];
        lc.strokeWeight = 1;
      }
      setRadii(lc, V.radius.lg);

      const top = figma.createAutoLayout('HORIZONTAL', { name: 'top', itemSpacing: 8, fills: [], counterAxisAlignItems: 'CENTER' });
      lc.appendChild(top);
      setSize(top, 'FILL', 'HUG');
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
      setSize(sp, 'FILL', 'HUG');
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
    setSize(metaRow, 'FILL', 'HUG');
    metaRow.setBoundVariable('itemSpacing', V.space['500']);

    const makeMetaCol = (kicker, value) => {
      const col = figma.createAutoLayout('VERTICAL', { name: kicker, itemSpacing: 8, fills: [] });
      metaRow.appendChild(col);
      setSize(col, 'HUG', 'HUG');
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
    // Only render DESIGNER / DEVELOPER columns when the spec actually names
    // someone — match reference cards that omit "Unassigned" entries to keep
    // the meta-row tight.
    const ownerD = CONFIG.json.owner && CONFIG.json.owner.designer ? CONFIG.json.owner.designer : null;
    const ownerDev = CONFIG.json.owner && CONFIG.json.owner.developer ? CONFIG.json.owner.developer : null;
    if (ownerD && ownerD !== 'Unassigned') makeMetaCol('DESIGNER', ownerD);
    if (ownerDev && ownerDev !== 'Unassigned') makeMetaCol('DEVELOPER', ownerDev);

    // spacer
    const sp2 = figma.createAutoLayout('HORIZONTAL', { name: 'sp2', itemSpacing: 0, fills: [] });
    metaRow.appendChild(sp2);
    setSize(sp2, 'FILL', 'HUG');

    statusPill(metaRow);
  };

  // -------- Dispatch the four bottom-of-card sections --------
  //
  // Phase 1b-A already rendered HEADER + ANATOMY + VARIANTS. We
  // continue with SUB-COMPONENTS / USAGE / ACCESSIBILITY / META,
  // appending each into the looked-up content frame.
  const dispatched = {
    SUB_COMPONENTS: buildSubComponents(),
    USAGE:          buildUsage(),
    ACCESSIBILITY:  buildAccessibility(),
    META:           true,
  };
  buildMeta();

  // 9. Categorize remaining inventory for build-workspace-card.js (phase 2).
  //    Anything still parked that isn't inside the new component wrapper is
  //    "unclassified" and belongs in the workspace card's W02 section. We
  //    keep these parked at (5000, -5000) so the workspace builder can pick
  //    them up by ID without scrubbing the page for stragglers.
  const unclassifiedNodeIds = [];
  for (const e of allNodes) {
    const n = figma.getNodeById(e.id);
    if (!n) {
      droppedNodes.push({ id: e.id, name: e.name, reason: 'node disappeared during build' });
      continue;
    }
    // Is the node a descendant of the new component wrapper?
    let p = n.parent;
    let inside = false;
    while (p) {
      if (p === outer) { inside = true; break; }
      p = p.parent;
    }
    if (!inside) {
      // Leave parked at (5000, -5000) for the workspace builder to claim.
      // (allNodes were placed there in step 3; nothing to do.)
      unclassifiedNodeIds.push(e.id);
    }
  }

  // Top-level ad-hoc non-COMPONENT nodes (SECTIONs, FRAMEs, RECTANGLEs) that
  // existed at page level outside any wrapper. These belong in the workspace
  // card's W03 section. They stay at their original positions until the
  // workspace builder reparents them.
  const adhocFrameIds = sectionLessTop.map(n => n.id);

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
    primarySet: primarySet ? { id: primarySet.id, name: primarySet.name } : null,
    stateInstancesDiscovered: Object.keys(stateInstances),
    variantSetIds: variantSets.map(e => e.id),
    subSetIds: subSets.map(e => e.id),
    inventoryPreserved: Array.from(inventoryMap.values()),
    reparented,
    droppedNodes,
    // For build-workspace-card.js (phase 2):
    workspaceHandoff: {
      existingWorkspaceFrameId: existingWorkspace ? existingWorkspace.id : null,
      unclassifiedNodeIds,
      adhocFrameIds,
    },
  };
}

// Run the batch
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
