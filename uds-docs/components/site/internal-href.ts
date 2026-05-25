// Version-aware internal-href helper.
//
// When a user is viewing an archive snapshot (`?uds=0.2`), every internal
// link in the docs site must preserve that query param. Otherwise clicking
// a sidebar entry, version dropdown nav, or footer link silently drops the
// user back to the live release — which the migration review caught as
// "Archive navigation drops ?uds=0.2".
//
// All client-side anchors that point to another docs route MUST route their
// href through `withUdsVersion(href, fetchVersion)`. External URLs and
// anchor-fragment ("#…") hashes are returned unchanged.

const QUERY_KEY = 'uds';

export function withUdsVersion(href: string, fetchVersion: string | undefined): string {
  if (!fetchVersion) return href;
  // Leave external URLs and protocol-relative URLs alone.
  if (/^(?:[a-z]+:|\/\/)/i.test(href)) return href;
  // Leave pure fragment links alone — they don't navigate to a new route.
  if (href.startsWith('#')) return href;

  // Split off any existing fragment so we re-attach it after the query.
  const hashIdx = href.indexOf('#');
  const fragment = hashIdx >= 0 ? href.slice(hashIdx) : '';
  const beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;

  // Build / augment the query string.
  const qIdx = beforeHash.indexOf('?');
  const pathOnly = qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash;
  const search = qIdx >= 0 ? beforeHash.slice(qIdx + 1) : '';
  const params = new URLSearchParams(search);
  params.set(QUERY_KEY, fetchVersion);
  return `${pathOnly}?${params.toString()}${fragment}`;
}
