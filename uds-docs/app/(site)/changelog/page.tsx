import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { AggregatedChangelog } from '@/lib/uds-data';
import { DocsPageHeader } from '@/components/site/ui';
import { ChangelogClient } from './ChangelogClient';

// Server component — reads the LIVE aggregated UDS changelog at build
// time and hands it to the client component as the initial value. The
// client may re-fetch a per-version changelog when the user switches
// archive versions (Chunk 14); the initial server load avoids a
// fetch+spinner on first paint of the live view.

export const metadata = { title: 'Changelog — UDS' };

export default async function ChangelogPage() {
  const cssPath = path.join(process.cwd(), 'uds/CHANGELOG.json');
  const raw = await fs.readFile(cssPath, 'utf8');
  const udsChangelog = JSON.parse(raw) as AggregatedChangelog;

  return (
    <>
      <DocsPageHeader
        title="Changelog"
        description="All notable changes to the Urban Design System and the documentation site."
      />
      <ChangelogClient initialUdsChangelog={udsChangelog} />
    </>
  );
}
