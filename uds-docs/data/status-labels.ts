// Ported from docs/data/status-labels.js during Chunk 07.

export type StatusKey =
  | 'placeholder'
  | 'blocked'
  | 'in-progress'
  | 'review'
  | 'production'
  | 'deprecated';

export const STATUS_LABELS: Record<StatusKey, { label: string; css: string }> = {
  placeholder: { label: 'Not Started', css: 'placeholder' },
  blocked: { label: 'Blocked', css: 'blocked' },
  'in-progress': { label: 'In Progress', css: 'in-progress' },
  review: { label: 'In Review', css: 'review' },
  production: { label: 'Production Ready', css: 'production' },
  deprecated: { label: 'Deprecated', css: 'deprecated' },
};

/** Ordered status progression for the stepper UI on each component page. */
export const STATUS_STEPS: Array<{ key: StatusKey; label: string }> = [
  { key: 'placeholder', label: 'Not Started' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'production', label: 'Production' },
];
