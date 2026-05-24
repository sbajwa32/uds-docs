import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

// Home page (`/`). Temporary "welcome" placeholder during the rebuild.
// The real intent is for `/` to either show the Changelog (matching the
// legacy site default) or land on a richer overview — that decision is
// deferred to Chunks 06a (Changelog) and beyond.

export default function HomePage() {
  return (
    <>
      <SgPageTitle>UDS — Urban Design System</SgPageTitle>
      <SgPageDesc>
        Welcome to the UDS documentation site. Browse the sidebar to explore
        components, foundations, tools, and reference material. Pages will
        appear as the migration progresses — see the Changelog for a current
        snapshot of what&apos;s landed.
      </SgPageDesc>
    </>
  );
}
