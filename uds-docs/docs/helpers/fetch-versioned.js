// docs/helpers/fetch-versioned.js
// Cache-busting fetch helper used by ES modules in docs/.
//
// All dynamic fetches in the docs site go through fetchVersioned() so the
// SITE_VERSION (read once from version.txt at module load time) is appended
// as a `?v=...` query param. This means bump-site.sh only has to update the
// canonical version.txt and every fetch in the running app naturally
// invalidates its cached response without per-fetch site-version awareness.
//
// Used heavily by Phase 6 onward where app.js fetches per-component
// uds/components/<id>/spec.json, examples/manifest.json, etc.

let cachedVersion = null;

async function loadSiteVersion() {
  if (cachedVersion !== null) return cachedVersion;
  try {
    const res = await fetch(new URL('../../version.txt', import.meta.url));
    if (res.ok) {
      cachedVersion = (await res.text()).trim();
      return cachedVersion;
    }
  } catch (_) {}
  // Fallback: read inline SITE_VERSION constant from the page if present
  if (typeof window !== 'undefined' && typeof window.SITE_VERSION === 'string') {
    cachedVersion = window.SITE_VERSION;
    return cachedVersion;
  }
  cachedVersion = 'unknown';
  return cachedVersion;
}

// Eagerly start loading the version so the first fetch doesn't pay the cost.
loadSiteVersion();

/**
 * fetchVersioned(url, init?) — like fetch() but appends `?v=<SITE_VERSION>`
 * (or merges with an existing query string) so the browser's HTTP cache
 * keys per-version. Resolves to a Response.
 */
export async function fetchVersioned(url, init) {
  const v = await loadSiteVersion();
  const target = new URL(url, document.baseURI);
  target.searchParams.set('v', v);
  return fetch(target.toString(), init);
}

/**
 * fetchVersionedJSON(url, init?) — convenience wrapper that returns parsed JSON.
 * Throws if the response isn't ok.
 */
export async function fetchVersionedJSON(url, init) {
  const res = await fetchVersioned(url, init);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.json();
}

/**
 * fetchVersionedText(url, init?) — convenience wrapper that returns text.
 * Throws if the response isn't ok.
 */
export async function fetchVersionedText(url, init) {
  const res = await fetchVersioned(url, init);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.text();
}
