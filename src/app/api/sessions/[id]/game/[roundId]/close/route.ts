import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSessionAccess } from "@/lib/sessions";
import { closeRound } from "@/lib/games";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/sessions/[id]/game/[roundId]/close">
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const { id, roundId } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return NextResponse.json({ error: "Tidak punya akses." }, { status: 404 });
  }

  const result = await closeRound(access, roundId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
