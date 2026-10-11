import { getAuth, authConfiguration } from "@/lib/auth";
export async function GET(request: Request) {
  if (!authConfiguration().ready)
    return Response.json(
      { message: "Accounts are not configured yet." },
      { status: 503 },
    );
  return getAuth().handler(request);
}
export async function POST(request: Request) {
  if (!authConfiguration().ready)
    return Response.json(
      { message: "Accounts are not configured yet." },
      { status: 503 },
    );
  return getAuth().handler(request);
}
