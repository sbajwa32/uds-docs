'use client';

// Token Search command palette — keyboard-accessible search over every
// --uds-* CSS custom property declared in the loaded stylesheets.
// Open with `/` or Cmd/Ctrl+K, type to filter, Enter to copy var(--name)
// to clipboard.
//
// Direct port of docs/modules/token-search/index.js (Phase 15a) into a
// single client component. The legacy version mounted a static modal in
// index.html and wired imperative listeners; this version owns the
// trigger button + modal markup and keeps state in React.
//
// Stub for proof-of-session — full implementation lands across the
// remaining steps in this chunk.

export function TokenSearch() {
  return (
    <button
      type="button"
      className="sg-header-search-trigger"
      aria-label="Search tokens (Chunk 10 — in progress)"
      aria-haspopup="dialog"
      title="Token search — in progress"
      disabled
    >
      <span className="material-symbols-outlined sg-header-search-trigger__icon">search</span>
      <span className="sg-header-search-trigger__placeholder">Search tokens...</span>
      <span className="sg-header-search-trigger__kbds">
        <kbd>/</kbd>
        <kbd>⌘K</kbd>
      </span>
    </button>
  );
}
