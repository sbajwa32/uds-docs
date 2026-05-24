// Pure async data layer for UDS payload (tokens, components, specs, etc.).
//
// Discipline (per the migration plan):
//   - No React imports. No context, no hooks.
//   - Every fetcher takes an optional `version` arg. Omit → current UDS payload
//     at `./uds/...`; provide → historical snapshot at `./versions/<X>/uds/...`.
//   - Chunk 14 will build a React context that reads the active version from
//     `useSearchParams()` and threads it through these fetchers. The fetchers
//     themselves never know a context exists.
//
// Naming: the schema-derived types in types/uds.ts use the schemas' own
// `title` fields, which produces names like UDSComponentSpecSchema. This
// module re-exports them with shorter aliases that read better at call sites.

import type {
  UDSVersion,
  UDSComponentsManifest,
  UDSComponentSpecSchema,
  UDSComponentStatus,
  UDSComponentChangelog,
  UDSComponentImplementationReference,
  UDSComponentExamplesManifest,
  UDSComponentFigmaNotes,
} from '@/types/uds';

// ---------------------------------------------------------------------------
// Public type aliases (re-exported with shorter names for ergonomic call sites)
// ---------------------------------------------------------------------------

export type VersionInfo = UDSVersion;
export type ComponentsManifest = UDSComponentsManifest;
export type ComponentSpec = UDSComponentSpecSchema;
export type ComponentStatus = UDSComponentStatus;
export type ComponentChangelog = UDSComponentChangelog;
export type ComponentImpl = UDSComponentImplementationReference;
export type ExamplesManifest = UDSComponentExamplesManifest;
export type FigmaNotes = UDSComponentFigmaNotes;

// versions.json (top-level, listing all snapshot versions) doesn't have a
// JSON Schema — it's hand-curated. Type it inline.
export interface VersionsManifest {
  /** UDS version currently served at `./uds/` (the "live" payload). */
  latest: string;
  /** All versions available, including the live one and every snapshot. */
  versions: string[];
}

// CHANGELOG.json (aggregated by scripts/aggregate-changelog.sh) and
// CHANGELOG.globalNotes.json (hand-curated) also don't have schemas. Their
// shapes are pinned by the aggregation script and are stable.
export interface AggregatedChangelogEntry {
  version: string;
  date: string;
  globalNotes: ChangelogNote[];
  byComponent: Record<string, ChangelogNote[]>;
}

export interface ChangelogNote {
  type: string;
  text: string;
}

export type AggregatedChangelog = AggregatedChangelogEntry[];

export interface GlobalNotesByVersion {
  [version: string]: {
    date: string;
    notes: ChangelogNote[];
  };
}

// ---------------------------------------------------------------------------
// URL builder + low-level fetchers
// ---------------------------------------------------------------------------

/**
 * Build a UDS-data URL for a given path within the design system payload.
 * - No version: live payload (`./uds/<path>`).
 * - Version specified: historical snapshot (`./versions/<X>/uds/<path>`).
 *
 * Paths are always joined with a leading `./` so the URL resolves relative to
 * `document.baseURI` regardless of which page made the request.
 */
export function udsResolve(relPath: string, version?: string): string {
  const trimmed = relPath.replace(/^\/+/, '');
  if (version) {
    return `./versions/${version}/uds/${trimmed}`;
  }
  return `./uds/${trimmed}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  // `cache: 'no-cache'` asks the browser to revalidate with the origin (it does
  // not skip the cache entirely — that would be `no-store`). The Cloudflare
  // `_headers` policy already sends `Cache-Control: no-cache` on JSON
  // responses; pairing the request hint with the response header keeps both
  // sides aligned.
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`UDS fetch failed: ${url} → ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

async function fetchJsonOptional<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`UDS fetch failed: ${url} → ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Top-level manifests
// ---------------------------------------------------------------------------

/** Top-level versions manifest at `./versions.json` (always live). */
export async function getVersions(): Promise<VersionsManifest> {
  return fetchJson<VersionsManifest>('./versions.json');
}

/** Version metadata for the live or a historical snapshot. */
export async function getVersionInfo(version?: string): Promise<VersionInfo> {
  return fetchJson<VersionInfo>(udsResolve('version.json', version));
}

/** Components manifest for the live or a historical snapshot. */
export async function getComponents(version?: string): Promise<ComponentsManifest> {
  return fetchJson<ComponentsManifest>(udsResolve('components.json', version));
}

// ---------------------------------------------------------------------------
// Per-component fetchers
// ---------------------------------------------------------------------------

export async function getComponentSpec(id: string, version?: string): Promise<ComponentSpec> {
  return fetchJson<ComponentSpec>(udsResolve(`components/${id}/spec.json`, version));
}

export async function getComponentStatus(id: string, version?: string): Promise<ComponentStatus> {
  return fetchJson<ComponentStatus>(udsResolve(`components/${id}/status.json`, version));
}

export async function getComponentChangelog(
  id: string,
  version?: string,
): Promise<ComponentChangelog> {
  return fetchJson<ComponentChangelog>(udsResolve(`components/${id}/changelog.json`, version));
}

export async function getComponentImpl(id: string, version?: string): Promise<ComponentImpl> {
  return fetchJson<ComponentImpl>(udsResolve(`components/${id}/impl.json`, version));
}

export async function getComponentManifest(
  id: string,
  version?: string,
): Promise<ExamplesManifest> {
  return fetchJson<ExamplesManifest>(
    udsResolve(`components/${id}/examples/manifest.json`, version),
  );
}

/**
 * Per-component Figma notes. Returns `null` when the file is absent (most
 * components don't have any open Figma notes); the Figma Notes tab in the
 * docs page should render only when this returns a non-null value.
 */
export async function getComponentFigmaNotes(
  id: string,
  version?: string,
): Promise<FigmaNotes | null> {
  return fetchJsonOptional<FigmaNotes>(udsResolve(`components/${id}/figmanotes.json`, version));
}

// ---------------------------------------------------------------------------
// Aggregated / curated changelog data
// ---------------------------------------------------------------------------

/** Aggregated UDS changelog (built from per-component changelogs). */
export async function getChangelog(version?: string): Promise<AggregatedChangelog> {
  return fetchJson<AggregatedChangelog>(udsResolve('CHANGELOG.json', version));
}

/** Hand-curated non-component release notes per version. */
export async function getGlobalNotes(version?: string): Promise<GlobalNotesByVersion> {
  return fetchJson<GlobalNotesByVersion>(udsResolve('CHANGELOG.globalNotes.json', version));
}
