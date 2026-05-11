// =====================================================================
// UDS Figma Component Card Builder
// =====================================================================
//
// Canonical builder for the seven-section component card layout, per
// `.cursor/rules/uds-figma-component-card.mdc`. Copy this entire file
// into the `code` parameter of `use_figma`, with the CONFIG block at the
// top filled in for the target component. The builder is a single
// atomic operation — if it fails, no changes are made to the file and
// you can safely retry after fixing the cause.
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
// Returns: { pageId, sectionIds: { HEADER, ANATOMY, ... }, componentSets: [...] }
// =====================================================================

// ----- CONFIG (substitute per component) -----
const CONFIG = {
  // The target page in the Figma file
  pageId: '5055:139',                    // e.g. Button page
  componentId: 'button',                 // kebab-case
  componentTitle: 'Button',              // Title Case
  status: 'in-progress',                 // 'in-progress' | 'review' | 'blocked' | 'production' | 'placeholder'
  udsVersion: '0.4',
  docsUrl: 'https://uds-docs/?#button',
  storybookUrl: 'https://storybook/?path=/story/button (placeholder)',

  // Parsed uds-docs/uds/components/<id>/spec.json — agent reads from disk and injects
  json: {
    title: 'Button',
    description: 'A button triggers an action or event...',
    whenToUse: 'Use buttons to trigger an action...',
    whenNotToUse: 'Do not use buttons for navigation links...',
    accessibility: { keyboard: [{ key: 'Space', action: 'Activate the button' }, /* ... */] },
    legacyAccessibilityNotes: 'Always use a <button> element...',
    owner: { designer: 'Unassigned', developer: 'Unassigned' },
    dependencies: { css: ['uds/components/button.css'] }
  },
  // Parsed uds-docs/uds/components/<id>/status.json
  statusJson: { current: 'in-progress', since: '0.1', history: [/* ... */] },

  // Component-set IDs on the page (auto-discovered if null)
  primarySetId: '5055:148',              // main variant set (becomes ANATOMY hero source + first VARIANTS column)
  variantSetIds: ['5055:148', '5123:189', '5140:695'],  // all sets for VARIANTS card; null = discover top-level COMPONENT_SETs
  variantNames: ['Primary', 'Secondary', 'Ghost'],       // human labels per variantSetIds in same order
  subSetIds: ['5271:3990', '6502:1252'],                 // SUB-COMPONENTS (button-group sets etc.); null = discover
  subSetNames: ['Horizontal group', 'Vertical group'],

  // ANATOMY state instances (auto-discovered if null)
  stateInstanceIds: {
    Default: '5067:29',
    Hover: '5113:186',
    Active: '5113:283',
    Disabled: '5120:1263'
  },

  // Section toggles (false → omit the entire card; the eyebrow number is preserved with a gap)
  sections: {
    ANATOMY: true,
    VARIANTS: true,
    SUB_COMPONENTS: true,
    USAGE: true,
    ACCESSIBILITY: true
  },
};

// ----- TOKEN KEY MAP (DO NOT EDIT — see token-map.json) -----
const KEYS = {
  text: {
    primary: 'f5a3ae409e24defe81a3ccbeba0ab5e2c09979d1',
    secondary: '96997351d5ceaa1fbc4dd9a899955e66ba8cc530',
    disabled: 'af48047b5e222762d9ab11dee658501a62ee066b',
    warning: '3479470213f4939afa288b2b9cefe921b8fa3872',
    success: '82e829c8a57a30b1353803953e3f8ba4c60c6a61',
    error: '5087f33cc61bef6dc94ae0ad4431a1dc9144e151',
    info: '930a3c4ba5600d99a953c46b39c4d0b261d30475',
    inverse: 'c3d0c76272400932235c808161118490985ecc07',
  },
  surface: {
    main: '929a0f30897b12884c1848b5071f7ab3e0a31b72',
    alt: 'd42911ee04e7227d6058c18e410ccf70c750ce33',
    subtle: '15cb1c4345ec1d9765099ca75012a4df3be0b0ee',
    bold: '18b0c1f45b52f6777464de95c523612f55dc7885',
    xxbold: '7a4c0f3ef4a0c5dcbbe5b2ddf35883b2e670602a',
    inverse: '874f1e009d0e5a10ec31376a561bef71347522be',
    pageMain: '6d6cdb813de786e9463b8a720ac612eb01c1434e',
    pageSubtle: '8e741579507ed611ee7799a8b4b7a242a898b555',
    warning: 'a3403de09a15bb6631040f5c0bf2a53c94046c8e',
    warningSubtle: '8dfade28315d60ab5ce01ec8d03262f29d03b809',
    successSubtle: 'da3a13c384795382d7d382dbe261940bf9785fc7',
    errorSubtle: 'a95a51677a276e176398cef0964712ad2888912a',
  },
  border: {
    primary: 'f4b910ed348d20c1718dd6dd931bbe842476d669',
    secondary: 'ad15bcf93e58eb189fa4ea000b5b30f178725b30',
    tertiary: '4b5b4b8634b4ffab2973b268fd3abb2afa4fdab3',
    warning: 'ae378dce787169c5c217eb162c98352248c585c8',
    success: '6c476d9bf9b9ef9fe73e567bd5df3dab72baa900',
    error: '03e65086fe8048fbd914f94f9ee891f25a8a2278',
    inverse: '7e206b401133055335d505380407a7b581b3509f',
  },
  icon: {
    warning: '2eb55aaa5cc2d0ee82a247c9c5fd556474e430d2',
    success: '38a52b0c4c1a23e37d0b9baef788e6c55fd98d98',
    error: '5ebf9c22ec9164dc863c86f15a6fa179a58539c7',
    secondary: '8e49e4fd8e1ada3295b207bb6b2d82d1380999ef',
  },
  space: {
    '0': '13b3cd9b9bf547bfb9bc5a01a421b5f61124bc43',
    '050': 'd57c22a4dbcb967fb354c4c25aca0347dd504908',
    '100': '29032578d5d46bc95048b1253b344e47f3285eed',
    '150': '0dfe69e370d9d4f7c5d8baff9a4d0c5ac75e8c95',
    '200': 'b7345e548fde2c3df0c839521b64580dab1d5ee1',
    '250': '52c87fcd6d39a3a0e6cd56af8d94b5e3b054a88b',
    '300': '3793a751fc882450d12db3437f29027bceefc4c6',
    '400': 'd7f2cfa27379c4e034bb7b84140a1864ce816088',
    '500': 'b40ec2e2a18939369ed2059004018a119f1cab14',
    '600': '1d3642a57002fd5b2bd785e26a2cfe9a3242a450',
    '800': 'cf4a3b05190c11603f24e38aea14c3f61abf32bb',
    '1000': 'b398603cd7cd6ef46f6a6659cdc68f85102fe705',
  },
  radius: {
    md: '2b1f70b62e82d711274209d6d1c7763dcb63752f',
    lg: 'd27395d9b45c18b11eec3168fd02337f589d5844',
    xl: '90ef1b511f2ba8710bb1366d855d4382dad79fc7',
    full: '2f5e24bb23151523f549b042e6239383eb38b545',
    sm: '5b9a5c362d9741929aa9dcb031109cee1856c934',
  },
};

// ----- STATUS → TOKEN GROUP MAP -----
const STATUS_TOKENS = {
  'in-progress':  { color: 'warning', label: 'IN PROGRESS' },
  'review':       { color: 'warning', label: 'IN REVIEW' },
  'blocked':      { color: 'error',   label: 'BLOCKED' },
  'production':   { color: 'success', label: 'PRODUCTION READY' },
  'placeholder':  { color: 'tertiary', label: 'NOT STARTED' },
};

// ----- HELPERS (these run inside the script) -----
const COLORS = {
  dark: { r: 0.09, g: 0.09, b: 0.09 },
  mid:  { r: 0.4,  g: 0.4,  b: 0.4 },
  white:{ r: 1,    g: 1,    b: 1 },
  light:{ r: 0.96, g: 0.96, b: 0.96 },
  warn: { r: 0.95, g: 0.6,  b: 0.1 },
  success: { r: 0.1, g: 0.5, b: 0.3 },
  error: { r: 0.7, g: 0.18, b: 0.18 },
  darkBg: { r: 0.04, g: 0.04, b: 0.04 },
  peach: { r: 1, g: 0.93, b: 0.83 },
  peachStrong: { r: 1, g: 0.78, b: 0.5 },
};

// ----- MAIN BUILDER -----

const page = figma.root.children.find(p => p.id === CONFIG.pageId);
if (!page) throw new Error(`Page ${CONFIG.pageId} not found`);
await figma.setCurrentPageAsync(page);

// Preload all fonts up front
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

// Status-driven token resolvers
const status = STATUS_TOKENS[CONFIG.status];
const statusColor = status.color === 'tertiary'
  ? COLORS.mid
  : (status.color === 'warning' ? COLORS.warn : (status.color === 'error' ? COLORS.error : COLORS.success));
const statusBindText = () => bind(
  status.color === 'tertiary' ? V.text.secondary : V.text[status.color],
  statusColor
);
const statusBindBorder = () => bind(
  status.color === 'tertiary' ? V.border.tertiary : V.border[status.color],
  statusColor
);
const statusBindIcon = () => bind(
  status.color === 'tertiary' ? V.icon.secondary : V.icon[status.color],
  statusColor
);
const statusBindSurfaceSubtle = () => {
  if (status.color === 'tertiary') return bind(V.surface.subtle, COLORS.light);
  if (status.color === 'warning')  return bind(V.surface.warningSubtle, COLORS.peach);
  if (status.color === 'success')  return bind(V.surface.successSubtle, { r: 0.94, g: 0.99, b: 0.96 });
  if (status.color === 'error')    return bind(V.surface.errorSubtle, { r: 0.99, g: 0.95, b: 0.95 });
  return bind(V.surface.subtle, COLORS.light);
};

// =====================================================================
// 1. TEAR DOWN existing page wrapper if present
// =====================================================================
const existingWrapper = page.children.find(c => c.name === `udc-${CONFIG.componentId}-page`);
const componentSetIds = [...(CONFIG.variantSetIds || []), ...(CONFIG.subSetIds || [])];

// Move component sets to a temp parking spot at page level
for (const id of componentSetIds) {
  const n = figma.getNodeById(id);
  if (n) {
    page.appendChild(n);
    n.x = 5000; n.y = -5000;
  }
}
if (existingWrapper) existingWrapper.remove();

// =====================================================================
// 2. BUILD outer page wrapper
// =====================================================================
const outer = figma.createAutoLayout('VERTICAL', { name: `udc-${CONFIG.componentId}-page`, itemSpacing: 0 });
outer.x = 0; outer.y = 0;
outer.resize(2800, 100);
outer.primaryAxisSizingMode = 'AUTO';
outer.counterAxisSizingMode = 'FIXED';
outer.fills = [bind(V.surface.pageSubtle, COLORS.light)];

// Top accent strip in status color (gradient)
const topAccent = figma.createRectangle();
topAccent.name = 'status-accent';
topAccent.resize(2800, 8);
topAccent.fills = status.color === 'tertiary'
  ? [bind(V.border.tertiary, COLORS.light)]
  : [{
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { color: { ...statusColor, a: 0.3 }, position: 0 },
        { color: { ...statusColor, a: 1 },   position: 0.5 },
        { color: { ...statusColor, a: 0.3 }, position: 1 },
      ],
    }];
outer.appendChild(topAccent);
topAccent.layoutSizingHorizontal = 'FILL';

// Inner content
const content = figma.createAutoLayout('VERTICAL', {
  name: 'content', fills: [],
  itemSpacing: 80, paddingTop: 64, paddingBottom: 64, paddingLeft: 64, paddingRight: 64,
});
outer.appendChild(content);
content.layoutSizingHorizontal = 'FILL';
content.layoutSizingVertical = 'HUG';
content.setBoundVariable('itemSpacing', V.space['1000']);
for (const k of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) {
  content.setBoundVariable(k, V.space['800']);
}

const sectionIds = {};

// =====================================================================
// 3. SHARED CARD HELPERS
// =====================================================================
const eyebrow = (parent, num, kicker, sublabel, dark) => {
  const eb = figma.createAutoLayout('HORIZONTAL', { name: 'eyebrow', itemSpacing: 16, counterAxisAlignItems: 'CENTER', fills: [] });
  parent.appendChild(eb);
  eb.layoutSizingHorizontal = 'HUG';
  eb.setBoundVariable('itemSpacing', V.space['200']);

  const n = figma.createText();
  n.fontName = { family: 'Geist Mono', style: 'Medium' };
  n.fontSize = 48; n.lineHeight = { unit: 'PIXELS', value: 48 };
  n.characters = num;
  n.fills = [statusBindText()];
  eb.appendChild(n);

  const sep = figma.createRectangle();
  sep.resize(1, 32);
  sep.fills = [statusBindBorder()];
  sep.opacity = 0.4;
  eb.appendChild(sep);

  const col = figma.createAutoLayout('VERTICAL', { name: 'eb-col', itemSpacing: 4, fills: [] });
  eb.appendChild(col);
  col.setBoundVariable('itemSpacing', V.space['050']);

  const k = figma.createText();
  k.fontName = { family: 'Geist Mono', style: 'Medium' };
  k.fontSize = 11;
  k.characters = kicker;
  k.letterSpacing = { unit: 'PERCENT', value: 8 };
  k.fills = [statusBindText()];
  col.appendChild(k);

  if (sublabel) {
    const s = figma.createText();
    s.fontName = { family: 'Geist Mono', style: 'Regular' };
    s.fontSize = 11;
    s.characters = sublabel;
    if (dark) {
      s.fills = [bind(V.text.inverse, COLORS.white)];
      s.opacity = 0.5;
    } else {
      s.fills = [bind(V.text.secondary, COLORS.mid)];
    }
    col.appendChild(s);
  }
};

const lightCard = (parent) => {
  const card = figma.createAutoLayout('VERTICAL', { name: '', itemSpacing: 0 });
  parent.appendChild(card);
  card.layoutSizingHorizontal = 'FILL';
  card.layoutSizingVertical = 'HUG';
  card.fills = [bind(V.surface.main, COLORS.white)];
  card.strokes = [bind(V.border.tertiary, COLORS.light)];
  card.strokeWeight = 1;
  for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
    card.setBoundVariable(r, V.radius.xl);
  }
  card.effects = [
    { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: 'NORMAL' },
    { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 12 }, radius: 32, spread: -4, visible: true, blendMode: 'NORMAL' },
  ];
  card.clipsContent = true;
  return card;
};

const darkCard = (parent) => {
  const card = figma.createAutoLayout('VERTICAL', { name: '', itemSpacing: 0 });
  parent.appendChild(card);
  card.layoutSizingHorizontal = 'FILL';
  card.layoutSizingVertical = 'HUG';
  card.fills = [bind(V.surface.xxbold, COLORS.darkBg)];
  card.strokes = [bind(V.border.inverse, { r: 0.15, g: 0.15, b: 0.15 })];
  card.strokeWeight = 1;
  for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
    card.setBoundVariable(r, V.radius.xl);
  }
  card.effects = [
    { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: 'NORMAL' },
    { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 24 }, radius: 60, spread: -8, visible: true, blendMode: 'NORMAL' },
  ];
  card.clipsContent = true;
  return card;
};

const innerPad = (card, vertical, gap, padding) => {
  const inner = figma.createAutoLayout(vertical ? 'VERTICAL' : 'HORIZONTAL', { name: 'inner', itemSpacing: gap, fills: [] });
  card.appendChild(inner);
  inner.layoutSizingHorizontal = 'FILL';
  inner.layoutSizingVertical = 'HUG';
  inner.setBoundVariable('itemSpacing', V.space[String(gap)]);
  for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) {
    inner.setBoundVariable(k, V.space[String(padding)]);
  }
  return inner;
};

// =====================================================================
// 4. SECTION BUILDERS
// =====================================================================
//
// Each card follows the same pattern. The full per-section recipes
// (typography sizes, content, exact spacing, hero panels, link cards,
// kbd tables, do/don't surfaces) live in the canonical Figma _TEMPLATE
// page (named `📐 _TEMPLATE { Component card }` in the Testbed file)
// and in the rule:
//
//   .cursor/rules/uds-figma-component-card.mdc
//
// The agent should read both before completing the section bodies. The
// pattern for each is:
//
//   const card = lightCard(content);   // or darkCard for HEADER/META
//   card.name = 'SECTION_NAME';
//   const inner = innerPad(card, true, 400, 800);
//   eyebrow(inner /* or secHead inside inner */, NUM, KICKER, SUBLABEL, isDark);
//   // ... section-specific children ...
//   sectionIds[SECTION_NAME] = card.id;
//
// Section eyebrow numbers are FIXED regardless of which sections are
// included (see rule: 'Don't renumber eyebrows'):
//
//   HEADER         → 01
//   ANATOMY        → 02
//   VARIANTS       → 03
//   SUB-COMPONENTS → 04
//   USAGE          → 05
//   ACCESSIBILITY  → 06
//   META           → 07
//
// To complete this builder, append the section-body code from either:
//   (a) inspecting the live `_TEMPLATE` page in the Testbed via use_figma
//       (preferred — designer-authored is canonical)
//   (b) the rule's per-section recipe tables
//   (c) the prior pilot run in this file (component sets + structure
//       remain on the page as a working reference)

sectionIds.OUTER = outer.id;
sectionIds.CONTENT = content.id;

return {
  pageId: page.id,
  componentId: CONFIG.componentId,
  status: CONFIG.status,
  outerFrameId: outer.id,
  contentFrameId: content.id,
  sectionIds,
  componentSetIdsParked: componentSetIds,
  note: 'Skeleton + helpers ready. Section bodies must be appended per the rule and _TEMPLATE page before reparenting component sets.',
};
