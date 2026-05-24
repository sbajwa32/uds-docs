'use client';

// Client-side wrapper for the Changelog page. Restores the legacy Changelog
// UX: UDS/SITE tabs, sticky search + type filters, a UDS-only component filter,
// filtered empty states, and a left jump rail with active section state.

import { useEffect, useMemo, useState } from 'react';

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
type ChangelogType = (typeof CHANGELOG_TYPE_ORDER)[number];

interface RenderChange extends ChangelogNote {
  component?: string | string[];
}

interface RailItem {
  id: string;
  label: string;
  meta?: string;
}

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

function slug(prefix: string, raw: string): string {
  return `${prefix}-${String(raw)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

function changelogPlainText(entry: RenderChange): string {
  const comps = Array.isArray(entry.component)
    ? entry.component.join(' ')
    : entry.component || '';
  return `${entry.type} ${comps} ${entry.text}`.toLowerCase();
}

function matchesQuery(entry: RenderChange, query: string, extra: string = ''): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${changelogPlainText(entry)} ${extra.toLowerCase()}`.includes(q);
}

function ChangeItems({ entries, component }: { entries: RenderChange[]; component?: string }) {
  // Class names match the legacy site exactly so the CSS in
  // styles/pages/legacy.css (.sg-cl-item, .sg-cl-type, .sg-cl-item::before)
  // applies — including the colored dot before each item and the
  // type-color tinting.
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {entries.map((entry, idx) => {
        const components = entry.component
          ? Array.isArray(entry.component)
            ? entry.component
            : [entry.component]
          : component
            ? [component]
            : [];
        return (
        <li key={idx} className={`sg-cl-item sg-cl-item--${entry.type}`}>
          <span className={`sg-cl-type sg-cl-type--${entry.type}`}>
            {entry.type}
          </span>{' '}
          {components.map((c) => (
            <span
              key={c}
              className="udc-badge sg-cl-component"
              data-variant="secondary"
              data-prominent="true"
              data-size="sm"
            >
              {c}
            </span>
          ))}
          {inlineCode(entry.text)}
        </li>
        );
      })}
    </ul>
  );
}

function UdsStream({ releases }: { releases: AggregatedChangelog }) {
  return (
    <div className="sg-cl-stream" id="sg-global-changelog">
      {releases.map((release) => {
        const compNames = Object.keys(release.byComponent || {});
        let totalCount = (release.globalNotes ?? []).length;
        compNames.forEach((n) => (totalCount += release.byComponent[n].length));
        const sectionId = slug('cl-release', release.version);

        return (
          <article key={release.version} id={sectionId} className="sg-cl-release">
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
                            return <ChangeItems key={type} entries={ofType} component={name} />;
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
  const groups = groupSiteByDate(entries);
  return (
    <div className="sg-cl-stream" id="sg-site-changelog">
      {groups.map((group) => {
        const dayCount = group.releases.reduce((acc, r) => acc + r.changes.length, 0);
        const sectionId = slug('cl-day', group.date);
        return (
          <article key={group.date} id={sectionId} className="sg-cl-day">
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

function ChangelogToolbar({
  activeTab,
  query,
  onQueryChange,
  disabledTypes,
  onToggleType,
  components,
  selectedComponents,
  onToggleComponent,
}: {
  activeTab: 'uds' | 'site';
  query: string;
  onQueryChange: (value: string) => void;
  disabledTypes: Set<ChangelogType>;
  onToggleType: (type: ChangelogType) => void;
  components: string[];
  selectedComponents: Set<string>;
  onToggleComponent: (component: string) => void;
}) {
  return (
    <div className="sg-cl-toolbar">
      <label className="sg-cl-search-wrap">
        <span className="material-symbols-outlined sg-cl-search-icon" aria-hidden="true">
          search
        </span>
        <input
          className="sg-cl-search"
          type="search"
          value={query}
          placeholder="Search changelog"
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </label>
      <div className="sg-cl-chips" aria-label="Change type filters">
        {CHANGELOG_TYPE_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            className={`sg-cl-chip sg-cl-chip--${type}`}
            aria-pressed={!disabledTypes.has(type)}
            onClick={() => onToggleType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      {activeTab === 'uds' && components.length > 0 ? (
        <div className="sg-cl-component-filter">
          <div className="sg-cl-chips" aria-label="Component filters">
            {components.map((component) => {
              const active = selectedComponents.size === 0 || selectedComponents.has(component);
              return (
                <button
                  key={component}
                  type="button"
                  className="sg-cl-chip"
                  aria-pressed={active}
                  onClick={() => onToggleComponent(component)}
                >
                  {component}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChangelogRail({
  items,
  activeId,
  onActivate,
}: {
  items: RailItem[];
  activeId: string | null;
  onActivate: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <nav className="sg-cl-rail" aria-label="Changelog sections">
      <h2 className="sg-cl-rail-heading">Jump to</h2>
      <ol className="sg-cl-rail-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="sg-cl-rail-link"
              aria-current={activeId === item.id}
              onClick={() => onActivate(item.id)}
            >
              {item.label}
              {item.meta ? <span className="sg-cl-rail-link-meta">{item.meta}</span> : null}
            </button>
          </li>
        ))}
      </ol>
    </nav>
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
  const [query, setQuery] = useState('');
  const [disabledTypes, setDisabledTypes] = useState<Set<ChangelogType>>(() => new Set());
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(() => new Set());
  const [activeRailId, setActiveRailId] = useState<string | null>(null);

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

  const componentFilters = useMemo(() => {
    const out = new Set<string>();
    for (const release of udsChangelog) {
      Object.keys(release.byComponent || {}).forEach((name) => out.add(name));
    }
    return Array.from(out).sort((a, b) => a.localeCompare(b));
  }, [udsChangelog]);

  const typeEnabled = (type: string) => !disabledTypes.has(type as ChangelogType);

  const filteredUds = useMemo<AggregatedChangelog>(() => {
    const newestFirst = udsChangelog.slice().reverse();
    return newestFirst
      .map((release) => {
        const extra = `${release.version} ${release.date}`;
        const globalNotes = (release.globalNotes ?? []).filter(
          (entry) => typeEnabled(entry.type) && matchesQuery(entry, query, extra),
        );

        const byComponent: Record<string, ChangelogNote[]> = {};
        for (const [component, entries] of Object.entries(release.byComponent || {})) {
          const componentIsSelected =
            selectedComponents.size === 0 || selectedComponents.has(component);
          if (!componentIsSelected) continue;
          const filtered = entries.filter(
            (entry) => typeEnabled(entry.type) && matchesQuery(entry, query, `${extra} ${component}`),
          );
          if (filtered.length) byComponent[component] = filtered;
        }

        return { ...release, globalNotes, byComponent };
      })
      .filter((release) => {
        const componentCount = Object.values(release.byComponent || {}).reduce(
          (n, entries) => n + entries.length,
          0,
        );
        return (release.globalNotes?.length ?? 0) + componentCount > 0;
      });
  }, [udsChangelog, query, disabledTypes, selectedComponents]);

  const filteredSite = useMemo<SiteChangelogEntry[]>(() => {
    return SITE_CHANGELOG.slice()
      .reverse()
      .map((release) => ({
        ...release,
        changes: release.changes.filter(
          (entry) =>
            typeEnabled(entry.type) &&
            matchesQuery(entry as ChangelogNote, query, `${release.version} ${release.date}`),
        ),
      }))
      .filter((release) => release.changes.length > 0);
  }, [query, disabledTypes]);

  const railItems = useMemo<RailItem[]>(() => {
    if (activeTab === 'uds') {
      return filteredUds.map((release) => ({
        id: slug('cl-release', release.version),
        label: `UDS ${release.version}`,
        meta: release.date,
      }));
    }
    return groupSiteByDate(filteredSite).map((group) => ({
      id: slug('cl-day', group.date),
      label: formatChangelogDate(group.date),
      meta: changeCountLabel(group.releases.reduce((n, r) => n + r.changes.length, 0)),
    }));
  }, [activeTab, filteredUds, filteredSite]);

  useEffect(() => {
    setActiveRailId(railItems[0]?.id ?? null);
  }, [activeTab, railItems]);

  useEffect(() => {
    if (!railItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveRailId(visible.target.id);
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0.01 },
    );
    for (const item of railItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [railItems]);

  const onToggleType = (type: ChangelogType) => {
    setDisabledTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const onToggleComponent = (component: string) => {
    setSelectedComponents((current) => {
      const all = componentFilters;
      const next = current.size === 0 ? new Set(all) : new Set(current);
      if (next.has(component)) next.delete(component);
      else next.add(component);
      // Empty set means "all selected"; if the user turns everything back on,
      // collapse to the compact all-selected representation.
      if (next.size === 0 || next.size === all.length) return new Set<string>();
      return next;
    });
  };

  const onRailActivate = (id: string) => {
    setActiveRailId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <div hidden={activeTab !== 'uds'}>
        <div className="sg-cl-page" data-cl-tab="uds">
          <ChangelogRail items={railItems} activeId={activeRailId} onActivate={onRailActivate} />
          <div className="sg-cl-main">
            <ChangelogToolbar
              activeTab="uds"
              query={query}
              onQueryChange={setQuery}
              disabledTypes={disabledTypes}
              onToggleType={onToggleType}
              components={componentFilters}
              selectedComponents={selectedComponents}
              onToggleComponent={onToggleComponent}
            />
            {filteredUds.length ? (
              <UdsStream releases={filteredUds} />
            ) : (
              <p className="sg-cl-empty">No UDS changelog entries match the current filters.</p>
            )}
          </div>
        </div>
      </div>
      <div hidden={activeTab !== 'site'}>
        <div className="sg-cl-page" data-cl-tab="site">
          <ChangelogRail items={railItems} activeId={activeRailId} onActivate={onRailActivate} />
          <div className="sg-cl-main">
            <ChangelogToolbar
              activeTab="site"
              query={query}
              onQueryChange={setQuery}
              disabledTypes={disabledTypes}
              onToggleType={onToggleType}
              components={[]}
              selectedComponents={selectedComponents}
              onToggleComponent={onToggleComponent}
            />
            {filteredSite.length ? (
              <SiteStream entries={filteredSite} />
            ) : (
              <p className="sg-cl-empty">No SITE changelog entries match the current filters.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
