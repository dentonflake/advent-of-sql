export default function Loading() {
  return (
    <main
      className="page-container loading-state"
      aria-busy="true"
      aria-label="Loading the workshop"
    >
      <span className="eyebrow">OPENING THE WORKSHOP</span>
      <div className="loading-line" />
      <div className="loading-line short" />
      <p>A moment for a little Christmas magic…</p>
    </main>
  );
}
