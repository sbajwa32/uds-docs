// docs/data/completeness-fields.js
// Extracted from app.js during Phase 3c of the UDS repo restructure.
// Exports: COMPLETENESS_FIELDS, SPEC_FIELD_LABELS

export const COMPLETENESS_FIELDS = [
    'description', 'whenToUse', 'whenNotToUse',
    'acceptanceCriteria', 'dependencies.css',
    'props', 'events', 'slots', 'states',
    'contentGuidelines', 'commonlyPairedWith', 'dosDonts',
    'accessibility.keyboard', 'accessibility.screenReader',
    'accessibility.wcag', 'accessibility.contrast',
    'knownIssues',
    'visualHierarchy', 'densityBehavior',
    'owner', 'figmaNodeId', 'storybookSlug'
];

export const SPEC_FIELD_LABELS = {
    'description': 'Description',
    'whenToUse': 'When to use',
    'whenNotToUse': 'When not to use',
    'acceptanceCriteria': 'Acceptance criteria',
    'dependencies.css': 'CSS dependencies',
    'props': 'Props / attributes',
    'events': 'Events emitted',
    'slots': 'Slots / content model',
    'states': 'States coverage',
    'contentGuidelines': 'Content guidelines',
    'commonlyPairedWith': 'Commonly paired with',
    'dosDonts': "Do's & don'ts",
    'accessibility.keyboard': 'Accessibility — keyboard',
    'accessibility.screenReader': 'Accessibility — screen reader',
    'accessibility.wcag': 'Accessibility — WCAG criteria',
    'accessibility.contrast': 'Accessibility — color contrast',
    'knownIssues': 'Known issues',
    'visualHierarchy': 'Visual hierarchy',
    'densityBehavior': 'Density behavior',
    'owner': 'Owner (designer + developer)',
    'figmaNodeId': 'Figma node link',
    'storybookSlug': 'Storybook story slug'
};

