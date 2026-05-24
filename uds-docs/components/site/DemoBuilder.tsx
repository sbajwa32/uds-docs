'use client';

// Demo Builder UI — Chunk 12b stub. Full implementation lands across the
// remaining steps in this chunk: dialog markup, focus trap, history,
// preview overlay, ZIP export. Exists now so the SiteHeader Build Demo
// slot can be filled and the legacy stub there can be retired.

export function DemoBuilder() {
  return (
    <span className="udc-tooltip-wrapper">
      <button
        type="button"
        className="sg-demo-btn"
        aria-label="Build Demo (Chunk 12b — in progress)"
        title="Demo Builder — in progress"
        disabled
      >
        <span className="material-symbols-outlined">construction</span>
      </button>
      <span className="udc-tooltip" role="tooltip" data-position="bottom">
        Build a multi-component HTML demo
      </span>
    </span>
  );
}
