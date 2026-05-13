// =====================================================================
// UDS Figma Component Card Builder — Phase 1a: Inventory
// =====================================================================
//
// First of three scripts that together build the component spec card
// and its companion workspace card. Each script fits comfortably under
// the use_figma `code` parameter limit (50k chars) and represents a
// focused, atomic operation:
//
//   Phase 1a (this file)              Inventory + park + teardown
//   Phase 1b (build-card-sections.js) Build outer wrapper + 7 sections
//   Phase 2  (build-workspace-card.js) Build workspace card
//
// Running order, per component:
//
//   1. Phase 1a (this script) — walks the page, classifies every
//      preservable COMPONENT_SET / COMPONENT / INSTANCE, parks them
//      at (5000, -5000) so they survive the wrapper teardown, removes
//      the existing `udc-<id>-page` wrapper. Returns IDs only.
//
//   2. Phase 1b — re-imports library variables, builds the outer
//      wrapper + 7 section cards, reparents preserved nodes into the
//      correct sections by ID. Returns workspaceHandoff for phase 2.
//
//   3. Phase 2 — reads the workspaceHandoff from phase 1b and builds
//      the workspace card at (2900, 0), reparenting unclassified
//      nodes into W02 (UNCLASSIFIED) and W03 (DESIGNER SCRATCH).
//
// Why this separation:
//
//   The single-script builder grew past 50k chars and was hitting the
//   use_figma `code` parameter limit. Splitting along the natural
//   pipeline boundary (inventory → render → workspace) produces three
//   focused scripts that are independently understandable and each
//   well under 50k with full comment density. See PR #15 / commit
//   that introduced this split for the full design rationale.
//
//   Phase 1a doesn't need fonts or library variables — it does no
//   rendering, only walks/parks/tears down. So this script is small
//   (~8-12k) and fast.
//
// Atomicity:
//
//   The Figma write is atomic: if this script throws, no parking or
//   teardown happens and the page is unchanged. Safe to retry after
//   fixing the cause. (See gotchas.md, "Atomic failures".)
//
// What this script does NOT do:
//
//   - Does not touch the `udc-<id>-workspace` wrapper if one exists.
//     Phase 2 (build-workspace-card.js) owns the workspace lifecycle:
//     it captures W01 example-slot contents before teardown so they
//     survive across rebuilds. Walking into the workspace from this
//     script would strip those contents prematurely.
//   - Does not read spec.json or status.json. Those are consumed by
//     phase 1b for header/title/description/keyboard-table content.
//     Phase 1a only needs `pageId` and `componentId`.
//   - Does not load fonts or import library variables. No rendering
//     happens here — every operation is structural (find / move /
//     remove). Saves roughly 1500 chars + several seconds per call.
//
// =====================================================================

// ----- BATCH CONFIG -----
//
// Inject `const BATCH = [{ pageId, componentId }, ...]` before sending
// to use_figma. Phase 1a only needs the two fields below per component:
//
//   pageId       Figma page id, e.g. '5445:5057' for radio
//   componentId  Kebab-case slug, e.g. 'radio'
//
// Example for a single-component run:
//
//   const BATCH = [{ pageId: '5445:5057', componentId: 'radio' }];
//
// Example for a full 8-component rollout:
//
//   const BATCH = [
//     { pageId: '5657:6776', componentId: 'icon-wrapper' },
//     { pageId: '5621:7276', componentId: 'link' },
//     { pageId: '5445:5056', componentId: 'checkbox' },
//     { pageId: '5445:5057', componentId: 'radio' },
//     { pageId: '5055:139',  componentId: 'button' },
//     { pageId: '5122:68',   componentId: 'dropdown' },
//     { pageId: '5440:5049', componentId: 'badge' },
//     { pageId: '5122:870',  componentId: 'data-table' },
//   ];
//
// =====================================================================


// =====================================================================
// Per-component inventory + park + teardown
// =====================================================================

async function inventoryOne(CONFIG) {
  const page = figma.root.children.find(p => p.id === CONFIG.pageId);
  if (!page) throw new Error(`Page ${CONFIG.pageId} not found`);
  await figma.setCurrentPageAsync(page);

  const cid = CONFIG.componentId;
  const wrapperName   = `udc-${cid}-page`;
  const workspaceName = `udc-${cid}-workspace`;
  const existingWrapper   = page.children.find(c => c.name === wrapperName);
  const existingWorkspace = page.children.find(c => c.name === workspaceName);

  // -------- 1. INVENTORY (no-content-loss) --------
  //
  // Walk every descendant of the existing component wrapper collecting
  // preservable nodes (COMPONENT_SET / COMPONENT / INSTANCE). We stop
  // descending into ALL THREE node types because:
  //
  //   - COMPONENT_SET: variant children move with the set when reparented.
  //   - COMPONENT:     nested children are part of the component definition.
  //   - INSTANCE:      nested children are derived from the main component
  //                    and Figma forbids reparenting them ("Cannot move
  //                    node. Node is inside of an instance"). The walker
  //                    captures the INSTANCE itself (so we know it exists)
  //                    but doesn't recurse into its children.
  //
  // Only descend through plain containers (FRAME / SECTION / GROUP / etc.).
  const inventoryPreservable = (root) => {
    const found = [];
    const visit = (n) => {
      if (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT' || n.type === 'INSTANCE') {
        found.push({ id: n.id, name: n.name, type: n.type });
        return;
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

  // The existing workspace (if any) is intentionally NOT walked here.
  // Its contents are owned by build-workspace-card.js, which has its
  // own update-mode path that captures W01 example-slot contents by
  // slot index and re-classifies W02/W03 contents into the rebuilt
  // workspace. Walking into it from this script would strip nodes the
  // workspace builder is about to preserve.

  for (const c of page.children) {
    if (c === existingWrapper || c === existingWorkspace) continue;
    if (c.type === 'COMPONENT_SET' || c.type === 'COMPONENT' || c.type === 'INSTANCE') {
      addToInv({ id: c.id, name: c.name, type: c.type }, 'top-level');
    } else {
      sectionLessTop.push({
        id: c.id, name: c.name, type: c.type,
        x: Math.round(c.x), y: Math.round(c.y),
        w: Math.round(c.width), h: Math.round(c.height),
      });
    }
  }

  // Look INSIDE top-level SECTIONs — if a SECTION wraps a COMPONENT_SET,
  // surface the inner COMPONENT_SET to inventory (special case: the
  // pre-rollout button page kept `udc-button` inside a SECTION wrapper).
  // The SECTION itself stays at page level and gets captured as adhoc.
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
  //
  // Primary set selection (in priority order):
  //   1. COMPONENT_SET named exactly `udc-<id>` or `udc-<id>-base`.
  //   2. First non-underscore-prefixed COMPONENT_SET.
  //   3. First COMPONENT_SET overall.
  //
  // Variant sets:    all non-underscore-prefixed COMPONENT_SETs (the
  //                  primary set is one of these — it gets reparented
  //                  into VARIANTS along with any siblings).
  // Sub sets:        all COMPONENT_SETs whose name starts with `_`
  //                  (e.g. `_udc-radio_radio-button`). Reparented into
  //                  SUB-COMPONENTS, not VARIANTS.
  const isUnderscoreName  = (n) => /^_/.test(n.name);
  const isExactPrimaryName = (n) => n.name === `udc-${cid}` || n.name === `udc-${cid}-base`;

  const allNodes = Array.from(inventoryMap.values())
    .map(e => ({ ...e, node: figma.getNodeById(e.id) }))
    .filter(e => e.node);
  const componentSets = allNodes.filter(e => e.node.type === 'COMPONENT_SET');

  let primarySet = componentSets.find(e => isExactPrimaryName(e.node));
  if (!primarySet) primarySet = componentSets.find(e => !isUnderscoreName(e.node));
  if (!primarySet) primarySet = componentSets[0];

  const variantSets = componentSets.filter(e => !isUnderscoreName(e.node));
  const subSets     = componentSets.filter(e =>  isUnderscoreName(e.node));

  // Discover state variants inside the primary set by parsing variant
  // property names. The primary set may have many variants; we pick one
  // per state where every OTHER variant property (size, destructive,
  // leading icon, etc.) takes its "default" value. That keeps the
  // ANATOMY state row apples-to-apples (we don't compare a Hover-large-
  // leading-icon against a Default-small-no-icon).
  const stateInstances = {}; // { Default: id, Hover: id, Active: id, Disabled: id, ... }
  const parseVariantProps = (name) => {
    const out = {};
    for (const part of name.split(',').map(s => s.trim())) {
      const m = /^([^=]+)=(.+)$/.exec(part);
      if (m) out[m[1].trim()] = m[2].trim();
    }
    return out;
  };

  if (primarySet && primarySet.node && primarySet.node.type === 'COMPONENT_SET') {
    const ps = primarySet.node;
    const variants = ps.children.filter(c => c.type === 'COMPONENT');
    const defaultV = ps.defaultVariant || variants[0];
    const defaultProps = defaultV ? parseVariantProps(defaultV.name) : {};
    const STATE_NAMES = ['Default', 'Hover', 'Active', 'Pressed', 'Focus', 'Focus-Visible', 'Selected', 'Disabled', 'Error', 'Open'];
    for (const v of variants) {
      const props = parseVariantProps(v.name);
      const stateRaw = props.State || props.state || null;
      if (!stateRaw) continue;
      const state = STATE_NAMES.find(s => s.toLowerCase() === stateRaw.toLowerCase());
      if (!state) continue;
      // Match every non-State property to the default variant.
      let matchesDefaults = true;
      for (const [k, val] of Object.entries(props)) {
        if (/^state$/i.test(k)) continue;
        if (defaultProps[k] !== undefined && defaultProps[k] !== val) {
          matchesDefaults = false;
          break;
        }
      }
      if (!matchesDefaults) continue;
      if (!stateInstances[state]) stateInstances[state] = v.id;
    }
  }

  // -------- 3. PARK preservable nodes at (5000, -5000) --------
  //
  // Move every inventoried node to page level at a far-off position
  // so it survives the wrapper teardown that follows. appendChild
  // preserves node identity (same id), so library bindings, variant
  // references, and Code Connect mappings all survive. Phase 1b
  // looks each node up by ID and reparents it into the correct
  // section.
  //
  // INSTANCE nodes nested inside another COMPONENT_SET / COMPONENT /
  // INSTANCE will fail to reparent ("Cannot move node. Node is inside
  // of an instance"). We capture these failures in droppedNodes so
  // phase 1b can report them; they'll die with the wrapper rather
  // than survive to phase 2.
  const droppedNodes = [];
  for (const e of allNodes) {
    try {
      page.appendChild(e.node);
      e.node.x = 5000;
      e.node.y = -5000;
    } catch (err) {
      droppedNodes.push({ id: e.id, name: e.name, reason: `appendChild failed: ${err.message}` });
    }
  }

  // -------- 4. TEAR DOWN old component wrapper --------
  //
  // Safe because every preservable descendant is now parked at page
  // level. The workspace wrapper (if present) stays — phase 2 owns it.
  if (existingWrapper) {
    try { existingWrapper.remove(); } catch (_) { /* already detached */ }
  }

  // -------- 5. Build classification payload for phase 1b --------
  //
  // Phase 1b consumes this via `CONFIG.inventory` in its own BATCH
  // config. Everything is plain serializable JSON (string IDs and
  // small objects). Each section is independently usable.
  return {
    pageId: page.id,
    pageName: page.name,
    componentId: cid,
    operation: existingWrapper ? 'update' : 'create',
    primary: primarySet ? { id: primarySet.id, name: primarySet.name, type: primarySet.node.type } : null,
    variantSetIds: variantSets.map(e => e.id),
    subSetIds:     subSets.map(e => e.id),
    stateInstances,
    inventory: {
      preservedNodeIds: allNodes.map(e => e.id),
      adhocFrameIds:    sectionLessTop.map(n => n.id),
    },
    existingWorkspaceFrameId: existingWorkspace ? existingWorkspace.id : null,
    droppedNodes,
  };
}


// =====================================================================
// Run the batch
// =====================================================================

const results = [];
for (const cfg of BATCH) {
  try {
    results.push(await inventoryOne(cfg));
  } catch (err) {
    results.push({
      componentId: cfg.componentId,
      error: err.message,
      stack: String(err.stack || '').slice(0, 1000),
    });
  }
}
return { batchCount: BATCH.length, results };
