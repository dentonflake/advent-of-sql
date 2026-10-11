import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import answers from "../content/answers.json";
try {
  process.loadEnvFile(".env.local");
} catch {
  /* CI uses process env */
}
const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  throw new Error("Integration checks only run against a local server.");
const db = new PrismaClient();
const id = `verify-${randomUUID()}`;
const other = `verify-${randomUUID()}`;
const token = randomUUID();
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error("Set BETTER_AUTH_SECRET");
const signingSecret = secret;
const cookie = `better-auth.session_token=${encodeURIComponent(`${token}.${createHmac("sha256", signingSecret).update(token).digest("base64")}`)}`;
async function post(
  path: string,
  body: unknown,
  options: { cookie?: string; origin?: string } = {},
) {
  const response = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: options.origin ?? origin,
      cookie: options.cookie ?? cookie,
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
async function main() {
  try {
    await db.user.create({
      data: {
        id,
        name: "Verification learner",
        email: `${id}@example.test`,
        emailVerified: true,
      },
    });
    await db.user.create({
      data: {
        id: other,
        name: "Other learner",
        email: `${other}@example.test`,
        emailVerified: true,
      },
    });
    await db.session.create({
      data: {
        id: randomUUID(),
        token,
        userId: id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    assert.equal(
      (
        await post(
          "/api/submit",
          { day: 1, part: 1, answer: "wrong" },
          { cookie: "" },
        )
      ).status,
      401,
    );
    assert.equal(
      (
        await post(
          "/api/submit",
          { day: 1, part: 1, answer: "wrong" },
          { origin: "https://example.test" },
        )
      ).status,
      403,
    );
    assert.equal(
      (await post("/api/submit", { day: 2, part: 1, answer: "wrong" })).status,
      403,
    );
    assert.equal(
      (await post("/api/submit", { day: 1, part: 2, answer: "wrong" })).status,
      403,
    );
    assert.equal(
      (await post("/api/submit", { day: 1.5, part: 1, answer: "wrong" }))
        .status,
      400,
    );
    assert.equal(
      (await post("/api/submit", { day: 1, part: 1, answer: "wrong" })).body
        .correct,
      false,
    );
    assert.equal(await db.completion.count({ where: { userId: id } }), 0);
    for (const answer of answers) {
      // Reset timestamps between steps to avoid simulating a brute-force player.
      await db.submission.deleteMany({ where: { userId: id } });
      const submitted = await post("/api/submit", {
        day: answer.day,
        part: answer.part,
        answer: ` ${answer.answer.toUpperCase()} `,
      });
      assert.equal(
        submitted.status,
        200,
        `HTTP for ${answer.day}.${answer.part}`,
      );
      assert.equal(
        submitted.body.correct,
        true,
        `Answer for ${answer.day}.${answer.part}: ${JSON.stringify(submitted.body)}`,
      );
    }
    assert.equal(await db.completion.count({ where: { userId: id } }), 24);
    const duplicate = await post("/api/submit", {
      day: 1,
      part: 1,
      answer: "irrelevant",
    });
    assert.equal(duplicate.body.alreadyCompleted, true);
    assert.equal(await db.completion.count({ where: { userId: id } }), 24);
    assert.equal(await db.completion.count({ where: { userId: other } }), 0);
    assert.equal(
      (await post("/api/preferences", { dialect: "mysql" })).status,
      200,
    );
    assert.equal(
      (await db.user.findUnique({ where: { id } }))?.dialect,
      "mysql",
    );
    assert.equal(
      (await post("/api/preferences", { dialect: "not-sql" })).status,
      400,
    );
    const progress = await fetch(`${origin}/workshop`, { headers: { cookie } });
    assert.match(await progress.text(), /The sleigh is ready/);
    const freshToken = randomUUID();
    await db.session.create({
      data: {
        id: randomUUID(),
        token: freshToken,
        userId: id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const freshCookie = `better-auth.session_token=${encodeURIComponent(`${freshToken}.${createHmac("sha256", signingSecret).update(freshToken).digest("base64")}`)}`;
    const secondDevice = await fetch(`${origin}/workshop`, {
      headers: { cookie: freshCookie },
    });
    assert.match(await secondDevice.text(), /The sleigh is ready/);
    // Throttle a separate learner's unanswered part.
    const otherToken = randomUUID();
    await db.session.create({
      data: {
        id: randomUUID(),
        token: otherToken,
        userId: other,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const otherCookie = `better-auth.session_token=${encodeURIComponent(`${otherToken}.${createHmac("sha256", signingSecret).update(otherToken).digest("base64")}`)}`;
    await db.submission.createMany({
      data: Array.from({ length: 12 }, () => ({ userId: other })),
    });
    assert.equal(
      (
        await post(
          "/api/submit",
          { day: 1, part: 1, answer: "wrong" },
          { cookie: otherCookie },
        )
      ).status,
      429,
    );
    const deletion = await post(
      "/api/auth/delete-user",
      {},
      { cookie: otherCookie },
    );
    assert.equal(deletion.status, 200, JSON.stringify(deletion.body));
    assert.equal(await db.user.findUnique({ where: { id: other } }), null);
    console.log(
      "Production integration: 24 answers, ordering, duplicates, cross-device persistence, isolation, preferences, throttling, and account deletion passed.",
    );
  } finally {
    await db.user.deleteMany({ where: { id: { in: [id, other] } } });
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
