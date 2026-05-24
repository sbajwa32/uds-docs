// HTML escape utility shared by per-component playground.js files. Each
// playground render(state) call uses esc() to safely interpolate user-typed
// label/text values into the generated HTML/JSX/Vue snippets.
//
// Phase 13: extracted from app.js when the global PLAYGROUNDS table was
// dissolved into per-component playground.js modules. The render() functions
// import esc directly so they're self-contained units that don't depend on
// app.js's lexical scope.

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
