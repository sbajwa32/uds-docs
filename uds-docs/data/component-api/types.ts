// Schema for per-component API tables that drive the Code tab on each
// component page. Extracted from index.html during Chunk 07.

export interface ApiClassEntry {
  /** Selector with leading dot, e.g. `.udc-button-primary`. */
  name: string;
  description: string;
}

export interface ApiAttributeEntry {
  /** Attribute name, e.g. `data-size` or `aria-selected`. */
  name: string;
  /** Allowed values; comma-separated codes or "—" when no value is required. */
  values: string;
  description: string;
}

export interface ComponentApi {
  /** CSS @import path, e.g. `./components/button.css`. */
  importPath?: string;
  cssClasses?: ApiClassEntry[];
  /** Omitted when the component has no attribute API. */
  attributes?: ApiAttributeEntry[];
  /**
   * Fallback raw HTML for components whose legacy Code tab didn't follow the
   * standard "Import + CSS Classes + Data Attributes" structure (e.g. `link`,
   * which shows raw <a> samples instead). Renderer uses this when the
   * structured fields are empty.
   */
  rawCodeHtml?: string;
}
