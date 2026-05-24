import { notFound } from 'next/navigation';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ComponentPageClient } from './ComponentPageClient';

// Static shell for every component documentation page. generateStaticParams
// reads components.json at build time so each /<componentId> URL is prebuilt
// as out/<componentId>.html. Actual data fetching + rendering happens on the
// client in ComponentPageClient — that gives us version-aware archive viewing
// for free in Chunk 14 (the URL gains ?uds=0.2 and the client refetches).

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

export async function generateMetadata({ params }: PageProps) {
  const { componentId } = await params;
  const components = await readComponents();
  const component = components.find((c) => c.id === componentId);
  return {
    title: component ? `${component.title} — UDS` : `${componentId} — UDS`,
  };
}

export default async function ComponentPage({ params }: PageProps) {
  const { componentId } = await params;
  const components = await readComponents();
  const component = components.find((c) => c.id === componentId);

  if (!component) {
    notFound();
  }

  return <ComponentPageClient componentId={componentId} />;
}
