import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { AggregatedChangelog } from '@/lib/uds-data';
import { ChangelogClient } from './ChangelogClient';

// Server component — reads the aggregated UDS changelog at build time and
// hands it to the client component along with the SITE changelog.

export const metadata = { title: 'Changelog — UDS' };

export default async function ChangelogPage() {
  const cssPath = path.join(process.cwd(), 'uds/CHANGELOG.json');
  const raw = await fs.readFile(cssPath, 'utf8');
  const udsChangelog = JSON.parse(raw) as AggregatedChangelog;

  return (
    <>
      <h1 className="sg-page-title">Changelog</h1>
      <p className="sg-page-desc">
        All notable changes to the Urban Design System and the documentation
        site.
      </p>
      <ChangelogClient udsChangelog={udsChangelog} />
    </>
  );
}
