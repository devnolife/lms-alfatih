import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getOnlineUsers } from "@/lib/realtime";
import { getSessionAccess, getSessionBoard } from "@/lib/sessions";
import { getDeliverables, getTasks } from "@/lib/groupwork";
import { getGameState } from "@/lib/games";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Snapshot of current session state — fetched on mount and every reconnect. */
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return NextResponse.json(
      { error: "Sesi tidak ditemukan atau tidak punya akses." },
      { status: 404 }
    );
  }

  const [board, tasks, deliverables, game] = await Promise.all([
    getSessionBoard(id, access.classId),
    getTasks(id),
    getDeliverables(id),
    getGameState(id),
  ]);

  return NextResponse.json({
    session: {
      id: access.sessionId,
      classId: access.classId,
      className: access.className,
      title: access.title,
      status: access.status,
      isTeacher: access.isTeacher,
    },
    online: getOnlineUsers(id),
    board,
    tasks,
    deliverables,
    game,
  });
}
