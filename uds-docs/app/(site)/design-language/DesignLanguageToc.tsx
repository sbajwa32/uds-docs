'use client';

// Wires the design-language page's sticky ToC behavior:
//   - Smooth-scroll on link click (no hash change so the URL stays clean).
//   - IntersectionObserver scroll-spy that highlights the matching ToC link.
//
// Direct port of registerPageLoadHook('design-language', ...) from
// docs/app.js:125-166. The ToC and target sections are rendered inside the
// page body via dangerouslySetInnerHTML, so this component just attaches DOM
// listeners after mount via useEffect.

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function DesignLanguageToc({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tocLinks = root.querySelectorAll<HTMLAnchorElement>('.sg-dl-toc a[href^="#"]');
    if (!tocLinks.length) return;

    // Smooth scroll on click without touching window.location.hash.
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLAnchorElement;
      const id = link.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    tocLinks.forEach((link) => link.addEventListener('click', onClick));

    // Scroll-spy: highlight the ToC link for whatever section is in view.
    const sections = root.querySelectorAll<HTMLElement>('section.sg-dl-section[id]');
    let observer: IntersectionObserver | null = null;
    if (sections.length && typeof IntersectionObserver !== 'undefined') {
      const linkById: Record<string, HTMLAnchorElement> = {};
      tocLinks.forEach((l) => {
        const id = l.getAttribute('href')?.slice(1);
        if (id) linkById[id] = l;
      });
      const setActive = (id: string) => {
        Object.values(linkById).forEach((l) => l.classList.remove('active'));
        linkById[id]?.classList.add('active');
      };
      let activeId: string | null = null;
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length && visible[0].target.id !== activeId) {
            activeId = visible[0].target.id;
            setActive(activeId);
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
      );
      sections.forEach((s) => observer!.observe(s));
    }

    return () => {
      tocLinks.forEach((link) => link.removeEventListener('click', onClick));
      observer?.disconnect();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
