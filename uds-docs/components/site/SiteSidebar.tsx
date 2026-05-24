// Canonical sidebar nav for the docs site. Mirrors the legacy index.html
// nav block (lines 240-297 of the pre-migration index.html).
//
// Structure-as-data so future link adds/removes are one-line edits. Section
// order matches the legacy site verbatim — designers know the layout.

import { SgSidebar, SgSidebarHeading } from './SgSidebar';
import { ActiveSgSidebarLink } from './ActiveSgSidebarLink';

interface NavLink {
  label: string;
  href: string;
  /** Optional Material Symbol name — used only on the top getting-started variant. */
  icon?: string;
}

interface NavSection {
  /** Undefined heading = unsectioned (top of sidebar, the getting-started block). */
  heading?: string;
  /** Style variant applied to every link in the section. */
  variant?: 'getting-started';
  links: NavLink[];
}

const NAV: NavSection[] = [
  {
    variant: 'getting-started',
    links: [
      { label: 'AI Assist', href: '/ai-assist', icon: 'smart_toy' },
      { label: 'Changelog', href: '/changelog', icon: 'history' },
      { label: 'Getting Started', href: '/getting-started', icon: 'download' },
    ],
  },
  {
    heading: 'Foundations',
    links: [
      { label: 'Semantic Colors', href: '/semantic-colors' },
      { label: 'Primitive Colors', href: '/primitive-colors' },
      { label: 'Text Styles', href: '/text-styles' },
      { label: 'Spacing', href: '/spacing' },
    ],
  },
  {
    heading: 'Forms & Actions',
    links: [
      { label: 'Button', href: '/button' },
      { label: 'Link', href: '/link' },
      { label: 'Label', href: '/label' },
      { label: 'Text Input', href: '/text-input' },
      { label: 'Text Area', href: '/text-area' },
      { label: 'Checkbox', href: '/checkbox' },
      { label: 'Radio', href: '/radio' },
      { label: 'Dropdown', href: '/dropdown' },
      { label: 'Combobox', href: '/combobox' },
      { label: 'Date Picker', href: '/date-picker' },
      { label: 'Toggle', href: '/toggle' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    heading: 'Status & Indicators',
    links: [
      { label: 'Badge', href: '/badge' },
      { label: 'Chip', href: '/chip' },
    ],
  },
  {
    heading: 'Layout',
    links: [
      { label: 'Divider', href: '/divider' },
      { label: 'Icon Wrapper', href: '/icon-wrapper' },
      { label: 'Spacer', href: '/spacer' },
    ],
  },
  {
    heading: 'Navigation',
    links: [
      { label: 'Breadcrumb', href: '/breadcrumb' },
      { label: 'Tabs', href: '/tabs' },
      { label: 'Nav Header', href: '/nav-header' },
      { label: 'Nav Vertical', href: '/nav-vertical' },
      { label: 'Pagination', href: '/pagination' },
    ],
  },
  {
    heading: 'Content',
    links: [
      { label: 'Tile', href: '/tile' },
      { label: 'List', href: '/list' },
      { label: 'Data Table', href: '/data-table' },
      { label: 'Data View', href: '/data-view' },
    ],
  },
  {
    heading: 'Feedback',
    links: [
      { label: 'Notification', href: '/notification' },
      { label: 'Dialog', href: '/dialog' },
      { label: 'Tooltip', href: '/tooltip' },
    ],
  },
  {
    heading: 'Patterns',
    links: [
      { label: 'Composition Recipes', href: '/recipes' },
      { label: 'Layout Templates', href: '/templates' },
    ],
  },
  {
    heading: 'UDS Tools',
    links: [{ label: 'Contrast Checker', href: '/contrast-checker' }],
  },
  {
    heading: 'Reference',
    links: [
      { label: 'About UDS', href: '/about' },
      { label: 'Design Process', href: '/design-process' },
      { label: 'Design Language', href: '/design-language' },
      { label: 'Cursor Workflows', href: '/cursor-workflows' },
    ],
  },
];

export function SiteSidebar() {
  return (
    <SgSidebar>
      {NAV.map((section, sectionIdx) => {
        const links = section.links.map((link) => (
          <ActiveSgSidebarLink
            key={link.href}
            href={link.href}
            variant={section.variant}
            icon={link.icon}
          >
            {link.label}
          </ActiveSgSidebarLink>
        ));

        return (
          <div key={section.heading ?? `section-${sectionIdx}`}>
            {section.heading ? <SgSidebarHeading>{section.heading}</SgSidebarHeading> : null}
            {links}
          </div>
        );
      })}
    </SgSidebar>
  );
}

