export interface TokenSwatchGroup {
  title: string;
  description?: string;
  tokens: TokenSwatch[];
}

export interface TokenSwatch {
  name: string;
  value?: string;
  checkerboard?: boolean;
}

export const SEMANTIC_COLOR_GROUPS: TokenSwatchGroup[] = [
  {
    title: 'Interactive surfaces',
    description:
      'Primary action colors that change per brand. Tokens marked * shift when switching brands.',
    tokens: [
      { name: '--uds-color-surface-interactive-none', value: 'transparent', checkerboard: true },
      { name: '--uds-color-surface-interactive-neutral', value: 'neutral bg' },
      { name: '--uds-color-surface-interactive-default', value: 'primary action bg *' },
      { name: '--uds-color-surface-interactive-hover', value: 'hover *' },
      { name: '--uds-color-surface-interactive-active', value: 'pressed *' },
      { name: '--uds-color-surface-interactive-subtle', value: 'ghost bg *' },
      { name: '--uds-color-surface-interactive-subtle-hover', value: 'ghost hover *' },
      { name: '--uds-color-surface-interactive-subtle-active', value: 'ghost pressed *' },
      { name: '--uds-color-surface-interactive-disabled' },
      { name: '--uds-color-surface-interactive-red', value: 'danger action bg' },
      { name: '--uds-color-surface-interactive-red-hover', value: 'danger hover' },
      { name: '--uds-color-surface-interactive-red-active', value: 'danger pressed' },
      { name: '--uds-color-surface-interactive-red-subtle', value: 'danger ghost bg' },
      { name: '--uds-color-surface-interactive-red-subtle-hover', value: 'danger ghost hover' },
      { name: '--uds-color-surface-interactive-red-subtle-active', value: 'danger ghost pressed' },
    ],
  },
  {
    title: 'Status surfaces',
    tokens: [
      { name: '--uds-color-surface-info' },
      { name: '--uds-color-surface-info-subtle' },
      { name: '--uds-color-surface-error' },
      { name: '--uds-color-surface-error-subtle' },
      { name: '--uds-color-surface-warning' },
      { name: '--uds-color-surface-warning-subtle' },
      { name: '--uds-color-surface-success' },
      { name: '--uds-color-surface-success-subtle' },
    ],
  },
  {
    title: 'Page surfaces',
    tokens: [
      { name: '--uds-color-surface-page-main' },
      { name: '--uds-color-surface-page-subtle' },
      { name: '--uds-color-surface-page-alt' },
      { name: '--uds-color-surface-page-bold' },
      { name: '--uds-color-surface-page-inverse' },
    ],
  },
  {
    title: 'Component surfaces (neutral scale)',
    tokens: [
      { name: '--uds-color-surface-none', value: 'transparent', checkerboard: true },
      { name: '--uds-color-surface-main' },
      { name: '--uds-color-surface-subtle' },
      { name: '--uds-color-surface-alt' },
      { name: '--uds-color-surface-bold' },
      { name: '--uds-color-surface-xbold' },
      { name: '--uds-color-surface-xxbold' },
      { name: '--uds-color-surface-inverse' },
      { name: '--uds-color-surface-white' },
      { name: '--uds-color-surface-black' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { name: '--uds-color-text-brand', value: 'changes per brand *' },
      { name: '--uds-color-text-primary' },
      { name: '--uds-color-text-inverse' },
      { name: '--uds-color-text-secondary' },
      { name: '--uds-color-text-disabled' },
      { name: '--uds-color-text-disabled-bold' },
      { name: '--uds-color-text-interactive' },
      { name: '--uds-color-text-interactive-hover' },
      { name: '--uds-color-text-interactive-active' },
      { name: '--uds-color-text-interactive-neutral' },
      { name: '--uds-color-text-info' },
      { name: '--uds-color-text-success' },
      { name: '--uds-color-text-error' },
      { name: '--uds-color-text-warning' },
    ],
  },
  {
    title: 'Border',
    tokens: [
      { name: '--uds-color-border-none', value: 'transparent', checkerboard: true },
      { name: '--uds-color-border-brand', value: 'changes per brand *' },
      { name: '--uds-color-border-primary' },
      { name: '--uds-color-border-secondary' },
      { name: '--uds-color-border-tertiary' },
      { name: '--uds-color-border-inverse' },
      { name: '--uds-color-border-disabled' },
      { name: '--uds-color-border-interactive', value: '*' },
      { name: '--uds-color-border-interactive-hover', value: '*' },
      { name: '--uds-color-border-interactive-active', value: '*' },
      { name: '--uds-color-border-subtle-interactive', value: '*' },
      { name: '--uds-color-border-subtle-interactive-hover', value: '*' },
      { name: '--uds-color-border-subtle-interactive-active', value: '*' },
      { name: '--uds-color-border-info' },
      { name: '--uds-color-border-success' },
      { name: '--uds-color-border-error' },
      { name: '--uds-color-border-warning' },
    ],
  },
  {
    title: 'Outline (focus / interaction rings)',
    tokens: [
      { name: '--uds-color-border-outline-hover' },
      { name: '--uds-color-border-outline-active' },
      { name: '--uds-color-border-outline-focus-visible' },
    ],
  },
  {
    title: 'Brand surfaces',
    description:
      'Brand colors for logos and brand marks. Static tokens stay the same across all modes.',
    tokens: [
      { name: '--uds-color-surface-brand-dynamic-bold', value: 'active brand accent *' },
      { name: '--uds-color-surface-brand-resman-bold' },
      { name: '--uds-color-surface-brand-resman-static' },
      { name: '--uds-color-surface-brand-anyonehome-bold' },
      { name: '--uds-color-surface-brand-anyonehome-static' },
      { name: '--uds-color-surface-brand-inhabit-bold' },
      { name: '--uds-color-surface-brand-inhabit-static' },
    ],
  },
  {
    title: 'Icon',
    tokens: [
      { name: '--uds-color-icon-none', value: 'transparent', checkerboard: true },
      { name: '--uds-color-icon-brand', value: 'changes per brand *' },
      { name: '--uds-color-icon-primary' },
      { name: '--uds-color-icon-inverse' },
      { name: '--uds-color-icon-secondary' },
      { name: '--uds-color-icon-disabled' },
      { name: '--uds-color-icon-disabled-bold' },
      { name: '--uds-color-icon-interactive', value: '*' },
      { name: '--uds-color-icon-interactive-hover', value: '*' },
      { name: '--uds-color-icon-interactive-active', value: '*' },
      { name: '--uds-color-icon-info' },
      { name: '--uds-color-icon-success' },
      { name: '--uds-color-icon-error' },
      { name: '--uds-color-icon-warning' },
    ],
  },
];
