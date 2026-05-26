'use client';

// Client-side wrapper for the Changelog page. Restores the legacy Changelog
// UX: UDS/SITE tabs, sticky search + type filters, a UDS-only component filter,
// filtered empty states, and a left jump rail with active section state.

import { useEffect, useMemo, useState } from 'react';

import { SgPageTabs, SgPageTab, SgPageTabPanel } from '@/components/site/SgPageHeader';
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

const CHANGELOG_TYPE_LABEL: Record<ChangelogType, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
  deprecated: 'Deprecated',
  removed: 'Removed',
};

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

function InlineChangeText({ text }: { text: string }) {
  // Render `code` segments as <code>; everything else as plain text. Matches
  // the legacy app.js renderChangeItems behaviour but stays inside React's
  // tree (no dangerouslySetInnerHTML, so hydration is straightforward).
  const parts = text.split(/(`[^`]+`)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="ds-changelog-inline-code">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
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

function ChangeTypeBadge({ type }: { type: string }) {
  const normalized = type as ChangelogType;
  return (
    <span className="ds-changelog-type" data-type={type}>
      {CHANGELOG_TYPE_LABEL[normalized] ?? type}
    </span>
  );
}

function ComponentTag({ name }: { name: string }) {
  return <span className="ds-changelog-component-tag">{name}</span>;
}

function ChangeItem({ entry, component }: { entry: RenderChange; component?: string }) {
  const components = entry.component
    ? Array.isArray(entry.component)
      ? entry.component
      : [entry.component]
    : component
      ? [component]
      : [];

  return (
    <li className="ds-changelog-item" data-type={entry.type}>
      <span className="ds-changelog-item-dot" aria-hidden="true" />
      <div className="ds-changelog-item-body">
        <div className="ds-changelog-item-meta">
          <ChangeTypeBadge type={entry.type} />
          {components.map((c) => (
            <ComponentTag key={c} name={c} />
          ))}
        </div>
        <p className="ds-changelog-item-text">
          <InlineChangeText text={entry.text} />
        </p>
      </div>
    </li>
  );
}

function ChangeItems({ entries, component }: { entries: RenderChange[]; component?: string }) {
  return (
    <ul className="ds-changelog-item-list">
      {entries.map((entry, idx) => (
        <ChangeItem key={idx} entry={entry} component={component} />
      ))}
    </ul>
  );
}

function UdsStream({ releases }: { releases: AggregatedChangelog }) {
  return (
    <div className="ds-changelog-stream" id="sg-global-changelog">
      {releases.map((release) => {
        const compNames = Object.keys(release.byComponent || {});
        let totalCount = (release.globalNotes ?? []).length;
        compNames.forEach((n) => (totalCount += release.byComponent[n].length));
        const sectionId = slug('cl-release', release.version);

        return (
          <article key={release.version} id={sectionId} className="ds-changelog-card">
            <header className="ds-changelog-card-header">
              <h3 className="ds-changelog-card-title">UDS {release.version}</h3>
              <div className="ds-changelog-card-meta">
                {release.date ? (
                  <span>{release.date}</span>
                ) : null}
                <span>{changeCountLabel(totalCount)}</span>
              </div>
            </header>
            <div className="ds-changelog-card-body">
              {release.globalNotes && release.globalNotes.length > 0 ? (
                <section className="ds-changelog-section">
                  <h4 className="ds-changelog-section-title">Release notes</h4>
                  <div>
                    {CHANGELOG_TYPE_ORDER.map((type) => {
                      const ofType = release.globalNotes.filter((e) => e.type === type);
                      if (!ofType.length) return null;
                      return <ChangeItems key={type} entries={ofType} />;
                    })}
                  </div>
                </section>
              ) : null}
              {compNames.length > 0 ? (
                <section className="ds-changelog-section">
                  <h4 className="ds-changelog-section-title">Components</h4>
                  {compNames.map((name) => {
                    const entries = release.byComponent[name];
                    return (
                      <div key={name} className="ds-changelog-component-group">
                        <h5 className="ds-changelog-component-heading">{name}</h5>
                        <div>
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
  // Mirrors legacy app.js formatChangelogDate: parses the ISO date as UTC so a
  // 2026-05-22 entry doesn't slip to "Thursday May 21" when a US-Pacific user
  // is reading it just after midnight UTC. Default locale (no 'en-US' lock-in)
  // so non-English browsers get their own weekday names.
  if (!iso) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const d = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  if (isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

function SiteStream({ entries }: { entries: SiteChangelogEntry[] }) {
  const groups = groupSiteByDate(entries);
  return (
    <div className="ds-changelog-stream" id="sg-site-changelog">
      {groups.map((group) => {
        const dayCount = group.releases.reduce((acc, r) => acc + r.changes.length, 0);
        const sectionId = slug('cl-day', group.date);
        return (
          <article key={group.date} id={sectionId} className="ds-changelog-card">
            <header className="ds-changelog-card-header">
              <h3 className="ds-changelog-card-title">{formatChangelogDate(group.date)}</h3>
              <div className="ds-changelog-card-meta">
                {group.releases.length > 1 ? (
                  <span>{group.releases.length} bumps</span>
                ) : null}
                <span>{changeCountLabel(dayCount)}</span>
              </div>
            </header>
            <div className="ds-changelog-card-body">
              {group.releases.map((release) => (
                <section key={release.version} className="ds-changelog-section">
                  <h4 className="ds-changelog-version-pill">{release.version}</h4>
                  <div>
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
    <div className="ds-changelog-toolbar">
      <label className="ds-changelog-search">
        <span className="material-symbols-outlined ds-changelog-search-icon" aria-hidden="true">
          search
        </span>
        <input
          className="ds-changelog-search-input"
          type="search"
          value={query}
          placeholder="Search changes"
          aria-label={activeTab === 'site' ? 'Search site changes' : 'Search changes'}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </label>
      <div className="ds-changelog-type-filters" aria-label="Change type filters">
        {CHANGELOG_TYPE_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            className="ds-changelog-filter-chip"
            data-type={type}
            aria-pressed={!disabledTypes.has(type)}
            onClick={() => onToggleType(type)}
          >
            {CHANGELOG_TYPE_LABEL[type]}
          </button>
        ))}
      </div>
      {activeTab === 'uds' && components.length > 0 ? (
        <div className="ds-changelog-component-filter">
          <div className="ds-changelog-filter-label">Filter by component</div>
          <div
            className="ds-changelog-component-filter-list"
            role="group"
            aria-label="Filter by component"
          >
            {components.map((component) => {
              const active = selectedComponents.size === 0 || selectedComponents.has(component);
              return (
                <button
                  key={component}
                  type="button"
                  className="ds-changelog-component-filter-chip"
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
  scope,
}: {
  items: RailItem[];
  activeId: string | null;
  onActivate: (id: string) => void;
  scope: 'uds' | 'site';
}) {
  if (!items.length) return null;
  const heading = scope === 'site' ? 'Jump to date' : 'Jump to release';
  return (
    <nav className="ds-changelog-rail" aria-label={heading}>
      <h2 className="ds-changelog-rail-heading">{heading}</h2>
      <ol className="ds-changelog-rail-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="ds-changelog-rail-link"
              aria-current={activeId === item.id}
              onClick={() => onActivate(item.id)}
            >
              {item.label}
              {item.meta ? <span className="ds-changelog-rail-meta">{item.meta}</span> : null}
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
  // archive switch. If an archive fetch fails, surface an empty archive
  // changelog with a flag — substituting live changelog data would be
  // a silent data-correctness regression (the UI says "viewing 0.2"
  // while showing 0.3 entries).
  const [archiveFetchFailed, setArchiveFetchFailed] = useState(false);
  useEffect(() => {
    if (!fetchVersion) {
      setArchiveFetchFailed(false);
      setUdsChangelog(initialUdsChangelog);
      return;
    }
    let cancelled = false;
    setArchiveFetchFailed(false);
    getChangelog(fetchVersion)
      .then((cl) => {
        if (cancelled) return;
        setUdsChangelog(cl);
      })
      .catch(() => {
        if (cancelled) return;
        setArchiveFetchFailed(true);
        setUdsChangelog([]);
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
    // When the user has actively narrowed the component filter, they want
    // to see only the changes for those components — global release notes
    // (which aren't tied to a component) become noise. With nothing
    // selected we keep the legacy behavior and show global notes alongside
    // every component group.
    const hideGlobalNotes = selectedComponents.size > 0;
    const newestFirst = udsChangelog.slice().reverse();
    return newestFirst
      .map((release) => {
        const extra = `${release.version} ${release.date}`;
        const globalNotes = hideGlobalNotes
          ? []
          : (release.globalNotes ?? []).filter(
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
      return filteredUds.map((release) => {
        const totalCount =
          (release.globalNotes?.length ?? 0) +
          Object.values(release.byComponent || {}).reduce((n, entries) => n + entries.length, 0);
        const dateAndCount = [release.date, changeCountLabel(totalCount)].filter(Boolean).join(' ');
        return {
          id: slug('cl-release', release.version),
          label: `UDS ${release.version}`,
          meta: dateAndCount,
        };
      });
    }
    return groupSiteByDate(filteredSite).map((group) => {
      const bumps = group.releases.length;
      const changes = group.releases.reduce((n, r) => n + r.changes.length, 0);
      const metaParts: string[] = [];
      if (bumps > 1) metaParts.push(`${bumps} bumps`);
      metaParts.push(changeCountLabel(changes));
      return {
        id: slug('cl-day', group.date),
        label: formatChangelogDate(group.date),
        meta: metaParts.join(' '),
      };
    });
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
        <SgPageTabPanel value="uds">
        <div className="ds-changelog-layout" data-changelog-tab="uds">
          <ChangelogRail
            items={railItems}
            activeId={activeRailId}
            onActivate={onRailActivate}
            scope="uds"
          />
          <div className="ds-changelog-main">
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
            {archiveFetchFailed ? (
              <p className="ds-changelog-empty" role="alert">
                Couldn&apos;t load the UDS {fetchVersion} archive changelog.
                The archive may not include a CHANGELOG.json — switch back to
                the latest version in the dropdown to see release notes.
              </p>
            ) : filteredUds.length ? (
              <UdsStream releases={filteredUds} />
            ) : (
              <p className="ds-changelog-empty">No UDS changelog entries match the current filters.</p>
            )}
          </div>
        </div>
      </SgPageTabPanel>
      <SgPageTabPanel value="site">
        <div className="ds-changelog-layout" data-changelog-tab="site">
          <ChangelogRail
            items={railItems}
            activeId={activeRailId}
            onActivate={onRailActivate}
            scope="site"
          />
          <div className="ds-changelog-main">
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
              <p className="ds-changelog-empty">No SITE changelog entries match the current filters.</p>
            )}
          </div>
        </div>
      </SgPageTabPanel>
      </SgPageTabs>
    </>
  );
}
