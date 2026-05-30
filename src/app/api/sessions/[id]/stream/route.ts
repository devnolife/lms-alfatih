import { randomUUID } from "node:crypto";
import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSessionAccess } from "@/lib/sessions";
import {
  addPresence,
  removePresence,
  subscribe,
  type RealtimeEvent,
} from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 20_000;

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/sessions/[id]/stream">
) {
  const session = await readSession();
  if (!session) {
    return new Response("Tidak masuk.", { status: 401 });
  }

  const { id } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return new Response("Tidak punya akses.", { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { displayName: true },
  });
  const displayName = user?.displayName ?? session.username;
  const connectionId = randomUUID();
  const encoder = new TextEncoder();

  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // controller already closed
        }
      };

      const sendEvent = (event: RealtimeEvent) => {
        send(`data: ${JSON.stringify(event)}\n\n`);
      };

      // Initial comment opens the stream promptly past any proxy buffering.
      send(`: connected ${connectionId}\n\n`);

      unsubscribe = subscribe(id, sendEvent);
      addPresence(id, {
        connectionId,
        userId: session.userId,
        displayName,
      });

      heartbeat = setInterval(() => send(`: ping\n\n`), HEARTBEAT_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
        removePresence(id, connectionId);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
      removePresence(id, connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
