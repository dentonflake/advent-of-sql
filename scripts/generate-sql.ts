import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { dialects, generateSql } from "../src/lib/sql";
import solutions from "../content/solutions.json";
const destination = resolve("public/downloads");
mkdirSync(destination, { recursive: true });
for (const dialect of dialects)
  writeFileSync(
    `${destination}/advent-of-sql-2025-${dialect}.sql`,
    generateSql(dialect),
  );
const setup = generateSql("sqlite");
const answers = solutions.map((puzzle) => {
  const value = execFileSync("sqlite3", [":memory:"], {
    input: setup + "\n" + puzzle.sql,
    encoding: "utf8",
  }).trim();
  if (!value || value.includes("\n"))
    throw new Error(
      `Puzzle ${puzzle.day}.${puzzle.part} must return one nonempty scalar`,
    );
  return { day: puzzle.day, part: puzzle.part, answer: value };
});
writeFileSync("content/answers.json", JSON.stringify(answers, null, 2) + "\n");
console.log(
  `Generated 3 SQL downloads and ${answers.length} verified answer values.`,
);
