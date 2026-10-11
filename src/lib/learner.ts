import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { authConfiguration, getAuth } from "./auth";
import { db } from "./db";
import { isDialect } from "./sql";
export const getLearner = cache(async () => {
 const requestHeaders = await headers();
 const hostname = (requestHeaders.get("host") ?? "").split(":")[0];
 const localPreview = process.env.NODE_ENV === "development" && process.env.LOCAL_PREVIEW === "true" && ["localhost", "127.0.0.1"].includes(hostname);
 let user;
 if (localPreview) {
  user = await db.user.upsert({ where: { id: "local-preview" }, update: {}, create: { id: "local-preview", email: "preview@localhost", name: "Workshop explorer", emailVerified: true } });
 } else {
  if (!authConfiguration().ready) return null;
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;
 }
 const completions = await db.completion.findMany({ where: { userId: user.id, year: 2025 }, select: { day: true, part: true }, orderBy: [{ day: "asc" }, { part: "asc" }] });
 return { id: user.id, name: user.name, email: user.email, dialect: isDialect(user.dialect) ? user.dialect : "postgresql" as const, completions, localPreview };
});
