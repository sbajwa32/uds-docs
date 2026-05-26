'use client';

// Banner shown when the user is viewing an archived UDS version. Renders
// nothing in the live view. Click "Return to current" to go back.

import { useUdsVersion } from './UdsVersionProvider';

import '../../styles/site/archive-banner.css';

export function ArchiveBanner() {
  const { isArchive, activeVersion, liveVersion, setActiveVersion } = useUdsVersion();
  if (!isArchive || !activeVersion) return null;

  return (
    <div className="sg-archive-banner" role="status">
      <span className="sg-archive-banner__label">
        You&apos;re viewing UDS{' '}
        <strong className="sg-archive-banner__version">{activeVersion}</strong>
        {' '}— an archived release. The live design system is UDS{' '}
        <strong>{liveVersion}</strong>.
      </span>
      <button
        type="button"
        className="sg-archive-banner__exit"
        onClick={() => setActiveVersion(null)}
      >
        Return to current
      </button>
    </div>
  );
}
