import { notFound } from 'next/navigation';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { NotYetPorted } from '@/components/site/NotYetPorted';

// Dynamic component page route. During Chunk 05 this is a placeholder — every
// component ID listed in uds/components.json gets a routable URL with a
// "Not yet ported, lands in Chunk 07" page body. Chunk 07 replaces the body
// with the real Guidelines / Code / Examples / Playground / Changelog tabs.
//
// generateStaticParams reads the on-disk components.json directly (Node fs)
// rather than via fetch, because this code runs at build time during static
// export — there's no server to fetch from yet. lib/uds-data.ts's runtime
// fetchers can't be reused here.

interface ComponentEntry {
  id: string;
  title: string;
}

interface ComponentsManifest {
  components: ComponentEntry[];
}

async function readComponents(): Promise<ComponentEntry[]> {
  const filePath = path.join(process.cwd(), 'uds', 'components.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw) as ComponentsManifest;
  return data.components;
}

export async function generateStaticParams() {
  const components = await readComponents();
  return components.map((c) => ({ componentId: c.id }));
}

interface PageProps {
  params: Promise<{ componentId: string }>;
}

export default async function ComponentPage({ params }: PageProps) {
  const { componentId } = await params;
  const components = await readComponents();
  const component = components.find((c) => c.id === componentId);

  if (!component) {
    notFound();
  }

  return <NotYetPorted title={component.title} chunkRef="07" />;
}
