import { getLearner } from "@/lib/learner";
import { db } from "@/lib/db";
import { isDialect } from "@/lib/dialects";
import { readSmallJson, sameOrigin } from "@/lib/request";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ message: "Invalid origin." }, { status: 403 });
  const learner = await getLearner();
  if (!learner)
    return Response.json(
      { message: "Sign in to save your database preference." },
      { status: 401 },
    );
  let body;
  try {
    body = await readSmallJson(request);
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }
  if (!isDialect(body.dialect))
    return Response.json(
      { message: "Choose a supported SQL dialect." },
      { status: 400 },
    );
  await db.user.update({
    where: { id: learner.id },
    data: { dialect: body.dialect },
  });
  return Response.json({ saved: true });
}
