import type { MDXComponents } from 'mdx/types';

// Required by @next/mdx when MDX pages live in app/ (App Router).
// Later chunks will populate this with chrome wrappers (e.g. <SgPageTitle> for h1).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
