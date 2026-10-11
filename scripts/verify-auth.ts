import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "../src/lib/auth";
try {
  process.loadEnvFile(".env.local");
} catch {
  /* CI provides env */
}
const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  throw new Error("Auth checks only run with a local test configuration");
const db = new PrismaClient();
const emails: string[] = [];
const addresses = [
  `auth-${randomUUID()}@example.test`,
  `auth-${randomUUID()}@example.test`,
];
const realFetch = globalThis.fetch;
process.env.RESEND_API_KEY = "re_local_test_only";
process.env.EMAIL_FROM = "Workshop test <test@example.test>";
// Capture only the outbound delivery. Token creation/verification uses the actual app auth factory.
globalThis.fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (url.startsWith("https://api.resend.com/")) {
    const payload = JSON.parse(String(init?.body));
    emails.push(payload.text);
    return Response.json({ id: randomUUID() });
  }
  return realFetch(input, init);
};
async function requestLink(email: string) {
  const response = await getAuth().handler(
    new Request(`${origin}/api/auth/sign-in/magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin,
        "x-real-ip": "127.0.0.1",
      },
      body: JSON.stringify({
        email,
        callbackURL: "/workshop",
        errorCallbackURL: "/sign-in?error=link",
      }),
    }),
  );
  assert.equal(response.status, 200);
  const url = emails.at(-1)?.match(/https?:\/\/[^\s]+/)?.[0];
  assert.ok(url, "Sign-in email must contain a link");
  return url;
}
async function main() {
  try {
    const link = await requestLink(addresses[0]);
    const first = await getAuth().handler(
      new Request(link, { headers: { "x-real-ip": "127.0.0.1" } }),
    );
    assert.equal(first.status, 302);
    assert.ok(first.headers.get("set-cookie")?.includes("session_token="));
    assert.equal(
      new URL(first.headers.get("location")!, origin).pathname,
      "/workshop",
    );
    const user = await db.user.findUnique({ where: { email: addresses[0] } });
    assert.ok(user);
    assert.equal(user.emailVerified, true);
    assert.equal(await db.session.count({ where: { userId: user.id } }), 1);
    const replay = await getAuth().handler(
      new Request(link, { headers: { "x-real-ip": "127.0.0.1" } }),
    );
    assert.equal(replay.status, 302);
    assert.match(replay.headers.get("location")!, /error/);
    assert.equal(await db.session.count({ where: { userId: user.id } }), 1);
    const expiring = await requestLink(addresses[1]);
    // Restrict every mutation to the unique test email, even if other users sign in concurrently.
    const records = await db.verification.findMany({
      where: {
        identifier: { startsWith: "magic-link:" },
        value: { contains: addresses[1] },
      },
    });
    assert.equal(records.length, 1);
    assert.equal(
      records[0].identifier.includes(
        new URL(expiring).searchParams.get("token")!,
      ),
      false,
      "Stored link token must be hashed",
    );
    await db.verification.update({
      where: { id: records[0].id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const expired = await getAuth().handler(
      new Request(expiring, { headers: { "x-real-ip": "127.0.0.1" } }),
    );
    assert.match(expired.headers.get("location")!, /error/);
    assert.equal(
      await db.user.findUnique({ where: { email: addresses[1] } }),
      null,
    );
    console.log(
      "Auth lifecycle: email generation, signup, verified session, single-use links, and expiration passed (delivery simulated).",
    );
  } finally {
    globalThis.fetch = realFetch;
    await db.user.deleteMany({ where: { email: { in: addresses } } });
    for (const address of addresses)
      await db.verification.deleteMany({
        where: { value: { contains: address } },
      });
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
