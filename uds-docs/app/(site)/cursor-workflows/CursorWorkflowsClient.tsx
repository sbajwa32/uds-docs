'use client';

// Ported from docs/pages/cursor-workflows.html during Chunk 06d.
// Converted from dangerouslySetInnerHTML to native JSX.
//
// Page-local styles are imported once from the site layout.
// Body sliced into: intro (pre-tab sections), 6 tab panels, and an outro
// (final callout). Tab strip uses DocsTabs/DocsTab/DocsTabPanel from
// Chunk 04.

import { useState } from 'react';

import { DocsTab, DocsTabPanel, DocsTabs } from '@/components/site/ui';
import { DocsBadge, DocsCard, DocsPageHeader, DocsSection } from '@/components/site/ui';


type TabKey = 'workflows' | 'rules' | 'skills' | 'subagents' | 'audits' | 'add';

const TABS: { value: TabKey; label: string }[] = [
  { value: 'workflows', label: 'Workflows' },
  { value: 'rules', label: 'Rules' },
  { value: 'skills', label: 'Skills' },
  { value: 'subagents', label: 'Subagents' },
  { value: 'audits', label: 'CI Audits' },
  { value: 'add', label: 'Add your own' },
];

export function CursorWorkflowsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('workflows');

  return (
    <>
      {/* ================================================================
          INTRO — title + page desc
          ================================================================ */}
      <DocsPageHeader
        title="Cursor Workflows"
        description={
          <>
            This site asks Cursor to do most of the design-system housekeeping &mdash; bumping
            versions, syncing Figma, writing changelogs, rebuilding release notes. You type a
            plain-English prompt; Cursor picks the right tool. This page is the map: what&apos;s in
            the toolbox, what each tool does, and which prompts trigger what.
          </>
        }
      />

      {/* ================================================================
          QUICK START — "Say this, get that"
          ================================================================ */}
      <DocsSection
        className="sg-cw-section"
        level={3}
        title={<>Say this &mdash; get that</>}
        description={
          <>
            The most common prompts and what they trigger. Type them in Cursor chat &mdash; you
            don&apos;t need to memorize skill names or workflows.
          </>
        }
      >
        <div className="sg-cw-section-eyebrow">
          <DocsBadge tone="brand">
            <span className="material-symbols-outlined">bolt</span>
            Quick start
          </DocsBadge>
        </div>
        <div className="sg-cw-prompts">
          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;UDS updated&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Bring the docs site up to a new Figma release.</strong>Reads both Figma files, applies safe updates, asks before anything risky, and rebuilds the release notes in Figma.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <a href="#wf-release">Workflow&nbsp;1</a>
              <code>uds-updated</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Sync nav-header from Figma&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Pull one component&apos;s latest Figma into the docs.</strong>Deep-inspects the Figma component, updates the spec / CSS / examples, writes a per-component changelog entry, rebuilds Figma release notes.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <a href="#wf-component-sync">Workflow&nbsp;2</a>
              <code>sync-figma-component-spec</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Add a tooltip component&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Scaffold a brand-new component end to end.</strong>Creates the folder, every required file, the sidebar link, the docs-page placeholder, and a starter changelog entry.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <a href="#wf-new-component">Workflow&nbsp;3</a>
              <code>new-component</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Build the Figma page for Button&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Generate the canonical seven-card component canvas in Figma.</strong>Builds Header / Anatomy / Variants / Sub-components / Usage / Accessibility / Meta cards from the spec data, all token-bound.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <code>figma-component-card</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Lab me an Avatar&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Start a code-first draft playground.</strong>Creates a hidden dev route where you can preview and tune a component idea before recreating it in Figma.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <code>uds-component-lab</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Factory me an Avatar&quot;</div>
            <p className="sg-cw-prompt-body"><strong>Draft a new UDS component directly in Figma.</strong>Builds a token-bound component set on a brand-new draft page. You accept it by renaming the page; the docs site catches up on the next &quot;UDS updated.&quot;</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <code>generate-uds-figma-component</code>
            </div>
          </DocsCard>

          <DocsCard className="sg-cw-prompt" elevated>
            <div className="sg-cw-prompt-say"><span className="material-symbols-outlined">chat</span>&quot;Audit our specs&quot;</div>
            <p className="sg-cw-prompt-body"><strong>See which components have the most spec gaps.</strong>Returns a completeness report &mdash; same scoring as the &quot;Spec X/22&quot; pill &mdash; with the three highest-impact fields to fill in next per component.</p>
            <div className="sg-cw-prompt-uses">
              <span className="sg-cw-prompt-uses-label">Uses</span>
              <code>spec-audit</code>
            </div>
          </DocsCard>
        </div>
      </DocsSection>

      {/* ================================================================
          CONCEPT PRIMER — Rule / Skill / Subagent / Audit
          ================================================================ */}
      <DocsSection
        className="sg-cw-section"
        level={3}
        title={<>What&apos;s in the toolbox</>}
        description="Four kinds of guidance, ordered from always-on background discipline to called-on-demand specialists to enforced-by-CI safety nets. Each kind lives in its own folder and plays a different role."
      >
        <div className="sg-cw-section-eyebrow">
          <DocsBadge tone="brand">
            <span className="material-symbols-outlined">map</span>
            Concept primer
          </DocsBadge>
        </div>
        <div className="sg-cw-concepts">
          <div className="sg-cw-concept-shell" data-type="rule">
            <DocsCard className="sg-cw-concept">
              <div className="sg-cw-concept-icon"><span className="material-symbols-outlined">policy</span></div>
              <h4 className="sg-cw-concept-name">Rule</h4>
              <p className="sg-cw-concept-body">A standing instruction Cursor reads on every relevant task. Sets the project&apos;s discipline.</p>
              <p className="sg-cw-concept-analogy">Like &quot;always wear a seatbelt.&quot;</p>
              <div className="sg-cw-concept-meta">
                <code>.cursor/rules/</code>
                <span className="sg-cw-concept-count">20</span>
              </div>
            </DocsCard>
          </div>

          <div className="sg-cw-concept-shell" data-type="skill">
            <DocsCard className="sg-cw-concept">
              <div className="sg-cw-concept-icon"><span className="material-symbols-outlined">menu_book</span></div>
              <h4 className="sg-cw-concept-name">Skill</h4>
              <p className="sg-cw-concept-body">A how-to procedure Cursor loads on demand when your prompt matches. Cursor itself follows the steps.</p>
              <p className="sg-cw-concept-analogy">Like &quot;how to change a tire &mdash; read the manual when you need it.&quot;</p>
              <div className="sg-cw-concept-meta">
                <code>.cursor/skills/</code>
                <span className="sg-cw-concept-count">10</span>
              </div>
            </DocsCard>
          </div>

          <div className="sg-cw-concept-shell" data-type="subagent">
            <DocsCard className="sg-cw-concept">
              <div className="sg-cw-concept-icon"><span className="material-symbols-outlined">support_agent</span></div>
              <h4 className="sg-cw-concept-name">Subagent</h4>
              <p className="sg-cw-concept-body">A specialist contractor. Spawns in its own context, does its job, returns one structured report, then disappears.</p>
              <p className="sg-cw-concept-analogy">Like &quot;call the mechanic.&quot;</p>
              <div className="sg-cw-concept-meta">
                <code>.cursor/agents/</code>
                <span className="sg-cw-concept-count">7</span>
              </div>
            </DocsCard>
          </div>

          <div className="sg-cw-concept-shell" data-type="audit">
            <DocsCard className="sg-cw-concept">
              <div className="sg-cw-concept-icon"><span className="material-symbols-outlined">verified</span></div>
              <h4 className="sg-cw-concept-name">CI Audit</h4>
              <p className="sg-cw-concept-body">A bash script that runs on every PR. Failing audits block merge. Catches the failure modes humans and agents skip.</p>
              <p className="sg-cw-concept-analogy">Like the MOT inspection.</p>
              <div className="sg-cw-concept-meta">
                <code>scripts/audit-*.sh</code>
                <span className="sg-cw-concept-count">12</span>
              </div>
            </DocsCard>
          </div>
        </div>
      </DocsSection>

      {/* ================================================================
          TABBED CATALOG
          ================================================================ */}
      <DocsSection
        className="sg-cw-section"
        level={3}
        title="The whole toolchain"
        description="Browse by category. Workflows show the end-to-end flows Cursor stitches together. The other tabs list every rule, skill, subagent, and audit individually."
      >
        <div className="sg-cw-section-eyebrow">
          <DocsBadge tone="brand">
            <span className="material-symbols-outlined">explore</span>
            Catalog
          </DocsBadge>
        </div>
        <DocsTabs
          activeTab={activeTab}
          onActiveTabChange={(v) => setActiveTab(v as TabKey)}
          ariaLabel="Toolchain catalog"
        >
          {TABS.map((t) => (
            <DocsTab key={t.value} value={t.value}>{t.label}</DocsTab>
          ))}

          {/* ============================================================
              TAB PANEL: Workflows
              ============================================================ */}
          <DocsTabPanel value="workflows">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-250)' }}>Four end-to-end flows the toolchain supports, from biggest scope (a new UDS release) to smallest (one component fix). Orchestrator skills tie multiple steps together; the specialist skills inside can also be invoked on their own.</p>

            {/* WORKFLOW 1: UDS release */}
            <div id="wf-release" className="sg-cw-workflow-anchor">
              <DocsCard className="sg-cw-workflow" elevated>
              <header className="sg-cw-workflow-header">
                <span className="sg-cw-workflow-num">1</span>
                <div className="sg-cw-workflow-titles">
                  <h4 className="sg-cw-workflow-name">UDS version release</h4>
                  <p className="sg-cw-workflow-summary">Figma <code style={{ fontFamily: 'monospace', fontSize: '0.92em' }}>UDS Version: X.Y</code> page bumps and the user confirms a release. The biggest flow &mdash; touches every Figma file, every changed component, both release-note frames, and the SITE build.</p>
                </div>
                <div className="sg-cw-workflow-stats">
                  <span className="sg-cw-workflow-stat"><strong>8</strong> steps</span>
                  <span className="sg-cw-workflow-stat"><strong>10</strong> audits gate it</span>
                </div>
              </header>

              <div className="sg-cw-workflow-triggers">
                <span className="sg-cw-workflow-triggers-label"><span className="material-symbols-outlined">chat</span>Triggers</span>
                <span className="sg-cw-trigger">&quot;UDS updated&quot;</span>
                <span className="sg-cw-trigger">&quot;Figma updated&quot;</span>
                <span className="sg-cw-trigger">&quot;sync UDS from Figma&quot;</span>
              </div>

              <ol className="sg-cw-steps">
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">1</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Preflight</h5>
                    <p className="sg-cw-step-desc">Confirms Figma is readable, then walks both files to find the version bump, status changes, new components, and renamed components.</p>
                    <div className="sg-cw-step-uses"><code>figma-capability-check</code><code>figma-inventory</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">2</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Token audit</h5>
                    <p className="sg-cw-step-desc">Direct read of every Figma Variable. Reports added / removed / renamed tokens, value changes per mode, and alias-graph validity.</p>
                    <div className="sg-cw-step-uses"><code>figma-token-audit</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">3</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Component inspections</h5>
                    <p className="sg-cw-step-desc">For each changed component: a deep node-tree, variant-matrix, token-binding, and accessibility read &mdash; compared against the docs-site spec.</p>
                    <div className="sg-cw-step-uses"><code>figma-component-inspector</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">4</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Snapshot release</h5>
                    <p className="sg-cw-step-desc">Archives the current <code>uds/</code> folder into <code>versions/&lt;old&gt;/uds/</code>, bumps <code>uds/version.json</code>, refreshes manifests.</p>
                    <div className="sg-cw-step-uses"><code>release.sh</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">5</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Apply safe changes</h5>
                    <p className="sg-cw-step-desc">High-confidence non-breaking changes apply automatically. Anything risky stops for explicit user confirmation.</p>
                    <div className="sg-cw-step-uses"><code>import-figma-tokens</code><code>sync-figma-component-spec</code><code>sync-figma-component-status</code><code>link-figma-nodes</code><code>new-component</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">6</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Re-check contrast</h5>
                    <p className="sg-cw-step-desc">Rebuilds the aggregated changelog and component manifest, then reviews token pairings in the Contrast Checker across all six themes.</p>
                    <div className="sg-cw-step-uses"><code>aggregate-changelog.sh</code><code>aggregate-components.sh</code><code>/contrast-checker</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">7</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Figma release notes</h5>
                    <p className="sg-cw-step-desc">Rebuilds the <code>Release Notes</code> frame on the current version page in BOTH Figma files. The two files always end up with identical text.</p>
                    <div className="sg-cw-step-uses"><code>sync-figma-release-notes</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">8</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Docs changelog</h5>
                    <p className="sg-cw-step-desc">Bumps the SITE build counter, appends the SITE changelog entry, cache-busts what changed, pushes to <code>main</code>. GitHub Actions deploys to GH Pages.</p>
                    <div className="sg-cw-step-uses"><code>SITE_CHANGELOG</code></div>
                  </div>
                </li>
              </ol>

              <div className="sg-cw-workflow-footer">
                <div className="sg-cw-workflow-audits">
                  <span className="sg-cw-workflow-audits-label"><span className="material-symbols-outlined">verified_user</span>Audits that gate the merge</span>
                  <code>audit-component-completeness</code><code>audit-placeholders</code><code>audit-token-usage</code><code>audit-demo-coverage</code><code>audit-changelog-currency</code><code>audit-aggregate-currency</code><code>audit-figma-sync-state-currency</code><code>audit-css-api-table</code><code>audit-doc-internal-consistency</code><code>audit-agent-docs-currency</code>
                </div>
                <details className="sg-cw-details">
                  <summary>What gets touched, end to end</summary>
                  <div className="sg-cw-details-body">
                    Every file under <code>uds/components/&lt;id&gt;/</code> for the changed components, all <code>uds/tokens/*.css</code>, <code>uds/CHANGELOG.json</code>, <code>uds/components.json</code>, <code>uds/version.json</code>, <code>versions.json</code> plus a new <code>versions/&lt;old&gt;/uds/</code> snapshot, <code>.cursor/figma/state/</code> snapshot files, the <strong>Release Notes</strong> frame in BOTH Figma files, and <code>uds-docs/data/site-changelog.ts</code>.
                  </div>
                </details>
              </div>
              </DocsCard>
            </div>

            {/* WORKFLOW 2: Mid-release component sync */}
            <div id="wf-component-sync" className="sg-cw-workflow-anchor">
              <DocsCard className="sg-cw-workflow" elevated>
              <header className="sg-cw-workflow-header">
                <span className="sg-cw-workflow-num">2</span>
                <div className="sg-cw-workflow-titles">
                  <h4 className="sg-cw-workflow-name">Mid-release component sync</h4>
                  <p className="sg-cw-workflow-summary">One or a few components get a fresh Figma read between releases. No version bump &mdash; just the changed components, their changelog entries, and a Figma release-notes refresh.</p>
                </div>
                <div className="sg-cw-workflow-stats">
                  <span className="sg-cw-workflow-stat"><strong>6</strong> steps</span>
                  <span className="sg-cw-workflow-stat"><strong>4</strong> audits gate it</span>
                </div>
              </header>

              <div className="sg-cw-workflow-triggers">
                <span className="sg-cw-workflow-triggers-label"><span className="material-symbols-outlined">chat</span>Triggers</span>
                <span className="sg-cw-trigger">&quot;sync nav-header from Figma&quot;</span>
                <span className="sg-cw-trigger">&quot;&lt;component&gt; renamed in Figma&quot;</span>
              </div>

              <ol className="sg-cw-steps">
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">1</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Deep inspect</h5>
                    <p className="sg-cw-step-desc">Locates the canonical Figma component set, walks the node tree, captures variants and token bindings, classifies every finding by confidence and risk.</p>
                    <div className="sg-cw-step-uses"><code>figma-component-inspector</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">2</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Apply spec sync</h5>
                    <p className="sg-cw-step-desc">Updates the spec, CSS, examples, impl, and playground for every high-confidence non-breaking finding. Stops on anything risky.</p>
                    <div className="sg-cw-step-uses"><code>sync-figma-component-spec</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">3</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Per-component changelog</h5>
                    <p className="sg-cw-step-desc">Adds an entry to that component&apos;s <code>changelog.json</code> for the current UDS version, then runs the aggregator to refresh the global changelog.</p>
                    <div className="sg-cw-step-uses"><code>aggregate-changelog.sh</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">4</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Update sync-state snapshot</h5>
                    <p className="sg-cw-step-desc">Records the captured Figma node IDs, variant matrix, and nested instances so the next sync can diff against this run.</p>
                    <div className="sg-cw-step-uses"><code>.cursor/figma/state/</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">5</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Figma release notes</h5>
                    <p className="sg-cw-step-desc">Mandatory whenever the global changelog changes &mdash; rebuilds the <code>Release Notes</code> frame on the current version page in both Figma files.</p>
                    <div className="sg-cw-step-uses"><code>sync-figma-release-notes</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">6</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Docs changelog</h5>
                    <p className="sg-cw-step-desc">Appends a SITE changelog entry describing the sync. Cloudflare and Next.js handle cache invalidation on deploy.</p>
                    <div className="sg-cw-step-uses"><code>SITE_CHANGELOG</code></div>
                  </div>
                </li>
              </ol>

              <div className="sg-cw-workflow-footer">
                <div className="sg-cw-workflow-audits">
                  <span className="sg-cw-workflow-audits-label"><span className="material-symbols-outlined">verified_user</span>Audits that hard-fail if any step is skipped</span>
                  <code>audit-changelog-currency</code><code>audit-aggregate-currency</code><code>audit-figma-sync-state-currency</code><code>audit-css-api-table</code>
                </div>
                <details className="sg-cw-details">
                  <summary>What gets touched, end to end</summary>
                  <div className="sg-cw-details-body">
                    The one or few <code>uds/components/&lt;id&gt;/</code> folders being synced, <code>uds/CHANGELOG.json</code>, <code>.cursor/figma/state/components.snapshot.json</code> + <code>last-sync.json</code>, the <strong>Release Notes</strong> frames in BOTH Figma files, and <code>uds-docs/data/site-changelog.ts</code>.
                  </div>
                </details>
              </div>
              </DocsCard>
            </div>

            {/* WORKFLOW 3: New component */}
            <div id="wf-new-component" className="sg-cw-workflow-anchor">
              <DocsCard className="sg-cw-workflow" elevated>
              <header className="sg-cw-workflow-header">
                <span className="sg-cw-workflow-num">3</span>
                <div className="sg-cw-workflow-titles">
                  <h4 className="sg-cw-workflow-name">Add a new component</h4>
                  <p className="sg-cw-workflow-summary">Scaffold a brand-new component on the docs site &mdash; folder, files, sidebar link, page placeholder, starter changelog entry. The component starts at <em>placeholder</em> status; the spec fills in over time.</p>
                </div>
                <div className="sg-cw-workflow-stats">
                  <span className="sg-cw-workflow-stat"><strong>4</strong> steps</span>
                </div>
              </header>

              <div className="sg-cw-workflow-triggers">
                <span className="sg-cw-workflow-triggers-label"><span className="material-symbols-outlined">chat</span>Triggers</span>
                <span className="sg-cw-trigger">&quot;add a tooltip component&quot;</span>
                <span className="sg-cw-trigger">&quot;scaffold a new pagination component&quot;</span>
                <span className="sg-cw-trigger">&quot;new component called X&quot;</span>
              </div>

              <ol className="sg-cw-steps">
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">1</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Scaffold the folder</h5>
                    <p className="sg-cw-step-desc">Creates the new <code>uds/components/&lt;id&gt;/</code> folder with every required file: CSS stub, spec.json, status.json, changelog.json with the initial &quot;added&quot; entry, impl.json, playground.js, examples/.</p>
                    <div className="sg-cw-step-uses"><code>new-component</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">2</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Wire into the docs site</h5>
                    <p className="sg-cw-step-desc">Adds the sidebar link, the page placeholder, the component CSS import, and (if interactive) the JS registration.</p>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">3</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Refresh manifests</h5>
                    <p className="sg-cw-step-desc">Aggregates the new component into <code>components.json</code> and folds its starter changelog entry into <code>CHANGELOG.json</code>.</p>
                    <div className="sg-cw-step-uses"><code>aggregate-components.sh</code><code>aggregate-changelog.sh</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">4</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Docs changelog</h5>
                    <p className="sg-cw-step-desc">Appends a SITE changelog entry announcing the new component. Cloudflare and Next.js handle cache invalidation on deploy.</p>
                    <div className="sg-cw-step-uses"><code>SITE_CHANGELOG</code></div>
                  </div>
                </li>
              </ol>

              <div className="sg-cw-workflow-footer">
                <details className="sg-cw-details">
                  <summary>What gets touched, end to end</summary>
                  <div className="sg-cw-details-body">
                    A brand-new <code>uds/components/&lt;id&gt;/</code> folder, <code>uds/components.json</code>, <code>uds/CHANGELOG.json</code>, and <code>uds-docs/data/site-changelog.ts</code>. The implementation (CSS, behavior) lands in the <code>@uds/web-components</code> package as a new <code>&lt;udc-id&gt;</code> custom element. Status starts at <em>placeholder</em>; spec completeness rises as the designer fills in fields. No Figma release-notes sync needed unless the addition lands as part of a UDS release.
                  </div>
                </details>
              </div>
              </DocsCard>
            </div>

            {/* WORKFLOW 4: Single component edit */}
            <div id="wf-component-edit" className="sg-cw-workflow-anchor">
              <DocsCard className="sg-cw-workflow" elevated>
              <header className="sg-cw-workflow-header">
                <span className="sg-cw-workflow-num">4</span>
                <div className="sg-cw-workflow-titles">
                  <h4 className="sg-cw-workflow-name">Single component edit</h4>
                  <p className="sg-cw-workflow-summary">Smallest scope &mdash; one component&apos;s CSS, examples, or playground gets adjusted. Often a Figma-comment follow-up or an a11y review fix. Per-component changelog is still mandatory.</p>
                </div>
                <div className="sg-cw-workflow-stats">
                  <span className="sg-cw-workflow-stat"><strong>4</strong> steps</span>
                </div>
              </header>

              <div className="sg-cw-workflow-triggers">
                <span className="sg-cw-workflow-triggers-label"><span className="material-symbols-outlined">chat</span>Triggers</span>
                <span className="sg-cw-trigger">&quot;fix the bento chevron color&quot;</span>
                <span className="sg-cw-trigger">&quot;tighten button padding&quot;</span>
              </div>

              <ol className="sg-cw-steps">
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">1</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Source-of-truth check</h5>
                    <p className="sg-cw-step-desc">Any edit under <code>uds-docs/uds/</code> has to come from Figma (or revert toward Figma parity). Cursor cites the Figma read first; it won&apos;t apply an audit-detected &quot;fix&quot; on its own.</p>
                    <div className="sg-cw-step-uses"><code>uds-source-of-truth</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">2</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Edit the file</h5>
                    <p className="sg-cw-step-desc">Change only the targeted file in <code>uds/components/&lt;id&gt;/</code>. Token-first CSS only &mdash; no raw hex / sizes / spacing.</p>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">3</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Per-component changelog</h5>
                    <p className="sg-cw-step-desc">Adds an entry to that component&apos;s <code>changelog.json</code> describing the fix; the aggregator picks it up.</p>
                    <div className="sg-cw-step-uses"><code>aggregate-changelog.sh</code></div>
                  </div>
                </li>
                <li className="sg-cw-step">
                  <span className="sg-cw-step-num">4</span>
                  <div className="sg-cw-step-body">
                    <h5 className="sg-cw-step-title">Docs changelog &amp; release notes</h5>
                    <p className="sg-cw-step-desc">Appends the SITE changelog entry. If the global changelog actually changed, Figma release notes rebuild too.</p>
                    <div className="sg-cw-step-uses"><code>SITE_CHANGELOG</code><code>sync-figma-release-notes</code></div>
                  </div>
                </li>
              </ol>

              <div className="sg-cw-workflow-footer">
                <details className="sg-cw-details">
                  <summary>What gets touched, end to end</summary>
                  <div className="sg-cw-details-body">
                    One source file under <code>uds/components/&lt;id&gt;/</code>, that component&apos;s <code>changelog.json</code>, <code>uds/CHANGELOG.json</code>, plus <code>uds-docs/data/site-changelog.ts</code>. Skip the per-component changelog entry and <code>audit-changelog-currency</code> blocks the merge.
                  </div>
                </details>
              </div>
              </DocsCard>
            </div>
          </DocsTabPanel>

          {/* ============================================================
              TAB PANEL: Rules
              ============================================================ */}
          <DocsTabPanel value="rules">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-300)' }}>20 rules total &mdash; 8 always-on (loaded into Cursor&apos;s context on every task) and 12 glob-scoped (loaded only when files matching the rule&apos;s glob are in context, or when a skill explicitly references the rule).</p>

            {/* ALWAYS-ON RULES */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Always-on</h4>
                <span className="sg-cw-group-count">8</span>
              </header>
              <p className="sg-cw-group-desc">Loaded on every task. These set the project&apos;s standing discipline.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-source-of-truth</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">The hardest rule: <code>uds-docs/uds/</code> is Figma&apos;s source of truth. Cursor won&apos;t edit anything in there in response to audit findings or &quot;obvious fixes&quot; &mdash; only the named Figma-sync skills (or an explicit user-directed revert) may write there.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-source-of-truth.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-master-preflight</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">The five-phase workflow every change has to follow: <em>sync first → source-of-truth check → bump → change → finalize</em>. Phase 5 holds the canonical round-trip checklist every Figma-sync skill points back at.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-master-preflight.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-site-changelog</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">Every change under <code>uds-docs/</code> bumps the SITE version, adds a <code>SITE_CHANGELOG</code> entry, and cache-busts whatever files changed. The entry itself is designer voice, not implementation log &mdash; one to three sentences, lead with what changed, technical names only when the reader needs them.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-site-changelog.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-content-schema</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">Component spec content lives in per-component <code>spec.json</code> and gets rendered by the Guidelines tab. Never re-introduce spec HTML into <code>index.html</code>.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-content-schema.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-release-workflow</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">The release questionnaire and automated release steps &mdash; snapshot, status sync, changelog, token regen, Figma release notes, SITE bump. The Changelog Sync Rule also fires whenever the global changelog changes mid-release.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-release-workflow.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-write-safety</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">Figma writes are denied by default. Only four scopes ever apply: release-notes frames, status page prefixes, cover-page version text, and component drafts on a <code>{'{Cursor}{Ignore}'}</code> page. Every write produces a before / after / rollback summary.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-write-safety.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-change-classification</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">Every finding pulled from Figma has to land with a confidence (high / medium / low), a risk class (non-breaking / potentially-breaking / destructive), and a default action. Only high-confidence + non-breaking auto-applies; everything else asks.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-change-classification.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">communication-style</code><span className="sg-cw-pill sg-cw-pill--always"><span className="material-symbols-outlined">visibility</span>Always on</span></header>
                  <p className="sg-cw-card-body">How Cursor should talk to you and write docs prose. Default tone: senior designer, not developer &mdash; concise, plain language, jargon only when it&apos;s the clearest word. SITE_CHANGELOG entries fall under designer voice now. Technical voice stays non-negotiable for code, schemas, per-component changelogs, audits, commits, PR descriptions, and the <code>.cursor/</code> files themselves.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/communication-style.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>
              </div>
            </div>

            {/* GLOB-SCOPED RULES */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Glob-scoped</h4>
                <span className="sg-cw-group-count">13</span>
              </header>
              <p className="sg-cw-group-desc">Loaded only when files matching the rule&apos;s glob are in context, or when a skill explicitly references the rule.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-token-first-css</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">uds/**/*.css</span></span></header>
                  <p className="sg-cw-card-body">Bans hardcoded colors, spacing, fonts, and radii. Use <code>var(--uds-*)</code>.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-token-first-css.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-token-architecture</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">uds/tokens/**/*.css</span></span></header>
                  <p className="sg-cw-card-body">The canonical token architecture and CSS output contract. Direct Figma Variables reads are primary; ZIP exports are fallback only. Also defines the required <code>figma-token-audit</code> report shape.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-token-architecture.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-preflight</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on any task</span></header>
                  <p className="sg-cw-card-body">Required preflight for any Figma read or write. Owns the canonical Figma file-keys table and the stoplight → status mapping; other rules cross-reference these.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-preflight.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-component-inspection</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">uds-docs/**</span></span></header>
                  <p className="sg-cw-card-body">Prevents screenshot-based guessing. Requires a node-tree + variant + token-binding + nested-instance + accessibility read before any component spec update. Bidirectional &mdash; also enumerates doc-side artifacts and diffs against the last snapshot so deletions and renames can&apos;t go silent.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-component-inspection.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-sync-state</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">.cursor/figma/**</span></span></header>
                  <p className="sg-cw-card-body">Defines what counts as a valid sync snapshot under <code>.cursor/figma/state/</code> and when an agent may update one. Snapshots only get written after a successful verified sync &mdash; never in dry-run mode.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-sync-state.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-component-checklist</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">uds-docs/**</span></span></header>
                  <p className="sg-cw-card-body">The required file list per component folder plus the pre-commit gate of audit scripts. The <code>new-component</code> skill uses this as its &quot;what does complete look like&quot; definition.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-component-checklist.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-component-card</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on card-skill files</span></header>
                  <p className="sg-cw-card-body">The canonical seven-card layout for component pages in the UDS Components Figma file. Used by the card-builder skill and its audit subagent.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-component-card.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-component-card-update</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on card-skill files</span></header>
                  <p className="sg-cw-card-body">Update-mode companion to the card layout rule. Defines drift detection, no-op when in sync, and the no-content-loss inventory-then-rebuild contract when the builder is re-run on an existing page.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-component-card-update.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-rule-discipline</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on <span className="sg-cw-scope">.cursor/**</span></span></header>
                  <p className="sg-cw-card-body">Fires whenever you edit a rule, skill, or subagent file. Bump that file&apos;s <code>lastUpdated:</code> in its YAML frontmatter and refresh the matching row in <code>.cursor/TOOLCHAIN.md</code> in the same commit. The toolchain equivalent of the SITE changelog discipline.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-rule-discipline.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-plugin-api-gotchas</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on any task</span></header>
                  <p className="sg-cw-card-body">Plugin-API gotchas that bit the component factory once and would bite any other Figma write the same way: same-file vs library component identity, INSTANCE_SWAP defaults, hidden white auto-layout fills, resize-axis quirks, within-call propagation limits, all five auto-layout spacing properties needing to be bound (not just the two CSS-style horizontal/vertical pair &mdash; &quot;every side bound&quot; is the rule, not &quot;every side equal&quot;), and effects binding via <code>setEffectStyleIdAsync</code> rather than raw <code>node.effects</code> literals (which render fine but escape every bound-check audit).</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-plugin-api-gotchas.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-figma-factory-quality</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on factory skills</span></header>
                  <p className="sg-cw-card-body">Process gates for any factory-style Figma build: full state design contract up front; a machine-verified Phase C audit that must report unbound paints, per-side spacing bindings (all five auto-layout properties), effect-style bindings (every node where <code>effects.length &gt; 0</code>), and per-variant <code>INSTANCE_SWAP</code> defaults vs. the model&apos;s plan; a variant grid that reflects axis semantics; sensible visibility defaults; and a Phase B.0 dependency manifest before any write.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-figma-factory-quality.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-design-language</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on any task</span></header>
                  <p className="sg-cw-card-body">How every UDS component handles each state &mdash; interaction, validation, availability, selection. Covers focus-ring constructions, surface treatment scale, elevation, radius, density, and the Checked-vs-Selected-vs-Active naming. Factory builds source state visuals from this rule rather than re-deriving them.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-design-language.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-naming-conventions</code><span className="sg-cw-pill sg-cw-pill--scoped">Loads on any task</span></header>
                  <p className="sg-cw-card-body">The design-system-level naming framework. Locks the canonical vocabulary every UDS component reaches for across ten categories: states (Default / Hover / Pressed / Focus / Selected / Disabled / Loading / Error, plus Empty + Read-only when applicable, plus Checked + Current as reserved words), sizes (Small / Medium / Large), tones (Info / Success / Warning / Error / Neutral), emphasis (Primary / Secondary / Tertiary for ranked importance vs Bold / Default / Subtle for tuning loudness), parts of a component (Leading / Trailing, Header / Body / Footer), the state-vs-variant-vs-property litmus test, casing rules, component and subcomponent naming, and lifecycle status. Companion to <code>uds-design-language</code> &mdash; design-language covers <em>how things look</em>, this rule covers <em>what we call them</em>. Factory and <code>new-component</code> pick names from this framework rather than guessing from siblings.</p>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/rules/uds-naming-conventions.mdc" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>
              </div>
            </div>
          </DocsTabPanel>

          {/* ============================================================
              TAB PANEL: Skills
              ============================================================ */}
          <DocsTabPanel value="skills">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-300)' }}>10 skills total &mdash; 4 orchestrators that stitch multiple steps together, and 6 specialist sync skills that orchestrators call (and that you can also invoke directly). Every sync skill ends by pointing at <code>uds-master-preflight</code> Phase 5 &mdash; the round-trip checklist lives in exactly one place.</p>

            {/* ORCHESTRATORS */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Orchestrators</h4>
                <span className="sg-cw-group-count">4</span>
              </header>
              <p className="sg-cw-group-desc">Top-level skills you invoke directly. They call other skills and subagents in sequence.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-updated</code><span className="sg-cw-pill sg-cw-pill--orch">Orchestrator</span></header>
                  <p className="sg-cw-card-body">End-to-end Figma → docs sync. Reads both Figma files, classifies findings (including surplus findings for doc-side artifacts with no Figma counterpart), applies high-confidence non-breaking changes, falls back to dry-run for everything else.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;UDS updated&quot;</span><span className="sg-cw-trigger">&quot;Figma updated&quot;</span><span className="sg-cw-trigger">&quot;sync UDS from Figma&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/uds-updated/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-component-card</code><span className="sg-cw-pill sg-cw-pill--orch">Orchestrator</span></header>
                  <p className="sg-cw-card-body">Builds the canonical seven-card layout on a UDS Components Figma page from <code>spec.json</code> data. Direction of data flow is code → Figma (opposite of every other Figma-sync skill).</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;build the Figma page for X&quot;</span><span className="sg-cw-trigger">&quot;regenerate the component cards&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/figma-component-card/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">uds-component-lab</code><span className="sg-cw-pill sg-cw-pill--orch">Orchestrator</span></header>
                  <p className="sg-cw-card-body">Starts a dev-only code draft for a component idea. It creates a hidden lab route for previewing states and variants, keeps the draft out of official UDS docs, and waits for explicit direction before promoting anything to Figma.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;Lab me an Avatar&quot;</span><span className="sg-cw-trigger">&quot;start a code-first lab for X&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/uds-component-lab/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">generate-uds-figma-component</code><span className="sg-cw-pill sg-cw-pill--orch">Orchestrator</span></header>
                  <p className="sg-cw-card-body">UDS Component Factory. Drafts a token-bound UDS component set directly inside Figma on a brand-new <code>🟠 &lt;Title&gt; {'{Cursor}{Ignore}'}</code> page. The <code>{'{Ignore}'}</code> marker takes the page out of every automation; the designer accepts by renaming the page. Stops at Figma &mdash; docs landing happens later via <code>uds-updated</code>.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;factory me an Avatar&quot;</span><span className="sg-cw-trigger">&quot;generate a UDS component for X&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/generate-uds-figma-component/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>
              </div>
            </div>

            {/* SPECIALIST SKILLS */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Specialist sync skills</h4>
                <span className="sg-cw-group-count">6</span>
              </header>
              <p className="sg-cw-group-desc">Called by orchestrators &mdash; or you can invoke them directly when you want just one piece of the flow.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">new-component</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Scaffolds a brand-new <code>uds/components/&lt;id&gt;/</code> folder end to end with every required file, the sidebar link, the page placeholder, and the SITE bump.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;add a component&quot;</span><span className="sg-cw-trigger">&quot;scaffold a new component called X&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/new-component/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">import-figma-tokens</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Regenerates the token CSS from a direct Figma Variables read. ZIP exports are fallback only. Updates the tokens snapshot and the last-sync marker.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;import tokens from Figma&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/import-figma-tokens/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">sync-figma-component-spec</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Updates one component&apos;s per-component files (spec, CSS, examples, impl, playground, figma notes) from a component-inspector report. Bidirectional &mdash; consumes the inspector&apos;s surplus + snapshot delta sections to propose removals as classified findings; the figma-notes section also auto-prunes resolved entries and adds new ones for open questions.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;sync &lt;component&gt; from Figma&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/sync-figma-component-spec/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">sync-figma-component-status</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Edits a component&apos;s <code>status.json</code> to match Figma&apos;s stoplight page prefix. Adds a per-component changelog entry. Backward moves from <em>review</em> or <em>production</em> ask before applying.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;sync component status&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/sync-figma-component-status/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">link-figma-nodes</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Populates <code>figmaNodeId</code> and <code>figmaPageNodeId</code> in <code>spec.json</code> from canonical Figma component-set and page nodes. Overwriting a non-null link asks first.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;populate missing figmaNodeId fields&quot;</span><span className="sg-cw-trigger">&quot;link X to Figma&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/link-figma-nodes/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">sync-figma-release-notes</code><span className="sg-cw-pill sg-cw-pill--sync">Sync skill</span></header>
                  <p className="sg-cw-card-body">Rebuilds the <code>Release Notes</code> frame on the current version page in both UDS Tokens and UDS Components Figma files from <code>uds/CHANGELOG.json</code>. The two files always end up identical.</p>
                  <div className="sg-cw-triggers"><span className="sg-cw-triggers-label">Try</span><span className="sg-cw-trigger">&quot;rebuild Figma release notes&quot;</span></div>
                  <footer className="sg-cw-card-foot"><a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/skills/sync-figma-release-notes/SKILL.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
                </DocsCard>
              </div>
            </div>
          </DocsTabPanel>

          {/* ============================================================
              TAB PANEL: Subagents
              ============================================================ */}
          <DocsTabPanel value="subagents">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-300)' }}>7 subagents, all read-only. Each spawns in its own isolated context window, does its job, returns one structured report, then disappears. That keeps noisy intermediate work out of the main conversation.</p>

            <div className="sg-cw-cards">
              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-capability-check</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Probes the Figma integration: which API tools work, what&apos;s actually readable. Returns a capability report covering pages, Variables, aliases, node trees, bound variables, and release-notes write support.</p>
                <footer className="sg-cw-card-foot">Run first in any Figma workflow.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-capability-check.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-token-audit</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Reads UDS Tokens Variables directly, validates the architecture, diffs against the last snapshot, reports added / removed / renamed tokens and value changes per mode.</p>
                <footer className="sg-cw-card-foot">Called by <code>uds-updated</code>, <code>import-figma-tokens</code>.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-token-audit.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-inventory</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Lists every Figma version, component page, status, component fingerprint. Spots new components, missing components, renamed components, and status mismatches against the docs site.</p>
                <footer className="sg-cw-card-foot">Called by <code>uds-updated</code>, release flow.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-inventory.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-component-inspector</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Deep-inspects one component end to end. Returns the variant matrix, anatomy, token bindings, hardcoded values, accessibility implications, doc-site mismatches, doc-site surplus, snapshot delta, and a Figma-notes evaluation. All three structured sections are mandatory.</p>
                <footer className="sg-cw-card-foot">Called by <code>uds-updated</code>, <code>sync-figma-component-spec</code>.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-component-inspector.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-spec-gap</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Compares Figma coverage against the docs site &mdash; missing docs, missing components, stale titles, status mismatches, new-component candidates.</p>
                <footer className="sg-cw-card-foot">Standalone audit; <code>link-figma-nodes</code> preflight.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-spec-gap.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">figma-component-card-audit</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Audits one (or all) UDS Components Figma component pages against the canonical card layout. Checks structure, token bindings, status pill, link cards, and content match against the spec.</p>
                <footer className="sg-cw-card-foot">Runs after <code>figma-component-card</code>.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/figma-component-card-audit.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>

              <DocsCard className="sg-cw-card">
                <header className="sg-cw-card-head"><code className="sg-cw-card-name">spec-audit</code><span className="sg-cw-pill sg-cw-pill--readonly"><span className="material-symbols-outlined">lock</span>Read-only</span></header>
                <p className="sg-cw-card-body">Scores spec completeness per component out of 22 &mdash; same scoring as the &quot;Spec X/22&quot; pill on each component page &mdash; and recommends the three highest-impact fields to fill in next.</p>
                <footer className="sg-cw-card-foot">Standalone; pre-release readiness check.<a className="sg-cw-card-link" href="https://github.com/sbajwa32/uds-docs/blob/main/.cursor/agents/spec-audit.md" target="_blank" rel="noopener noreferrer">Open file<span className="material-symbols-outlined">open_in_new</span></a></footer>
              </DocsCard>
            </div>
          </DocsTabPanel>

          {/* ============================================================
              TAB PANEL: CI Audits
              ============================================================ */}
          <DocsTabPanel value="audits">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-300)' }}>12 bash audits in <code>scripts/audit-*.sh</code>, wired into <code>.github/workflows/audits.yml</code>. They run on every PR and every push to <code>main</code>. Failing audits block merge. Three of them grandfather pre-existing drift via <code>scripts/audit-baseline.json</code>. Contrast validation lives in the Contrast Checker tool (<code>/contrast-checker</code>), not CI.</p>

            {/* PRE-EXISTING AUDITS */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Pre-existing audits</h4>
                <span className="sg-cw-group-count">4</span>
              </header>
              <p className="sg-cw-group-desc">Lived on the repo from early on. Catch the most basic completeness and convention violations.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-component-completeness</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Every <code>uds/components/&lt;id&gt;/</code> folder has the required minimum files: CSS, schema-valid <code>spec.json</code>, <code>status.json</code>, <code>changelog.json</code>, <code>impl.json</code>, <code>playground.js</code>, <code>examples/manifest.json</code>, at least one example HTML.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-placeholders</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Every <code>{'{{token}}'}</code> referenced in any example HTML is declared in <code>placeholder-vocabulary.json</code>. Keeps Demo Builder substitution deterministic.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-token-usage</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Every per-component CSS file uses <code>--uds-*</code> tokens. Flags hardcoded hex values.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-demo-coverage</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Every implementation-ready component has at least one example with <code>demoWeight &gt; 0</code> so the Demo Builder always has something to render.</p>
                </DocsCard>
              </div>
            </div>

            {/* PR2 + PR3 AUDITS */}
            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Drift-detection audits</h4>
                <span className="sg-cw-group-count">7</span>
              </header>
              <p className="sg-cw-group-desc">Introduced to hard-block the failure modes that produced the nav-header changelog, page-chrome, and sync-state issues. Each fails CI when its specific class of drift appears.</p>

              <div className="sg-cw-cards">
                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-changelog-currency</code><span className="sg-cw-pill sg-cw-pill--grand"><span className="material-symbols-outlined">history</span>Grandfathered</span></header>
                  <p className="sg-cw-card-body">For each component, fails if any commit after the baseline SHA touched source files (CSS / JS / spec / examples / impl / playground / status) without a matching <code>changelog.json</code> entry. Exempts commits whose message contains <code>[no-changelog: &lt;reason&gt;]</code>.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-aggregate-currency</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Re-runs the aggregators into temp files and diffs against the committed <code>uds/CHANGELOG.json</code> and <code>uds/components.json</code>. Catches &quot;edited per-component, forgot to aggregate.&quot;</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-figma-sync-state-currency</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">State-based check that each <code>spec.json</code> <code>figmaNodeId</code> and <code>figmaPageNodeId</code> matches the <code>components.snapshot.json</code> <code>componentSetNodeId</code> and <code>pageNodeId</code>.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-css-api-table</code><span className="sg-cw-pill sg-cw-pill--grand"><span className="material-symbols-outlined">history</span>Grandfathered</span></header>
                  <p className="sg-cw-card-body">For each component, regex-extracts <code>udc-*</code> selectors from the CSS and the codes from the hardcoded API table in <code>index.html</code>. Fails on either-direction drift. 10 components with pre-existing drift are tolerated via baseline; new drift fails.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-doc-internal-consistency</code><span className="sg-cw-pill sg-cw-pill--grand"><span className="material-symbols-outlined">history</span>Grandfathered</span></header>
                  <p className="sg-cw-card-body">Per-component doc-side coherence safety net &mdash; the partner of the inspector&apos;s surplus pass. Five checks: orphan CSS selectors, undispatched spec events, missing impl token refs, missing component pair refs, and orchestrator script entries pointing at missing files. Catches what partial cleanups leave behind.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-agent-docs-currency</code><span className="sg-cw-pill sg-cw-pill--grand"><span className="material-symbols-outlined">history</span>Grandfathered</span></header>
                  <p className="sg-cw-card-body">Compares the files under <code>.cursor/rules/</code>, <code>.cursor/skills/</code>, <code>.cursor/agents/</code> against the references on THIS docs page. Catches &quot;added / renamed / removed a rule, skill, or agent without updating the docs.&quot;</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-toolchain-currency</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Three bundled checks: every rule / skill / subagent file&apos;s frontmatter <code>lastUpdated:</code> is newer than its git mtime; every file has a row in <code>.cursor/TOOLCHAIN.md</code>; every row&apos;s date matches the file&apos;s frontmatter.</p>
                </DocsCard>

                <DocsCard className="sg-cw-card">
                  <header className="sg-cw-card-head"><code className="sg-cw-card-name">audit-figma-card-template</code><span className="sg-cw-pill sg-cw-pill--blocks"><span className="material-symbols-outlined">block</span>Blocks merge</span></header>
                  <p className="sg-cw-card-body">Verifies the component-card template constants used by the card builder skill stay in sync with the canonical layout rule.</p>
                </DocsCard>
              </div>
            </div>

            <div className="sg-cw-group">
              <header className="sg-cw-group-header">
                <h4 className="sg-cw-group-name">Baselines and exemptions</h4>
              </header>
              <p className="sg-cw-group-desc"><code>scripts/audit-baseline.json</code> is the single config file for any audit that grandfathers pre-existing drift. It holds:</p>
              <ul style={{ fontSize: 'var(--uds-font-size-sm)', color: 'var(--uds-color-text-secondary)', lineHeight: 1.6, paddingLeft: 'var(--uds-space-300)', marginTop: 'var(--uds-space-100)' }}>
                <li><strong><code>audit-changelog-currency</code></strong> &mdash; a <code>baseline</code> SHA. Commits before this SHA aren&apos;t checked. Update only on a deliberate sweep that backfills changelogs.</li>
                <li><strong><code>audit-css-api-table</code></strong> &mdash; a <code>toleratedComponents</code> array. Components in this list are exempted from the Code-tab table check. Add or remove only with explicit user direction.</li>
                <li><strong><code>audit-doc-internal-consistency</code></strong> &mdash; a <code>toleratedFindings</code> array of literal <code>comp/check/identifier</code> strings, plus <code>toleratedComponents</code> for whole-component skips. The goal is to drain the list as components get cleaned up.</li>
                <li><strong><code>audit-agent-docs-currency</code></strong> &mdash; a <code>baseline</code> SHA and an optional <code>toleratedFiles</code> array for internal-only rules / skills / agents that intentionally don&apos;t appear on this docs page.</li>
              </ul>
            </div>
          </DocsTabPanel>

          {/* ============================================================
              TAB PANEL: Add your own
              ============================================================ */}
          <DocsTabPanel value="add">
            <p className="sg-subsection-desc" style={{ marginBottom: 'var(--uds-space-300)' }}>All four kinds live in the repo and ship with anyone who clones it. Add one when the discipline you&apos;re following keeps getting forgotten &mdash; rules for standing instructions, skills for repeatable procedures, subagents for context-isolated work, audits for the safety net.</p>

            <div className="sg-cw-recipes">
              <DocsCard className="sg-cw-recipe">
                <h4><span className="material-symbols-outlined">policy</span>Add a Rule</h4>
                <ol>
                  <li>Drop a <code>.mdc</code> file in <code>.cursor/rules/</code> with YAML frontmatter (<code>description</code>, <code>alwaysApply: true</code> OR <code>globs: [...]</code>) and the rule body in markdown.</li>
                  <li>Use rules for standing instructions and project conventions &mdash; &quot;always do X,&quot; &quot;never use Y.&quot;</li>
                  <li>Add a card to this page&apos;s <strong>Rules</strong> tab. <code>audit-agent-docs-currency</code> blocks the merge otherwise.</li>
                </ol>
              </DocsCard>

              <DocsCard className="sg-cw-recipe">
                <h4><span className="material-symbols-outlined">menu_book</span>Add a Skill</h4>
                <ol>
                  <li>Create <code>.cursor/skills/&lt;name&gt;/SKILL.md</code> with frontmatter (<code>name</code>, <code>description</code>) and a step-by-step procedure. Optionally add <code>scripts/</code>, <code>references/</code>, or <code>assets/</code> subfolders.</li>
                  <li>Use skills for repeatable, well-defined procedures Cursor can carry out itself &mdash; &quot;scaffold X,&quot; &quot;sync Y.&quot;</li>
                  <li>Every sync skill should end with a pointer to <code>uds-master-preflight</code> Phase 5.</li>
                  <li>Add a card to this page&apos;s <strong>Skills</strong> tab.</li>
                </ol>
              </DocsCard>

              <DocsCard className="sg-cw-recipe">
                <h4><span className="material-symbols-outlined">support_agent</span>Add a Subagent</h4>
                <ol>
                  <li>Create <code>.cursor/agents/&lt;name&gt;.md</code> with frontmatter (<code>name</code>, <code>description</code>, optionally <code>readonly: true</code>, <code>model</code>).</li>
                  <li>Use subagents for tasks that benefit from context isolation &mdash; long research, parallel work, read-only audits.</li>
                  <li>Add a card to this page&apos;s <strong>Subagents</strong> tab.</li>
                </ol>
              </DocsCard>

              <DocsCard className="sg-cw-recipe">
                <h4><span className="material-symbols-outlined">verified</span>Add an Audit</h4>
                <ol>
                  <li>Create <code>scripts/audit-&lt;name&gt;.sh</code> following the patterns of existing audits &mdash; exit non-zero with a clear &quot;FAIL &mdash; &lt;reason&gt;&quot; line on failure; emit &quot;OK &mdash; &lt;summary&gt;&quot; on success.</li>
                  <li>Wire it into the <code>audits</code> job in <code>.github/workflows/audits.yml</code>.</li>
                  <li>If the audit needs grandfathering, extend <code>scripts/audit-baseline.json</code>.</li>
                  <li>Add a card to this page&apos;s <strong>CI Audits</strong> tab.</li>
                </ol>
              </DocsCard>
            </div>
          </DocsTabPanel>
        </DocsTabs>
      </DocsSection>

      {/* ================================================================
          FINAL CALLOUT — Why this matters for designers
          ================================================================ */}
      <div className="sg-cw-callout">
        <span className="material-symbols-outlined">stars</span>
        <div className="sg-cw-callout-body">
          <p className="sg-cw-callout-title">You don&apos;t have to memorize any of this</p>
          <p className="sg-cw-callout-text">Saying &quot;sync the bento dropdown from Figma,&quot; &quot;audit our specs,&quot; or &quot;scaffold a new tooltip component&quot; is enough. Cursor picks the right skill or subagent based on the description, the rules guarantee the version bump / per-component changelog / aggregate / snapshot / Figma release notes / cache-bust all land, and the CI audits hard-fail if anything is silently skipped. Less ceremony, fewer mistakes, more time on actual design.</p>
        </div>
      </div>
    </>
  );
}
