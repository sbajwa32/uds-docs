// Auto-extracted from legacy index.html during Chunk 07.
// Source of truth for the Code tab's API tables on the button component page.

import type { ComponentApi } from './types';

export const buttonApi: ComponentApi = {
  importPath: "./components/button.css",
  cssClasses: [
    { name: ".udc-button-primary", description: "Primary filled button (brand color background)" },
    { name: ".udc-button-secondary", description: "Secondary outlined button (border, no fill)" },
    { name: ".udc-button-ghost", description: "Ghost button (text only, subtle hover)" },
  ],
  attributes: [
    { name: "data-size", values: "sm", description: "Small size with reduced padding" },
    { name: "data-leading-icon", values: "—", description: "Indicates a leading icon is present; reduces left padding" },
    { name: "data-trailing-icon", values: "—", description: "Indicates a trailing icon is present; reduces right padding" },
    { name: "data-icon-only", values: "—", description: "Icon-only square button (equal padding, no gap)" },
    { name: "data-btn-color", values: "danger, success, warning, neutral", description: "Override accent color (maps to Figma's Destructive=True for danger)" },
    { name: "aria-selected", values: "true", description: "Selected/active toggle state" },
    { name: "disabled", values: "—", description: "Disabled state" },
  ],
};
