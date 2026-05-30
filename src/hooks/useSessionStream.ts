"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface BoardRow {
  userId: string;
  displayName: string;
  xp: number;
  solvedCount: number;
  online: boolean;
}

export interface PresenceUser {
  userId: string;
  displayName: string;
}

export interface SessionInfo {
  id: string;
  classId: string;
  className: string;
  title: string | null;
  status: "ACTIVE" | "ENDED";
  isTeacher: boolean;
}

export interface SessionSnapshot {
  session: SessionInfo;
  online: PresenceUser[];
  board: BoardRow[];
}

interface RealtimeEvent {
  id: number;
  type: string;
  data: unknown;
}

export interface SessionStreamState {
  connected: boolean;
  session: SessionInfo | null;
  online: PresenceUser[];
  board: BoardRow[];
  ended: boolean;
}

/**
 * Subscribes to a live session over SSE. SSE is treated as a notification
 * channel only: on connect AND every reconnect we refetch the authoritative
 * snapshot, then apply streamed deltas on top.
 */
export function useSessionStream(sessionId: string): SessionStreamState {
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [ended, setEnded] = useState(false);

  const lastEventIdRef = useRef(0);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const snap = (await res.json()) as SessionSnapshot;
      setSession(snap.session);
      setOnline(snap.online);
      setBoard(snap.board);
      setEnded(snap.session.status === "ENDED");
    } catch {
      // transient; will retry on next reconnect
    }
  }, [sessionId]);

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    const handleEvent = (event: RealtimeEvent) => {
      // Drop out-of-order/duplicate events (best-effort ordering).
      if (event.id <= lastEventIdRef.current) return;
      lastEventIdRef.current = event.id;

      switch (event.type) {
        case "presence":
          setOnline((event.data as { online: PresenceUser[] }).online);
          // Reflect online flags onto the board too.
          setBoard((prev) => {
            const onlineIds = new Set(
              (event.data as { online: PresenceUser[] }).online.map(
                (u) => u.userId
              )
            );
            return prev.map((r) => ({ ...r, online: onlineIds.has(r.userId) }));
          });
          break;
        case "board:update":
          setBoard((event.data as { board: BoardRow[] }).board);
          break;
        case "session:ended":
          setEnded(true);
          setSession((prev) => (prev ? { ...prev, status: "ENDED" } : prev));
          break;
      }
    };

    const connect = () => {
      es = new EventSource(`/api/sessions/${sessionId}/stream`);
      es.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        // Refetch authoritative state on every (re)connect.
        void fetchSnapshot();
      };
      es.onmessage = (e) => {
        try {
          handleEvent(JSON.parse(e.data) as RealtimeEvent);
        } catch {
          // ignore malformed
        }
      };
      es.onerror = () => {
        setConnected(false);
        // EventSource auto-reconnects; snapshot refetch happens on reopen.
      };
    };

    connect();

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [sessionId, fetchSnapshot]);

  return { connected, session, online, board, ended };
}
