import "server-only";
export function sameOrigin(request: Request) {
 const origin = request.headers.get("origin");
 const configured = process.env.BETTER_AUTH_URL;
 const expected = configured ? new URL(configured).origin : new URL(request.url).origin;
 return origin === expected;
}
export async function readSmallJson(request: Request): Promise<Record<string, unknown>> {
 if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Expected JSON");
 if (Number(request.headers.get("content-length") ?? 0) > 4096) throw new Error("Request too large");
 const reader = request.body?.getReader();
 if (!reader) throw new Error("Missing body");
 const chunks: Uint8Array[] = []; let length = 0;
 while (true) {
  const { done, value } = await reader.read(); if (done) break;
  length += value.byteLength;
  if (length > 4096) { await reader.cancel(); throw new Error("Request too large"); }
  chunks.push(value);
 }
 const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
 if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
 return value;
}
