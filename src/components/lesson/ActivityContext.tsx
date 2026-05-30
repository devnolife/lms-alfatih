"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ActivityCtx {
  lessonSlug?: string;
  activityId?: string;
}

const Ctx = createContext<ActivityCtx>({});

export function useActivityContext(): ActivityCtx {
  return useContext(Ctx);
}

/**
 * Merges its value onto the surrounding context. The lesson page sets
 * `lessonSlug` once at the top; each `::game` then layers on its own
 * `activityId`, so `useGameFeedback().solved()` can report completion without
 * any per-game prop plumbing.
 */
export function ActivityProvider({
  value,
  children,
}: {
  value: ActivityCtx;
  children: ReactNode;
}) {
  const outer = useContext(Ctx);
  return <Ctx.Provider value={{ ...outer, ...value }}>{children}</Ctx.Provider>;
}

// Module-level guard so a given activity reports completion at most once per
// page load even if `solved()` fires repeatedly.
const reported = new Set<string>();

export function reportActivityComplete(lessonSlug: string, activityId: string) {
  const key = `${lessonSlug}::${activityId}`;
  if (reported.has(key)) return;
  reported.add(key);
  void fetch("/api/activities/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonSlug, activityId }),
  }).catch(() => {
    // Allow a retry on a later solve if the network call failed.
    reported.delete(key);
  });
}
