import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-container centered-state">
      <span className="eyebrow">A LETTER GONE ASTRAY</span>
      <h1>This page isn’t in the ledger.</h1>
      <p>Let’s get you back to the workshop.</p>
      <Link href="/workshop" className="button primary">
        Return to the challenges →
      </Link>
    </main>
  );
}
