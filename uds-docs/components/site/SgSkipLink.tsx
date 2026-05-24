// SgSkipLink — keyboard-only "Skip to main content" link.
// Renders absolutely-positioned off-screen until focused (matches legacy markup).
//
// (Stub — full styles + kit-sink rendering land in subsequent commits of Chunk 04.)
export function SgSkipLink({
  href = '#main-content',
  children = 'Skip to main content',
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a className="sg-skip-link" href={href}>
      {children}
    </a>
  );
}
