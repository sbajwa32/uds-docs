// Auto-extracted from legacy index.html during Chunk 07.
// Source of truth for the Code tab's API tables on the text-input component page.

import type { ComponentApi } from './types';

export const textInputApi: ComponentApi = {
  importPath: "./components/text-input.css",
  cssClasses: [
    { name: ".udc-text-input", description: "Root wrapper (vertical stack)" },
    { name: ".udc-text-input__label", description: "Label text" },
    { name: ".udc-text-input__required", description: "Red dot indicator" },
    { name: ".udc-text-input__field", description: "The bordered input container" },
    { name: ".udc-text-input__leading-icon", description: "Leading icon slot" },
    { name: ".udc-text-input__trailing-btn", description: "Trailing action button" },
    { name: ".udc-text-input__helper", description: "Helper text row" },
    { name: ".udc-text-input__counter", description: "Character counter" },
  ],
  attributes: [
    { name: "data-state", values: "error", description: "Error state styling" },
    { name: "disabled", values: "—", description: "On the &lt;input&gt; element" },
  ],
};
