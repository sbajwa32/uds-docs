// Stub — populated in the next commit of Chunk 06a from docs/data/site-changelog.js.
//
// Ported in this chunk so the new Changelog page can render the SITE tab from
// typed data (the file was previously a plain ES module).

export type SiteChangelogChangeType = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated';

export interface SiteChangelogChange {
  type: SiteChangelogChangeType;
  text: string;
}

export interface SiteChangelogEntry {
  /** SITE version, e.g. "SITE 2026.04.01.1". */
  version: string;
  /** ISO calendar date YYYY-MM-DD. */
  date: string;
  changes: SiteChangelogChange[];
}

export const SITE_CHANGELOG: SiteChangelogEntry[] = [];
