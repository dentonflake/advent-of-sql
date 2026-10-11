export const dialects = ["postgresql", "mysql", "sqlite"] as const;
export type Dialect = (typeof dialects)[number];
export function isDialect(value: unknown): value is Dialect {
  return typeof value === "string" && dialects.includes(value as Dialect);
}
export const dialectLabels: Record<Dialect, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
};
