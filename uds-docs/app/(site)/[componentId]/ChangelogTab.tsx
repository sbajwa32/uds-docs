// Per-component Changelog tab — renders entries from changelog.json grouped
// by version, newest version first.

import type { ComponentChangelog } from '@/lib/uds-data';

const TYPE_ORDER = ['added', 'changed', 'fixed', 'deprecated', 'removed'] as const;

export function ChangelogTab({
  componentId,
  changelog,
}: {
  componentId: string;
  changelog: ComponentChangelog | null;
}) {
  void componentId;

  if (!changelog || !changelog.entries || changelog.entries.length === 0) {
    return (
      <p className="ds-changelog-empty">
        No changes recorded yet. This component was introduced in the initial
        release.
      </p>
    );
  }

  // Group entries by version. Entries are stored oldest-first per the schema;
  // reverse the resulting groups for newest-first display.
  const groups = new Map<string, ComponentChangelog['entries']>();
  for (const entry of changelog.entries) {
    const list = groups.get(entry.version) ?? [];
    list.push(entry);
    groups.set(entry.version, list);
  }
  const versions = Array.from(groups.keys()).reverse();

  return (
    <div className="ds-changelog-stream">
      {versions.map((version) => {
        const entries = groups.get(version)!;
        return (
          <article key={version} className="ds-changelog-card">
            <header className="ds-changelog-card-header">
              <h3 className="ds-changelog-card-title">UDS {version}</h3>
              <div className="ds-changelog-card-meta">
                <span>
                  {entries.length} {entries.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
            </header>
            <div className="ds-changelog-card-body">
              <div>
                {TYPE_ORDER.map((type) => {
                  const ofType = entries.filter((e) => e.type === type);
                  if (!ofType.length) return null;
                  return (
                    <ul key={type} className="ds-changelog-item-list">
                      {ofType.map((entry, i) => (
                        <li
                          key={`${entry.version}-${type}-${i}`}
                          className="ds-changelog-item"
                          data-type={type}
                        >
                          <span className="ds-changelog-item-dot" aria-hidden="true" />
                          <div className="ds-changelog-item-body">
                            <div className="ds-changelog-item-meta">
                              <span className="ds-changelog-type" data-type={type}>
                                {type}
                              </span>
                            </div>
                            <p className="ds-changelog-item-text">{inlineCode(entry.text)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function inlineCode(text: string): React.ReactNode {
  // Render `code` segments as <code>; everything else as plain text. Avoids
  // the dangerouslySetInnerHTML hydration issues encountered in Chunk 06a.
  const parts = text.split(/(`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="ds-changelog-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
