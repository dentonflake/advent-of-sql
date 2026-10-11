import Link from "next/link";
import { ArrowRight, LockKeyhole, Check, Star, Download } from "lucide-react";
import { Header, Footer, Stars } from "@/components/shell";
import { getLearner } from "@/lib/learner";
import challenges from "@/lib/challenges.json";
import { isDayUnlocked, nextPuzzle } from "@/lib/progression";
export const metadata = { title: "Your workshop" };
export default async function Workshop() {
  const learner = await getLearner();
  const completed = learner?.completions ?? [];
  const next = nextPuzzle(completed);
  return (
    <>
      <Header />
      <main className="page-container" id="main">
        <div className="workshop-heading">
          <div>
            <span className="eyebrow">CHRISTMAS AT THE NORTH POLE · 2025</span>
            <h1>Your workshop awaits.</h1>
            <p>
              {learner
                ? next
                  ? "A new clue, a warm cup, and a little more SQL."
                  : "You did it. The sleigh is ready, and Christmas is on its way."
                : "Twelve small adventures. Sign in to collect your stars."}
            </p>
          </div>
          <div className="total-stars">
            <Star size={25} fill="currentColor" />
            <strong>
              {completed.length}
              <span> / 24</span>
            </strong>
            <small>CHRISTMAS STARS</small>
          </div>
        </div>
        <div
          className="progress-track"
          aria-label={`${completed.length} of 24 puzzles complete`}
        >
          <span style={{ width: `${(completed.length / 24) * 100}%` }} />
        </div>
        <div className="workshop-tools">
          <Link href="/setup">
            <Download size={16} /> Get your workshop database
          </Link>
          <span>Two parts per day · 15–30 minutes</span>
        </div>
        {!learner && (
          <div className="notice">
            <p>Save your adventure across devices with a free account.</p>
            <Link href="/sign-in" className="button primary small">
              Sign in to begin <ArrowRight size={16} />
            </Link>
          </div>
        )}
        <div className="calendar-grid">
          {challenges.map((challenge) => {
            const count = completed.filter(
              (c) => c.day === challenge.day,
            ).length;
            const open = isDayUnlocked(completed, challenge.day);
            const current = next?.day === challenge.day;
            const inner = (
              <>
                <div className="day-top">
                  <span>
                    DAY <b>{String(challenge.day).padStart(2, "0")}</b>
                  </span>
                  <Stars count={count} />
                </div>
                <h2>{challenge.title}</h2>
                <p>{challenge.concept}</p>
                <div className="day-bottom">
                  {count === 2 ? (
                    <>
                      <Check size={15} /> Completed
                    </>
                  ) : open ? (
                    <>
                      {current ? "Your next chapter" : "Begin this day"}
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={14} /> Complete day {challenge.day - 1}
                    </>
                  )}
                </div>
              </>
            );
            return open ? (
              <Link
                href={learner ? `/2025/day/${challenge.day}` : "/sign-in"}
                key={challenge.day}
                className={`day-tile ${current ? "current" : ""} ${count === 2 ? "complete" : ""}`}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={challenge.day}
                className="day-tile locked"
                aria-label={`Day ${challenge.day}: ${challenge.title}, locked`}
              >
                {inner}
              </div>
            );
          })}
        </div>
        <div className="workshop-note">
          ✦ Every great query starts with a little curiosity.
        </div>
      </main>
      <Footer />
    </>
  );
}
