// docs/data/status-labels.js
// Extracted from app.js during Phase 3c of the UDS repo restructure.
// Exports: STATUS_LABELS, STATUS_STEPS

export const STATUS_LABELS = {
    'placeholder':  { label: 'Not Started',       css: 'placeholder'  },
    'blocked':      { label: 'Blocked',            css: 'blocked'      },
    'in-progress':  { label: 'In Progress',        css: 'in-progress'  },
    'review':       { label: 'In Review',          css: 'review'       },
    'production':   { label: 'Production Ready',   css: 'production'   },
    'deprecated':   { label: 'Deprecated',         css: 'deprecated'   }
};

export const STATUS_STEPS = [
    { key: 'placeholder', label: 'Not Started' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'review', label: 'In Review' },
    { key: 'production', label: 'Production' }
];

