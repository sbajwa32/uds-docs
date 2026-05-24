export default function HomePage() {
  return (
    <main
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '40rem',
        margin: '4rem auto',
        padding: '0 1.5rem',
        lineHeight: 1.6,
        color: '#1a1a1a',
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: '2rem', fontWeight: 700 }}>
        UDS migration in progress
      </h1>
      <p>
        The Urban Design System documentation site is being rebuilt on
        TypeScript + React + Next.js. This URL is the staging build for that
        work — pages will appear here as the migration progresses.
      </p>
      <p>
        The live site is still at{' '}
        <a href="https://udsdocs.com" style={{ color: '#0b5fff' }}>
          udsdocs.com
        </a>
        .
      </p>
    </main>
  );
}
