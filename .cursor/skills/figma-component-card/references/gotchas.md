# UDS Figma Component Card — Gotchas

Hard-won lessons from the Button pilot. Skipping any of these will cost the next agent 20+ turns of debugging. Read this BEFORE the first `use_figma` call.

## Variable bindings

### Always re-import library variables fresh in every `use_figma` call

```js
// CORRECT — within each use_figma call, fresh import
const tp = await figma.variables.importVariableByKeyAsync('f5a3ae409e24defe81a3ccbeba0ab5e2c09979d1');
node.fills = [figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:0,g:0,b:0}}, 'color', tp)];
```

```js
// WRONG — using a Variable ID stored across calls (e.g. via setSharedPluginData)
const tp = await figma.variables.getVariableByIdAsync(storedTokenId);  // returns a stub
node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', tp)];  // looks bound, isn't
```

`getVariableByIdAsync` with a previously imported library variable's ID returns a "stub" Variable object. The binding APIs accept it without erroring, the resulting paint LOOKS bound when inspected, but at render time the literal color shows through and the variable isn't actually bound. Only `importVariableByKeyAsync` produces a real Variable suitable for `setBoundVariableForPaint`.

This is the single most expensive gotcha. Burned ~10 turns on the pilot.

### Bind paints, not fills arrays

```js
// CORRECT
let p = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
p = figma.variables.setBoundVariableForPaint(p, 'color', variable);
node.fills = [p];
```

```js
// WRONG — Figma throws "fills and strokes variable bindings must be set on paints directly"
node.setBoundVariable('fills', variable);
```

### Pass a real color literal in the paint

The literal `color` value in the paint is what shows when the variable can't resolve (e.g. file not subscribed, mode mismatch). Always pass the resolved-in-default-mode color, not pure white. This was a footgun: passing `{r:1,g:1,b:1}` for a `text-primary` binding made screenshots look broken even though the binding was correct, because Figma sometimes rendered the literal during preview.

```js
// CORRECT
const make = (variable, color) => figma.variables.setBoundVariableForPaint({type:'SOLID', color}, 'color', variable);
make(tp, { r: 0.09, g: 0.09, b: 0.09 });  // text-primary literal matches resolved value

// WRONG
make(tp, { r: 1, g: 1, b: 1 });  // looks invisible until binding resolves; debug nightmare
```

The default-mode resolved values for the colors used most often:

| Token | Default mode color (RGB 0–1) |
|---|---|
| `text-primary` | `0.09, 0.09, 0.09` (near black) |
| `text-secondary` | `0.4, 0.4, 0.4` (medium gray) |
| `text-warning` | `0.78, 0.46, 0.04` (orange) |
| `text-inverse` | `1, 1, 1` (white) |
| `surface-main` | `1, 1, 1` (white) |
| `surface-subtle` | `0.96, 0.96, 0.96` (off-white) |
| `surface-xxbold` | `0.04, 0.04, 0.04` (near black; in light mode this resolves to a dark gray) |
| `border-tertiary` | `0.96, 0.96, 0.96` (very subtle) |
| `border-warning` | `0.95, 0.6, 0.1` (orange) |

## Auto-layout sizing

### Set `layoutSizingHorizontal/Vertical` AFTER `appendChild`

```js
// CORRECT
const card = figma.createAutoLayout('VERTICAL');
parent.appendChild(card);
card.layoutSizingHorizontal = 'FILL';  // works because card is now in an auto-layout parent
card.layoutSizingVertical = 'HUG';
```

```js
// WRONG
const card = figma.createAutoLayout('VERTICAL');
card.layoutSizingHorizontal = 'FILL';  // throws: "FILL can only be set on children of auto-layout frames"
parent.appendChild(card);
```

### `HUG` requires the node to BE an auto-layout frame

```js
// CORRECT — make spacers via createAutoLayout
const spacer = figma.createAutoLayout('HORIZONTAL', { name: 'spacer', fills: [] });
parent.appendChild(spacer);
spacer.layoutSizingHorizontal = 'FILL';
spacer.layoutSizingVertical = 'HUG';
```

```js
// WRONG
const spacer = figma.createFrame();  // not auto-layout
parent.appendChild(spacer);
spacer.layoutSizingVertical = 'HUG';  // throws: "HUG can only be set on auto-layout frames"
```

### `minHeight = 0` throws — use `null` to unset

```js
node.minHeight = null;  // CORRECT
node.minHeight = 0;     // WRONG: "minHeight cannot be set to 0, use null to unset"
```

### Resize before sizing modes if you need a specific dimension

`node.resize(w, h)` resets sizing modes to `FIXED` on both axes. So if you want `FILL` width and a fixed 360 height: resize FIRST, then set sizing.

## Auto-layout enums

`counterAxisAlignItems` only accepts `'MIN' | 'MAX' | 'CENTER' | 'BASELINE'`. There is no `'START'` (CSS muscle memory). Use `'MIN'` instead.

## Page switching

```js
// CORRECT
await figma.setCurrentPageAsync(page);

// WRONG
figma.currentPage = page;  // throws "Setting figma.currentPage is not supported"
```

`figma.currentPage` resets to the first page at the start of every `use_figma` call. Always re-set it.

## Component set inspection

To find state variants by name:

```js
const set = figma.getNodeById(setId);
const byState = {};
for (const c of set.children) {
  const m = /State=(\w+)/.exec(c.name);
  const dest = /Destructive=False/.test(c.name);
  const def = /Size=Default/.test(c.name);
  const noLead = /Show Leading Icon=False/.test(c.name);
  const noTrail = /Show Trailing Icon=False/.test(c.name);
  const noIO = /Icon Only=False/.test(c.name);
  if (dest && def && noLead && noTrail && noIO && m && !byState[m[1]]) {
    byState[m[1]] = c.id;
  }
}
// byState = { Default: '...', Hover: '...', Active: '...', Disabled: '...', ... }
```

The variant property names (`State`, `Destructive`, `Size`, `Show Leading Icon`, etc.) vary between components — this regex set works for Button. For other components, inspect first to find the property names.

For default fallback: `set.defaultVariant` always returns one valid component, so use it as a hero if state-parsing fails.

## Reparenting component sets

When rebuilding a page, you'll want to MOVE existing component sets (not duplicate them). Steps:

1. Move them to a temp location at the page level: `page.appendChild(setNode); setNode.x = 5000; setNode.y = -5000;`
2. Delete the old wrapper frame
3. Build the new wrapper
4. Reparent the sets into the new wrapper's appropriate cards

`appendChild` from anywhere to anywhere preserves the node's identity and ID. Code Connect mappings, instance references, and library bindings all survive.

## Screenshots and verification

### `Read` tool image cache

The Cursor `Read` tool caches images aggressively by some opaque key (path + content hash + ???). The same on-disk file can render as different cached images depending on read history. Workarounds:

- Save with a UUID-stamped filename: `dh_$(uuidgen).png`
- Better: write to a fresh directory per fetch: `/tmp/figma-shots-$(date +%s%N)/`
- Best: skip `Read` entirely. Trust structural inspection from `use_figma` (walk the tree, return character contents and dimensions). Only render screenshots for end-of-build review.

### Inline `screenshot()` is fine but contentsOnly:false includes overlapping nodes

```js
await frame.screenshot({ scale: 0.5, contentsOnly: true });  // isolated to this frame
```

### Screenshot URLs from `get_screenshot` are short-lived

Download via `curl` immediately. If you wait too long, you get a 403.

## Atomic failures

Failed `use_figma` scripts execute zero changes — the file remains untouched. So if your script throws halfway through, you're not in a half-built state. Just fix the script and retry. No cleanup needed.

The corollary: `try/catch` around individual operations to "best-effort" build a card is generally counterproductive. If a paint binding throws, the rest of the card needs that binding too. Fail fast, fix, retry.

## Spacing tokens beyond `space/400`

The space tokens 050 through 400 (4–32px) resolve correctly when read via the Variable API. Tokens 500+ (40, 48, 64, 80, 96, 100, 112…) sometimes resolve to 0 in the Variable API even though they bind correctly at render time. Don't trust `valuesByMode` for the larger spaces — bind them and let Figma render. Verified at render time on the Button pilot.

## Sandboxed shell

If `curl` to a Figma asset URL returns exit 56 ("CONNECT tunnel failed, response 403"), the shell session got sandboxed mid-conversation. The Figma asset URL itself is fine; you just need the shell to have full network. Either request `required_permissions: ["full_network"]` on the Shell call, or use the inline `await node.screenshot()` route (returned in the `use_figma` response) which doesn't require shell at all.

## Don't bother

- **Trying to set page-level color modes from a script.** `page.setExplicitVariableModeForCollection` works but switching modes mid-build for "preview" purposes will make your screenshots inconsistent. Just bind correctly and trust the file's mode setting.
- **Using `figma.notify`.** Throws "not implemented".
- **Using `console.log` to communicate with the agent.** Only `return` is observable.
