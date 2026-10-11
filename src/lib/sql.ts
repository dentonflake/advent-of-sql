import workshop from "../../content/workshop.json";
export const dialects = ["postgresql", "mysql", "sqlite"] as const;
export type Dialect = typeof dialects[number];
export function isDialect(value: unknown): value is Dialect {
  return typeof value === "string" && dialects.includes(value as Dialect);
}
export const dialectLabels: Record<Dialect, string> = { postgresql: "PostgreSQL", mysql: "MySQL", sqlite: "SQLite" };
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
    const columns = Object.entries(table.columns).map(([column, type]) => `  ${column} ${type}`);
    lines.push(`CREATE TABLE ${name} (\n${columns.join(",\n")}\n)${dialect === "mysql" ? " ENGINE=InnoDB" : ""};`, "");
    const values = table.rows.map(row => `(${row.map(value => value === null ? "NULL" : typeof value === "number" ? value : `'${value.replaceAll("'", "''")}'`).join(", ")})`);
    lines.push(`INSERT INTO ${name} (${Object.keys(table.columns).join(", ")}) VALUES\n${values.join(",\n")};`, "");
  }
  if (dialect !== "mysql") lines.push("COMMIT;");
  lines.push("", "-- Ready! Start Day 1 at Advent of SQL.", "");
  return lines.join("\n");
}
