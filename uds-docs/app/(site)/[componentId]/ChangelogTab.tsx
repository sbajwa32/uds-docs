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
      <p className="sg-changelog-empty">
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
    <div className="sg-cl-stream">
      {versions.map((version) => {
        const entries = groups.get(version)!;
        return (
          <article key={version} className="sg-cl-release">
            <header className="sg-cl-release-header">
              <h3 className="sg-cl-release-title">UDS {version}</h3>
              <div className="sg-cl-release-meta">
                <span className="sg-cl-release-count">
                  {entries.length} {entries.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
            </header>
            <div className="sg-cl-release-body">
              <div className="sg-cl-item-list">
                {TYPE_ORDER.map((type) => {
                  const ofType = entries.filter((e) => e.type === type);
                  if (!ofType.length) return null;
                  return (
                    <ul key={type} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {ofType.map((entry, i) => (
                        <li
                          key={`${entry.version}-${type}-${i}`}
                          className={`sg-cl-item sg-cl-item--${type}`}
                        >
                          <span className={`sg-cl-type sg-cl-type--${type}`}>
                            {type}
                          </span>{' '}
                          {inlineCode(entry.text)}
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
        <code key={i} className="sg-cl-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
