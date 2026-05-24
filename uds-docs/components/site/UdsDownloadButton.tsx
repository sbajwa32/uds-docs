'use client';

// "Download UDS (.zip)" button used on the Getting Started page. Bundles
// the runnable UDS payload (tokens + per-component CSS/JS) into a zip
// via JSZip on click, then triggers a browser download.
//
// Direct port of the legacy `gs-download-btn` handler from
// `docs/app.js`.

import { useState } from 'react';

import { downloadUdsBundle } from '@/lib/demo-builder/zip';

export function UdsDownloadButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setBusy(true);
    try {
      await downloadUdsBundle(window.location.origin, 'uds.zip');
    } catch (e) {
      setError('Couldn’t build the zip: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="sg-download-btn"
        onClick={onClick}
        disabled={busy}
        style={{ marginBottom: 8 }}
      >
        <span className="material-symbols-outlined">
          {busy ? 'hourglass_top' : 'download'}
        </span>
        {busy ? 'Building zip…' : 'Download UDS (.zip)'}
      </button>
      {error ? (
        <p
          role="alert"
          style={{
            color: 'var(--uds-color-text-error)',
            fontSize: 'var(--uds-font-size-sm)',
            marginTop: 'var(--uds-space-050)',
          }}
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
