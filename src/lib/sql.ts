import workshop from "../../content/workshop.json";
import { dialectLabels, type Dialect } from "./dialects";
export { dialects, dialectLabels, isDialect, type Dialect } from "./dialects";
export const tables = workshop;
export function generateSql(dialect: Dialect): string {
  const lines = [
    `-- Advent of SQL · 2025 · ${dialectLabels[dialect]}`,
    "-- Dataset version 1.0. Run once in a NEW, EMPTY workshop database.",
    "-- This creates only workshop tables. Do not run in your website/account database.",
    "-- All dates are ISO YYYY-MM-DD text. Flags use 0 and 1 in every dialect.",
    "-- A second run intentionally fails instead of overwriting your existing work.",
    "-- SQLite and PostgreSQL roll back on failure; MySQL DDL commits implicitly.",
    "",
    ...(dialect === "sqlite" ? ["PRAGMA foreign_keys = ON;"] : []),
    ...(dialect !== "mysql" ? ["BEGIN;"] : []),
  ];
  for (const [name, table] of Object.entries(workshop)) {
    const foreignKeys: string[] = [];
    const columns = Object.entries(table.columns).map(([column, type]) => {
      if (dialect === "mysql" && type.includes(" REFERENCES ")) {
        const [definition, reference] = type.split(" REFERENCES ");
        foreignKeys.push(`  FOREIGN KEY (${column}) REFERENCES ${reference}`);
        return `  ${column} ${definition}`;
      }
      return `  ${column} ${type}`;
    });
    columns.push(...foreignKeys);
    lines.push(
      `CREATE TABLE ${name} (\n${columns.join(",\n")}\n)${dialect === "mysql" ? " ENGINE=InnoDB" : ""};`,
      "",
    );
    const values = table.rows.map(
      (row) =>
        `(${row.map((value) => (value === null ? "NULL" : typeof value === "number" ? value : `'${value.replaceAll("'", "''")}'`)).join(", ")})`,
    );
    lines.push(
      `INSERT INTO ${name} (${Object.keys(table.columns).join(", ")}) VALUES\n${values.join(",\n")};`,
      "",
    );
  }
  if (dialect !== "mysql") lines.push("COMMIT;");
  lines.push("", "-- Ready! Start Day 1 at Advent of SQL.", "");
  return lines.join("\n");
}
