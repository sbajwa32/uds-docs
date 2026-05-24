'use client';

// Version dropdown — populates from `useUdsVersion().versions`, switches
// the active version on change. Replaces the disabled stub from Chunk
// 05.

import { useUdsVersion } from './UdsVersionProvider';

export function VersionDropdown() {
  const { activeVersion, liveVersion, versions, setActiveVersion } = useUdsVersion();
  // The dropdown value is the explicit string "live" for the current
  // release, or the archived version literal otherwise. Avoids the
  // empty-string footgun that breaks <option> equality.
  const value = activeVersion ?? liveVersion;

  return (
    <select
      className="sg-version-select"
      aria-label="UDS version"
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        setActiveVersion(next === liveVersion ? null : next);
      }}
    >
      {versions.map((v) => (
        <option key={v} value={v}>
          UDS {v}
          {v === liveVersion ? ' (current)' : ''}
        </option>
      ))}
    </select>
  );
}
