// Auto-extracted from legacy index.html during Chunk 07.
// Source of truth for the Code tab's API tables on the nav-header component page.

import type { ComponentApi } from './types';

export const navHeaderApi: ComponentApi = {
  importPath: "./components/nav-header.css",
  cssClasses: [
    { name: ".udc-nav-header", description: "Top header bar (3-column grid)" },
    { name: ".udc-nav-header__left / __center / __right", description: "Grid sections" },
    { name: ".udc-nav-logo", description: "Logo container" },
    { name: ".udc-nav-title-area", description: "Page-title pill (icon + title + chevron). Figma source: _udc-nav-header_title-area. The chevron is decorative — no popover is wired into the canonical udc-nav-header contract." },
    { name: ".udc-nav-title-area[data-title-only=\"true\"]", description: "Bare page-title mode (paragraph/xl-bold, no icon, no chevron, no pill chrome). Matches Figma Title Only=True variant." },
    { name: ".udc-nav-title-area__chevron", description: "Chevron icon on the title-area pill (visual affordance only)" },
    { name: ".udc-nav-search", description: "Search bar" },
    { name: ".udc-nav-mywork", description: "\"My Work\" action button" },
    { name: ".udc-nav-account", description: "Account actions group" },
  ],
};
