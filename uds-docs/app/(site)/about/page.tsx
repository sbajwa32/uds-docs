import { VersionedLink as Link } from '@/components/site/VersionedLink';
import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

export const metadata = { title: 'About UDS — UDS' };

export default function AboutPage() {
  return (
    <div className="sg-page-content">
      <SgPageTitle>About UDS</SgPageTitle>
      <SgPageDesc>
        What UDS is, what this site is for, how a component goes from idea to
        production, and the terminology you&apos;ll encounter along the way.
      </SgPageDesc>

      {/* ===== Purpose ===== */}
      <section className="sg-about-section">
        <h2 className="sg-about-heading">Purpose</h2>

        <div className="sg-about-purpose-grid">
          <div className="sg-about-card">
            <div className="sg-about-card__eyebrow">
              <span className="material-symbols-outlined">palette</span>
              The design system
            </div>
            <h3 className="sg-about-card__title">Urban Design System (UDS)</h3>
            <p className="sg-about-card__body">
              A coherent, themable design system shared across our products. UDS
              ships in two layers: <strong>tokens</strong> (semantic CSS custom
              properties for colors, spacing, type, borders, shadows) and{' '}
              <strong>components</strong> (framework-agnostic web components in
              Storybook). One codebase, one design language, multiple brands
              (Base, ResMan, AnyoneHome, Inhabit) and color schemes (light,
              dark) — adapted automatically via <code>data-*</code> attributes.
            </p>
            <ul className="sg-about-card__list">
              <li>
                <strong>Designers</strong> get a consistent visual language,
                locked-in tokens, and ready-made components — no more bespoke
                buttons per project.
              </li>
              <li>
                <strong>Developers</strong> get framework-agnostic web
                components and a stable token API. Use them in React, Vue,
                Svelte, Angular, or vanilla.
              </li>
              <li>
                <strong>Product / brand teams</strong> get cross-brand
                consistency with single-attribute theming.
              </li>
            </ul>
          </div>

          <div className="sg-about-card">
            <div className="sg-about-card__eyebrow">
              <span className="material-symbols-outlined">menu_book</span>
              This site
            </div>
            <h3 className="sg-about-card__title">UDS Documentation Site</h3>
            <p className="sg-about-card__body">
              The <strong>design specification</strong> layer of UDS — where
              designers author the contract that developers implement. Every
              component has a structured JSON spec (
              <code>uds/components/&lt;id&gt;/spec.json</code>) that defines
              props, events, slots, states, accessibility, and acceptance
              criteria. The doc site renders that spec as Guidelines, plus
              visual examples and an interactive playground.
            </p>
            <ul className="sg-about-card__list">
              <li>
                <strong>Designers</strong> author specs here and confirm visual
                examples match Figma.
              </li>
              <li>
                <strong>Developers</strong> read specs here and ship 1:1
                implementations to Storybook.
              </li>
              <li>
                <strong>PMs / stakeholders</strong> track component status, spec
                completeness, and changelog history.
              </li>
            </ul>
            <p className="sg-about-card__note">
              <strong>All code on this site is example only.</strong> Production
              framework code lives in the UDS Storybook — see{' '}
              <Link className="sg-gl-link" href="/getting-started">
                Getting Started
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ===== Component lifecycle ===== */}
      <section className="sg-about-section">
        <h2 className="sg-about-heading">Component Lifecycle</h2>
        <p className="sg-about-section-desc">
          From &quot;we need a thing&quot; to &quot;an app uses it in
          production&quot;. Every UDS component flows through these six phases.
        </p>

        <ol className="sg-lifecycle">
          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">1</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Propose</h3>
                <span className="sg-lifecycle__owner" data-role="any">
                  <span className="material-symbols-outlined">person</span>
                  Anyone
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                A need is identified — designer, developer, or PM starts a
                Figma page for the component with the red Exploration prefix and
                notes what problem it solves. See the{' '}
                <Link className="sg-gl-link" href="/design-process">
                  Design Process
                </Link>{' '}
                page for the full stoplight flow.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">
                    design_services
                  </span>
                  Figma — UDS Components (Red)
                </span>
                <span className="sg-lifecycle__tag" data-status="proposed">
                  Proposed
                </span>
              </div>
            </div>
          </li>

          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">2</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Design</h3>
                <span className="sg-lifecycle__owner" data-role="designer">
                  <span className="material-symbols-outlined">brush</span>
                  Designer
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                Designer builds variants and states in the UDS Components Figma
                file. Page name gets the orange dot prefix while in progress.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">
                    design_services
                  </span>
                  Figma — UDS Components
                </span>
                <span className="sg-lifecycle__tag" data-status="in-progress">
                  In Progress
                </span>
              </div>
            </div>
          </li>

          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">3</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Spec</h3>
                <span className="sg-lifecycle__owner" data-role="designer">
                  <span className="material-symbols-outlined">brush</span>
                  Designer
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                Designer writes the structured spec in{' '}
                <code>uds/components/&lt;id&gt;/spec.json</code> — description,
                when-to-use, props, events, slots, states, accessibility. The
                Guidelines tab on the doc site auto-renders from this file. Use
                the{' '}
                <Link className="sg-gl-link" href="/cursor-workflows">
                  <code>new-component</code> skill
                </Link>{' '}
                to scaffold.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">data_object</span>
                  uds/components/&lt;id&gt;/spec.json
                </span>
                <span className="sg-lifecycle__tag" data-status="in-progress">
                  Spec building
                </span>
              </div>
            </div>
          </li>

          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">4</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Build</h3>
                <span className="sg-lifecycle__owner" data-role="developer">
                  <span className="material-symbols-outlined">code</span>
                  Developer
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                Developer implements the spec 1:1 as a framework-agnostic web
                component in Storybook. Acceptance criteria from the JSON drive
                the work.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                  Storybook
                </span>
                <span className="sg-lifecycle__tag" data-status="in-progress">
                  In Review
                </span>
              </div>
            </div>
          </li>

          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">5</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Ship</h3>
                <span className="sg-lifecycle__owner" data-role="both">
                  <span className="material-symbols-outlined">groups</span>
                  Designer + Developer
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                Spec audit (run the{' '}
                <Link className="sg-gl-link" href="/cursor-workflows">
                  <code>spec-audit</code> subagent
                </Link>
                ), accessibility review, visual review against Figma. Status
                moves to Production Ready, doc site bumps the UDS version, Figma
                release notes are updated.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">verified</span>
                  Doc site + Figma + Storybook
                </span>
                <span className="sg-lifecycle__tag" data-status="done">
                  Production Ready
                </span>
              </div>
            </div>
          </li>

          <li className="sg-lifecycle__step">
            <div className="sg-lifecycle__num">6</div>
            <div className="sg-lifecycle__body">
              <div className="sg-lifecycle__title-row">
                <h3 className="sg-lifecycle__title">Use</h3>
                <span className="sg-lifecycle__owner" data-role="developer">
                  <span className="material-symbols-outlined">code</span>
                  Product teams
                </span>
              </div>
              <p className="sg-lifecycle__desc">
                Product apps install <code>uds-core</code> for tokens and
                register the Storybook web components. The component appears in
                real products. Bug reports and enhancement requests flow back via
                the <strong>Report Issue</strong> button on each component page.
              </p>
              <div className="sg-lifecycle__meta">
                <span className="sg-lifecycle__loc">
                  <span className="material-symbols-outlined">
                    rocket_launch
                  </span>
                  Production apps
                </span>
                <span className="sg-lifecycle__tag" data-status="done">
                  Live
                </span>
              </div>
            </div>
          </li>
        </ol>

        <p className="sg-about-aside">
          <strong>Three sources of truth.</strong> <em>Figma</em> is the visual
          source. <em>This doc site</em> (specifically the{' '}
          <code>uds/components/&lt;id&gt;/spec.json</code> files) is the design
          spec. <em>Storybook</em> is the implementation. They stay in sync via
          the{' '}
          <Link className="sg-gl-link" href="/cursor-workflows">
            release workflow
          </Link>
          .
        </p>
      </section>

      {/* ===== Glossary ===== */}
      <section className="sg-about-section">
        <h2 className="sg-about-heading">Glossary</h2>
        <p className="sg-about-section-desc">
          UDS terminology. Use this when you encounter a term and aren&apos;t
          sure what it means.
        </p>

        <dl className="sg-glossary">
          <dt>Primitive token</dt>
          <dd>
            A raw token value (e.g.{' '}
            <code>--uds-primitive-color-blue-500: #1f6df0</code>). Never used
            directly in component code — primitives feed into semantic tokens.
          </dd>
          <dt>Semantic token</dt>
          <dd>
            A purpose-named token (e.g.{' '}
            <code>--uds-color-text-primary</code>). These are what you use in
            components. Their values change with theme/mode.
          </dd>
          <dt>Variant</dt>
          <dd>
            A distinct visual or behavioral type of a component (e.g.{' '}
            <code>primary</code> / <code>secondary</code> /{' '}
            <code>ghost</code> button variants). Defined as{' '}
            <code>data-*</code> attributes or modifier classes.
          </dd>
          <dt>State</dt>
          <dd>
            An interactive condition (default, hover, active, focus, disabled,
            error, loading, empty). Different from variants — a button can be in
            any state regardless of variant.
          </dd>
          <dt>Mode</dt>
          <dd>
            A token-set switch (e.g. light vs dark color scheme). Controlled by{' '}
            <code>data-color-scheme</code> on <code>&lt;html&gt;</code>.
          </dd>
          <dt>Theme</dt>
          <dd>
            A brand-level token override (Base, ResMan, AnyoneHome, Inhabit).
            Controlled by <code>data-theme</code> on{' '}
            <code>&lt;html&gt;</code>.
          </dd>
          <dt>Density</dt>
          <dd>
            Compactness of UI (compact vs comfortable). Controlled by{' '}
            <code>data-density</code>.
          </dd>
          <dt>Font scale</dt>
          <dd>
            Global type-size multiplier (smaller / default / larger). Controlled
            by <code>data-font-scale</code>.
          </dd>
          <dt>Text style</dt>
          <dd>
            A predefined typographic role (e.g.{' '}
            <code>uds-text-heading-xl</code>,{' '}
            <code>uds-text-paragraph-base</code>). Composes font-size +
            line-height + weight in one class.
          </dd>
          <dt>Surface</dt>
          <dd>
            A semantic background-color token (page, main, subtle, alt, etc.).
            Controls the depth/hierarchy of stacked panels.
          </dd>
          <dt>Slot</dt>
          <dd>
            A named content region inside a component (e.g. Dialog has{' '}
            <code>header</code> / <code>body</code> / <code>footer</code>{' '}
            slots). The Storybook web component must support these.
          </dd>
          <dt>Prop / Attribute</dt>
          <dd>
            An input value the Storybook web component should accept (e.g.{' '}
            <code>variant=&quot;primary&quot;</code>, <code>disabled</code>).
          </dd>
          <dt>Event</dt>
          <dd>
            A custom event the Storybook web component should dispatch (e.g.{' '}
            <code>change</code>, <code>dismiss</code>, <code>select</code>).
          </dd>
          <dt>Stoplight status</dt>
          <dd>
            The component readiness indicator: Placeholder → Blocked → In
            Progress → In Review → Production Ready → Deprecated.
          </dd>
          <dt>Spec completeness</dt>
          <dd>
            How filled-in this component&apos;s{' '}
            <code>uds/components/&lt;id&gt;/spec.json</code> file is. Different
            from production status — a Production-Ready component might still
            have an incomplete written spec.
          </dd>
        </dl>
      </section>
    </div>
  );
}
