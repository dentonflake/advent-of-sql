import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "./db";
export function authConfiguration() {
  return {
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    ready: Boolean(
      process.env.DATABASE_URL &&
      process.env.BETTER_AUTH_SECRET &&
      process.env.BETTER_AUTH_URL,
    ),
  };
}
function createAuth() {
  if (!authConfiguration().ready)
    throw new Error(
      "Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL before enabling accounts.",
    );
  return betterAuth({
    appName: "Advent of SQL",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(db, { provider: "postgresql" }),
    user: {
      deleteUser: { enabled: true },
      additionalFields: {
        dialect: { type: "string", defaultValue: "postgresql", input: false },
      },
    },
    socialProviders: authConfiguration().google
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {},
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
    plugins: [
      magicLink({
        expiresIn: 600,
        storeToken: "hashed",
        sendMagicLink: async ({ email, url }) => {
          if (!authConfiguration().email)
            throw new Error("Email sign-in has not been configured.");
          const result = await new Resend(
            process.env.RESEND_API_KEY!,
          ).emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Your key to Santa’s workshop",
            text: `Welcome to Advent of SQL!\n\nSign in to your workshop: ${url}\n\nThis link expires in 10 minutes. If you did not request it, you can ignore this email.`,
          });
          if (result.error) throw new Error("Unable to deliver sign-in email.");
        },
      }),
    ],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (instance ??= createAuth());
}
