import Link from 'next/link';
import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

export const metadata = { title: 'Design Process — UDS' };

export default function DesignProcessPage() {
  return (
    <div className="sg-page-content">
      <SgPageTitle>Design Process</SgPageTitle>
      <SgPageDesc>How a component moves from a first sketch to something developers can build. The page below proposes a process; the bottom half compares it to how big design systems handle the same problem.</SgPageDesc>

      <style>{`
/* Page-local styles for the design-process page. Scoped via .sg-dp-* prefix. */

.sg-dp-discussion-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--uds-space-150);
  padding: var(--uds-space-200) var(--uds-space-250);
  background: var(--uds-color-surface-info-subtle);
  border: 1px solid var(--uds-color-border-info);
  border-left: 4px solid var(--uds-color-border-info);
  border-radius: var(--uds-border-radius-container-md);
  margin: var(--uds-space-200) 0 var(--uds-space-400);
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.55;
}
.sg-dp-discussion-banner .material-symbols-outlined {
  color: var(--uds-color-icon-info);
  flex-shrink: 0;
  font-size: 22px;
}
.sg-dp-discussion-banner strong { font-weight: var(--uds-font-weight-bold); }

.sg-dp-part-marker {
  display: inline-block;
  padding: 2px 10px;
  background: var(--uds-color-surface-alt);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-full);
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-xs);
  font-weight: var(--uds-font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--uds-color-text-secondary);
  margin: var(--uds-space-500) 0 var(--uds-space-150);
}

/* Two-homes layout */
.sg-dp-universes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--uds-space-200);
  margin: var(--uds-space-200) 0 var(--uds-space-400);
}
@media (max-width: 720px) {
  .sg-dp-universes { grid-template-columns: 1fr; }
}
.sg-dp-universe {
  padding: var(--uds-space-250) var(--uds-space-300);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-md);
  background: var(--uds-color-surface-subtle);
}
.sg-dp-universe h4 {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-md);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: 0 0 var(--uds-space-075);
}
.sg-dp-universe-body {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-secondary);
  line-height: 1.55;
  margin: 0;
}
.sg-dp-universe-stages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--uds-space-100);
  margin-top: var(--uds-space-150);
}
.sg-dp-universe-stages .sg-dp-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 7px;
  border-radius: var(--uds-border-radius-container-full);
  background: var(--uds-color-surface-main);
  border: 1px solid var(--uds-color-border-secondary);
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-xs);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
}

/* Stoplight swatch */
.sg-dp-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--uds-color-border-secondary);
  flex-shrink: 0;
}
.sg-dp-swatch--red    { background: var(--uds-color-surface-error); }
.sg-dp-swatch--orange { background: var(--uds-color-surface-warning); }
.sg-dp-swatch--yellow { background: var(--uds-color-surface-warning-subtle); }
.sg-dp-swatch--green  { background: var(--uds-color-surface-success); }
.sg-dp-swatch--black  { background: var(--uds-color-surface-inverse); }
.sg-dp-swatch--beta   { background: var(--uds-color-surface-info); }

/* Lifecycle flow */
.sg-dp-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--uds-space-100);
  padding: var(--uds-space-200) var(--uds-space-250);
  background: var(--uds-color-surface-subtle);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-md);
  margin: var(--uds-space-200) 0 var(--uds-space-400);
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
}
.sg-dp-flow-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--uds-color-surface-main);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-md);
  color: var(--uds-color-text-primary);
  font-weight: var(--uds-font-weight-bold);
}
.sg-dp-flow-arrow {
  color: var(--uds-color-icon-secondary);
  font-size: 18px;
  line-height: 1;
}
.sg-dp-flow-aside {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: var(--uds-space-150);
  padding: 4px 10px;
  background: var(--uds-color-surface-info-subtle);
  border: 1px dashed var(--uds-color-border-info);
  border-radius: var(--uds-border-radius-container-md);
  font-size: var(--uds-font-size-xs);
  color: var(--uds-color-text-info);
}
.sg-dp-flow-caption {
  margin-top: var(--uds-space-100);
  font-size: var(--uds-font-size-xs);
  color: var(--uds-color-text-secondary);
  width: 100%;
  text-align: center;
}

/* Stage cards */
.sg-dp-stage-card {
  padding: var(--uds-space-300) var(--uds-space-300) var(--uds-space-250);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-md);
  background: var(--uds-color-surface-main);
  margin: 0 0 var(--uds-space-200);
}
.sg-dp-stage-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--uds-space-150);
  margin-bottom: var(--uds-space-150);
  padding-bottom: var(--uds-space-150);
  border-bottom: 1px solid var(--uds-color-border-secondary);
}
.sg-dp-stage-card__swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--uds-color-border-secondary);
  flex-shrink: 0;
}
.sg-dp-stage-card__title {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-lg);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: 0;
}
.sg-dp-stage-card__meta {
  display: flex;
  gap: var(--uds-space-150);
  flex-wrap: wrap;
  margin-left: auto;
}
.sg-dp-stage-card__meta-item {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-xs);
  color: var(--uds-color-text-secondary);
}
.sg-dp-stage-card__meta-item strong {
  color: var(--uds-color-text-primary);
  font-weight: var(--uds-font-weight-bold);
}
.sg-dp-stage-card__lead {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.6;
  margin: 0 0 var(--uds-space-200);
}
.sg-dp-checklist-heading {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: var(--uds-space-200) 0 var(--uds-space-075);
}
.sg-dp-checklist {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--uds-space-150);
}
.sg-dp-checklist li {
  position: relative;
  padding: 4px 0 4px 26px;
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.55;
}
.sg-dp-checklist li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--uds-color-border-secondary);
  border-radius: 3px;
  background: var(--uds-color-surface-main);
}

/* Iteration patterns */
.sg-dp-pattern {
  padding: var(--uds-space-200) var(--uds-space-250);
  border: 1px solid var(--uds-color-border-secondary);
  border-radius: var(--uds-border-radius-container-md);
  background: var(--uds-color-surface-subtle);
  margin: 0 0 var(--uds-space-150);
}
.sg-dp-pattern h4 {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-md);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: 0 0 var(--uds-space-075);
}
.sg-dp-pattern p {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--uds-space-075);
}
.sg-dp-pattern p:last-child { margin-bottom: 0; }
.sg-dp-pattern strong { color: var(--uds-color-text-primary); }

/* Recommendation cards */
.sg-dp-rec {
  padding: var(--uds-space-300);
  border: 1px solid var(--uds-color-border-secondary);
  border-left: 4px solid var(--uds-color-border-info);
  border-radius: var(--uds-border-radius-container-md);
  background: var(--uds-color-surface-main);
  margin: 0 0 var(--uds-space-200);
}
.sg-dp-rec__num {
  display: inline-block;
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-xs);
  font-weight: var(--uds-font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--uds-color-text-info);
  margin-bottom: var(--uds-space-050);
}
.sg-dp-rec__title {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-md);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: 0 0 var(--uds-space-150);
}
.sg-dp-rec h5 {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  font-weight: var(--uds-font-weight-bold);
  color: var(--uds-color-text-primary);
  margin: var(--uds-space-150) 0 var(--uds-space-050);
}
.sg-dp-rec p {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.6;
  margin: 0 0 var(--uds-space-075);
}
.sg-dp-rec p:last-child { margin-bottom: 0; }
.sg-dp-rec ul {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.6;
  padding-left: 22px;
  margin: 0 0 var(--uds-space-100);
}

/* Status-lives list */
.sg-dp-loclist {
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-primary);
  line-height: 1.6;
  padding-left: 22px;
}

/* Cross-references */
.sg-dp-xref {
  padding: var(--uds-space-200) var(--uds-space-250);
  background: var(--uds-color-surface-subtle);
  border-radius: var(--uds-border-radius-container-md);
  font-family: var(--uds-font-family);
  font-size: var(--uds-font-size-sm);
  color: var(--uds-color-text-secondary);
  line-height: 1.6;
  margin-top: var(--uds-space-400);
}
.sg-dp-xref a { color: var(--uds-color-text-interactive); }
      `}</style>

      {/* DISCUSSION BANNER */}
      <div className="sg-dp-discussion-banner">
        <span className="material-symbols-outlined">forum</span>
        <div>
          <strong>This is a draft for discussion, not how the system works today.</strong> The current process inside the design system hasn{"'"}t been changed yet. This page captures a proposed way of working and a side-by-side review against how other design systems handle the same problem. Nothing here is in effect until we decide to adopt it.
        </div>
      </div>

      {/* OVERVIEW */}
      <p className="sg-page-desc">The stoplight tells you where each component is in the design process. Five colors, one for each stage. Red means just starting; green means ready for developers to build. The proposal below explains what each color means, what you{"'"}ll see while you{"'"}re there, and what to check off to move forward.</p>

      {/* PART 1 — THE PROPOSED PROCESS */}
      <div className="sg-dp-part-marker">Part 1 — The proposal</div>

      <h3 className="sg-subsection-title">Two homes for a component</h3>
      <p className="sg-subsection-desc">A component lives in two places during its life: Figma while you{"'"}re designing it, then the docs site once it{"'"}s far enough along to be written up. Developers come in after that, taking the finished design from the docs site and building it in Storybook. The stoplight is a designer{"'"}s tool — it tracks how far along the design itself is, not the engineering work.</p>

      <div className="sg-dp-universes">
        <div className="sg-dp-universe">
          <h4>Figma — where you{"'"}re designing</h4>
          <p className="sg-dp-universe-body">Sketching, exploring, building out variants and states. Nothing on the docs site yet. The Figma page name carries a colored prefix that tells everyone how far along the work is.</p>
          <div className="sg-dp-universe-stages">
            <span className="sg-dp-pill"><span className="sg-dp-swatch sg-dp-swatch--red"></span>Red — Exploration</span>
            <span className="sg-dp-pill"><span className="sg-dp-swatch sg-dp-swatch--orange"></span>Orange — In Progress</span>
          </div>
        </div>
        <div className="sg-dp-universe">
          <h4>Docs site — where the finished design lives</h4>
          <p className="sg-dp-universe-body">The component has a page, a written spec, examples, and a status badge. Anyone in the company can see it and use it for product work. Green means the design is locked and developers can start building.</p>
          <div className="sg-dp-universe-stages">
            <span className="sg-dp-pill"><span className="sg-dp-swatch sg-dp-swatch--yellow"></span>Yellow — In Review</span>
            <span className="sg-dp-pill"><span className="sg-dp-swatch sg-dp-swatch--green"></span>Green — Production Ready</span>
            <span className="sg-dp-pill"><span className="sg-dp-swatch sg-dp-swatch--black"></span>Black — Deprecated</span>
          </div>
        </div>
      </div>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>The five stages at a glance</h3>
      <div className="sg-dp-flow">
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--red"></span>Red</span>
        <span className="sg-dp-flow-arrow">→</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--orange"></span>Orange</span>
        <span className="sg-dp-flow-arrow">→</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--yellow"></span>Yellow</span>
        <span className="sg-dp-flow-arrow">→</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--green"></span>Green</span>
        <span className="sg-dp-flow-arrow">⤳</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--black"></span>Black</span>
        <span className="sg-dp-flow-aside"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>code</span>Storybook (developers build here, after Green)</span>
        <span className="sg-dp-flow-caption">Forward is the typical path. Sunset to Black is dotted because not every component ends up there. Going backward (Yellow back to Orange, for example) is normal too — see {'"'}When things change{'"'} below.</span>
      </div>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>The five stages, in detail</h3>
      <p className="sg-subsection-desc">Each stage is a card with three sections: what the stage means, what you{"'"}ll see while you{"'"}re there, and what you need to check off before moving forward.</p>

      {/* Red — Exploration */}
      <div className="sg-dp-stage-card">
        <div className="sg-dp-stage-card__header">
          <span className="sg-dp-stage-card__swatch sg-dp-swatch--red"></span>
          <h4 className="sg-dp-stage-card__title">Red — Exploration</h4>
          <div className="sg-dp-stage-card__meta">
            <span className="sg-dp-stage-card__meta-item"><strong>Lives in:</strong> Figma</span>
            <span className="sg-dp-stage-card__meta-item"><strong>Who works on it:</strong> Designer</span>
          </div>
        </div>
        <p className="sg-dp-stage-card__lead">You{"'"}ve just started thinking about a new component. You{"'"}re sketching ideas in Figma — trying different shapes, sizes, and approaches to see what feels right.</p>
        <div className="sg-dp-checklist-heading">While you{"'"}re here</div>
        <ul className="sg-dp-checklist">
          <li>There{"'"}s a Figma page for this component with the red prefix</li>
          <li>You{"'"}ve drawn at least one rough version on the canvas</li>
          <li>The questions you{"'"}re trying to answer are written down somewhere on the page (sticky notes, comments, a notes frame — whatever works)</li>
          <li>The component doesn{"'"}t appear on the docs site yet</li>
        </ul>
        <div className="sg-dp-checklist-heading">To move to Orange</div>
        <ul className="sg-dp-checklist">
          <li>You{"'"}ve picked one of your sketches as the direction you want to build out</li>
          <li>The other sketches are tucked away or labeled so you remember what you tried</li>
          <li>You rename the Figma page from red to orange</li>
        </ul>
      </div>

      {/* Orange — In Progress */}
      <div className="sg-dp-stage-card">
        <div className="sg-dp-stage-card__header">
          <span className="sg-dp-stage-card__swatch sg-dp-swatch--orange"></span>
          <h4 className="sg-dp-stage-card__title">Orange — In Progress</h4>
          <div className="sg-dp-stage-card__meta">
            <span className="sg-dp-stage-card__meta-item"><strong>Lives in:</strong> Figma</span>
            <span className="sg-dp-stage-card__meta-item"><strong>Who works on it:</strong> Designer</span>
          </div>
        </div>
        <p className="sg-dp-stage-card__lead">You{"'"}ve picked a direction and you{"'"}re building it out properly — drawing all the variants (small/medium/large, primary/secondary, etc.) and all the states (hover, focused, disabled).</p>
        <div className="sg-dp-checklist-heading">While you{"'"}re here</div>
        <ul className="sg-dp-checklist">
          <li>The Figma page has the orange prefix</li>
          <li>You{"'"}ve drawn the variants the component needs (sizes, fills, icon options, etc.)</li>
          <li>You{"'"}ve drawn the states the component needs (default, hover, focused, active, disabled — plus anything specific like error or loading)</li>
          <li>Everything uses the design system{"'"}s colors, spacing, and typography (no hardcoded values)</li>
          <li>You{"'"}ve labeled each part of the component in Figma so someone reading later knows what each piece is called</li>
          <li>The component still doesn{"'"}t appear on the docs site</li>
        </ul>
        <div className="sg-dp-checklist-heading">To move to Yellow</div>
        <ul className="sg-dp-checklist">
          <li>The design feels settled enough that someone could write a description from it</li>
          <li>You rename the Figma page from orange to yellow</li>
          <li>You ask the assistant to set the component up on the docs site (it creates the page, a starter example, and a spec template you fill in next)</li>
        </ul>
      </div>

      {/* Yellow — In Review */}
      <div className="sg-dp-stage-card">
        <div className="sg-dp-stage-card__header">
          <span className="sg-dp-stage-card__swatch sg-dp-swatch--yellow"></span>
          <h4 className="sg-dp-stage-card__title">Yellow — In Review</h4>
          <div className="sg-dp-stage-card__meta">
            <span className="sg-dp-stage-card__meta-item"><strong>Lives in:</strong> Docs site</span>
            <span className="sg-dp-stage-card__meta-item"><strong>Who works on it:</strong> Designer</span>
          </div>
        </div>
        <p className="sg-dp-stage-card__lead">The component now has a page on the docs site. You{"'"}re writing the spec — the description, when to use it, when not to use it, what props it has, what keyboard shortcuts it supports. A yellow {'"'}Not production-ready{'"'} banner sits at the top so anyone visiting knows the spec is still being written.</p>
        <div className="sg-dp-checklist-heading">While you{"'"}re here</div>
        <ul className="sg-dp-checklist">
          <li>The component has a page on the docs site with Examples, Code, Guidelines, Changelog, and Playground tabs</li>
          <li>The Guidelines tab has the basics filled in: a description, when to use it, when not to use it, the parts it{"'"}s made of, and the keyboard interactions it supports</li>
          <li>At least one example is rendered on the page so people can see it in action</li>
          <li>The {'"'}Spec X/22{'"'} pill on the Guidelines tab climbs as you fill in more fields — aim for at least 80%</li>
          <li>The yellow {'"'}Not production-ready{'"'} banner is visible at the top</li>
          <li>A peer designer can review the spec while you{"'"}re here (optional, but a good idea)</li>
        </ul>
        <div className="sg-dp-checklist-heading">To move to Green</div>
        <ul className="sg-dp-checklist">
          <li>The {'"'}Spec X/22{'"'} pill is at 80% or higher</li>
          <li>You{"'"}re confident the description, props, and behavior are final — not still moving</li>
          <li>You rename the Figma page from yellow to green</li>
          <li>You change the status on the component{"'"}s page from {'"'}In Review{'"'} to {'"'}Production Ready{'"'}</li>
        </ul>
      </div>

      {/* Green — Production */}
      <div className="sg-dp-stage-card">
        <div className="sg-dp-stage-card__header">
          <span className="sg-dp-stage-card__swatch sg-dp-swatch--green"></span>
          <h4 className="sg-dp-stage-card__title">Green — Production Ready</h4>
          <div className="sg-dp-stage-card__meta">
            <span className="sg-dp-stage-card__meta-item"><strong>Lives in:</strong> Docs site</span>
            <span className="sg-dp-stage-card__meta-item"><strong>Who works on it:</strong> Designer</span>
          </div>
        </div>
        <p className="sg-dp-stage-card__lead">The design is locked. Marking it Green is how you tell developers {'"'}you can build this now — the spec won{"'"}t keep changing on you.{'"'} From here, developers pick the component up and build the production version in Storybook.</p>
        <div className="sg-dp-checklist-heading">While you{"'"}re here</div>
        <ul className="sg-dp-checklist">
          <li>The status shows {'"'}Production Ready{'"'} on the sidebar and on the page</li>
          <li>The {'"'}Not production-ready{'"'} banner is gone</li>
          <li>The Figma page has the green prefix</li>
          <li>Developers can implement the component knowing the spec is stable</li>
          <li>Product teams can use the spec when planning new features</li>
        </ul>
        <div className="sg-dp-checklist-heading">What happens after Green</div>
        <ul className="sg-dp-checklist">
          <li>Developers build the component in Storybook — that{"'"}s their workstream, not part of the stoplight</li>
          <li>If they hit small issues during build, those become spec tweaks (recorded as updates, no status change)</li>
          <li>Real product features start using the component</li>
        </ul>
        <div className="sg-dp-checklist-heading">If you decide to deprecate it (move to Black)</div>
        <ul className="sg-dp-checklist">
          <li>A replacement component exists (ideally also Production Ready)</li>
          <li>The {'"'}when not to use{'"'} section points at the replacement</li>
          <li>You rename the Figma page from green to black</li>
          <li>You change the status from {'"'}Production Ready{'"'} to {'"'}Deprecated{'"'}</li>
        </ul>
        <div className="sg-dp-checklist-heading">If you need to re-open for a major redesign (back to Yellow)</div>
        <ul className="sg-dp-checklist">
          <li>This needs an explicit {'"'}yes, I{"'"}m doing this{'"'} — Green is a public contract that developers may already be building against</li>
          <li>The reason for going back is written down so consumers know why</li>
        </ul>
      </div>

      {/* Black — Deprecated */}
      <div className="sg-dp-stage-card">
        <div className="sg-dp-stage-card__header">
          <span className="sg-dp-stage-card__swatch sg-dp-swatch--black"></span>
          <h4 className="sg-dp-stage-card__title">Black — Deprecated</h4>
          <div className="sg-dp-stage-card__meta">
            <span className="sg-dp-stage-card__meta-item"><strong>Lives in:</strong> Docs site</span>
            <span className="sg-dp-stage-card__meta-item"><strong>Who works on it:</strong> Designer</span>
          </div>
        </div>
        <p className="sg-dp-stage-card__lead">This component is being phased out. Projects that already use it can keep using it, but new work should reach for the replacement listed in the spec.</p>
        <div className="sg-dp-checklist-heading">While you{"'"}re here</div>
        <ul className="sg-dp-checklist">
          <li>The status shows {'"'}Deprecated{'"'}</li>
          <li>{'"'}When not to use{'"'} tells people what to use instead</li>
          <li>The Figma page has the black prefix</li>
          <li>The component is still visible on the docs site so old projects can find it</li>
          <li>This is the end of the line — no progressing forward from here</li>
        </ul>
        <div className="sg-dp-checklist-heading">Day-to-day</div>
        <ul className="sg-dp-checklist">
          <li>Old projects keep using it without issue</li>
          <li>New projects are pointed at the replacement</li>
          <li>Eventually the component is removed entirely in a major release of the design system — that{"'"}s a separate, deliberate decision, not something that happens automatically</li>
        </ul>
      </div>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>When things change</h3>
      <p className="sg-subsection-desc">The real world isn{"'"}t perfect. Designs evolve. Specs need tweaks. Components occasionally need to go backward before they can go forward. Three patterns cover almost every case.</p>

      <div className="sg-dp-pattern">
        <h4>1. Small changes (the most common kind)</h4>
        <p>You{"'"}re at Yellow and you tighten the description. Or you{"'"}re at Green and you fix the wording in an example. Most edits look like this — just make the change, write a short note in the component{"'"}s changelog (one sentence is fine), and you{"'"}re done. The component stays at its current color.</p>
      </div>

      <div className="sg-dp-pattern">
        <h4>2. The design needs more work (going backward)</h4>
        <p><strong>Yellow back to Orange.</strong> While writing the spec you realize the Figma design isn{"'"}t actually settled yet. Take it back to Figma — rename the page back to orange, change the status to {'"'}In Progress,{'"'} and jot down why. The docs-site page stays put. Your spec work is preserved for when you come back.</p>
        <p><strong>Yellow back to Red.</strong> Rare. You want to throw out the current direction and explore alternatives. Same idea, status goes back to {'"'}Exploration.{'"'}</p>
        <p><strong>Green back to Yellow.</strong> A major redesign. This is the only backward move that needs explicit confirmation — Green is a public contract, and developers might already be implementing against it.</p>
        <p>The component{"'"}s history keeps a record of every status change, so going back and forth is fully preserved — you can look back later and see how it evolved.</p>
      </div>

      <div className="sg-dp-pattern">
        <h4>3. The docs site and Figma fall out of sync</h4>
        <p>Sometimes Figma gets updated but the docs site doesn{"'"}t catch up (or the other way around). When that happens, the assistant can compare the two and propose updates. Safe changes get applied automatically; anything risky stops for your review before anything is changed.</p>
      </div>

      <div className="sg-dp-pattern">
        <h4>Default when you{"'"}re not sure</h4>
        <p>Stay at the current color and write a short changelog note. Going backward is a real option, but use it when you mean to — not on reflex. A good rule: if you{"'"}d be willing to defend the move in a one-sentence note, do it; if not, just make the edit in place.</p>
      </div>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>Where the status shows up</h3>
      <ul className="sg-dp-loclist">
        <li><strong>The Figma page name</strong> carries a colored prefix (red, orange, yellow, green, or black) — the most visible signal of where a component is</li>
        <li><strong>The sidebar status badge</strong> on the docs site shows the current color for any component that has a page (Yellow and later)</li>
        <li><strong>The {'"'}Not production-ready{'"'} banner</strong> sits at the top of Yellow component pages so visitors know the spec might still change</li>
        <li><strong>The component{"'"}s history</strong> records every status change, so you can always look back and see how it got here</li>
      </ul>

      {/* PART 2 — RECOMMENDATIONS */}
      <div className="sg-dp-part-marker">Part 2 — How this compares to big design systems</div>

      <h3 className="sg-subsection-title">Five things worth considering</h3>
      <p className="sg-subsection-desc">When you look at how the biggest design systems work — Shopify{"'"}s Polaris, IBM{"'"}s Carbon, Salesforce{"'"}s Lightning, Adobe{"'"}s Spectrum, Google{"'"}s Material — they all do a few things the proposal above doesn{"'"}t. Here are five ideas worth weighing.</p>

      {/* Recommendation 1 */}
      <div className="sg-dp-rec">
        <div className="sg-dp-rec__num">Recommendation 1 · Highest impact</div>
        <h4 className="sg-dp-rec__title">Add a {'"'}Beta{'"'} stage between approved and locked-forever</h4>
        <p>Almost every big design system has a stage that says: {'"'}you can use this, but the spec might still change.{'"'} For example:</p>
        <ul>
          <li>Polaris: Stable / <strong>Experimental</strong> / Legacy / Deprecated</li>
          <li>Carbon: <strong>Experimental</strong> / Draft / Stable / Deprecated</li>
          <li>Lightning: Drafted / <strong>Beta</strong> / Released / Deprecated</li>
          <li>Spectrum: Working draft / <strong>Beta</strong> / Released</li>
        </ul>
        <p>The proposal jumps straight from Yellow (private review) to Green (locked). With nothing in between, when a developer sees Green they assume {'"'}this never changes{'"'} — and then they{"'"}re surprised when an update lands later.</p>
        <h5>What this would look like</h5>
        <p>Add a sixth stage, or a small {'"'}Beta{'"'} badge that sits on top of Green. Developers building against a Beta spec know things might shift. Green (or {'"'}Stable{'"'}) is reserved for components that are genuinely locked.</p>
      </div>

      {/* Recommendation 2 */}
      <div className="sg-dp-rec">
        <div className="sg-dp-rec__num">Recommendation 2</div>
        <h4 className="sg-dp-rec__title">Drop the Red (Exploration) stage</h4>
        <p>None of the big design systems publicly track design exploration. That happens in a designer{"'"}s working file and stays private until it{"'"}s coherent enough to be a real direction. Tracking it publicly makes the system look bigger and messier than it really is.</p>
        <h5>What this would look like</h5>
        <p>Figma pages for early sketches still exist, but they don{"'"}t get a red prefix and they don{"'"}t appear in the design system at all. A component only enters the stoplight when it reaches Orange — when there{"'"}s a real direction with real variants. The five stages collapse to four: Orange → Yellow → Green → Black.</p>
      </div>

      {/* Recommendation 3 */}
      <div className="sg-dp-rec">
        <div className="sg-dp-rec__num">Recommendation 3</div>
        <h4 className="sg-dp-rec__title">Track that the Storybook build actually exists at Green</h4>
        <p>The big design systems treat {'"'}shipped{'"'} as the spec AND the working code, not just the spec. They don{"'"}t call something Stable until the implementation exists. The proposal puts Storybook on a parallel track, gated by Green but otherwise off the stoplight — which risks the same drift problems we already see between Figma and code.</p>
        <h5>What this would look like</h5>
        <p>The Green stage checklist gains one item: {'"'}Storybook implementation exists and matches the spec.{'"'} It doesn{"'"}t have to block the flip to Green (a designer can mark it Green to signal {'"'}ready for development{'"'}), but it should be tracked and visible somewhere on the page.</p>
      </div>

      {/* Recommendation 4 */}
      <div className="sg-dp-rec">
        <div className="sg-dp-rec__num">Recommendation 4</div>
        <h4 className="sg-dp-rec__title">Require a written reason when a component goes backward</h4>
        <p>Successful design systems make backward moves a little painful on purpose — a written reason, a peer review, something visible. The proposal lets a designer move backward freely. That risks ping-ponging — Yellow → Orange → Yellow → Orange — without ever committing.</p>
        <h5>What this would look like</h5>
        <p>Every backward move requires a short reason: {'"'}Variants for icon-only need rework,{'"'} or whatever. The reason shows up on the component page as a small {'"'}Why this regressed{'"'} note. Public visibility creates the discipline — designers who know the reason will be public think twice before going back.</p>
      </div>

      {/* Recommendation 5 */}
      <div className="sg-dp-rec">
        <div className="sg-dp-rec__num">Recommendation 5</div>
        <h4 className="sg-dp-rec__title">Add a {'"'}How this differs from most design systems{'"'} note</h4>
        <p>The two-homes model (Figma owns half the lifecycle, docs site owns the other half) is unusual. Most big design systems have a single home — the docs site is the spec, code is the implementation, and the Figma file is downstream of both (or even auto-generated from them).</p>
        <h5>What this would look like</h5>
        <p>A short callout on this page that acknowledges the difference:</p>
        <p>{'"'}Most design systems treat the documentation site as the single source of truth. We split it: Figma owns design while it{"'"}s still in motion (Red and Orange), the docs site owns the finished design (Yellow, Green, Black). This works for a small team where most of the design work happens in Figma — but if you{"'"}re coming from Material, Polaris, or Carbon, expect to look in two places during the early stages of a component.{'"'}</p>
      </div>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>If we adopted all five</h3>
      <p className="sg-subsection-desc">The stoplight would look like this — four stages instead of five, with a Beta badge that can sit on top of Green:</p>

      <div className="sg-dp-flow">
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--orange"></span>Orange — In Progress</span>
        <span className="sg-dp-flow-arrow">→</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--yellow"></span>Yellow — In Review</span>
        <span className="sg-dp-flow-arrow">→</span>
        <span className="sg-dp-flow-node">
          <span className="sg-dp-swatch sg-dp-swatch--green"></span>Green — Production
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', marginLeft: '6px', background: 'var(--uds-color-surface-info-subtle)', color: 'var(--uds-color-text-info)', borderRadius: 'var(--uds-border-radius-container-full)', fontSize: 'var(--uds-font-size-xs)', fontWeight: 'var(--uds-font-weight-bold)' }}>
            <span className="sg-dp-swatch sg-dp-swatch--beta" style={{ width: '10px', height: '10px' }}></span>Beta
          </span>
        </span>
        <span className="sg-dp-flow-arrow">⤳</span>
        <span className="sg-dp-flow-node"><span className="sg-dp-swatch sg-dp-swatch--black"></span>Black — Deprecated</span>
        <span className="sg-dp-flow-caption">Early sketches stay private (no Red). Storybook is tracked on the Green checklist. Backward moves need a written reason.</span>
      </div>

      <p className="sg-subsection-desc" style={{ marginTop: 'var(--uds-space-200)' }}>Concrete changes from the proposal in Part 1:</p>
      <ul className="sg-dp-loclist">
        <li><strong>Stages drop from five to four:</strong> In Progress, In Review, Production (with optional Beta), Deprecated</li>
        <li><strong>Red goes away.</strong> Early sketches happen in private Figma files, not in the design system</li>
        <li><strong>A {'"'}Beta{'"'} badge</strong> can sit on Green for components that are usable but not yet locked</li>
        <li><strong>Green{"'"}s checklist gains:</strong> {'"'}Storybook implementation exists and matches the spec{'"'}</li>
        <li><strong>Backward moves require a short reason</strong> that{"'"}s visible on the component page</li>
        <li><strong>This page</strong> adds the {'"'}how this differs from most design systems{'"'} note so newcomers aren{"'"}t confused</li>
      </ul>

      <h3 className="sg-subsection-title" style={{ marginTop: 'var(--uds-space-400)' }}>Open for discussion</h3>
      <p className="sg-subsection-desc">This page captures both the proposal and the comparison side-by-side so they can be debated together. Resolved decisions will land either as edits to this page or as a real change to the live system. Until then, what{"'"}s running today hasn{"'"}t changed.</p>

      <div className="sg-dp-xref">
        <strong>Related:</strong>{' '}
        <Link href="/about">About UDS</Link> · <Link href="/cursor-workflows">Cursor Workflows</Link> for the under-the-hood mechanics if you{"'"}re curious how the assistant handles status changes, syncs, and changelog updates.
      </div>
    </div>
  );
}
