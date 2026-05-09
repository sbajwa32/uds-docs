// docs/helpers/uds-path.js
// Version-aware path resolver for UDS data fetches.
//
// All UDS-data fetches in the docs site go through udsResolve() so the
// version dropdown can swap which copy of UDS data is read:
//   - Current live UDS: ./uds/...
//   - Historical snapshot: ./versions/<X>/uds/...
//
// The viewing version is read from the ?uds=X.Y URL parameter at module
// load time. Changing the dropdown sets the param and reloads — no hot
// switching, since fetches are cached aggressively across the app.
//
// Snapshots can be PRUNED (deleted from disk to save space) per the locked
// pruning policy — when that happens, udsPath() falls back to the current
// path and isVersionPruned() returns true so the caller can render a
// "snapshot pruned" caveat.

let _availableVersions = null;
let _currentVersion = null;
let _viewingVersion = null;

// Read ?uds=X.Y from URL once at module load.
function readViewingFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('uds') || null;
  } catch (_) {
    return null;
  }
}
_viewingVersion = readViewingFromURL();

async function ensureVersionsLoaded() {
  if (_availableVersions !== null) return;
  try {
    const [vRes, mfRes] = await Promise.all([
      fetch('./uds/version.json'),
      fetch('./versions.json')
    ]);
    if (vRes.ok) {
      const data = await vRes.json();
      _currentVersion = data.version || null;
    }
    if (mfRes.ok) {
      const data = await mfRes.json();
      _availableVersions = new Set((data.versions || []).filter(v => v !== _currentVersion));
    } else {
      _availableVersions = new Set();
    }
  } catch (_) {
    _availableVersions = new Set();
  }
}
ensureVersionsLoaded();

/**
 * udsPath(version) — returns the base path to read UDS data from. Defaults
 * to the viewing-version (?uds= URL param) if no version is supplied.
 *   - null / undefined / 'current' → uses _viewingVersion fallback
 *   - matches current → './uds/'
 *   - listed in versions.json with versions/<X>/ on disk → './versions/<X>/uds/'
 *   - everything else (pruned or unknown) → './uds/' (caller should warn)
 */
export function udsPath(version) {
  const v = (version === undefined || version === null || version === 'current')
    ? _viewingVersion
    : version;
  if (!v || v === _currentVersion) return './uds/';
  if (_availableVersions && _availableVersions.has(v)) {
    return './versions/' + v + '/uds/';
  }
  return './uds/';
}

/**
 * udsResolve(relativePath) — resolves a path-from-uds-root (e.g.
 * 'components/button/spec.json' or 'CHANGELOG.json') to a fetchable URL
 * respecting the current viewing version. The path may also contain a
 * leading './uds/' or 'uds/' prefix; both are handled.
 */
export function udsResolve(relativePath) {
  let p = String(relativePath || '');
  if (p.startsWith('./uds/')) p = p.slice('./uds/'.length);
  else if (p.startsWith('uds/')) p = p.slice('uds/'.length);
  return udsPath() + p;
}

/**
 * isVersionPruned(version) — true if the version is referenced (e.g. in
 * changelog history) but its snapshot folder is not on disk. Renderer
 * should show a "snapshot pruned" caveat in the version dropdown / page.
 */
export function isVersionPruned(version) {
  if (!version || version === 'current' || version === _currentVersion) return false;
  if (!_availableVersions) return false;
  return !_availableVersions.has(version);
}

/** currentVersion() — the live UDS version per uds/version.json. */
export function currentVersion() {
  return _currentVersion;
}

/** viewingVersion() — the version the user has selected via ?uds=, or null
 *  if viewing the live current version. Render a "viewing archive" banner
 *  when this is non-null. */
export function viewingVersion() {
  return _viewingVersion;
}

/** isViewingHistorical() — true if the user is viewing an archived version
 *  (?uds=X.Y is set and matches an on-disk snapshot). */
export function isViewingHistorical() {
  return _viewingVersion && _viewingVersion !== _currentVersion;
}

/** availableVersions() — array of historical versions on disk (no current). */
export function availableVersions() {
  return _availableVersions ? Array.from(_availableVersions) : [];
}

/** Public export to await before doing UDS-data work that depends on the
 *  version map. The module starts loading on import; this lets early
 *  callers wait for it.
 */
export const versionsReady = ensureVersionsLoaded();
