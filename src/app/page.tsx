import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Sparkles,
  Database,
  Terminal,
  Star,
} from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { getLearner } from "@/lib/learner";
import { nextPuzzle } from "@/lib/progression";
export default async function Home() {
  const learner = await getLearner();
  const next = nextPuzzle(learner?.completions ?? []);
  const destination = learner
    ? next
      ? `/2025/day/${next.day}`
      : "/workshop"
    : "/sign-in";
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <Image
            src="/images/workshop.webp"
            alt="A snowy Santa’s workshop with glowing windows, pine trees, and a sleigh full of gifts"
            fill
            priority
            sizes="100vw"
            className="hero-image"
          />
          <div className="hero-wash" />
          <div className="hero-content">
            <span className="eyebrow">
              <span /> THE 2025 ADVENTURE
            </span>
            <h1>
              A little query.
              <br />A little <em>Christmas magic.</em>
            </h1>
            <p>
              Twelve days in Santa’s workshop.
              <br />
              Twenty-four puzzles. One cozy way to learn SQL.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href={destination}>
                {learner
                  ? next
                    ? "Continue your adventure"
                    : "Your completed adventure"
                  : "Enter the workshop"}
                <ArrowRight size={18} />
              </Link>
              <Link className="hero-secondary" href="/setup">
                Get the database <Download size={16} />
              </Link>
            </div>
            <div className="hero-footnote">
              <Sparkles size={15} /> For beginners. For the joy of figuring it
              out.
            </div>
          </div>
        </section>
        <section className="intro-strip">
          <span>YOUR CHRISTMAS MISSION</span>
          <p>
            Santa needs a helping hand.
            <br />
            <strong>And you have just the query.</strong>
          </p>
          <div>
            The letters are piling up, the shelves need sorting, and the sleigh
            won’t pack itself. Follow the clues in the workshop’s database, one
            day at a time.
          </div>
        </section>
        <section className="how-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A SIMPLE LITTLE RITUAL</span>
              <h2>
                Make a cup of cocoa.
                <br />
                Pull up a database.
              </h2>
            </div>
            <p>
              About 15–30 minutes a day.
              <br />
              Go at your own pace. All twelve days are here.
            </p>
          </div>
          <div className="steps">
            <article>
              <span className="step-number">01</span>
              <Database size={27} strokeWidth={1.3} />
              <h3>Set up your workshop</h3>
              <p>
                Choose PostgreSQL, MySQL, or SQLite. Download one script and
                your workshop is ready.
              </p>
              <Link href="/setup">
                Choose your database <ArrowRight size={15} />
              </Link>
            </article>
            <article>
              <span className="step-number">02</span>
              <Terminal size={27} strokeWidth={1.3} />
              <h3>Follow the daily story</h3>
              <p>
                Read the puzzle, explore the tables, and run real SQL in your
                own database.
              </p>
            </article>
            <article>
              <span className="step-number">03</span>
              <Star size={27} strokeWidth={1.3} />
              <h3>Find an answer. Earn a star.</h3>
              <p>
                Submit your result to unlock the next part. Two stars open the
                next day of the adventure.
              </p>
            </article>
          </div>
        </section>
        <section className="invitation">
          <TreeDecoration />
          <div>
            <span className="eyebrow">
              TWELVE DAYS. A WORKSHOP FULL OF WONDER.
            </span>
            <h2>Your first letter is waiting.</h2>
            <p>
              Start with a simple SELECT. Finish with a sleigh ready for
              Christmas.
            </p>
            <Link href={destination} className="button primary">
              {learner ? "Back to your adventure" : "Let’s begin"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
function TreeDecoration() {
  return (
    <div aria-hidden="true" className="invitation-mark">
      ✦
    </div>
  );
}
