'use client';

// Wrapper for static prose pages (About, Design Language, Design Process,
// Getting Started, etc.) whose content is built as a single HTML string
// and rendered via `dangerouslySetInnerHTML`. Those strings contain
// hand-written internal links like `<a href="/cursor-workflows">` that
// bypass Next's `<Link>` because they aren't React nodes.
//
// On mount we walk the rendered DOM, find every internal `<a>` (anything
// that resolves to the same origin and isn't an explicit `target="_blank"`
// or `download`), and intercept its click handler to:
//
//   1. Preserve the active `?uds=` archive param via `withUdsVersion()`
//      so prose-link clicks don't drop a reader out of an archive view.
//   2. Use `router.push()` instead of a full document navigation so the
//      UDS-theme + UDS-version providers stay mounted (no theme reset).
//
// External links, mailto:/tel:/javascript:, hash-only links, and links
// with explicit `target` or `download` attributes pass through unchanged.

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useUdsVersion } from './UdsVersionProvider';
import { withUdsVersion } from './internal-href';

function isInternalAnchor(a: HTMLAnchorElement): boolean {
  // Treat empty/no-href, external, fragment-only, mailto/tel/etc. as
  // "leave alone". Only intercept same-origin path navigations.
  const raw = a.getAttribute('href');
  if (!raw) return false;
  if (a.target && a.target !== '' && a.target !== '_self') return false;
  if (a.hasAttribute('download')) return false;
  if (raw.startsWith('#')) return false;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) return false;
  if (/^[a-z]+:\/\//i.test(raw)) {
    // Absolute URL — only intercept if same origin.
    try {
      const url = new URL(raw, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return raw.startsWith('/');
}

export function ProseContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { fetchVersion } = useUdsVersion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    function onClick(e: MouseEvent) {
      // Only handle plain left-clicks. Cmd/Ctrl/Shift/middle-click should
      // still open in new tab / window. Right-click too.
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = (e.target as Element | null)?.closest?.('a');
      if (!(target instanceof HTMLAnchorElement)) return;
      if (!isInternalAnchor(target)) return;

      const raw = target.getAttribute('href') || '';
      const versioned = withUdsVersion(raw, fetchVersion);
      e.preventDefault();
      router.push(versioned);
    }

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [router, fetchVersion]);

  // Also normalize hrefs in-place so middle-click / "open in new tab" /
  // copy-link still carries the archive context. The click handler covers
  // the regular-click path; this covers the user-driven open-elsewhere
  // path. Re-run when fetchVersion flips so archive entries get rewritten.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    for (const a of anchors) {
      if (!isInternalAnchor(a)) continue;
      const raw = a.getAttribute('href') || '';
      const versioned = withUdsVersion(raw, fetchVersion);
      if (raw !== versioned) a.setAttribute('href', versioned);
    }
  }, [fetchVersion, html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
