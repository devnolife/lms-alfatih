import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { endSession } from "@/lib/sessions";
import { publish } from "@/lib/realtime";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/sessions/[id]/end">
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const result = await endSession(id, session.userId, session.role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  publish(id, "session:ended", {});
  return NextResponse.json({ ok: true });
}
