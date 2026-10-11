import Link from "next/link";
import { TreePine, ArrowUpRight, Star } from "lucide-react";
import { getLearner } from "@/lib/learner";
import { SignOut } from "./sign-out";
export async function Header() {
  const learner = await getLearner();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Advent of SQL home">
          <TreePine size={26} strokeWidth={1.5} />
          <span>
            Advent of <b>SQL</b>
            <small>A NORTH POLE ADVENTURE</small>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/workshop">The challenges</Link>
          <Link href="/setup">Database setup</Link>
          {learner ? (
            <>
              <Link className="nav-progress" href="/workshop">
                <Star size={15} />
                {learner.completions.length}
                <span>/ 24</span>
              </Link>
              {learner.localPreview ? (
                <span className="preview-label">Local preview</span>
              ) : (
                <>
                  <Link href="/account">Account</Link>
                  <SignOut />
                </>
              )}
            </>
          ) : (
            <Link className="nav-signin" href="/sign-in">
              Sign in <ArrowUpRight size={16} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href="/">
          Advent of SQL
        </Link>
        <p>Made for curious minds and a little Christmas magic.</p>
      </div>
      <div className="footer-links">
        <Link href="/setup">Database setup</Link>
        <Link href="/about">About the adventure</Link>
        <Link href="/privacy">Privacy</Link>
        <span>2025 EDITION</span>
      </div>
    </footer>
  );
}
export function Stars({ count = 0 }: { count?: number }) {
  return (
    <span className="stars" aria-label={`${count} of 2 stars earned`}>
      {[1, 2].map((i) => (
        <Star
          key={i}
          size={17}
          strokeWidth={1.5}
          className={count >= i ? "earned" : ""}
          fill={count >= i ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
