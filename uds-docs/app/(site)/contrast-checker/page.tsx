import { ContrastChecker } from '@/components/site/ContrastChecker';
import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';

export const metadata = { title: 'Contrast Checker — UDS' };

export default function ContrastCheckerPage() {
  return (
    <>
      <SgPageTitle>Contrast Checker</SgPageTitle>
      <SgPageDesc>
        Evaluate every text, icon, and border token against every surface
        token across all 6 supported themes. Computed live from resolved CSS
        variables. Click any pair to load it into the Compare panel.
      </SgPageDesc>
      <ContrastChecker />
    </>
  );
}
