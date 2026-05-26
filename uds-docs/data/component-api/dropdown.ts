// Auto-extracted from legacy index.html during Chunk 07.
// Source of truth for the Code tab's API tables on the dropdown component page.

import type { ComponentApi } from './types';

export const dropdownApi: ComponentApi = {
  importPath: "./components/dropdown.css",
  cssClasses: [
    { name: ".udc-dropdown", description: "Root wrapper — positioned container" },
    { name: ".udc-dropdown__label", description: "Label text above the trigger" },
    { name: ".udc-dropdown__required", description: "Red required dot" },
    { name: ".udc-dropdown__trigger", description: "Clickable trigger box" },
    { name: ".udc-dropdown__leading-icon", description: "Optional leading icon slot" },
    { name: ".udc-dropdown__value", description: "Selected value display (add data-placeholder for placeholder style)" },
    { name: ".udc-dropdown__chevron", description: "Trailing arrow icon (auto-rotates when open)" },
    { name: ".udc-dropdown__helper", description: "Helper text row below trigger" },
    { name: ".udc-dropdown__counter", description: "Character/selection counter in helper row" },
    { name: ".udc-dropdown__list", description: "Option list container (shown when data-open=\"true\")" },
    { name: ".udc-dropdown__item", description: "Individual selectable option" },
  ],
  attributes: [
    { name: "data-state=\"error\"", values: ".udc-dropdown", description: "Error visual treatment" },
    { name: "data-open=\"true\"", values: ".udc-dropdown", description: "Shows list, rotates chevron" },
    { name: "aria-disabled=\"true\"", values: ".udc-dropdown__trigger", description: "Disabled state" },
    { name: "data-placeholder", values: ".udc-dropdown__value", description: "Muted placeholder style" },
  ],
};
