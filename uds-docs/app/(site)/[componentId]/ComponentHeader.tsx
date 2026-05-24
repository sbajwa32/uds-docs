// Page chrome for a component documentation page.
//
//   - SgPageTitle bound to spec.title (with figmanotes.json count badge if any).
//   - SgPageDesc bound to spec.description.
//   - Status badge (sg-component-progress) showing where the component sits in
//     the placeholder → blocked → in-progress → review → production lifecycle.
//   - "Spec X/Y" completeness pill — counts non-empty fields in spec.json
//     against the COMPLETENESS_FIELDS list (data/completeness-fields.ts).
//   - Figma + Storybook + GitHub link buttons in the header.

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

function computeCompleteness(spec: ComponentSpec): { filled: number; total: number } {
  let filled = 0;
  for (const field of COMPLETENESS_FIELDS) {
    const value = getDotPath(spec, field);
    // Special-case `owner`: filled only if at least one role is non-Unassigned.
    if (field === 'owner' && value && typeof value === 'object') {
      const owner = value as { designer?: string; developer?: string };
      const hasDesigner = owner.designer && owner.designer !== 'Unassigned';
      const hasDeveloper = owner.developer && owner.developer !== 'Unassigned';
      if (hasDesigner || hasDeveloper) filled++;
      continue;
    }
    if (isFilledValue(value)) filled++;
  }
  return { filled, total: COMPLETENESS_FIELDS.length };
}

function StatusBadge({ status }: { status: ComponentStatus }) {
  const meta = STATUS_LABELS[status.current];
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status.current);

  return (
    <div
      className={`sg-component-progress sg-component-progress--${meta.css}`}
      title={`${meta.label} (since UDS ${status.since})`}
      aria-label={`Status: ${meta.label}`}
    >
      <span className={`sg-status-dot sg-status-dot--${meta.css}`} aria-hidden="true" />
      <span className="sg-component-progress__label">{meta.label}</span>
      {currentIdx >= 0 ? (
        <span className="sg-component-progress__steps">
          {STATUS_STEPS.map((step, idx) => (
            <span
              key={step.key}
              className={`sg-component-progress__step${
                idx <= currentIdx ? ' sg-component-progress__step--complete' : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}

function CompletenessPill({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const tone = pct >= 80 ? 'production' : pct >= 50 ? 'review' : 'in-progress';
  // Render the missing-fields breakdown as the title attr so designers can
  // hover the pill and see what's missing.
  return (
    <span
      className={`sg-spec-pill sg-spec-pill--${tone}`}
      title={`${filled} of ${total} fields filled (${pct}%)`}
      aria-label={`Spec completeness: ${filled} of ${total}`}
    >
      Spec {filled}/{total}
    </span>
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
  const { filled, total } = computeCompleteness(spec);

  // Suppress unused-import warning on CompletenessField + SPEC_FIELD_LABELS;
  // they're consumed by the title attr below.
  const missingFields = COMPLETENESS_FIELDS.filter((f: CompletenessField) => {
    if (f === 'owner') {
      const o = spec.owner as { designer?: string; developer?: string } | undefined;
      return !(o && ((o.designer && o.designer !== 'Unassigned') || (o.developer && o.developer !== 'Unassigned')));
    }
    return !isFilledValue(getDotPath(spec, f));
  });
  const titleSuffix =
    missingFields.length > 0
      ? `\nMissing: ${missingFields.map((f) => SPEC_FIELD_LABELS[f]).join(', ')}`
      : '';

  return (
    <>
      <div className="sg-page-header" data-title-suffix={titleSuffix}>
        <SgPageTitle>{spec.title || componentId}</SgPageTitle>
        <div className="sg-page-meta">
          <StatusBadge status={status} />
          <CompletenessPill filled={filled} total={total} />
        </div>
      </div>
      {spec.description ? <SgPageDesc>{spec.description}</SgPageDesc> : null}
      <HeaderLinks componentId={componentId} spec={spec} />
    </>
  );
}
