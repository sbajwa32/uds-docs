// =====================================================================
// UDS Figma Workspace Card Builder
// =====================================================================
//
// Companion to build-card.js. Builds the `udc-<id>-workspace` card that
// sits at x=2900 on the same page as `udc-<id>-page`. Three sections:
//
//   W01 EXAMPLES   — 2x2 grid of empty labeled slot frames the designer
//                    drops real-world example instances into.
//   W02 UNCLASSIFIED COMPONENT NODES — anything inventoried by build-
//                    card.js that didn't fit into HEADER hero, ANATOMY,
//                    VARIANTS, or SUB-COMPONENTS. Reparented in here
//                    instead of left stranded at page level.
//   W03 DESIGNER SCRATCH — top-level non-component nodes (FRAMEs,
//                    SECTIONs, RECTANGLEs the agent doesn't classify).
//                    Reparented in as-is so nothing on the page gets
//                    buried under the spec card.
//
// Run order, per component:
//   1. use_figma `code: build-card.js` with CONFIG → builds component
//      card at (0,0). Returns `unclassifiedNodeIds` and `adhocFrameIds`.
//   2. use_figma `code: this script` with WORKSPACE_CONFIG (the IDs
//      from step 1) → builds workspace at (2900, 0).
//
// Update mode: if a `udc-<id>-workspace` already exists, this script
// captures its W01 example slots' contents (by slot index), then tears
// down the wrapper and rebuilds, restoring slot contents to the new
// slots. W02/W03 contents are not preserved across rebuilds — they're
// always re-derived from the inventory IDs handed in.
// =====================================================================

// ----- WORKSPACE_CONFIG -----
// Provide WORKSPACE_CONFIG (or a BATCH array of these for multi-component runs):
//
//   const WORKSPACE_CONFIG = {
//     pageId: '5445:5057',                   // Figma page id (e.g. radio = 5445:5057)
//     componentId: 'radio',                  // kebab-case
//     componentTitle: 'Radio',               // for the top-strip caption
//     unclassifiedNodeIds: ['5802:40401',…], // from build-card.js step 1 result
//     adhocFrameIds: ['6192:27126',…],       // from build-card.js step 1 result
//   };
//
// const BATCH = [WORKSPACE_CONFIG];

// ----- TOKEN KEY MAP (DO NOT EDIT — see token-map.json) -----
const KEYS = {
  text: {
    primary:   'f5a3ae409e24defe81a3ccbeba0ab5e2c09979d1',
    secondary: '96997351d5ceaa1fbc4dd9a899955e66ba8cc530',
    inverse:   'c3d0c76272400932235c808161118490985ecc07',
  },
  surface: {
    main:    '929a0f30897b12884c1848b5071f7ab3e0a31b72',
    subtle:  '15cb1c4345ec1d9765099ca75012a4df3be0b0ee',
    xxbold:  '7a4c0f3ef4a0c5dcbbe5b2ddf35883b2e670602a',
  },
  border: {
    primary:   'f4b910ed348d20c1718dd6dd931bbe842476d669',
    secondary: 'ad15bcf93e58eb189fa4ea000b5b30f178725b30',
    tertiary:  '4b5b4b8634b4ffab2973b268fd3abb2afa4fdab3',
    inverse:   '7e206b401133055335d505380407a7b581b3509f',
  },
  icon: {
    secondary: '8e49e4fd8e1ada3295b207bb6b2d82d1380999ef',
  },
  space: {
    '050':  'd57c22a4dbcb967fb354c4c25aca0347dd504908',
    '100':  '29032578d5d46bc95048b1253b344e47f3285eed',
    '150':  '0dfe69e370d9d4f7c5d8baff9a4d0c5ac75e8c95',
    '200':  'b7345e548fde2c3df0c839521b64580dab1d5ee1',
    '300':  '3793a751fc882450d12db3437f29027bceefc4c6',
    '400':  'd7f2cfa27379c4e034bb7b84140a1864ce816088',
    '500':  'b40ec2e2a18939369ed2059004018a119f1cab14',
    '600':  '1d3642a57002fd5b2bd785e26a2cfe9a3242a450',
    '800':  'cf4a3b05190c11603f24e38aea14c3f61abf32bb',
    '1000': 'b398603cd7cd6ef46f6a6659cdc68f85102fe705',
  },
  radius: {
    sm:   '5b9a5c362d9741929aa9dcb031109cee1856c934',
    md:   '2b1f70b62e82d711274209d6d1c7763dcb63752f',
    lg:   'd27395d9b45c18b11eec3168fd02337f589d5844',
    xl:   '90ef1b511f2ba8710bb1366d855d4382dad79fc7',
  },
};

const COLORS = {
  dark:   { r: 0.09, g: 0.09, b: 0.09 },
  mid:    { r: 0.4,  g: 0.4,  b: 0.4 },
  white:  { r: 1,    g: 1,    b: 1 },
  light:  { r: 0.96, g: 0.96, b: 0.96 },
  darkBg: { r: 0.04, g: 0.04, b: 0.04 },
};

const WORKSPACE_X_OFFSET = 2900; // 2800 width + 100 gap from component card at x=0
const WORKSPACE_WIDTH    = 2800;
const SECTION_INNER_W    = 2544; // wrapper - 2 * card padding (2672 - 64*2) — matches component card

// ----- Font preload -----
for (const style of ['Bold', 'Semi Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Inter', style });
}
for (const style of ['Bold', 'Medium', 'Regular']) {
  await figma.loadFontAsync({ family: 'Geist Mono', style });
}

// ----- Variable import (fresh each run; library variable IDs become stubs across calls) -----
const V = {};
const importGroup = async (g) => {
  V[g] = {};
  for (const [n, k] of Object.entries(KEYS[g])) {
    V[g][n] = await figma.variables.importVariableByKeyAsync(k);
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

// =====================================================================
// Per-component builder
// =====================================================================
async function buildOneWorkspace(CONFIG) {
  const page = figma.root.children.find(p => p.id === CONFIG.pageId);
  if (!page) throw new Error(`Page ${CONFIG.pageId} not found`);
  await figma.setCurrentPageAsync(page);

  const cid = CONFIG.componentId;
  const wsName = `udc-${cid}-workspace`;

  // -------- 1. Capture existing W01 slot contents (for update-mode preserve) --------
  const w01Restore = []; // [{ slotIndex, childIds: [...] }]
  const existingWs = page.children.find(c => c.name === wsName);
  if (existingWs) {
    const findRecursive = (node, predicate) => {
      if (predicate(node)) return node;
      if ('children' in node && node.children) {
        for (const c of node.children) {
          const found = findRecursive(c, predicate);
          if (found) return found;
        }
      }
      return null;
    };
    const w01 = findRecursive(existingWs, n => n.name === 'EXAMPLES');
    if (w01) {
      const slots = [];
      const collect = (n) => {
        if (n.name && /^example-slot-\d+$/.test(n.name)) slots.push(n);
        if ('children' in n && n.children) for (const c of n.children) collect(c);
      };
      collect(w01);
      slots.sort((a, b) => {
        const ai = parseInt(a.name.replace('example-slot-', ''), 10);
        const bi = parseInt(b.name.replace('example-slot-', ''), 10);
        return ai - bi;
      });
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const preserveable = (slot.children || []).filter(c =>
          c.type === 'COMPONENT' || c.type === 'COMPONENT_SET' || c.type === 'INSTANCE'
        );
        if (preserveable.length) {
          // Park each at page level so they survive teardown
          for (const c of preserveable) {
            try { page.appendChild(c); c.x = 5000; c.y = -5000; } catch (_) {}
          }
          w01Restore.push({ slotIndex: i, childIds: preserveable.map(c => c.id) });
        }
      }
    }
    try { existingWs.remove(); } catch (_) {}
  }

  // -------- 2. Build outer wrapper at (2900, 0) --------
  const outer = figma.createAutoLayout('VERTICAL', { name: wsName, itemSpacing: 0 });
  outer.x = WORKSPACE_X_OFFSET;
  outer.y = 0;
  outer.resize(WORKSPACE_WIDTH, 100);
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'FIXED';
  outer.fills = [bind(V.surface.subtle, COLORS.light)];
  for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
    outer.setBoundVariable(r, V.radius.xl);
  }
  outer.clipsContent = true;

  // Status accent — neutral (border-secondary at 60% opacity), no gradient.
  // Visually distinguishes the workspace card from the (status-colored) spec card.
  const accent = figma.createRectangle();
  accent.name = 'status-accent';
  accent.resize(WORKSPACE_WIDTH, 8);
  accent.fills = [bindOpacity(V.border.secondary, COLORS.mid, 0.6)];
  outer.appendChild(accent);
  accent.layoutSizingHorizontal = 'FILL';

  // Content frame — VERTICAL, gap 80, padding 64 (matches component card)
  const content = figma.createAutoLayout('VERTICAL', { name: 'content', fills: [], itemSpacing: 80 });
  outer.appendChild(content);
  content.layoutSizingHorizontal = 'FILL';
  content.layoutSizingVertical = 'HUG';
  content.setBoundVariable('itemSpacing', V.space['1000']);
  for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) {
    content.setBoundVariable(k, V.space['800']);
  }

  // -------- 3. Shared helpers --------
  const eyebrow = (parent, num, kicker, sublabel) => {
    const eb = figma.createAutoLayout('HORIZONTAL', { name: 'eyebrow', itemSpacing: 16, counterAxisAlignItems: 'CENTER', fills: [] });
    parent.appendChild(eb);
    eb.layoutSizingHorizontal = 'HUG';
    eb.layoutSizingVertical = 'HUG';
    eb.setBoundVariable('itemSpacing', V.space['200']);

    const n = figma.createText();
    n.fontName = { family: 'Geist Mono', style: 'Medium' };
    n.fontSize = 48;
    n.lineHeight = { unit: 'PIXELS', value: 48 };
    n.characters = num;
    n.fills = [bind(V.text.secondary, COLORS.mid)];
    eb.appendChild(n);

    const sep = figma.createRectangle();
    sep.name = 'bar';
    sep.resize(1, 32);
    sep.fills = [bind(V.border.tertiary, COLORS.light)];
    sep.opacity = 0.5;
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
    k.fills = [bind(V.text.secondary, COLORS.mid)];
    col.appendChild(k);

    if (sublabel) {
      const s = figma.createText();
      s.fontName = { family: 'Geist Mono', style: 'Regular' };
      s.fontSize = 11;
      s.characters = sublabel;
      s.fills = [bind(V.text.secondary, COLORS.mid)];
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

  const innerPad = (card) => {
    const inner = figma.createAutoLayout('VERTICAL', { name: 'inner', itemSpacing: 0, fills: [] });
    card.appendChild(inner);
    inner.layoutSizingHorizontal = 'FILL';
    inner.layoutSizingVertical = 'HUG';
    inner.setBoundVariable('itemSpacing', V.space['400']);
    for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) {
      inner.setBoundVariable(k, V.space['800']);
    }
    return inner;
  };

  const secHead = (parent, num, kicker, sublabel, title, description) => {
    const head = figma.createAutoLayout('VERTICAL', { name: 'sec-head', itemSpacing: 12, fills: [] });
    parent.appendChild(head);
    head.layoutSizingHorizontal = 'FILL';
    head.layoutSizingVertical = 'HUG';
    head.setBoundVariable('itemSpacing', V.space['150']);
    eyebrow(head, num, kicker, sublabel);
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

  // -------- 4. W01 EXAMPLES — 2x2 grid of empty labeled slots --------
  const w01Card = lightCard(content, 'EXAMPLES');
  const w01Inner = innerPad(w01Card);
  secHead(w01Inner, 'W01', 'REAL-WORLD USAGE', '· / examples',
    'Real-world examples',
    'Drop instances of the component into these slots to show how it composes in real-world contexts. Slot contents are preserved across rebuilds; the slot frames themselves are designer-fillable placeholders, not auto-rebuilt.'
  );

  const examplesGrid = figma.createAutoLayout('VERTICAL', { name: 'examples-grid', itemSpacing: 24, fills: [] });
  w01Inner.appendChild(examplesGrid);
  examplesGrid.layoutSizingHorizontal = 'FILL';
  examplesGrid.layoutSizingVertical = 'HUG';
  examplesGrid.setBoundVariable('itemSpacing', V.space['300']);

  const SLOT_GAP = 24;
  const SLOT_WIDTH = Math.floor((SECTION_INNER_W - SLOT_GAP) / 2); // 2 columns
  const SLOT_HEIGHT = 480;
  const slotIds = [];

  for (let row = 0; row < 2; row++) {
    const rowFrame = figma.createAutoLayout('HORIZONTAL', { name: `examples-row-${row + 1}`, itemSpacing: 24, fills: [] });
    examplesGrid.appendChild(rowFrame);
    rowFrame.layoutSizingHorizontal = 'FILL';
    rowFrame.layoutSizingVertical = 'HUG';
    rowFrame.setBoundVariable('itemSpacing', V.space['300']);

    for (let col = 0; col < 2; col++) {
      const slotIndex = row * 2 + col; // 0..3
      const slot = figma.createAutoLayout('VERTICAL', {
        name: `example-slot-${slotIndex + 1}`,
        itemSpacing: 16,
        counterAxisAlignItems: 'CENTER',
        primaryAxisAlignItems: 'CENTER',
        fills: [],
      });
      rowFrame.appendChild(slot);
      slot.resize(SLOT_WIDTH, SLOT_HEIGHT);
      slot.layoutSizingHorizontal = 'FIXED';
      slot.layoutSizingVertical = 'FIXED';
      slot.paddingTop = 32; slot.paddingBottom = 32; slot.paddingLeft = 32; slot.paddingRight = 32;
      slot.setBoundVariable('itemSpacing', V.space['200']);
      slot.fills = [bindOpacity(V.surface.subtle, COLORS.light, 0.5)];
      slot.strokes = [bind(V.border.tertiary, COLORS.light)];
      slot.strokeWeight = 1;
      slot.dashPattern = [10, 6];
      for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
        slot.setBoundVariable(r, V.radius.lg);
      }
      slotIds.push(slot.id);

      // Restore content if this slot had children in the prior workspace
      const restore = w01Restore.find(r => r.slotIndex === slotIndex);
      if (restore) {
        for (const childId of restore.childIds) {
          const node = figma.getNodeById(childId);
          if (node) {
            try { slot.appendChild(node); } catch (err) { /* skip on failure */ }
          }
        }
      } else {
        // Empty slot: chip with index + helper text
        const chip = figma.createAutoLayout('HORIZONTAL', { name: 'slot-label-chip', itemSpacing: 8, counterAxisAlignItems: 'CENTER', fills: [] });
        slot.appendChild(chip);
        chip.layoutSizingHorizontal = 'HUG';
        chip.layoutSizingVertical = 'HUG';
        chip.paddingTop = 6; chip.paddingBottom = 6; chip.paddingLeft = 12; chip.paddingRight = 12;
        chip.setBoundVariable('itemSpacing', V.space['100']);
        chip.fills = [bind(V.surface.main, COLORS.white)];
        chip.strokes = [bind(V.border.tertiary, COLORS.light)];
        chip.strokeWeight = 1;
        for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
          chip.setBoundVariable(r, V.radius.sm);
        }
        const chipLbl = figma.createText();
        chipLbl.fontName = { family: 'Geist Mono', style: 'Medium' };
        chipLbl.fontSize = 11;
        chipLbl.characters = `EXAMPLE ${slotIndex + 1}`;
        chipLbl.letterSpacing = { unit: 'PERCENT', value: 8 };
        chipLbl.fills = [bind(V.text.secondary, COLORS.mid)];
        chip.appendChild(chipLbl);

        const help = figma.createText();
        help.fontName = { family: 'Inter', style: 'Regular' };
        help.fontSize = 14;
        help.characters = 'Drop a real-world example of the component here.';
        help.textAlignHorizontal = 'CENTER';
        help.fills = [bind(V.text.secondary, COLORS.mid)];
        slot.appendChild(help);
      }
    }
  }

  // -------- 5. W02 UNCLASSIFIED COMPONENT NODES --------
  const w02Card = lightCard(content, 'UNCLASSIFIED');
  const w02Inner = innerPad(w02Card);
  secHead(w02Inner, 'W02', 'COMPONENT NODES', '· / unclassified',
    'Unclassified components',
    "Components, sets, and instances that the builder couldn't fit into the spec card's HEADER hero, ANATOMY, VARIANTS, or SUB-COMPONENTS sections. Reparented in here so they're visible and accessible — not buried under the spec card or stranded at page level."
  );

  const w02Row = figma.createAutoLayout('HORIZONTAL', { name: 'unclassified-row', itemSpacing: 24, counterAxisAlignItems: 'MIN', fills: [] });
  w02Inner.appendChild(w02Row);
  w02Row.layoutSizingHorizontal = 'FILL';
  w02Row.layoutSizingVertical = 'HUG';
  w02Row.layoutWrap = 'WRAP';
  w02Row.setBoundVariable('itemSpacing', V.space['300']);

  const reparented = { unclassified: [], adhoc: [] };
  const skipped = { unclassified: [], adhoc: [] };

  const reparentItemCard = (parentRow, node, kind) => {
    const itemCard = figma.createAutoLayout('VERTICAL', { name: `item-${node.name}`, itemSpacing: 12, fills: [] });
    parentRow.appendChild(itemCard);
    itemCard.layoutSizingHorizontal = 'HUG';
    itemCard.layoutSizingVertical = 'HUG';
    itemCard.paddingTop = 24; itemCard.paddingBottom = 24; itemCard.paddingLeft = 24; itemCard.paddingRight = 24;
    itemCard.setBoundVariable('itemSpacing', V.space['150']);
    itemCard.fills = [bind(V.surface.subtle, COLORS.light)];
    for (const r of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) {
      itemCard.setBoundVariable(r, V.radius.md);
    }

    const meta = figma.createAutoLayout('VERTICAL', { name: 'meta', itemSpacing: 4, fills: [] });
    itemCard.appendChild(meta);
    meta.layoutSizingHorizontal = 'HUG';
    meta.layoutSizingVertical = 'HUG';
    meta.setBoundVariable('itemSpacing', V.space['050']);

    const lbl = figma.createText();
    lbl.fontName = { family: 'Geist Mono', style: 'Medium' };
    lbl.fontSize = 12;
    lbl.characters = node.name;
    lbl.fills = [bind(V.text.primary, COLORS.dark)];
    meta.appendChild(lbl);

    const typeLbl = figma.createText();
    typeLbl.fontName = { family: 'Geist Mono', style: 'Regular' };
    typeLbl.fontSize = 10;
    typeLbl.characters = node.type;
    typeLbl.letterSpacing = { unit: 'PERCENT', value: 8 };
    typeLbl.fills = [bind(V.text.secondary, COLORS.mid)];
    meta.appendChild(typeLbl);

    try {
      itemCard.appendChild(node);
      reparented[kind].push({ id: node.id, name: node.name, type: node.type });
    } catch (err) {
      skipped[kind].push({ id: node.id, name: node.name, type: node.type, reason: String(err.message || err).slice(0, 200) });
    }
  };

  for (const id of (CONFIG.unclassifiedNodeIds || [])) {
    const node = figma.getNodeById(id);
    if (!node) {
      skipped.unclassified.push({ id, reason: 'node not found' });
      continue;
    }
    reparentItemCard(w02Row, node, 'unclassified');
  }

  // If nothing to show, leave a placeholder
  if (w02Row.children.length === 0) {
    const empty = figma.createText();
    empty.fontName = { family: 'Inter', style: 'Regular' };
    empty.fontSize = 14;
    empty.characters = 'No unclassified component nodes on this page. (When the builder runs, anything inventoried that doesn\u2019t fit the spec card\u2019s rules will be reparented here.)';
    empty.fills = [bind(V.text.secondary, COLORS.mid)];
    w02Row.appendChild(empty);
    empty.layoutSizingHorizontal = 'FILL';
  }

  // -------- 6. W03 DESIGNER SCRATCH --------
  const w03Card = lightCard(content, 'SCRATCH');
  const w03Inner = innerPad(w03Card);
  secHead(w03Inner, 'W03', 'DESIGNER SCRATCH', '· / ad-hoc',
    'Designer scratch',
    'Top-level frames, sections, screenshots, and notes the agent doesn\u2019t classify. Reparented in as-is so nothing on the page gets buried under the spec card. Drop additional scratch nodes anywhere inside this section.'
  );

  const w03Row = figma.createAutoLayout('HORIZONTAL', { name: 'scratch-row', itemSpacing: 24, counterAxisAlignItems: 'MIN', fills: [] });
  w03Inner.appendChild(w03Row);
  w03Row.layoutSizingHorizontal = 'FILL';
  w03Row.layoutSizingVertical = 'HUG';
  w03Row.layoutWrap = 'WRAP';
  w03Row.setBoundVariable('itemSpacing', V.space['300']);

  for (const id of (CONFIG.adhocFrameIds || [])) {
    const node = figma.getNodeById(id);
    if (!node) {
      skipped.adhoc.push({ id, reason: 'node not found' });
      continue;
    }
    reparentItemCard(w03Row, node, 'adhoc');
  }

  if (w03Row.children.length === 0) {
    const empty = figma.createText();
    empty.fontName = { family: 'Inter', style: 'Regular' };
    empty.fontSize = 14;
    empty.characters = 'No top-level scratch frames on this page.';
    empty.fills = [bind(V.text.secondary, COLORS.mid)];
    w03Row.appendChild(empty);
    empty.layoutSizingHorizontal = 'FILL';
  }

  return {
    componentId: cid,
    pageId: page.id,
    workspaceFrameId: outer.id,
    workspaceX: WORKSPACE_X_OFFSET,
    workspaceY: 0,
    workspaceDim: { w: Math.round(outer.width), h: Math.round(outer.height) },
    sections: { W01: w01Card.id, W02: w02Card.id, W03: w03Card.id },
    w01SlotIds: slotIds,
    w01Restored: w01Restore.length,
    reparented,
    skipped,
  };
}

// =====================================================================
// Run the batch
// =====================================================================
const results = [];
for (const cfg of BATCH) {
  try {
    const r = await buildOneWorkspace(cfg);
    results.push(r);
  } catch (err) {
    results.push({ componentId: cfg.componentId, error: err.message, stack: String(err.stack || '').slice(0, 1000) });
  }
}
return { batchCount: BATCH.length, results };
