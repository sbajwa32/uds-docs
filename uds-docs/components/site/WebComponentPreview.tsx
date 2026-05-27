'use client';

import { useEffect } from 'react';

import { registerUdsComponents } from '@uds/web-components';

export function WebComponentPreview({ html }: { html: string }) {
  useEffect(() => {
    registerUdsComponents();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
