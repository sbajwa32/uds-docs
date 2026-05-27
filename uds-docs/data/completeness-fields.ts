// Drives the "Spec X/Y" completeness pill on every component page header.
// Each entry is a dot-path into spec.json — the page renderer counts how many
// of these are non-empty in the component's spec.json to compute X/Y.
//
// `knownIssues` was removed from this list on 2026-05-13. It was a weird
// completeness signal (the component is "more complete" if it has unresolved
// issues?) and is being deprecated in favor of figmanotes.json for Figma-side
// findings (the bulk of what knownIssues was historically used for).
// knownIssues stays in the schema for legitimate non-Figma implementation
// notes (browser quirks, SR limitations) but doesn't count toward
// completeness either way.

export const COMPLETENESS_FIELDS = [
  'description',
  'whenToUse',
  'whenNotToUse',
  'acceptanceCriteria',
  'dependencies.css',
  'props',
  'events',
  'slots',
  'states',
  'contentGuidelines',
  'commonlyPairedWith',
  'dosDonts',
  'accessibility.keyboard',
  'accessibility.screenReader',
  'accessibility.wcag',
  'accessibility.contrast',
  'visualHierarchy',
  'densityBehavior',
  'owner',
  'figmaNodeId',
  'storybookSlug',
] as const;

export type CompletenessField = (typeof COMPLETENESS_FIELDS)[number];

export const SPEC_FIELD_LABELS: Record<CompletenessField, string> = {
  description: 'Description',
  whenToUse: 'When to use',
  whenNotToUse: 'When not to use',
  acceptanceCriteria: 'Acceptance criteria',
  'dependencies.css': 'CSS dependencies',
  props: 'Props / attributes',
  events: 'Events emitted',
  slots: 'Slots / content model',
  states: 'States coverage',
  contentGuidelines: 'Content guidelines',
  commonlyPairedWith: 'Commonly paired with',
  dosDonts: "Do's & don'ts",
  'accessibility.keyboard': 'Accessibility — keyboard',
  'accessibility.screenReader': 'Accessibility — screen reader',
  'accessibility.wcag': 'Accessibility — WCAG criteria',
  'accessibility.contrast': 'Accessibility — color contrast',
  visualHierarchy: 'Visual hierarchy',
  densityBehavior: 'Density behavior',
  owner: 'Owner (designer + developer)',
  figmaNodeId: 'Figma node link',
  storybookSlug: 'Storybook story slug',
};
