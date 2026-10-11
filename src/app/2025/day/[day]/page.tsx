import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Database,
  Clock,
} from "lucide-react";
import { Header, Footer, Stars } from "@/components/shell";
import { AnswerForm } from "@/components/answer-form";
import { getLearner } from "@/lib/learner";
import challenges from "@/lib/challenges.json";
import { isDayUnlocked, isPartUnlocked, hasCompleted } from "@/lib/progression";
import { dialectLabels } from "@/lib/dialects";
type Props = {
  params: Promise<{ day: string }>;
  searchParams: Promise<{ part?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { day } = await params;
  const challenge = challenges.find((c) => String(c.day) === day);
  return {
    title: challenge ? `Day ${day}: ${challenge.title}` : "Day not found",
  };
}
export default async function ChallengePage({ params, searchParams }: Props) {
  const { day: dayParam } = await params;
  const challenge = challenges.find((c) => String(c.day) === dayParam);
  if (!challenge) notFound();
  const learner = await getLearner();
  if (!learner) redirect(`/sign-in?next=/2025/day/${challenge.day}`);
  const { completions } = learner;
  const day = challenge.day;
  if (!isDayUnlocked(completions, day))
    return (
      <>
        <Header />
        <main className="page-container centered-state">
          <LockKeyhole size={32} />
          <h1>This chapter is still wrapped.</h1>
          <p>Finish both parts of the previous days to open day {day}.</p>
          <Link className="button primary" href="/workshop">
            Return to your workshop <ArrowRight size={17} />
          </Link>
        </main>
        <Footer />
      </>
    );
  const requestedPart = (await searchParams).part === "2" ? 2 : 1;
  const part = isPartUnlocked(completions, day, requestedPart)
    ? requestedPart
    : 1;
  const puzzle = challenge.parts[part - 1];
  const done = hasCompleted(completions, day, part);
  const both =
    hasCompleted(completions, day, 1) && hasCompleted(completions, day, 2);
  return (
    <>
      <Header />
      <main className="page-container challenge-page" id="main">
        <Link className="back-link" href="/workshop">
          <ArrowLeft size={15} /> Back to the workshop
        </Link>
        <div className="challenge-layout">
          <article className="puzzle-body">
            <div className="puzzle-kicker">
              <span className="eyebrow">
                DAY {String(day).padStart(2, "0")} · THE 2025 ADVENTURE
              </span>
              <Stars count={completions.filter((c) => c.day === day).length} />
            </div>
            <h1>{challenge.title}</h1>
            <p className="story">{challenge.story}</p>
            <div className="part-tabs" aria-label="Puzzle parts">
              {[1, 2].map((n) =>
                isPartUnlocked(completions, day, n) ? (
                  <Link
                    key={n}
                    href={`/2025/day/${day}?part=${n}`}
                    aria-current={part === n ? "page" : undefined}
                    className={part === n ? "active" : ""}
                  >
                    Part {n}
                    {hasCompleted(completions, day, n) && <Check size={15} />}
                  </Link>
                ) : (
                  <span key={n} className="tab-locked">
                    <LockKeyhole size={13} /> Part {n}
                  </span>
                ),
              )}
            </div>
            <span className="eyebrow">PART {part}</span>
            <h2>{puzzle.title}</h2>
            <p className="question">{puzzle.question}</p>
            {done ? (
              <div className="completed-answer">
                <Check size={21} />
                <div>
                  <strong>You earned this star.</strong>
                  <p>
                    Your progress is saved.{" "}
                    {part === 1
                      ? "Part 2 is ready when you are."
                      : day === 12
                        ? "You’ve completed the whole adventure!"
                        : "The next day is waiting."}
                  </p>
                  <Link
                    href={
                      part === 1
                        ? `/2025/day/${day}?part=2`
                        : day < 12
                          ? `/2025/day/${day + 1}`
                          : "/workshop"
                    }
                    className="inline-link"
                  >
                    {part === 1
                      ? "Continue to part 2"
                      : day < 12
                        ? `Open day ${day + 1}`
                        : "Celebrate your 24 stars"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <AnswerForm
                key={`${day}-${part}`}
                day={day}
                part={part}
                answerFormat={puzzle.answerFormat}
              />
            )}
            <div className="puzzle-footer">
              <Clock size={15} /> A little patience goes a long way.
              <span>
                {both
                  ? "Day complete · 2 stars earned"
                  : "Run your query in your own database."}
              </span>
            </div>
          </article>
          <aside className="puzzle-sidebar">
            <div className="sidebar-note">
              <span className="eyebrow">YOUR WORKSHOP LEDGER</span>
              <h3>Tables for this chapter</h3>
              <ul>
                {challenge.tables.map((table) => (
                  <li key={table}>
                    <Database size={15} />
                    <code>{table}</code>
                  </li>
                ))}
              </ul>
              <Link href="/setup#schema" className="inline-link">
                View the table reference <ArrowRight size={15} />
              </Link>
            </div>
            <div className="database-note">
              <span className="eyebrow">YOUR DATABASE</span>
              <strong>{dialectLabels[learner.dialect]}</strong>
              <p>
                Same workshop. Same answers.
                <br />
                Your preferred SQL.
              </p>
              <Link href="/setup">
                Change or download again <ArrowRight size={14} />
              </Link>
            </div>
            <p className="sidebar-signoff">
              A note from Juniper
              <br />
              <em>
                “There’s no rush.
                <br />
                Even Santa checks his work.”
              </em>
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
