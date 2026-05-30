import { EventEmitter } from "node:events";
import { redis, redisEnabled } from "@/lib/redis";

/**
 * Lightweight real-time pub/sub for live class sessions.
 *
 * Transport to the browser is SSE; this module is the server-side bus that
 * fans an event out to every SSE connection subscribed to a session.
 *
 * - Single instance: an in-process EventEmitter is the whole story.
 * - Multiple instances: set REDIS_URL so events cross processes. We publish to
 *   a Redis channel and a single subscriber connection re-emits locally. When
 *   Redis is absent the bus silently stays in-process (fine for one instance).
 *
 * SSE is a NOTIFICATION channel only — Postgres is the source of truth and the
 * client refetches a snapshot on (re)connect, so we do not persist/replay
 * events here.
 */

export interface RealtimeEvent {
  id: number;
  type: string;
  data: unknown;
  ts: number;
}

type Handler = (event: RealtimeEvent) => void;

const REDIS_CHANNEL = "funpython:rt";

const globalForRt = globalThis as unknown as {
  __rtEmitter?: EventEmitter;
  __rtSeq?: { n: number };
  __rtRedisSubBound?: boolean;
};

const emitter =
  globalForRt.__rtEmitter ??
  (globalForRt.__rtEmitter = new EventEmitter().setMaxListeners(0));

const seq = globalForRt.__rtSeq ?? (globalForRt.__rtSeq = { n: 0 });

// Bind the Redis subscriber once per process for cross-instance fan-out.
if (redisEnabled() && redis && !globalForRt.__rtRedisSubBound) {
  globalForRt.__rtRedisSubBound = true;
  const sub = redis.duplicate();
  sub.subscribe(REDIS_CHANNEL).catch((err) => {
    console.warn("[realtime] redis subscribe failed:", err?.message);
  });
  sub.on("message", (_channel: string, message: string) => {
    try {
      const { sessionId, event } = JSON.parse(message) as {
        sessionId: string;
        event: RealtimeEvent;
      };
      emitter.emit(sessionId, event);
    } catch {
      // ignore malformed payloads
    }
  });
}

export function publish(
  sessionId: string,
  type: string,
  data: unknown
): RealtimeEvent {
  const event: RealtimeEvent = {
    id: ++seq.n,
    type,
    data,
    ts: Date.now(),
  };
  // Local listeners (this instance).
  emitter.emit(sessionId, event);
  // Other instances, if Redis is configured.
  if (redisEnabled() && redis) {
    redis
      .publish(REDIS_CHANNEL, JSON.stringify({ sessionId, event }))
      .catch(() => {});
  }
  return event;
}

export function subscribe(sessionId: string, handler: Handler): () => void {
  emitter.on(sessionId, handler);
  return () => emitter.off(sessionId, handler);
}

// ---------------------------------------------------------------------------
// Presence — tracked per CONNECTION (not per user) so multiple tabs/devices
// ref-count correctly. A user is "offline" only when all their connections go.
// In-memory: presence is per-instance. Multi-instance presence would need a
// shared store; out of scope for v1 (documented in the plan).
// ---------------------------------------------------------------------------

export interface PresenceUser {
  userId: string;
  displayName: string;
}

interface Connection {
  connectionId: string;
  userId: string;
  displayName: string;
}

const globalForPresence = globalThis as unknown as {
  __rtPresence?: Map<string, Map<string, Connection>>;
};

const presence =
  globalForPresence.__rtPresence ??
  (globalForPresence.__rtPresence = new Map());

export function getOnlineUsers(sessionId: string): PresenceUser[] {
  const conns = presence.get(sessionId);
  if (!conns) return [];
  const byUser = new Map<string, PresenceUser>();
  for (const c of conns.values()) {
    byUser.set(c.userId, { userId: c.userId, displayName: c.displayName });
  }
  return [...byUser.values()];
}

/** Registers a connection and broadcasts the updated presence list. */
export function addPresence(
  sessionId: string,
  connection: Connection
): void {
  let conns = presence.get(sessionId);
  if (!conns) {
    conns = new Map();
    presence.set(sessionId, conns);
  }
  conns.set(connection.connectionId, connection);
  publish(sessionId, "presence", { online: getOnlineUsers(sessionId) });
}

/** Removes a connection and broadcasts the updated presence list. */
export function removePresence(sessionId: string, connectionId: string): void {
  const conns = presence.get(sessionId);
  if (!conns) return;
  conns.delete(connectionId);
  if (conns.size === 0) presence.delete(sessionId);
  publish(sessionId, "presence", { online: getOnlineUsers(sessionId) });
}
