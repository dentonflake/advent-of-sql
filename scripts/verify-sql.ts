import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dialects, generateSql, type Dialect } from "../src/lib/sql";
import solutions from "../content/solutions.json";
import answers from "../content/answers.json";
const dialect = (process.argv[2] ?? "sqlite") as Dialect;
if (!dialects.includes(dialect)) throw new Error("Choose sqlite, postgresql, or mysql");
assert.equal(readFileSync(`public/downloads/advent-of-sql-2025-${dialect}.sql`, "utf8"), generateSql(dialect), "Download is stale; run sql:generate");
let query: (sql: string) => string;
if (dialect === "postgresql") {
  if (!process.env.WORKSHOP_DATABASE_URL) throw new Error("Set WORKSHOP_DATABASE_URL to a NEW disposable PostgreSQL database");
  query = sql => execFileSync("psql", [process.env.WORKSHOP_DATABASE_URL!, "-XAt", "-v", "ON_ERROR_STOP=1", "-c", sql], { encoding: "utf8" }).trim();
  query(generateSql(dialect));
} else if (dialect === "mysql") {
  if (!process.env.WORKSHOP_MYSQL_DATABASE) throw new Error("Set WORKSHOP_MYSQL_DATABASE to a NEW disposable MySQL database");
  query = sql => execFileSync("mysql", ["--protocol=TCP", "-h", process.env.WORKSHOP_MYSQL_HOST ?? "127.0.0.1", "-P", process.env.WORKSHOP_MYSQL_PORT ?? "53306", "-u", process.env.WORKSHOP_MYSQL_USER ?? "root", "-N", "-B", process.env.WORKSHOP_MYSQL_DATABASE!], { input: sql, encoding: "utf8" }).trim();
  query(generateSql(dialect));
} else query = sql => execFileSync("sqlite3", [":memory:"], { input: generateSql(dialect) + "\n" + sql, encoding: "utf8" }).trim();
for (const puzzle of solutions) {
  const expected = answers.find(a => a.day === puzzle.day && a.part === puzzle.part)!;
  assert.equal(query(puzzle.sql), expected.answer, `Puzzle ${puzzle.day}.${puzzle.part}`);
}
console.log(`${dialect}: all 24 reference queries match the shared answers.`);
