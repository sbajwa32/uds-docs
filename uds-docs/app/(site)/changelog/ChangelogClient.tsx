'use client';

// Client-side wrapper for the Changelog page. Renders the two-tab strip
// (UDS / SITE) and the corresponding stream for each tab. The UDS stream
// re-fetches when the active archive version changes (Chunk 14); the
// SITE stream is migration-history-only and never archives.

import { useEffect, useState } from 'react';

import { SgPageTabs, SgPageTab } from '@/components/site/SgPageHeader';
import { useUdsVersion } from '@/components/site/UdsVersionProvider';
import { getChangelog } from '@/lib/uds-data';
import type { AggregatedChangelog, ChangelogNote } from '@/lib/uds-data';
import {
  SITE_CHANGELOG,
  type SiteChangelogEntry,
  type SiteChangelogChange,
} from '@/data/site-changelog';

const CHANGELOG_TYPE_ORDER = ['added', 'changed', 'fixed', 'deprecated', 'removed'] as const;

function changeCountLabel(n: number): string {
  return `${n} ${n === 1 ? 'change' : 'changes'}`;
}

function inlineCode(text: string): React.ReactNode {
  // Render `code` segments as <code>; everything else as plain text. Matches
  // the legacy app.js renderChangeItems behaviour but stays inside React's
  // tree (no dangerouslySetInnerHTML, so hydration is straightforward).
  const parts = text.split(/(`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="sg-cl-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function ChangeItems({ entries }: { entries: ChangelogNote[] }) {
  // Class names match the legacy site exactly so the CSS in
  // styles/pages/legacy.css (.sg-cl-item, .sg-cl-type, .sg-cl-item::before)
  // applies — including the colored dot before each item and the
  // type-color tinting.
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {entries.map((entry, idx) => (
        <li key={idx} className={`sg-cl-item sg-cl-item--${entry.type}`}>
          <span className={`sg-cl-type sg-cl-type--${entry.type}`}>
            {entry.type}
          </span>{' '}
          {inlineCode(entry.text)}
        </li>
      ))}
    </ul>
  );
}

function UdsStream({ releases }: { releases: AggregatedChangelog }) {
  const newestFirst = releases.slice().reverse();
  return (
    <div className="sg-cl-stream" id="sg-global-changelog">
      {newestFirst.map((release) => {
        const compNames = Object.keys(release.byComponent || {});
        let totalCount = (release.globalNotes ?? []).length;
        compNames.forEach((n) => (totalCount += release.byComponent[n].length));

        return (
          <article key={release.version} className="sg-cl-release">
            <header className="sg-cl-release-header">
              <h3 className="sg-cl-release-title">UDS {release.version}</h3>
              <div className="sg-cl-release-meta">
                {release.date ? (
                  <span className="sg-cl-release-date">{release.date}</span>
                ) : null}
                <span className="sg-cl-release-count">{changeCountLabel(totalCount)}</span>
              </div>
            </header>
            <div className="sg-cl-release-body">
              {release.globalNotes && release.globalNotes.length > 0 ? (
                <section className="sg-cl-release-section">
                  <h4 className="sg-cl-release-section-title">Release notes</h4>
                  <div className="sg-cl-item-list">
                    {CHANGELOG_TYPE_ORDER.map((type) => {
                      const ofType = release.globalNotes.filter((e) => e.type === type);
                      if (!ofType.length) return null;
                      return <ChangeItems key={type} entries={ofType} />;
                    })}
                  </div>
                </section>
              ) : null}
              {compNames.length > 0 ? (
                <section className="sg-cl-release-section">
                  <h4 className="sg-cl-release-section-title">Components</h4>
                  {compNames.map((name) => {
                    const entries = release.byComponent[name];
                    return (
                      <div key={name} className="sg-cl-comp">
                        <h5 className="sg-cl-comp-name">{name}</h5>
                        <div className="sg-cl-item-list">
                          {CHANGELOG_TYPE_ORDER.map((type) => {
                            const ofType = entries.filter((e) => e.type === type);
                            if (!ofType.length) return null;
                            return <ChangeItems key={type} entries={ofType} />;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </section>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

interface SiteDayGroup {
  date: string;
  releases: SiteChangelogEntry[];
}

function groupSiteByDate(entries: SiteChangelogEntry[]): SiteDayGroup[] {
  const groups = new Map<string, SiteDayGroup>();
  for (const entry of entries) {
    const existing = groups.get(entry.date);
    if (existing) existing.releases.push(entry);
    else groups.set(entry.date, { date: entry.date, releases: [entry] });
  }
  return Array.from(groups.values());
}

function formatChangelogDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SiteStream({ entries }: { entries: SiteChangelogEntry[] }) {
  const newestFirst = entries.slice().reverse();
  const groups = groupSiteByDate(newestFirst);
  return (
    <div className="sg-cl-stream" id="sg-site-changelog">
      {groups.map((group) => {
        const dayCount = group.releases.reduce((acc, r) => acc + r.changes.length, 0);
        return (
          <article key={group.date} className="sg-cl-day">
            <header className="sg-cl-day-header">
              <h3 className="sg-cl-day-title">{formatChangelogDate(group.date)}</h3>
              <div className="sg-cl-day-meta">
                {group.releases.length > 1 ? (
                  <span className="sg-cl-day-count">{group.releases.length} bumps</span>
                ) : null}
                <span className="sg-cl-day-count">{changeCountLabel(dayCount)}</span>
              </div>
            </header>
            <div className="sg-cl-day-body">
              {group.releases.map((release) => (
                <section key={release.version} className="sg-cl-bump">
                  <h4 className="sg-cl-bump-label">{release.version}</h4>
                  <div className="sg-cl-item-list">
                    {CHANGELOG_TYPE_ORDER.map((type) => {
                      const ofType: SiteChangelogChange[] = release.changes.filter(
                        (e) => e.type === type,
                      );
                      if (!ofType.length) return null;
                      return <ChangeItems key={type} entries={ofType as ChangelogNote[]} />;
                    })}
                  </div>
                </section>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ChangelogClient({
  initialUdsChangelog,
}: {
  initialUdsChangelog: AggregatedChangelog;
}) {
  const { fetchVersion, isArchive } = useUdsVersion();
  const [activeTab, setActiveTab] = useState<'uds' | 'site'>('uds');
  const [udsChangelog, setUdsChangelog] = useState<AggregatedChangelog>(initialUdsChangelog);

  // Re-fetch when switching to an archive version. The initial value is
  // the build-time live changelog, so we only need to override on
  // archive switch.
  useEffect(() => {
    if (!fetchVersion) {
      setUdsChangelog(initialUdsChangelog);
      return;
    }
    let cancelled = false;
    getChangelog(fetchVersion)
      .then((cl) => {
        if (!cancelled) setUdsChangelog(cl);
      })
      .catch(() => {
        // Archive lookup failed — fall back to the live changelog.
        if (!cancelled) setUdsChangelog(initialUdsChangelog);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchVersion, initialUdsChangelog]);

  return (
    <>
      <SgPageTabs
        activeTab={activeTab}
        onActiveTabChange={(v) => setActiveTab(v as 'uds' | 'site')}
        ariaLabel="Changelog scope"
      >
        <SgPageTab value="uds">
          UDS{isArchive ? ` (${fetchVersion} archive)` : ''}
        </SgPageTab>
        <SgPageTab value="site">Site</SgPageTab>
      </SgPageTabs>
      {/*
        The legacy `.sg-cl-page` wrapper was a `200px (rail) | 1fr (main)`
        grid. The migrated React port doesn't render a navigation rail yet
        — until it does, drop the grid so the stream renders at full
        content width instead of being squeezed into the empty rail slot.
      */}
      <div hidden={activeTab !== 'uds'}>
        <div className="sg-cl-main" data-cl-tab="uds">
          <UdsStream releases={udsChangelog} />
        </div>
      </div>
      <div hidden={activeTab !== 'site'}>
        <div className="sg-cl-main" data-cl-tab="site">
          <SiteStream entries={SITE_CHANGELOG} />
        </div>
      </div>
    </>
  );
}
