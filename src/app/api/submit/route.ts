import { db } from "@/lib/db";
import { getLearner } from "@/lib/learner";
import { isPartUnlocked, hasCompleted } from "@/lib/progression";
import { answerIsCorrect } from "@/lib/answers";
import { readSmallJson, sameOrigin } from "@/lib/request";
import { Prisma } from "@prisma/client";
export async function POST(request: Request) {
 if (!sameOrigin(request)) return Response.json({ message: "Please submit from the workshop website." }, { status: 403 });
 const learner = await getLearner();
 if (!learner) return Response.json({ message: "Sign in to save your stars." }, { status: 401 });
 let body;
 try { body = await readSmallJson(request); } catch { return Response.json({ message: "Please submit a valid answer." }, { status: 400 }); }
 const { day, part, answer } = body;
 if (typeof day !== "number" || typeof part !== "number" || typeof answer !== "string" || !answer.trim() || answer.length > 200 || !Number.isInteger(day) || !Number.isInteger(part) || day < 1 || day > 12 || ![1, 2].includes(part)) return Response.json({ message: "Enter one answer value, up to 200 characters." }, { status: 400 });
 const result = await db.$transaction(async tx => {
  // Serialize this learner's attempts across processes to keep limits and unlocks consistent.
  await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${learner.id}, 2025))`);
  const completions = await tx.completion.findMany({ where: { userId: learner.id, year: 2025 }, select: { day: true, part: true } });
  if (!isPartUnlocked(completions, day, part)) return { status: 403, message: "Finish the preceding puzzles to unlock this part." };
  if (hasCompleted(completions, day, part)) return { status: 200, correct: true, alreadyCompleted: true, message: "This star is already yours." };
  await tx.submission.deleteMany({ where: { userId: learner.id, createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
  const attempts = await tx.submission.count({ where: { userId: learner.id, createdAt: { gte: new Date(Date.now() - 60_000) } } });
  if (attempts >= 12) return { status: 429, message: "Take a cocoa break. You can try again in a minute." };
  await tx.submission.create({ data: { userId: learner.id } });
  const correct = answerIsCorrect(day, part, answer);
  if (correct) await tx.completion.create({ data: { userId: learner.id, year: 2025, day, part } });
  return { status: 200, correct, message: correct ? (part === 1 ? "A star for you! Part 2 is now open." : day === 12 ? "All 24 stars! Christmas is ready to go." : "Two stars! Your next day is now open.") : "That’s not quite it. Check your result and try again." };
 });
 const { status, ...payload } = result;
 return Response.json(payload, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
}
