export type CompletedPart = { day: number; part: number };
export function hasCompleted(completions: CompletedPart[], day: number, part: number) {
  return completions.some(c => c.day === day && c.part === part);
}
export function isDayUnlocked(completions: CompletedPart[], day: number) {
  return Number.isInteger(day) && day >= 1 && day <= 12 && Array.from({ length: day - 1 }, (_, i) => i + 1).every(d => hasCompleted(completions, d, 1) && hasCompleted(completions, d, 2));
}
export function isPartUnlocked(completions: CompletedPart[], day: number, part: number) {
  return isDayUnlocked(completions, day) && (part === 1 || (part === 2 && hasCompleted(completions, day, 1)));
}
export function nextPuzzle(completions: CompletedPart[]) {
  for (let day = 1; day <= 12; day++) for (let part = 1; part <= 2; part++) if (!hasCompleted(completions, day, part)) return { day, part };
  return null;
}
export function normalizeAnswer(value: string) {
  const clean = value.trim().normalize("NFKC").replace(/\s+/g, " ");
  if (/^[+-]?\d+(?:\.0+)?$/.test(clean)) return BigInt(clean.replace(/\.0+$/, "")).toString();
  return clean.toLocaleLowerCase("en-US");
}
