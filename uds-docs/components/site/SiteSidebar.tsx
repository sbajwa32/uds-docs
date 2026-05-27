'use client';

// Canonical sidebar nav for the docs site.
//
// Structure-as-data so future link adds/removes are one-line edits.
//
// In archive mode (?uds=0.2), the component-link rows are filtered against
// the archive's components.json manifest so links to components that don't
// exist in that snapshot are hidden instead of leading to a "Couldn't load
// component" page.

import { useEffect, useState } from 'react';

import { SgSidebar, SgSidebarHeading } from './SgSidebar';
import { ActiveSgSidebarLink } from './ActiveSgSidebarLink';
import { ComponentSidebarLink } from './ComponentSidebarLink';
import { useUdsVersion } from './UdsVersionProvider';
import { getComponents, type ComponentsManifest } from '@/lib/uds-data';

interface NavLink {
  label: string;
  href: string;
  componentId?: string;
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
      { label: 'Button', href: '/button', componentId: 'button' },
      { label: 'Link', href: '/link', componentId: 'link' },
      { label: 'Label', href: '/label', componentId: 'label' },
      { label: 'Text Input', href: '/text-input', componentId: 'text-input' },
      { label: 'Text Area', href: '/text-area', componentId: 'text-area' },
      { label: 'Checkbox', href: '/checkbox', componentId: 'checkbox' },
      { label: 'Radio', href: '/radio', componentId: 'radio' },
      { label: 'Dropdown', href: '/dropdown', componentId: 'dropdown' },
      { label: 'Combobox', href: '/combobox', componentId: 'combobox' },
      { label: 'Date Picker', href: '/date-picker', componentId: 'date-picker' },
      { label: 'Toggle', href: '/toggle', componentId: 'toggle' },
      { label: 'Search', href: '/search', componentId: 'search' },
    ],
  },
  {
    heading: 'Status & Indicators',
    links: [
      { label: 'Badge', href: '/badge', componentId: 'badge' },
      { label: 'Chip', href: '/chip', componentId: 'chip' },
    ],
  },
  {
    heading: 'Layout',
    links: [
      { label: 'Divider', href: '/divider', componentId: 'divider' },
      { label: 'Icon Wrapper', href: '/icon-wrapper', componentId: 'icon-wrapper' },
      { label: 'Spacer', href: '/spacer', componentId: 'spacer' },
    ],
  },
  {
    heading: 'Navigation',
    links: [
      { label: 'Breadcrumb', href: '/breadcrumb', componentId: 'breadcrumb' },
      { label: 'Tabs', href: '/tabs', componentId: 'tabs' },
      { label: 'Nav Header', href: '/nav-header', componentId: 'nav-header' },
      { label: 'Nav Vertical', href: '/nav-vertical', componentId: 'nav-vertical' },
      { label: 'Pagination', href: '/pagination', componentId: 'pagination' },
    ],
  },
  {
    heading: 'Content',
    links: [
      { label: 'Tile', href: '/tile', componentId: 'tile' },
      { label: 'List', href: '/list', componentId: 'list' },
      { label: 'Data Table', href: '/data-table', componentId: 'data-table' },
      { label: 'Data View', href: '/data-view', componentId: 'data-view' },
    ],
  },
  {
    heading: 'Feedback',
    links: [
      { label: 'Notification', href: '/notification', componentId: 'notification' },
      { label: 'Dialog', href: '/dialog', componentId: 'dialog' },
      { label: 'Tooltip', href: '/tooltip', componentId: 'tooltip' },
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

export function SiteSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
} = {}) {
  const { fetchVersion, isArchive } = useUdsVersion();
  // Set of component ids available in the active version. `null` = still
  // loading the manifest; `null` also means "don't filter yet, render every
  // component link the NAV table defines". On live (`isArchive` is false)
  // we never filter — the NAV table IS the live manifest by construction.
  const [allowed, setAllowed] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!isArchive) {
      setAllowed(null);
      return;
    }
    let cancelled = false;
    setAllowed(null);
    getComponents(fetchVersion)
      .then((manifest: ComponentsManifest) => {
        if (cancelled) return;
        const ids = new Set<string>();
        for (const c of manifest.components ?? []) ids.add(c.id);
        setAllowed(ids);
      })
      .catch(() => {
        // Manifest fetch failed — leave allowed null so the user still sees
        // every link instead of an empty sidebar. The component pages
        // themselves will surface the missing-spec error.
        if (!cancelled) setAllowed(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchVersion, isArchive]);

  return (
    <SgSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose}>
      {NAV.map((section, sectionIdx) => {
        const visibleLinks = section.links.filter((link) => {
          // Non-component nav rows always render.
          if (!link.componentId) return true;
          // Live mode: render everything from the NAV table.
          if (!isArchive) return true;
          // Archive mode, manifest still loading: render optimistically.
          if (allowed === null) return true;
          return allowed.has(link.componentId);
        });

        if (visibleLinks.length === 0) return null;

        const links = visibleLinks.map((link) =>
          link.componentId ? (
            <ComponentSidebarLink
              key={link.href}
              href={link.href}
              componentId={link.componentId}
            >
              {link.label}
            </ComponentSidebarLink>
          ) : (
            <ActiveSgSidebarLink
              key={link.href}
              href={link.href}
              variant={section.variant}
              icon={link.icon}
            >
              {link.label}
            </ActiveSgSidebarLink>
          ),
        );

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

