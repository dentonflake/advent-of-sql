import Link from "next/link";
import { Header, Footer } from "@/components/shell";
export const metadata = { title: "About the adventure" };
export default function About() {
  return (
    <>
      <Header />
      <main className="page-container prose-page" id="main">
        <span className="eyebrow">LEARN BY FIGURING IT OUT</span>
        <h1>A small Christmas adventure.</h1>
        <p className="page-lead">
          Advent of SQL began as a way to learn SQL together—one cozy puzzle at
          a time.
        </p>
        <h2>Twelve days. Twenty-four stars.</h2>
        <p>
          You’re Santa’s newest workshop helper. Start with simple lookups, then
          find your way through filters, sorting, totals, joins, grouping,
          missing values, and subqueries. Every day has two parts, designed for
          about 15–30 minutes of exploring together.
        </p>
        <h2>One database for the whole story.</h2>
        <p>
          Download the setup script for PostgreSQL, MySQL, or SQLite and run SQL
          in your own database. The website checks your answer value, saves your
          stars, and opens the next chapter. It never connects to your workshop
          database.
        </p>
        <h2>Your own pace.</h2>
        <p>
          The entire 2025 edition is available now. Days unlock as you finish
          them, with no calendar deadline and no leaderboard. There are no
          built-in hints or solution reveals; bring a friend, use your
          database’s documentation, and enjoy the puzzle.
        </p>
        <p>
          This is an independent project inspired by the joy of daily
          programming puzzles. It is not affiliated with Advent of Code.
        </p>
        <Link href="/setup" className="button primary">
          Set up your workshop →
        </Link>
      </main>
      <Footer />
    </>
  );
}
