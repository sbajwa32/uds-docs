// docs/modules/demo-builder/example-fetcher.js
// Fetches per-component example HTML from uds/components/<id>/examples/
// and resolves token placeholders against the supplied pool.
//
// This is the source-of-truth replacement for templates.js. After Phase 7:
//   - Demo Builder calls fetchExampleHTML(componentId, randomPool())
//   - Docs page Examples tab calls fetchExampleHTML(componentId, canonicalPool())
// Same files, same substitution engine — drift between docs and demos
// becomes structurally impossible.

import { rnd } from './rng.js';
import { applyTokenSubstitution } from './substitution.js';

const _manifestCache = {};
const _htmlCache = {};

async function fetchManifest(componentId) {
  if (_manifestCache[componentId]) return _manifestCache[componentId];
  const url = `./uds/components/${componentId}/examples/manifest.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No manifest for component ${componentId} (${res.status})`);
  const m = await res.json();
  _manifestCache[componentId] = m;
  return m;
}

async function fetchExampleFile(componentId, fileName) {
  const key = `${componentId}/${fileName}`;
  if (_htmlCache[key]) return _htmlCache[key];
  const url = `./uds/components/${componentId}/examples/${fileName}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No example file ${fileName} for ${componentId} (${res.status})`);
  const text = await res.text();
  _htmlCache[key] = text;
  return text;
}

/**
 * Picks an example variant from a manifest by demoWeight.
 * - If `pickAll` is true, returns the first entry with showInDocs=true (used by docs page)
 * - Otherwise weighted-random across entries with demoWeight > 0
 */
function pickVariant(manifest, opts = {}) {
  const examples = manifest.examples || [];
  if (opts.pickAll) {
    return examples.find((e) => e.showInDocs !== false) || examples[0];
  }
  const eligible = examples.filter((e) => (e.demoWeight || 0) > 0);
  if (!eligible.length) {
    return examples[0] || null;
  }
  const totalWeight = eligible.reduce((s, e) => s + e.demoWeight, 0);
  let roll = rnd() * totalWeight;
  for (const e of eligible) {
    roll -= e.demoWeight;
    if (roll <= 0) return e;
  }
  return eligible[0];
}

/**
 * fetchExampleHTML(componentId, pool, opts?)
 *   pool: data-pools.js DATA or canonical-pool.js CANONICAL_POOL
 *   opts.variantId: optional — pick a specific manifest entry by id
 *   opts.pickAll: pick first showInDocs entry (docs page mode)
 *
 * Returns the example HTML string with all {{placeholder}} substitutions
 * applied. Returns null if the component or example can't be loaded.
 */
export async function fetchExampleHTML(componentId, pool, opts = {}) {
  try {
    const manifest = await fetchManifest(componentId);
    let variant;
    if (opts.variantId) {
      variant = (manifest.examples || []).find((e) => e.id === opts.variantId);
    } else {
      variant = pickVariant(manifest, opts);
    }
    if (!variant) return null;
    const html = await fetchExampleFile(componentId, variant.file);
    return applyTokenSubstitution(html, pool);
  } catch (err) {
    console.warn('fetchExampleHTML failed:', componentId, err.message);
    return null;
  }
}

/**
 * fetchAllExamples(componentId, pool) — returns [{ id, label, description, html }]
 * for every example with showInDocs !== false. Used by the docs page Examples
 * tab to render every variant.
 */
export async function fetchAllExamples(componentId, pool) {
  try {
    const manifest = await fetchManifest(componentId);
    const visible = (manifest.examples || []).filter((e) => e.showInDocs !== false);
    const results = [];
    for (const e of visible) {
      const html = await fetchExampleFile(componentId, e.file);
      results.push({
        id: e.id,
        label: e.label || e.id,
        description: e.description || '',
        html: applyTokenSubstitution(html, pool)
      });
    }
    return results;
  } catch (err) {
    console.warn('fetchAllExamples failed:', componentId, err.message);
    return [];
  }
}
