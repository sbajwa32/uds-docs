'use client';

// Page chrome for a component documentation page.
//
//   - SgPageTitle bound to spec.title.
//   - SgPageDesc bound to spec.description.
//   - HeaderLinks — Figma + Storybook + GitHub icon-buttons.
//   - ReadinessCard — two-row "Status" + "Spec" segmented bars (.sg-readiness
//     markup). Direct port of `renderComponentProgress()` from the legacy
//     app.js; the legacy CSS (styles/pages/legacy.css) is reused verbatim.

import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';
import { useEffect, useRef, useState } from 'react';
import type { ComponentSpec, ComponentStatus, ComponentChangelog } from '@/lib/uds-data';
import { STATUS_LABELS, STATUS_STEPS } from '@/data/status-labels';
import {
  COMPLETENESS_FIELDS,
  SPEC_FIELD_LABELS,
  type CompletenessField,
} from '@/data/completeness-fields';

const FIGMA_FILE_KEY = '1XJoUJgtNpw4R0IIT3VjoK'; // UDS Components — same as legacy app.js
const GITHUB_REPO = 'sbajwa32/uds-docs';
const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
const STORYBOOK_BASE_URL = 'https://storybook.example.com'; // Placeholder — matches legacy app.js

function isFilledValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(isFilledValue);
  }
  return true;
}

function getDotPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>(
    (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

interface CompletenessScore {
  filled: number;
  total: number;
  filledFields: Set<string>;
  missingFields: CompletenessField[];
}

function computeCompleteness(spec: ComponentSpec): CompletenessScore {
  let filled = 0;
  const filledFields = new Set<string>();
  const missingFields: CompletenessField[] = [];
  for (const field of COMPLETENESS_FIELDS) {
    const value = getDotPath(spec, field);
    let isFilled = false;
    if (field === 'owner' && value && typeof value === 'object') {
      const owner = value as { designer?: string; developer?: string };
      const hasDesigner = owner.designer && owner.designer !== 'Unassigned';
      const hasDeveloper = owner.developer && owner.developer !== 'Unassigned';
      isFilled = !!(hasDesigner || hasDeveloper);
    } else {
      isFilled = isFilledValue(value);
    }
    if (isFilled) {
      filled++;
      filledFields.add(field);
    } else {
      missingFields.push(field);
    }
  }
  return { filled, total: COMPLETENESS_FIELDS.length, filledFields, missingFields };
}

function ReadinessCard({
  status,
  score,
  componentId,
}: {
  status: ComponentStatus;
  score: CompletenessScore;
  componentId: string;
}) {
  const meta = STATUS_LABELS[status.current] || {
    label: status.current,
    css: status.current,
  };
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status.current);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const pct = score.total > 0 ? Math.round((score.filled / score.total) * 100) : 0;
  const githubSpecUrl = `${GITHUB_REPO_URL}/tree/main/uds-docs/uds/components/${componentId}/spec.json`;

  return (
    <div style={{ position: 'relative' }}>
      <section className="sg-readiness" aria-label="Component readiness">
        <div className="sg-readiness__row">
          <div className="sg-readiness__label">
            <span>Status</span>
            <span className="sg-readiness__value">
              {meta.label}{' '}
              <span className="sg-readiness__value--muted">
                · since {status.since}
              </span>
            </span>
          </div>
          <div
            className="sg-status-bar"
            role="group"
            aria-label={`Component status: ${meta.label}`}
          >
            {STATUS_STEPS.map((step, idx) => {
              let state: 'complete' | 'current' | 'future' = 'future';
              if (currentIdx < 0) {
                state = 'future';
              } else if (idx < currentIdx) {
                state = 'complete';
              } else if (idx === currentIdx) {
                state = 'current';
              }
              return (
                <span
                  key={step.key}
                  className="sg-status-bar__segment"
                  data-state={state}
                  data-status={step.key}
                >
                  {step.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="sg-readiness__row">
          <div className="sg-readiness__label">
            <span>Spec</span>
            <span className="sg-readiness__value">
              {score.filled} of {score.total} fields filled
              <span className="sg-readiness__cta">
                View checklist{' '}
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_forward
                </span>
              </span>
            </span>
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="sg-spec-bar sg-spec-progress-trigger"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`Spec progress: ${score.filled} of ${score.total} fields filled. Click to view checklist.`}
            onClick={() => setOpen((value) => !value)}
          >
            {COMPLETENESS_FIELDS.map((field) => (
              <span
                key={field}
                className="sg-spec-bar__segment"
                data-filled={score.filledFields.has(field) ? 'true' : 'false'}
                data-field={field}
                title={SPEC_FIELD_LABELS[field as CompletenessField]}
              />
            ))}
          </button>
        </div>
      </section>

      {open ? (
        <div
          ref={popoverRef}
          className="sg-spec-popover"
          role="dialog"
          aria-label="Spec checklist"
          style={{ top: 'calc(100% - var(--uds-space-200))', left: 0 }}
        >
          <div className="sg-spec-popover__header">
            <strong>
              Spec {score.filled}/{score.total}
            </strong>
            <span className="sg-spec-popover__pct">{pct}% complete</span>
            <button
              type="button"
              className="sg-spec-popover__close"
              aria-label="Close spec checklist"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="sg-spec-popover__intro">
            Filled fields come from <code>spec.json</code>. Missing fields are the next
            highest-impact spec work for this component.
          </p>
          <SpecChecklistGroup
            title="Filled"
            fields={COMPLETENESS_FIELDS.filter((field) => score.filledFields.has(field))}
            kind="filled"
          />
          <SpecChecklistGroup
            title="Missing"
            fields={score.missingFields as CompletenessField[]}
            kind="missing"
          />
          <p className="sg-spec-popover__footer">
            <a href={githubSpecUrl} target="_blank" rel="noopener noreferrer">
              Open spec.json on GitHub
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SpecChecklistGroup({
  title,
  fields,
  kind,
}: {
  title: string;
  fields: readonly CompletenessField[];
  kind: 'filled' | 'missing';
}) {
  if (!fields.length) return null;
  return (
    <div className="sg-spec-popover__group">
      <h4>{title}</h4>
      <ul>
        {fields.map((field) => (
          <li key={field} className={`sg-spec-popover__${kind}`}>
            {kind === 'filled' ? (
              <span className="sg-spec-popover__check">✓</span>
            ) : (
              <span className="sg-spec-popover__dot" />
            )}
            {SPEC_FIELD_LABELS[field]}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeaderLinks({ componentId, spec }: { componentId: string; spec: ComponentSpec }) {
  const figmaNodeId = (spec.figmaNodeId as string | null | undefined) ??
    (spec.figmaPageNodeId as string | null | undefined);
  const figmaUrl = figmaNodeId
    ? `https://www.figma.com/design/${FIGMA_FILE_KEY}/UDS-Components?node-id=${encodeURIComponent(figmaNodeId)}`
    : null;
  const figmaLabel = (spec.figmaNodeId as string | null | undefined) ? 'Figma (variant)' : 'Figma';
  const storybookSlug = (spec.storybookSlug as string | null | undefined);
  // Legacy parity: Storybook button always renders. Links to the placeholder
  // base URL until a real slug exists. The same `title` tooltip from legacy
  // app.js documents the placeholder state.
  const storybookUrl = storybookSlug
    ? `${STORYBOOK_BASE_URL}/?path=/story/${storybookSlug}`
    : STORYBOOK_BASE_URL;
  // Legacy parity: GitHub button is a disabled placeholder (no real link target).
  const reportTitle = encodeURIComponent(`[${spec.title || componentId}] `);
  const reportBody = encodeURIComponent(
    `Component: ${componentId}\nPage: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nDescribe the issue or feedback:\n\n`,
  );
  const reportIssueUrl = `${GITHUB_REPO_URL}/issues/new?title=${reportTitle}&body=${reportBody}`;

  return (
    <div className="sg-page-links">
      {figmaUrl ? (
        <a
          className="sg-page-link"
          href={figmaUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined">design_services</span>
          {figmaLabel}
        </a>
      ) : (
        <span className="sg-page-link" aria-disabled="true">
          <span className="material-symbols-outlined">design_services</span>
          Figma
        </span>
      )}
      <a
        className="sg-page-link"
        href={storybookUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Placeholder — update STORYBOOK_BASE_URL once Storybook is live"
      >
        <span className="material-symbols-outlined">auto_awesome</span>
        Storybook
      </a>
      <span className="sg-page-link" aria-disabled="true">
        <span className="material-symbols-outlined">code</span>
        GitHub
      </span>
      <a
        className="sg-page-link"
        href={reportIssueUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="material-symbols-outlined">bug_report</span>
        Report Issue
      </a>
    </div>
  );
}

// "Not production-ready" warning banner — direct port of
// `renderComponentHeaderExtras()` from legacy app.js.
function NotProductionBanner({ status }: { status: ComponentStatus }) {
  if (status.current === 'production') return null;
  const meta = STATUS_LABELS[status.current];
  const label = meta ? meta.label : status.current;
  return (
    <div className="sg-not-for-production">
      <span className="material-symbols-outlined" aria-hidden="true">warning_amber</span>
      <span>
        <strong>Not production-ready.</strong> Status: {label}. Specs and behavior may
        change. See the Storybook implementation for shippable code.
      </span>
    </div>
  );
}

// "Last updated" collapsible details — direct port of the second half of
// `renderComponentHeaderExtras()` from legacy app.js. Groups per-component
// changelog entries by version, sorts newest-first, and renders the two
// most-recent releases inline plus a link to the full per-component
// changelog tab.
interface GroupedRelease {
  version: string;
  changes: Array<{ type: string; text: string }>;
}

function groupChangelogByVersion(
  changelog: ComponentChangelog | null,
): GroupedRelease[] {
  if (!changelog || !changelog.entries || !changelog.entries.length) return [];
  const byVersion: Record<string, Array<{ type: string; text: string }>> = {};
  for (const entry of changelog.entries) {
    if (!byVersion[entry.version]) byVersion[entry.version] = [];
    byVersion[entry.version].push({ type: entry.type, text: entry.text });
  }
  const versions = Object.keys(byVersion).sort((a, b) => {
    const pa = a.split(/[.\-]/).map((x) => (/^\d+$/.test(x) ? parseInt(x, 10) : 0));
    const pb = b.split(/[.\-]/).map((x) => (/^\d+$/.test(x) ? parseInt(x, 10) : 0));
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
    }
    return 0;
  });
  return versions.map((v) => ({ version: v, changes: byVersion[v] }));
}

function LastUpdatedPanel({
  componentId,
  changelog,
}: {
  componentId: string;
  changelog: ComponentChangelog | null;
}) {
  const grouped = groupChangelogByVersion(changelog);
  if (!grouped.length) return null;
  const last = grouped[0];
  const preview = grouped.slice(0, 2);
  return (
    <details className="sg-recent-changes">
      <summary>
        <span className="sg-recent-label">Last updated:</span>{' '}
        <span className="sg-recent-version">{last.version}</span>{' '}
        <span className="sg-recent-toggle">Show recent changes</span>
      </summary>
      <div className="sg-recent-inner">
        {preview.map((release) => (
          <div key={release.version} className="sg-recent-release">
            <div className="sg-recent-release-title">{release.version}</div>
            <ul>
              {release.changes.map((c, idx) => (
                <li key={idx}>
                  <span className={`sg-recent-type sg-recent-type--${c.type}`}>
                    {c.type}
                  </span>{' '}
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <a className="sg-recent-full" href={`#/${componentId}?tab=changelog`}>
          View full changelog →
        </a>
      </div>
    </details>
  );
}

export function ComponentHeader({
  componentId,
  spec,
  status,
  changelog,
}: {
  componentId: string;
  spec: ComponentSpec;
  status: ComponentStatus;
  changelog: ComponentChangelog | null;
}) {
  const score = computeCompleteness(spec);

  return (
    <>
      <SgPageTitle>{spec.title || componentId}</SgPageTitle>
      {spec.description ? <SgPageDesc>{spec.description}</SgPageDesc> : null}
      <HeaderLinks componentId={componentId} spec={spec} />
      <ReadinessCard componentId={componentId} status={status} score={score} />
      <NotProductionBanner status={status} />
      <LastUpdatedPanel componentId={componentId} changelog={changelog} />
    </>
  );
}
