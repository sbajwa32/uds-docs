// Guidelines tab — direct port of renderGuidelines() from legacy app.js:593.
//
// Sections render conditionally — empty/missing fields are skipped so the
// docs page only shows what the spec actually has. Keeps designers from
// staring at empty placeholders while specs are in flight.
//
// Section order matches the legacy site:
//   1. Overview      — description, whenToUse, whenNotToUse
//   2. Specification — acceptance criteria, dependencies, props, events, slots
//   3. Behavior      — states, content guidelines, visual hierarchy, density
//   4. Patterns      — dos/don'ts, commonly paired with
//   5. Accessibility — keyboard, screen reader, WCAG, contrast
//   6. Known Issues  — the catch-all bullet list
//   7. Ownership     — designer + developer (when set to non-Unassigned)
//   8. Implementation Reference (impl.json) — JS function + tokens used

import type { ComponentSpec, ComponentImpl } from '@/lib/uds-data';

interface SpecPropEntry {
  name: string;
  type: string;
  default?: string | number | boolean | null;
  required?: boolean;
  enum?: string[];
  description?: string;
}

interface SpecEventEntry {
  name: string;
  description?: string;
  payload?: string;
}

interface SpecSlotEntry {
  name: string;
  description?: string;
}

interface SpecStateEntry {
  name: string;
  description?: string;
  hasVisual?: boolean;
}

interface SpecKeyboardEntry {
  key: string;
  action: string;
}

interface SpecScreenReaderEntry {
  trigger: string;
  announcement: string;
}

interface SpecWcagEntry {
  criterion: string;
  level: string;
  howMet?: string;
}

interface SpecContrastEntry {
  foreground?: string;
  background?: string;
  ratio?: number;
  passes?: string;
}

function isFilled<T>(arr: T[] | undefined | null): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

function GroupSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ds-guideline-group">
      <h2 className="ds-guideline-group__title">{title}</h2>
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="ds-guideline-subhead">{children}</h3>;
}

function ProseSection({ title, text }: { title?: string; text: string }) {
  return (
    <div className="ds-guideline-section">
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <p className="ds-guideline-prose">{text}</p>
    </div>
  );
}

function ListSection({
  title,
  items,
  ordered,
}: {
  title?: string;
  items: string[];
  ordered: boolean;
}) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <div className="ds-guideline-section">
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <Tag className="ds-guideline-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    </div>
  );
}

function PropsTable({ props: rows }: { props: SpecPropEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Props / attributes</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.name}>
              <td>
                <code>{p.name}</code>
              </td>
              <td>
                {p.type === 'enum' && p.enum ? (
                  <code>{p.enum.map((v) => `'${v}'`).join(' | ')}</code>
                ) : (
                  <code>{p.type}</code>
                )}
              </td>
              <td>{p.default == null ? '—' : <code>{String(p.default)}</code>}</td>
              <td>{p.required ? 'Yes' : ''}</td>
              <td>{p.description ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ events }: { events: SpecEventEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Events emitted</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Payload</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.name}>
              <td>
                <code>{e.name}</code>
              </td>
              <td>{e.payload ? <code>{e.payload}</code> : '—'}</td>
              <td>{e.description ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SlotsTable({ slots }: { slots: SpecSlotEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Slots / content model</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.name}>
              <td>
                <code>{s.name}</code>
              </td>
              <td>{s.description ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatesTable({ states }: { states: SpecStateEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>States coverage</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>State</th>
            <th>Visual</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {states.map((s) => (
            <tr key={s.name}>
              <td>
                <code>{s.name}</code>
              </td>
              <td>{s.hasVisual ? 'Yes' : '—'}</td>
              <td>{s.description ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DependenciesSection({
  deps,
}: {
  deps: NonNullable<ComponentSpec['dependencies']>;
}) {
  const css = (deps.css as string[] | undefined) ?? [];
  const js = (deps.js as string[] | undefined) ?? [];
  if (css.length === 0 && js.length === 0) return null;
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Dependencies</SectionTitle>
      {css.length > 0 ? (
        <>
          <p className="ds-guideline-subhead">CSS</p>
          <ul className="ds-guideline-list">
            {css.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {js.length > 0 ? (
        <>
          <p className="ds-guideline-subhead">JS</p>
          <ul className="ds-guideline-list">
            {js.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function DosDontsSection({
  dosDonts,
}: {
  dosDonts: { dos?: string[]; donts?: string[] };
}) {
  const dos = dosDonts.dos ?? [];
  const donts = dosDonts.donts ?? [];
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Do&apos;s &amp; don&apos;ts</SectionTitle>
      <div className="ds-guideline-dodont ds-guideline-dodont-cols">
        {dos.length > 0 ? (
          <div className="ds-guideline-dodont-col ds-guideline-do">
            <h4 className="ds-guideline-subhead">Do</h4>
            <ul>
              {dos.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {donts.length > 0 ? (
          <div className="ds-guideline-dodont-col ds-guideline-dont">
            <h4 className="ds-guideline-subhead">Don&apos;t</h4>
            <ul>
              {donts.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PairedWithSection({ ids }: { ids: string[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Commonly paired with</SectionTitle>
      <ul className="ds-guideline-paired">
        {ids.map((id) => (
          <li key={id}>
            <a className="sg-page-link" href={`/${id}`}>
              {id}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyboardTable({ rows }: { rows: SpecKeyboardEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Keyboard</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <kbd>{r.key}</kbd>
              </td>
              <td>{r.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScreenReaderTable({ rows }: { rows: SpecScreenReaderEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Screen reader</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Trigger</th>
            <th>Announcement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.trigger}</td>
              <td>{r.announcement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WcagTable({ rows }: { rows: SpecWcagEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>WCAG criteria</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Level</th>
            <th>How met</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <code>{r.criterion}</code>
              </td>
              <td>{r.level}</td>
              <td>{r.howMet ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContrastTable({ rows }: { rows: SpecContrastEntry[] }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Color contrast</SectionTitle>
      <table className="ds-table">
        <thead>
          <tr>
            <th>Foreground</th>
            <th>Background</th>
            <th>Ratio</th>
            <th>Passes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <code>{r.foreground ?? '—'}</code>
              </td>
              <td>
                <code>{r.background ?? '—'}</code>
              </td>
              <td>{r.ratio != null ? `${r.ratio.toFixed(2)}:1` : '—'}</td>
              <td>{r.passes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OwnershipSection({ owner }: { owner: { designer?: string; developer?: string } }) {
  return (
    <div className="ds-guideline-section">
      <SectionTitle>Ownership</SectionTitle>
      <ul className="ds-guideline-list">
        {owner.designer && owner.designer !== 'Unassigned' ? (
          <li>
            <strong>Designer:</strong> {owner.designer}
          </li>
        ) : null}
        {owner.developer && owner.developer !== 'Unassigned' ? (
          <li>
            <strong>Developer:</strong> {owner.developer}
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function ImplementationReferenceSection({ impl }: { impl: ComponentImpl }) {
  const tokens = impl.tokens ?? {};
  const tokenGroups = Object.entries(tokens) as [string, string[]][];

  return (
    <div className="ds-guideline-section">
      <SectionTitle>Implementation Reference</SectionTitle>
      {impl.jsFunc ? (
        <p className="ds-guideline-prose">
          Behavior in <code>{impl.jsFile}</code> via{' '}
          <code>{impl.jsFunc}()</code>.
        </p>
      ) : null}
      {tokenGroups.length > 0 ? (
        <>
          <p className="ds-guideline-subhead">Tokens used</p>
          {tokenGroups.map(([groupName, list]) => (
            <div key={groupName}>
              <p className="ds-guideline-subhead">{groupName}</p>
              <ul className="ds-guideline-list">
                {(list ?? []).map((t) => (
                  <li key={t}>
                    <code>{t}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

export function GuidelinesTab({
  spec,
  impl,
}: {
  spec: ComponentSpec;
  impl: ComponentImpl | null;
}) {
  const groups: React.ReactNode[] = [];

  // 1. Overview
  const overview: React.ReactNode[] = [];
  if (spec.description) overview.push(<ProseSection key="desc" title="Description" text={spec.description} />);
  if (spec.whenToUse) overview.push(<ProseSection key="wtu" title="When to use" text={spec.whenToUse} />);
  if (spec.whenNotToUse)
    overview.push(<ProseSection key="wntu" title="When not to use" text={spec.whenNotToUse} />);
  if (overview.length) groups.push(<GroupSection key="overview" title="Overview">{overview}</GroupSection>);

  // 2. Specification
  const specSection: React.ReactNode[] = [];
  if (isFilled(spec.acceptanceCriteria as string[] | undefined)) {
    specSection.push(
      <ListSection
        key="ac"
        title="Acceptance Criteria"
        items={spec.acceptanceCriteria as string[]}
        ordered
      />,
    );
  }
  if (
    spec.dependencies &&
    (isFilled(spec.dependencies.css as string[] | undefined) ||
      isFilled(spec.dependencies.js as string[] | undefined))
  ) {
    specSection.push(
      <DependenciesSection key="deps" deps={spec.dependencies as NonNullable<ComponentSpec['dependencies']>} />,
    );
  }
  if (isFilled(spec.props as SpecPropEntry[] | undefined))
    specSection.push(<PropsTable key="props" props={spec.props as unknown as SpecPropEntry[]} />);
  if (isFilled(spec.events as SpecEventEntry[] | undefined))
    specSection.push(<EventsTable key="events" events={spec.events as unknown as SpecEventEntry[]} />);
  if (isFilled(spec.slots as SpecSlotEntry[] | undefined))
    specSection.push(<SlotsTable key="slots" slots={spec.slots as unknown as SpecSlotEntry[]} />);
  if (specSection.length)
    groups.push(<GroupSection key="spec" title="Specification">{specSection}</GroupSection>);

  // 3. Behavior
  const behavior: React.ReactNode[] = [];
  if (isFilled(spec.states as SpecStateEntry[] | undefined))
    behavior.push(<StatesTable key="states" states={spec.states as unknown as SpecStateEntry[]} />);
  if (spec.contentGuidelines)
    behavior.push(<ProseSection key="cg" title="Content guidelines" text={spec.contentGuidelines} />);
  if (spec.visualHierarchy)
    behavior.push(<ProseSection key="vh" title="Visual hierarchy" text={spec.visualHierarchy} />);
  if (spec.densityBehavior)
    behavior.push(<ProseSection key="db" title="Density behavior" text={spec.densityBehavior} />);
  if (behavior.length)
    groups.push(<GroupSection key="behavior" title="Behavior">{behavior}</GroupSection>);

  // 4. Patterns
  const patterns: React.ReactNode[] = [];
  if (
    spec.dosDonts &&
    (isFilled(spec.dosDonts.dos as string[] | undefined) ||
      isFilled(spec.dosDonts.donts as string[] | undefined))
  ) {
    patterns.push(
      <DosDontsSection
        key="dosdonts"
        dosDonts={spec.dosDonts as { dos?: string[]; donts?: string[] }}
      />,
    );
  }
  if (isFilled(spec.commonlyPairedWith as string[] | undefined))
    patterns.push(<PairedWithSection key="paired" ids={spec.commonlyPairedWith as string[]} />);
  if (patterns.length)
    groups.push(<GroupSection key="patterns" title="Patterns">{patterns}</GroupSection>);

  // 5. Accessibility
  const a11y = (spec.accessibility ?? {}) as {
    keyboard?: SpecKeyboardEntry[];
    screenReader?: SpecScreenReaderEntry[];
    wcag?: SpecWcagEntry[];
    contrast?: SpecContrastEntry[];
  };
  const a11yParts: React.ReactNode[] = [];
  if (isFilled(a11y.keyboard))
    a11yParts.push(<KeyboardTable key="kbd" rows={a11y.keyboard!} />);
  if (isFilled(a11y.screenReader))
    a11yParts.push(<ScreenReaderTable key="sr" rows={a11y.screenReader!} />);
  if (isFilled(a11y.wcag)) a11yParts.push(<WcagTable key="wcag" rows={a11y.wcag!} />);
  if (isFilled(a11y.contrast)) a11yParts.push(<ContrastTable key="contrast" rows={a11y.contrast!} />);
  if (a11yParts.length)
    groups.push(<GroupSection key="a11y" title="Accessibility">{a11yParts}</GroupSection>);

  // 6. Known Issues
  if (isFilled(spec.knownIssues as string[] | undefined)) {
    groups.push(
      <GroupSection key="issues" title="Known Issues">
        <ListSection items={spec.knownIssues as string[]} ordered={false} />
      </GroupSection>,
    );
  }

  // 7. Ownership
  const owner = spec.owner as { designer?: string; developer?: string } | undefined;
  if (
    owner &&
    ((owner.designer && owner.designer !== 'Unassigned') ||
      (owner.developer && owner.developer !== 'Unassigned'))
  ) {
    groups.push(
      <GroupSection key="owner" title="Ownership">
        <OwnershipSection owner={owner} />
      </GroupSection>,
    );
  }

  // 8. Implementation Reference (impl.json)
  if (impl && (impl.jsFunc || (impl.tokens && Object.keys(impl.tokens).length > 0))) {
    groups.push(
      <GroupSection key="impl" title="Implementation">
        <ImplementationReferenceSection impl={impl} />
      </GroupSection>,
    );
  }

  if (groups.length === 0) {
    return (
      <div className="ds-guidelines-empty">
        <p>No guidelines captured yet. This spec is in progress.</p>
      </div>
    );
  }

  return <>{groups}</>;
}
