// docs/helpers/uds-path.js
// Version-aware path resolver for UDS data fetches.
//
// All fetches in docs/app.js that read from uds/... go through udsPath()
// so the version dropdown can swap which copy of UDS data is read:
//   - Current live UDS: ./uds/...
//   - Historical snapshot: ./versions/<X>/uds/...
//
// Snapshots can be PRUNED (deleted from disk to save space) per the locked
// pruning policy — when that happens, udsPath() falls back to the current
// path and isVersionPruned() returns true so the caller can render a
// "snapshot pruned" caveat.
//
// Per-component changelog history is NEVER pruned, so the Changelog page
// continues to show entries for pruned versions (just without the ability
// to navigate to the frozen snapshot of those specs).

let _availableVersions = null;
let _currentVersion = null;

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
 * udsPath(version) — returns the base path to read UDS data from.
 *   - null / undefined / 'current' → './uds/'
 *   - matches uds/version.json.version → './uds/'
 *   - listed in versions.json with versions/<X>/ on disk → './versions/<X>/uds/'
 *   - everything else (pruned or unknown) → './uds/' (caller should warn)
 */
export function udsPath(version) {
  if (!version || version === 'current' || version === _currentVersion) {
    return './uds/';
  }
  if (_availableVersions && _availableVersions.has(version)) {
    return './versions/' + version + '/uds/';
  }
  return './uds/'; // pruned or unknown
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

/** availableVersions() — array of historical versions on disk (no current). */
export function availableVersions() {
  return _availableVersions ? Array.from(_availableVersions) : [];
}

/** Public export to await before doing UDS-data work that depends on the
 *  version map. The module starts loading on import; this lets early
 *  callers wait for it.
 */
export const versionsReady = ensureVersionsLoaded();
