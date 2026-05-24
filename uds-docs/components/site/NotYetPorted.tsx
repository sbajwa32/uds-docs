// Shared placeholder for routes that exist (so sidebar links resolve) but
// whose content lands in a later chunk. Used heavily during the migration
// rebuild; deleted (or replaced wholesale) as each chunk fills in its pages.
//
// (Stub — wired up in subsequent commits of Chunk 05.)
import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

export function NotYetPorted({
  title,
  chunkRef,
}: {
  title: string;
  /** The migration chunk that will replace this placeholder, e.g. "06a", "07". */
  chunkRef: string;
}) {
  return (
    <>
      <SgPageTitle>{title}</SgPageTitle>
      <SgPageDesc>
        Not yet ported. Lands in Chunk {chunkRef} of the docs Next.js migration.
      </SgPageDesc>
    </>
  );
}
