import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import type { SessionAccess } from "@/lib/sessions";
import type { GameStatus } from "@prisma/client";

// Each quiz round answers come from a fixed bank (also bundled client-side).
// Max attainable score = questionCount * POINTS_PER_CORRECT (+ no time bonus,
// to keep the leaderboard fair and deterministic).
export const POINTS_PER_CORRECT = 100;

export const GAME_CATALOG: Record<
  string,
  { title: string; questionCount: number }
> = {
  "kuis-output": { title: "Tebak Hasil Kode", questionCount: 5 },
  "kuis-rumpang": { title: "Isi Kode Rumpang", questionCount: 5 },
};

export function isValidGameKey(key: unknown): key is string {
  return typeof key === "string" && key in GAME_CATALOG;
}

function maxScoreFor(gameKey: string): number {
  const meta = GAME_CATALOG[gameKey];
  return (meta?.questionCount ?? 0) * POINTS_PER_CORRECT;
}

type Fail = { ok: false; status: number; error: string };
const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

export interface ScoreRow {
  userId: string;
  displayName: string;
  score: number;
}

export interface RoundInfo {
  id: string;
  gameKey: string;
  title: string;
  status: GameStatus;
  questionCount: number;
}

export interface GameState {
  round: RoundInfo | null;
  scoreboard: ScoreRow[];
}

function toRoundInfo(round: {
  id: string;
  gameKey: string;
  status: GameStatus;
}): RoundInfo {
  const meta = GAME_CATALOG[round.gameKey];
  return {
    id: round.id,
    gameKey: round.gameKey,
    title: meta?.title ?? round.gameKey,
    status: round.status,
    questionCount: meta?.questionCount ?? 0,
  };
}

async function getScoreboard(roundId: string): Promise<ScoreRow[]> {
  const scores = await prisma.gameScore.findMany({
    where: { roundId },
    orderBy: { score: "desc" },
  });
  if (scores.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: scores.map((s) => s.userId) } },
    select: { id: true, displayName: true },
  });
  const names = new Map(users.map((u) => [u.id, u.displayName]));
  return scores.map((s) => ({
    userId: s.userId,
    displayName: names.get(s.userId) ?? "?",
    score: s.score,
  }));
}

/** Latest round for a session (OPEN if one exists, else the most recent). */
async function getCurrentRound(sessionId: string) {
  const open = await prisma.gameRound.findFirst({
    where: { sessionId, status: "OPEN" },
    orderBy: { startedAt: "desc" },
  });
  if (open) return open;
  return prisma.gameRound.findFirst({
    where: { sessionId },
    orderBy: { startedAt: "desc" },
  });
}

export async function getGameState(sessionId: string): Promise<GameState> {
  const round = await getCurrentRound(sessionId);
  if (!round) return { round: null, scoreboard: [] };
  return {
    round: toRoundInfo(round),
    scoreboard: await getScoreboard(round.id),
  };
}

export async function broadcastGame(sessionId: string): Promise<void> {
  const game = await getGameState(sessionId);
  publish(sessionId, "game:update", { game });
}

export async function startRound(
  access: SessionAccess,
  userId: string,
  gameKey: unknown
): Promise<{ ok: true; roundId: string } | Fail> {
  if (!access.isTeacher) {
    return fail(403, "Hanya guru yang bisa memulai kuis.");
  }
  if (access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }
  if (!isValidGameKey(gameKey)) {
    return fail(400, "Jenis kuis tidak dikenal.");
  }

  // Close any open round first so there is at most one OPEN round.
  await prisma.gameRound.updateMany({
    where: { sessionId: access.sessionId, status: "OPEN" },
    data: { status: "CLOSED", endedAt: new Date() },
  });

  const round = await prisma.gameRound.create({
    data: {
      sessionId: access.sessionId,
      gameKey,
      startedByUserId: userId,
    },
    select: { id: true },
  });
  await broadcastGame(access.sessionId);
  return { ok: true, roundId: round.id };
}

export async function submitScore(
  access: SessionAccess,
  userId: string,
  roundId: string,
  rawScore: unknown
): Promise<{ ok: true } | Fail> {
  const round = await prisma.gameRound.findFirst({
    where: { id: roundId, sessionId: access.sessionId },
    select: { status: true, gameKey: true },
  });
  if (!round) return fail(404, "Ronde tidak ditemukan.");
  if (round.status !== "OPEN") return fail(409, "Kuis sudah ditutup.");

  if (typeof rawScore !== "number" || !Number.isFinite(rawScore)) {
    return fail(400, "Skor tidak valid.");
  }
  const score = Math.max(0, Math.min(Math.floor(rawScore), maxScoreFor(round.gameKey)));

  // Idempotent + monotonic: keep the player's best score. Different users write
  // different PK rows, so there is no cross-user write race here.
  const existing = await prisma.gameScore.findUnique({
    where: { roundId_userId: { roundId, userId } },
    select: { score: true },
  });
  if (!existing) {
    await prisma.gameScore.create({ data: { roundId, userId, score } });
  } else if (score > existing.score) {
    await prisma.gameScore.update({
      where: { roundId_userId: { roundId, userId } },
      data: { score },
    });
  }

  await broadcastGame(access.sessionId);
  return { ok: true };
}

export async function closeRound(
  access: SessionAccess,
  roundId: string
): Promise<{ ok: true } | Fail> {
  if (!access.isTeacher) {
    return fail(403, "Hanya guru yang bisa menutup kuis.");
  }
  const round = await prisma.gameRound.findFirst({
    where: { id: roundId, sessionId: access.sessionId },
    select: { status: true },
  });
  if (!round) return fail(404, "Ronde tidak ditemukan.");
  if (round.status === "CLOSED") return { ok: true };

  await prisma.gameRound.update({
    where: { id: roundId },
    data: { status: "CLOSED", endedAt: new Date() },
  });
  await broadcastGame(access.sessionId);
  return { ok: true };
}
