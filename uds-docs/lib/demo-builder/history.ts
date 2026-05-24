// localStorage-backed Demo Builder history. Direct port of
// docs/modules/demo-builder/history.js into a typed module.
//
// Cap-at-2 is preserved verbatim: each blob can be hundreds of KB
// (the entire generated HTML is stored so "Open last build" works
// without rebuilding), so localStorage runs out of room fast.

export const STORAGE_KEY = 'uds-demo-history';

export interface DemoHistoryEntry {
  timestamp: string;
  framework: 'html';
  theme: {
    colorScheme: string;
    brand: string;
    font: string;
  };
  components: string[];
  componentCount: number;
  sizeKB: number;
  blobHtml: string;
}

export function getHistory(): DemoHistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: DemoHistoryEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  const trimmed = history.slice();
  while (trimmed.length > 2) trimmed.shift();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded — drop oldest and retry once.
    if (trimmed.length > 1) {
      trimmed.shift();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Give up; the user just won't see the history card.
      }
    }
  }
}

export function pushHistory(entry: DemoHistoryEntry): DemoHistoryEntry[] {
  const next = [...getHistory(), entry];
  saveHistory(next);
  return next;
}
