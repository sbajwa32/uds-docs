# UDS Documentation Site — Agent Notes

This repo is the design-to-engineering handoff specification for the
**Urban Design System (UDS)**. The deployed site is hosted on GitHub Pages.

The site is a static HTML/CSS/JS app — no build step, no bundler, no
framework. Edit files, push, GitHub Actions auto-deploys.

## Project layout

| Path | What it is |
| --- | --- |
| `uds-docs/` | The documentation site (HTML, CSS, JS) |
| `uds-docs/index.html` | The shell. Hash-routed SPA. |
| `uds-docs/app.js` | All the runtime logic — playgrounds, tabs, search, completeness pill, version dropdown, etc. |
| `uds-docs/components/` | Per-component CSS files (one per component) |
| `uds-docs/scripts/` | Per-component JS files (one per component) |
| `uds-docs/content/` | **Per-component spec JSON.** The Guidelines tab is rendered from these. |
| `uds-docs/content/schema.json` | Schema for the spec JSON. |
| `uds-docs/uds/` | The downloadable UDS package — token CSS only (primitives, semantic, font-scale). Components live in Storybook. |
| `uds-docs/versions/` | Snapshots of older site versions (UDS 0.1, etc.) |
| `uds-docs/version.txt` | Current SITE version (auto-bumped) |
| `uds-docs/bump-site.sh` | Run this BEFORE making changes — bumps the SITE version using the actual system date. |
| `uds-docs/release.sh` | Run this when bumping UDS version (creates a snapshot). |
| `.cursor/rules/` | Workflow rules (pre-flight, site changelog, release workflow, etc.) |
| `.cursor/skills/new-component/` | Skill that scaffolds a new component end to end. |
| `.cursor/agents/spec-audit.md` | Read-only subagent that audits spec completeness across all components. |
| `.github/workflows/deploy.yml` | Auto-deploys `uds-docs/` to GitHub Pages on push to main. |

## Cursor Cloud / Background Agent specifics

- **No install step.** `.cursor/environment.json` declares an empty install
  and starts a `python3 -m http.server` on port 4000 inside `uds-docs/`. If
  you need to test a render, `curl http://localhost:4000/` works inside the
  cloud VM.
- **Desktop preview is pre-wired.** On every fresh Cloud Agent VM, the
  `start` command in `.cursor/environment.json` runs `.cursor/desktop-preview.sh`
  which (a) sets Plank to auto-hide so the dock doesn't cover content,
  (b) waits for the doc-site server on port 4000, and (c) launches Chrome
  on `DISPLAY=:1` at `http://localhost:4000/` sized to fill the 1920x1200
  VNC display. To take a screenshot of what the user sees on the desktop
  preview, `pip3 install pyscreenshot pillow` (already present) and run
  `DISPLAY=:1 python3 -c "import pyscreenshot; pyscreenshot.grab().save('/tmp/shot.png')"`.
  To drive the browser (navigate, scroll, hover, click), use `xdotool`
  with `DISPLAY=:1`. The script is idempotent — re-running it is safe.
- **The agent VM is Ubuntu.** All the bash scripts (`bump-site.sh`,
  `release.sh`) are POSIX-friendly. `bump-site.sh` uses BSD `sed -i ''` —
  on Linux this becomes `sed -i` (no empty arg). If you hit a sed error in
  the cloud, that's why; tell the user.
- **Always preflight.** Before making ANY content/code change, run
  `bash uds-docs/bump-site.sh`. This is enforced by
  `.cursor/rules/uds-master-preflight.mdc`.
- **Always add a SITE_CHANGELOG entry.** The `SITE_CHANGELOG` array in
  `uds-docs/app.js` MUST get a new entry that matches the version
  `bump-site.sh` just produced. Newest entries go FIRST in the array (the
  renderer reverses for display).
- **Cache-bust `app.js` if its contents changed.** In `index.html` find the
  `<script src="app.js?v=...">` tag and bump the version number. This
  prevents stale browser caches.
- **Storybook is the source of truth for production component code.** This
  doc site is the **specification only**. Don't generate framework code or
  React/Vue snippets here.
- **The Guidelines tab is JSON-driven.** Never re-introduce static
  guidelines HTML into `index.html`. Edit `uds-docs/content/<id>.json`.

## Standard task flow for an agent

1. `bash uds-docs/bump-site.sh` (preflight — bumps SITE version)
2. Make the change
3. Add a `SITE_CHANGELOG` entry in `uds-docs/app.js` matching the new version
4. If `app.js` content changed, bump `?v=N` on its `<script>` tag in `index.html`
5. If a component or token changed, also add a per-component CHANGELOG entry
   under `uds-docs/app.js` (`category: "components"` or `"tokens"`)
6. `git add -A && git commit -m "<concise message>" && git push`

That's it. GitHub Actions handles the deploy.

## Common subagents to use

- **`spec-audit`** (read-only): Audits all `content/*.json` files and
  reports completeness gaps. Use when the user asks "what specs are
  incomplete?" or before a release.

## Common skills to use

- **`new-component`**: Scaffolds a new component (JSON, CSS, sidebar entry,
  page section, COMPONENT_STATUS entry, SITE bump). Use when the user
  says "add a new X component".

## Don't do

- Don't add framework code (React/Vue/Svelte) anywhere. The site is vanilla.
- Don't put component spec content directly in `index.html` — use `content/<id>.json`.
- Don't skip the preflight `bump-site.sh`. It's not optional.
- Don't commit framework files (`node_modules/`, `package-lock.json` from a build, etc.).
- Don't change `versions.json` casually — it controls the version dropdown
  in the header. The `release.sh` script manages it.
