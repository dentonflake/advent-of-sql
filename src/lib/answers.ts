import "server-only";
import answers from "../../content/answers.json";
import { normalizeAnswer } from "./progression";
export function answerIsCorrect(day: number, part: number, submitted: string) {
  const expected = answers.find((a) => a.day === day && a.part === part);
  return Boolean(
    expected && normalizeAnswer(submitted) === normalizeAnswer(expected.answer),
  );
}
