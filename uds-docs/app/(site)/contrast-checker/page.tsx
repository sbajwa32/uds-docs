import { ContrastChecker } from '@/components/site/ContrastChecker';
import { DocsPageHeader } from '@/components/site/ui';

export const metadata = { title: 'Contrast Checker — UDS' };

export default function ContrastCheckerPage() {
  return (
    <>
      <DocsPageHeader
        title="Contrast Checker"
        description="Evaluate every text, icon, and border token against every surface token across all 6 supported themes. Computed live from resolved CSS variables. Click any pair to load it into the Compare panel."
      />
      <ContrastChecker />
    </>
  );
}
