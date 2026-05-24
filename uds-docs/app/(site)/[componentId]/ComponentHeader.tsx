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
import type { ComponentSpec, ComponentStatus } from '@/lib/uds-data';
import { STATUS_LABELS, STATUS_STEPS } from '@/data/status-labels';
import {
  COMPLETENESS_FIELDS,
  SPEC_FIELD_LABELS,
  type CompletenessField,
} from '@/data/completeness-fields';

const FIGMA_FILE_KEY = '1XJoUJgtNpw4R0IIT3VjoK'; // UDS Components — same as legacy app.js
const GITHUB_REPO_URL = 'https://github.com/sbajwa32/uds-docs';
const STORYBOOK_BASE_URL = 'https://storybook.urbandesignsystem.com';

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
  const storybookSlug = (spec.storybookSlug as string | null | undefined);
  const storybookUrl = storybookSlug
    ? `${STORYBOOK_BASE_URL}/?path=/story/${storybookSlug}`
    : null;
  const githubUrl = `${GITHUB_REPO_URL}/tree/main/uds-docs/uds/components/${componentId}`;

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
          Figma
        </a>
      ) : (
        <span className="sg-page-link" aria-disabled="true">
          <span className="material-symbols-outlined">design_services</span>
          Figma
        </span>
      )}
      {storybookUrl ? (
        <a
          className="sg-page-link"
          href={storybookUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined">science</span>
          Storybook
        </a>
      ) : null}
      <a
        className="sg-page-link"
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="material-symbols-outlined">code</span>
        GitHub
      </a>
    </div>
  );
}

export function ComponentHeader({
  componentId,
  spec,
  status,
}: {
  componentId: string;
  spec: ComponentSpec;
  status: ComponentStatus;
}) {
  const score = computeCompleteness(spec);

  return (
    <>
      <SgPageTitle>{spec.title || componentId}</SgPageTitle>
      {spec.description ? <SgPageDesc>{spec.description}</SgPageDesc> : null}
      <HeaderLinks componentId={componentId} spec={spec} />
      <ReadinessCard componentId={componentId} status={status} score={score} />
    </>
  );
}
