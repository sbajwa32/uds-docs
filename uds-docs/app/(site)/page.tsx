'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

// Home page (`/`). The legacy site landed on `semantic-colors` by default
// when the URL had no fragment; preserve that behavior with a
// client-side redirect. Static export still emits a `/index.html`
// document that shows the welcome copy below if JS is disabled or the
// redirect hasn't run yet.

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/semantic-colors');
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
