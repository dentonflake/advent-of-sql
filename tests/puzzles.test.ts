import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { generateSql, dialects, tables } from "../src/lib/sql";
import { readFileSync } from "node:fs";
import challenges from "../src/lib/challenges.json";
import solutions from "../content/solutions.json";
import answers from "../content/answers.json";
import { isPartUnlocked, isDayUnlocked, normalizeAnswer, nextPuzzle } from "../src/lib/progression";
test("every challenge has two scalar answers and valid table references", () => {
 assert.equal(challenges.length, 12); assert.equal(solutions.length, 24); assert.equal(answers.length, 24);
 for (const challenge of challenges) {
  assert.equal(challenge.parts.length, 2);
  for (const table of challenge.tables) assert.ok(table in tables);
  for (const part of challenge.parts) assert.ok(answers.find(a => a.day === challenge.day && a.part === part.part));
 }
});
test("every SQLite reference solution matches the canonical answer", () => {
 for (const puzzle of solutions) {
  const actual = execFileSync("sqlite3", [":memory:"], { input: generateSql("sqlite") + "\n" + puzzle.sql, encoding: "utf8" }).trim();
  assert.equal(actual, answers.find(a => a.day === puzzle.day && a.part === puzzle.part)?.answer);
 }
});
test("downloaded files exactly match the shared generator", () => {
 for (const dialect of dialects) assert.equal(readFileSync(`public/downloads/advent-of-sql-2025-${dialect}.sql`, "utf8"), generateSql(dialect));
});
test("foreign keys are intact and every table has rows", () => {
 const result = execFileSync("sqlite3", [":memory:"], { input: generateSql("sqlite") + "\nPRAGMA foreign_key_check;", encoding: "utf8" });
 assert.equal(result.trim(), ""); for (const table of Object.values(tables)) assert.ok(table.rows.length);
});
test("progression enforces every earlier day and part one", () => {
 assert.equal(isDayUnlocked([], 1), true); assert.equal(isDayUnlocked([], 2), false);
 assert.equal(isPartUnlocked([], 1, 2), false);
 assert.equal(isPartUnlocked([{ day: 1, part: 1 }], 1, 2), true);
 assert.equal(isDayUnlocked([{ day: 1, part: 1 }, { day: 1, part: 2 }], 2), true);
 assert.equal(isDayUnlocked([{ day: 2, part: 1 }, { day: 2, part: 2 }], 3), false);
 assert.equal(isDayUnlocked([], 0), false); assert.equal(isDayUnlocked([], 13), false);
 assert.equal(isPartUnlocked([], 1, 3), false);
 assert.deepEqual(nextPuzzle([]), { day: 1, part: 1 });
 const all = challenges.flatMap(c => c.parts.map(p => ({ day: c.day, part: p.part })));
 assert.equal(nextPuzzle(all), null);
});
test("answer normalization tolerates whitespace and integer formatting, not different values", () => {
 assert.equal(normalizeAnswer("  Velvet   Fox  "), "velvet fox");
 assert.equal(normalizeAnswer("00042.00"), "42"); assert.equal(normalizeAnswer("+42"), "42");
 assert.notEqual(normalizeAnswer("42.1"), normalizeAnswer("42"));
 assert.notEqual(normalizeAnswer("42 grams"), normalizeAnswer("42"));
});
