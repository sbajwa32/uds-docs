// =====================================================================
// UDS Component Factory — Phase C deterministic gate-check harness
// =====================================================================
//
// WHAT THIS IS
//   A single, runnable verification pass for the model-INDEPENDENT
//   deterministic gates in the factory skill's "Phase C — Quality-gate
//   report → Tool-emitted gates" section. Paste this whole script into a
//   `use_figma` call (set SET_ID first); it returns a per-gate pass/fail
//   object plus the list of gates it deliberately does NOT cover.
//
// WHY IT EXISTS (run it; do not hand-roll which gates to check)
//   The Phase C gates are "deterministic — counts, not opinions," yet they
//   live as ~12 prose bullets. When an agent decides from memory which ones
//   to run, a NON-SKIPPABLE gate gets silently dropped. This has now
//   happened twice:
//     - 2026-06-10 data-field: shipped `State = … | Editing` past a
//       hand-rolled Phase C that omitted the naming-convention gate.
//     - 2026-06-11 rich-text-editor: shipped a dead `showExpand` BOOLEAN
//       (registered but wired to no node) past a hand-rolled Phase C that
//       omitted the property-wiring gate.
//   A fixed harness turns "did I remember gate X?" into "gate X is a key in
//   the report" — a skipped gate becomes a missing key, not a silent pass.
//
// SCOPE — this harness is authoritative for the gates it runs, and ONLY
// those. It does the mechanical 80%. It does NOT clear the judgment / model-
// dependent gates (variant matrix vs the approved model, per-variant
// INSTANCE_SWAP defaults, tone-bearing adornment role-split, the model's
// designer-reachable exposure list, visual correctness). Those stay a
// SEPARATE manual pass — see report.NOT_CHECKED_run_these_manually. A green
// report here is necessary, never sufficient. Trusting it as "ship it" just
// trades one skipped-step failure for another.
//
// HOW TO RUN
//   1. Set SET_ID to the udc-<id> COMPONENT_SET node id.
//   2. Run via use_figma. Read report.pass + report.failedHardGates first,
//      then drill into report.gates[...] for node ids.
//   3. Then do the manual judgment pass over NOT_CHECKED_run_these_manually.
//
// MAINTENANCE
//   This script is the EXECUTABLE definition of the deterministic gates.
//   The skill prose explains what each gate means; when a gate's logic
//   changes, change it HERE and reconcile the prose description — don't let
//   the two drift. Guarded property reads (`'prop' in node`) are deliberate:
//   the harness must never throw on a node type that lacks a property
//   (e.g. `cornerRadius` on TEXT).
// =====================================================================

// --- EDIT THIS ------------------------------------------------------
const SET_ID = 'COMPONENT_SET_ID_HERE';
// --------------------------------------------------------------------

// Canonical State-axis values — uds-naming-conventions.mdc §1. A State
// value outside this set is a HARD fail (rename = potentially-breaking,
// ask-user — never silent).
const CANONICAL_STATES = ['Default', 'Hovered', 'Focused', 'Pressed', 'Selected', 'Disabled', 'Loading', 'Error', 'Empty', 'Read-only', 'Dragged', 'Indeterminate', 'Checked', 'Current'];

const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || set.type !== 'COMPONENT_SET') return { fatal: 'SET_ID is not a COMPONENT_SET: ' + SET_ID };
const variants = set.children;

// gotcha §14 — attribute each node to its owning instance. The host audit
// inspects only nodes the host itself owns; a nested DS instance's internals
// (a udc-button's own label/icon) belong to that instance and are out of
// scope for the host's token/spacing/typography/hygiene gates.
function hostOwned(node, host) { let p = node.parent; while (p && p !== host) { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; }
function ownNodes(variant) { const all = variant.findAll(n => hostOwned(n, variant)); all.push(variant); return all; }

// SOLID paint on `key` that lacks a color-variable binding.
function rawPaint(node, key) {
  if (!(key in node) || !Array.isArray(node[key])) return false;
  return node[key].some(p => p && p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color));
}

const G = {};

// G1 — token bindings (own nodes): no raw SOLID fills/strokes, no unbound radii.
const rawFill = [], rawStroke = [], unboundRadius = [];
for (const v of variants) for (const n of ownNodes(v)) {
  if (rawPaint(n, 'fills')) rawFill.push(n.id + ':' + n.name);
  if (rawPaint(n, 'strokes')) rawStroke.push(n.id + ':' + n.name);
  if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius > 0) {
    const bv = n.boundVariables || {};
    if (!bv.topLeftRadius && !bv.topRightRadius && !bv.bottomLeftRadius && !bv.bottomRightRadius) unboundRadius.push(n.id + ':' + n.name);
  }
}
G.tokenBindings = { pass: !rawFill.length && !rawStroke.length && !unboundRadius.length, rawFill: rawFill.length, rawStroke: rawStroke.length, unboundRadius: unboundRadius.length, sample: [...rawFill, ...rawStroke, ...unboundRadius].slice(0, 8) };

// G2 — per-side spacing bindings. All FIVE reported separately: a combined
// count hides the horizontal-bound / vertical-stranded asymmetry (gotchas §5).
const padMiss = { paddingTop: [], paddingBottom: [], paddingLeft: [], paddingRight: [], itemSpacing: [] };
for (const v of variants) for (const n of ownNodes(v)) {
  if ((n.type === 'FRAME' || n.type === 'COMPONENT') && n.layoutMode && n.layoutMode !== 'NONE') {
    const bv = n.boundVariables || {};
    for (const prop of Object.keys(padMiss)) if (typeof n[prop] === 'number' && n[prop] > 0 && !bv[prop]) padMiss[prop].push(n.id);
  }
}
G.spacingBindings = { pass: Object.values(padMiss).every(a => !a.length), paddingTop: padMiss.paddingTop.length, paddingBottom: padMiss.paddingBottom.length, paddingLeft: padMiss.paddingLeft.length, paddingRight: padMiss.paddingRight.length, itemSpacing: padMiss.itemSpacing.length, sample: [].concat(...Object.values(padMiss)).slice(0, 8) };

// G3 — effect-style bindings: any node with effects MUST carry an effectStyleId
// (gotchas §6 — the visual looks right even when the binding is missing).
const rawEffects = [];
for (const v of variants) for (const n of ownNodes(v)) {
  if ('effects' in n && Array.isArray(n.effects) && n.effects.length > 0 && 'effectStyleId' in n && !n.effectStyleId) rawEffects.push(n.id + ':' + n.name);
}
G.effectBindings = { pass: !rawEffects.length, count: rawEffects.length, sample: rawEffects.slice(0, 6) };

// G4 — typography: each text node has a textStyleId OR all four font var
// bindings. Partial (some-but-not-four) is its own bucket.
const typeMiss = [], typePartial = [];
for (const v of variants) for (const n of ownNodes(v)) {
  if (n.type !== 'TEXT') continue;
  if (n.textStyleId) continue;
  const bv = n.boundVariables || {};
  const fontVars = ['fontFamily', 'fontSize', 'fontStyle', 'lineHeight'].filter(k => bv[k]);
  if (fontVars.length === 0) typeMiss.push(n.id + ':' + n.name);
  else if (fontVars.length < 4) typePartial.push(n.id + ':' + n.name + ' (' + fontVars.length + '/4)');
}
G.typographyBinding = { pass: !typeMiss.length && !typePartial.length, missing: typeMiss.length, partial: typePartial.length, sample: [...typeMiss, ...typePartial].slice(0, 8) };

// G5 — text wrap: copy nodes left at WIDTH_AND_HEIGHT overflow on long content
// (gotchas §8). Reported as candidates — fixed short labels are exempt, agent
// confirms each.
const wrapCand = [];
for (const v of variants) for (const n of ownNodes(v)) if (n.type === 'TEXT' && n.textAutoResize === 'WIDTH_AND_HEIGHT') wrapCand.push(n.id + ':' + n.name);
G.textWrap = { pass: !wrapCand.length, candidates: wrapCand.length, sample: wrapCand.slice(0, 8), note: 'WIDTH_AND_HEIGHT overflows on long copy. Fixed short labels are exempt — confirm each candidate is a true short label.' };

const pdefs = set.componentPropertyDefinitions;

// G6 — naming-convention gate: every State-axis value must be canonical.
const nonCanonical = [];
for (const k of Object.keys(pdefs)) {
  const d = pdefs[k];
  if (d.type === 'VARIANT' && /^State$/i.test(k)) for (const opt of (d.variantOptions || [])) if (!CANONICAL_STATES.includes(opt)) nonCanonical.push(k + '=' + opt);
}
G.naming = { pass: !nonCanonical.length, nonCanonical };

// G7 — property-wiring liveness (THE recurrence gate). Every registered,
// non-variant component property must be referenced by >=1 node in EVERY
// variant, via the kind that matches its type. `dead` = referenced in zero
// variants (the showExpand 2026-06-11 miss). `partial` = wired in some only.
const refKind = { TEXT: 'characters', BOOLEAN: 'visible', INSTANCE_SWAP: 'mainComponent' };
const deadProps = [], partialProps = [];
for (const fullKey of Object.keys(pdefs)) {
  const d = pdefs[fullKey];
  if (d.type === 'VARIANT') continue;
  const kind = refKind[d.type];
  if (!kind) continue;
  let wired = 0;
  for (const v of variants) if (v.findAll(n => { const r = n.componentPropertyReferences; return r && r[kind] === fullKey; }).length > 0) wired++;
  if (wired === 0) deadProps.push(fullKey + ' [' + d.type + ']');
  else if (wired < variants.length) partialProps.push(fullKey + ' [' + d.type + '] ' + wired + '/' + variants.length);
}
G.propertyWiring = { pass: !deadProps.length && !partialProps.length, dead: deadProps, partial: partialProps };

// G8 — layer hygiene + page clutter: no generic node names; nothing on the
// page but the set (a leftover `_`-prefixed scratch node is tolerated, and
// sibling `udc-`-prefixed COMPONENT_SETs are tolerated as family member sets —
// a family page hosts several udc-<stem>* sets; see uds-naming-conventions §8).
const generic = [];
for (const v of variants) for (const n of ownNodes(v)) if (/^(Frame|Rectangle|Group|Component|Line|Vector|Ellipse) ?\d+$/.test(n.name)) generic.push(n.id + ':' + n.name);
const page = set.parent;
const pageClutter = (page && page.type === 'PAGE') ? page.children.filter(n => n.id !== set.id && !/^_/.test(n.name) && !(n.type === 'COMPONENT_SET' && /^udc-/.test(n.name))).map(n => n.name) : [];
G.layerHygiene = { pass: !generic.length && !pageClutter.length, generic: generic.length, genericSample: generic.slice(0, 8), pageClutter };

// G9 — contract block + version stamp. Delimiters present (literal `<<`, not
// HTML-escaped — gotchas §10), and the DATE in the contract's Factory-version
// line == the date plugin-data stamp. Tolerates BOTH the legacy
// `Factory-version: <date>` and the F13+ `Factory-version: F# (<date>)` forms:
// the date is the machine key, the F# is the derived display index (captured
// for reporting, not separately verified — the changelog needed to map it
// isn't readable in the Figma plugin context).
const dm = set.descriptionMarkdown || '';
const hasOpen = dm.indexOf('<<UDS-FACTORY-CONTRACT v1>>') >= 0;
const hasClose = dm.indexOf('<<END-UDS-FACTORY-CONTRACT>>') >= 0;
const fvStamp = set.getSharedPluginData('dsb', 'factory_version') || null;
const fvLineRaw = (dm.match(/Factory-version:\s*([^\n]+)/) || [])[1] || null;
const fvDate = fvLineRaw ? ((fvLineRaw.match(/\d{4}\.\d{2}\.\d{2}\.\d+/) || [])[0] || null) : null;
const fvF = fvLineRaw ? ((fvLineRaw.match(/\bF(\d+)\b/) || [])[1] || null) : null;
G.contractAndStamp = { pass: hasOpen && hasClose && !!fvStamp && fvDate === fvStamp, hasOpen, hasClose, fvStamp, fvContractDate: fvDate, fvContractF: fvF ? ('F' + fvF) : null };

// G10 — proactive sealed-control scan. Host-owned nested instances that are
// NEITHER exposed NOR hoisted are candidate sealed controls (gotcha §12 +
// factory-quality §2 check 7). Candidates only — a decorative/structural
// instance (a divider) is a review note, never an auto-fail.
const sealed = new Set();
for (const v of variants) for (const n of v.findAll(x => x.type === 'INSTANCE' && hostOwned(x, v))) {
  const r = n.componentPropertyReferences;
  if (n.isExposedInstance !== true && !(r && (r.mainComponent || r.visible))) sealed.add(n.name);
}
G.sealedControlScan = { candidates: [...sealed], note: 'Candidates only — confirm whether each is a control-bearing instance (fail if sealed) or decorative/structural (review note).' };

// --- overall verdict --------------------------------------------------
// Hard gates auto-fail the run. textWrap / layerHygiene / sealedControlScan
// are candidate-style and surface for judgment without failing pass.
const HARD = ['tokenBindings', 'spacingBindings', 'effectBindings', 'typographyBinding', 'naming', 'propertyWiring', 'contractAndStamp'];
const failedHardGates = HARD.filter(k => G[k] && G[k].pass === false);
return {
  setName: set.name,
  variantCount: variants.length,
  pass: failedHardGates.length === 0,
  failedHardGates,
  gates: G,
  NOT_CHECKED_run_these_manually: [
    'Variant matrix vs the approved Phase A model (axes + values are what was approved).',
    'Per-variant INSTANCE_SWAP defaults vs the model (each variant has its intended glyph, not the universal placeholder).',
    'Tone-bearing adornment coverage — content vs control split by role (needs icon-role judgment; gotcha/factory-quality §6).',
    "Nested-instance exposure vs the model's designer-reachable list (this script only runs the proactive sealed-control half).",
    'Whether textWrap / layerHygiene / sealedControl candidates are intentional.',
    'Visual correctness — get_screenshot and confirm it renders and reads right.'
  ]
};
