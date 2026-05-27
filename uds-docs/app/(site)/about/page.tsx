import type { ReactNode } from 'react';

import { VersionedLink as Link } from '@/components/site/VersionedLink';
import { DocsBadge, DocsCard, DocsPageHeader, DocsSection, DocsStateMessage } from '@/components/site/ui';

export const metadata = { title: 'About UDS — UDS' };

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'brand';

interface LifecycleStep {
  number: number;
  title: string;
  owner: string;
  ownerIcon: string;
  description: ReactNode;
  location: string;
  locationIcon: string;
  status: string;
  statusTone: BadgeTone;
}

const lifecycleSteps: LifecycleStep[] = [
  {
    number: 1,
    title: 'Propose',
    owner: 'Anyone',
    ownerIcon: 'person',
    description: (
      <>
        A need is identified — designer, developer, or PM starts a Figma page for the component with the red
        Exploration prefix and notes what problem it solves. See the{' '}
        <Link href="/design-process">
          Design Process
        </Link>{' '}
        page for the full stoplight flow.
      </>
    ),
    location: 'Figma — UDS Components (Red)',
    locationIcon: 'design_services',
    status: 'Proposed',
    statusTone: 'error',
  },
  {
    number: 2,
    title: 'Design',
    owner: 'Designer',
    ownerIcon: 'brush',
    description:
      'Designer builds variants and states in the UDS Components Figma file. Page name gets the orange dot prefix while in progress.',
    location: 'Figma — UDS Components',
    locationIcon: 'design_services',
    status: 'In Progress',
    statusTone: 'warning',
  },
  {
    number: 3,
    title: 'Spec',
    owner: 'Designer',
    ownerIcon: 'brush',
    description: (
      <>
        Designer writes the structured spec in <code>uds/components/&lt;id&gt;/spec.json</code> — description,
        when-to-use, props, events, slots, states, accessibility. The Guidelines tab on the doc site auto-renders
        from this file. Use the{' '}
        <Link href="/cursor-workflows">
          <code>new-component</code> skill
        </Link>{' '}
        to scaffold.
      </>
    ),
    location: 'uds/components/<id>/spec.json',
    locationIcon: 'data_object',
    status: 'Spec building',
    statusTone: 'warning',
  },
  {
    number: 4,
    title: 'Build',
    owner: 'Developer',
    ownerIcon: 'code',
    description:
      'Developer implements the spec 1:1 as a framework-agnostic web component in Storybook. Acceptance criteria from the JSON drive the work.',
    location: 'Storybook',
    locationIcon: 'auto_awesome',
    status: 'In Review',
    statusTone: 'info',
  },
  {
    number: 5,
    title: 'Ship',
    owner: 'Designer + Developer',
    ownerIcon: 'groups',
    description: (
      <>
        Spec audit (run the{' '}
        <Link href="/cursor-workflows">
          <code>spec-audit</code> subagent
        </Link>
        ), accessibility review, visual review against Figma. Status moves to Production Ready, doc site bumps the UDS
        version, Figma release notes are updated.
      </>
    ),
    location: 'Doc site + Figma + Storybook',
    locationIcon: 'verified',
    status: 'Production Ready',
    statusTone: 'success',
  },
  {
    number: 6,
    title: 'Use',
    owner: 'Product teams',
    ownerIcon: 'code',
    description: (
      <>
        Product apps import the UDS CSS bundle for tokens and register the Web Components. The component appears in
        real products. Bug reports and enhancement requests flow back via the <strong>Report Issue</strong>{' '}
        button on each component page.
      </>
    ),
    location: 'Production apps',
    locationIcon: 'rocket_launch',
    status: 'Live',
    statusTone: 'success',
  },
];

const glossary = [
  {
    term: 'Primitive token',
    definition: (
      <>
        A raw token value (e.g. <code>--uds-primitive-color-blue-500: #1f6df0</code>). Never used directly in
        component code — primitives feed into semantic tokens.
      </>
    ),
  },
  {
    term: 'Semantic token',
    definition: (
      <>
        A purpose-named token (e.g. <code>--uds-color-text-primary</code>). These are what you use in components.
        Their values change with theme/mode.
      </>
    ),
  },
  {
    term: 'Variant',
    definition: (
      <>
        A distinct visual or behavioral type of a component (e.g. <code>primary</code> / <code>secondary</code> /{' '}
        <code>ghost</code> button variants). Defined as <code>data-*</code> attributes or modifier classes.
      </>
    ),
  },
  {
    term: 'State',
    definition:
      'An interactive condition (default, hover, active, focus, disabled, error, loading, empty). Different from variants — a button can be in any state regardless of variant.',
  },
  {
    term: 'Mode',
    definition: (
      <>
        A token-set switch (e.g. light vs dark color scheme). Controlled by <code>data-color-scheme</code> on{' '}
        <code>&lt;html&gt;</code>.
      </>
    ),
  },
  {
    term: 'Theme',
    definition: (
      <>
        A brand-level token override (Base, ResMan, AnyoneHome, Inhabit). Controlled by <code>data-theme</code> on{' '}
        <code>&lt;html&gt;</code>.
      </>
    ),
  },
  {
    term: 'Density',
    definition: (
      <>
        Compactness of UI (compact vs comfortable). Controlled by <code>data-density</code>.
      </>
    ),
  },
  {
    term: 'Font scale',
    definition: (
      <>
        Global type-size multiplier (smaller / default / larger). Controlled by <code>data-font-scale</code>.
      </>
    ),
  },
  {
    term: 'Text style',
    definition: (
      <>
        A predefined typographic role (e.g. <code>uds-text-heading-xl</code>,{' '}
        <code>uds-text-paragraph-base</code>). Composes font-size + line-height + weight in one class.
      </>
    ),
  },
  {
    term: 'Surface',
    definition:
      'A semantic background-color token (page, main, subtle, alt, etc.). Controls the depth/hierarchy of stacked panels.',
  },
  {
    term: 'Slot',
    definition: (
      <>
        A named content region inside a component (e.g. Dialog has <code>header</code> / <code>body</code> /{' '}
        <code>footer</code> slots). The Storybook web component must support these.
      </>
    ),
  },
  {
    term: 'Prop / Attribute',
    definition: (
      <>
        An input value the Storybook web component should accept (e.g. <code>variant=&quot;primary&quot;</code>,{' '}
        <code>disabled</code>).
      </>
    ),
  },
  {
    term: 'Event',
    definition: (
      <>
        A custom event the Storybook web component should dispatch (e.g. <code>change</code>, <code>dismiss</code>,{' '}
        <code>select</code>).
      </>
    ),
  },
  {
    term: 'Stoplight status',
    definition: 'The component readiness indicator: Placeholder → Blocked → In Progress → In Review → Production Ready → Deprecated.',
  },
  {
    term: 'Spec completeness',
    definition: (
      <>
        How filled-in this component&apos;s <code>uds/components/&lt;id&gt;/spec.json</code> file is. Different from
        production status — a Production-Ready component might still have an incomplete written spec.
      </>
    ),
  },
];

function PaddedCard({ children }: { children: ReactNode }) {
  return (
    <DocsCard elevated>
      <div style={{ padding: 'var(--uds-space-300)' }}>{children}</div>
    </DocsCard>
  );
}

export default function AboutPage() {
  return (
    <>
      <DocsPageHeader
        title="About UDS"
        description="What UDS is, what this site is for, how a component goes from idea to production, and the terminology you'll encounter along the way."
      />

      <DocsSection title="Purpose">
        <div
          style={{
            display: 'grid',
            gap: 'var(--uds-space-300)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          <PaddedCard>
            <DocsBadge tone="brand">
              <span className="material-symbols-outlined">palette</span>
              The design system
            </DocsBadge>
            <h3 className="ds-section__title" style={{ marginTop: 'var(--uds-space-200)' }}>
              Urban Design System (UDS)
            </h3>
            <p className="ds-guideline-prose">
              A coherent, themable design system shared across our products. UDS ships in two layers:{' '}
              <strong>tokens</strong> (semantic CSS custom properties for colors, spacing, type, borders, shadows) and{' '}
              <strong>components</strong> (framework-agnostic web components in Storybook). One codebase, one design
              language, multiple brands (Base, ResMan, AnyoneHome, Inhabit) and color schemes (light, dark) — adapted
              automatically via <code>data-*</code> attributes.
            </p>
            <ul className="ds-guideline-list" style={{ marginTop: 'var(--uds-space-200)' }}>
              <li>
                <strong>Designers</strong> get a consistent visual language, locked-in tokens, and ready-made components
                — no more bespoke buttons per project.
              </li>
              <li>
                <strong>Developers</strong> get framework-agnostic web components and a stable token API. Use them in
                React, Vue, Svelte, Angular, or vanilla.
              </li>
              <li>
                <strong>Product / brand teams</strong> get cross-brand consistency with single-attribute theming.
              </li>
            </ul>
          </PaddedCard>

          <PaddedCard>
            <DocsBadge tone="brand">
              <span className="material-symbols-outlined">menu_book</span>
              This site
            </DocsBadge>
            <h3 className="ds-section__title" style={{ marginTop: 'var(--uds-space-200)' }}>
              UDS Documentation Site
            </h3>
            <p className="ds-guideline-prose">
              The <strong>design specification</strong> layer of UDS — where designers author the contract that
              developers implement. Every component has a structured JSON spec (
              <code>uds/components/&lt;id&gt;/spec.json</code>) that defines props, events, slots, states,
              accessibility, and acceptance criteria. The doc site renders that spec as Guidelines, plus visual examples
              and an interactive playground.
            </p>
            <ul className="ds-guideline-list" style={{ marginTop: 'var(--uds-space-200)' }}>
              <li>
                <strong>Designers</strong> author specs here and confirm visual examples match Figma.
              </li>
              <li>
                <strong>Developers</strong> read specs here and ship 1:1 implementations to Storybook.
              </li>
              <li>
                <strong>PMs / stakeholders</strong> track component status, spec completeness, and changelog history.
              </li>
            </ul>
            <DocsStateMessage title="Example code only" tone="info">
              Production framework code lives in the UDS Storybook — see{' '}
              <Link href="/getting-started">
                Getting Started
              </Link>
              .
            </DocsStateMessage>
          </PaddedCard>
        </div>
      </DocsSection>

      <DocsSection
        title="Component Lifecycle"
        description='From "we need a thing" to "an app uses it in production". Every UDS component flows through these six phases.'
      >
        <ol style={{ display: 'grid', gap: 'var(--uds-space-200)', listStyle: 'none', margin: 0, padding: 0 }}>
          {lifecycleSteps.map((step) => (
            <li key={step.number}>
              <PaddedCard>
                <div
                  style={{
                    display: 'grid',
                    gap: 'var(--uds-space-200)',
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    alignItems: 'start',
                  }}
                >
                  <DocsBadge tone="neutral">{step.number}</DocsBadge>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 'var(--uds-space-100)',
                        justifyContent: 'space-between',
                      }}
                    >
                      <h3 className="ds-section__title" style={{ margin: 0 }}>
                        {step.title}
                      </h3>
                      <DocsBadge tone="neutral">
                        <span className="material-symbols-outlined">{step.ownerIcon}</span>
                        {step.owner}
                      </DocsBadge>
                    </div>
                    <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-100)' }}>
                      {step.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 'var(--uds-space-100)',
                        marginTop: 'var(--uds-space-150)',
                      }}
                    >
                      <DocsBadge tone="neutral">
                        <span className="material-symbols-outlined">{step.locationIcon}</span>
                        {step.location}
                      </DocsBadge>
                      <DocsBadge tone={step.statusTone}>{step.status}</DocsBadge>
                    </div>
                  </div>
                </div>
              </PaddedCard>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: 'var(--uds-space-300)' }}>
          <DocsStateMessage title="Three sources of truth" tone="info">
            <em>Figma</em> is the visual source. <em>This doc site</em> (specifically the{' '}
            <code>uds/components/&lt;id&gt;/spec.json</code> files) is the design spec. <em>Storybook</em> is the
            implementation. They stay in sync via the{' '}
            <Link href="/cursor-workflows">
              release workflow
            </Link>
            .
          </DocsStateMessage>
        </div>
      </DocsSection>

      <DocsSection
        title="Glossary"
        description="UDS terminology. Use this when you encounter a term and aren't sure what it means."
      >
        <DocsCard>
          <dl style={{ display: 'grid', gap: 0, margin: 0 }}>
            {glossary.map((item) => (
              <div
                key={item.term}
                style={{
                  display: 'grid',
                  gap: 'var(--uds-space-075)',
                  padding: 'var(--uds-space-200)',
                  borderBottom: '1px solid var(--uds-color-border-secondary)',
                }}
              >
                <dt className="ds-section__title" style={{ margin: 0 }}>
                  {item.term}
                </dt>
                <dd className="ds-guideline-prose" style={{ margin: 0 }}>
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        </DocsCard>
      </DocsSection>
    </>
  );
}
