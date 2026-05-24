// Page chrome for a component documentation page.
//
//   - SgPageTitle bound to spec.title.
//   - SgPageDesc bound to spec.description.
//   - HeaderLinks — Figma + Storybook + GitHub icon-buttons.
//   - ReadinessCard — two-row "Status" + "Spec" segmented bars (.sg-readiness
//     markup). Direct port of `renderComponentProgress()` from the legacy
//     app.js; the legacy CSS (styles/pages/legacy.css) is reused verbatim.

import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';
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
}

function computeCompleteness(spec: ComponentSpec): CompletenessScore {
  let filled = 0;
  const filledFields = new Set<string>();
  for (const field of COMPLETENESS_FIELDS) {
    const value = getDotPath(spec, field);
    if (field === 'owner' && value && typeof value === 'object') {
      const owner = value as { designer?: string; developer?: string };
      const hasDesigner = owner.designer && owner.designer !== 'Unassigned';
      const hasDeveloper = owner.developer && owner.developer !== 'Unassigned';
      if (hasDesigner || hasDeveloper) {
        filled++;
        filledFields.add(field);
      }
      continue;
    }
    if (isFilledValue(value)) {
      filled++;
      filledFields.add(field);
    }
  }
  return { filled, total: COMPLETENESS_FIELDS.length, filledFields };
}

function ReadinessCard({
  status,
  score,
}: {
  status: ComponentStatus;
  score: CompletenessScore;
}) {
  const meta = STATUS_LABELS[status.current] || {
    label: status.current,
    css: status.current,
  };
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status.current);

  return (
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
          </span>
        </div>
        <div
          className="sg-spec-bar"
          role="group"
          aria-label={`Spec progress: ${score.filled} of ${score.total} fields filled`}
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
        </div>
      </div>
    </section>
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
      <ReadinessCard status={status} score={score} />
    </>
  );
}
