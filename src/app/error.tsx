"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-container centered-state">
      <span className="eyebrow">A SMALL WORKSHOP HICCUP</span>
      <h1>The lantern went out.</h1>
      <p>We couldn’t load this page. Please try again in a moment.</p>
      <button onClick={reset} className="button primary">
        Try again
      </button>
      <a className="inline-link" href="/">
        Back to the home page
      </a>
    </main>
  );
}
