'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

// Home page (`/`). The legacy site landed on `semantic-colors` by default
// when the URL had no fragment; preserve that behavior with a
// client-side redirect. Static export still emits a `/index.html`
// document that shows the welcome copy below if JS is disabled or the
// redirect hasn't run yet.
//
// Preserve `?uds=` (and any other future query params) across the
// redirect so `/?uds=0.2` lands on `/semantic-colors?uds=0.2` and the
// reader stays inside the archive view across a refresh. The legacy
// behavior was a hash route that carried the query string by accident;
// we have to do it deliberately now.

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`/semantic-colors${search}`);
  }, [router]);

  return (
    <>
      <SgPageTitle>UDS — Urban Design System</SgPageTitle>
      <SgPageDesc>
        Welcome to the UDS documentation site. Loading the Semantic Colors
        page…
      </SgPageDesc>
    </>
  );
}
