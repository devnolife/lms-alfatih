import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import type { SessionAccess } from "@/lib/sessions";
import type {
  DeliverableType,
  ReviewStatus,
  TaskStatus,
} from "@prisma/client";

// Caps to keep full-list broadcasts cheap and prevent classroom spam.
export const MAX_TASKS_PER_SESSION = 200;
export const MAX_DELIVERABLES_PER_SESSION = 100;
export const TITLE_MAX = 120;
export const TEXT_MAX = 10_000;
export const URL_MAX = 2_000;

type Fail = { ok: false; status: number; error: string };
type Ok<T> = { ok: true } & T;
type Result<T = unknown> = Ok<T> | Fail;

const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

// ---------------------------------------------------------------------------
// Shapes returned to the client (names resolved for display).
// ---------------------------------------------------------------------------

export interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  createdByUserId: string;
  createdByName: string;
  claimedByUserId: string | null;
  claimedByName: string | null;
  createdAt: string;
}

export interface DeliverableRow {
  id: string;
  type: DeliverableType;
  content: string;
  teacherStatus: ReviewStatus;
  authorUserId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

async function resolveNames(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, displayName: true },
  });
  return new Map(users.map((u) => [u.id, u.displayName]));
}

export async function getTasks(sessionId: string): Promise<TaskRow[]> {
  const tasks = await prisma.groupTask.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  const names = await resolveNames(
    tasks.flatMap((t) => [t.createdByUserId, t.claimedByUserId ?? ""])
  );
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    createdByUserId: t.createdByUserId,
    createdByName: names.get(t.createdByUserId) ?? "?",
    claimedByUserId: t.claimedByUserId,
    claimedByName: t.claimedByUserId
      ? names.get(t.claimedByUserId) ?? "?"
      : null,
    createdAt: t.createdAt.toISOString(),
  }));
}

export async function getDeliverables(
  sessionId: string
): Promise<DeliverableRow[]> {
  const items = await prisma.groupDeliverable.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  const names = await resolveNames(items.map((d) => d.authorUserId));
  return items.map((d) => ({
    id: d.id,
    type: d.type,
    content: d.content,
    teacherStatus: d.teacherStatus,
    authorUserId: d.authorUserId,
    authorName: names.get(d.authorUserId) ?? "?",
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function broadcastTasks(sessionId: string): Promise<void> {
  const tasks = await getTasks(sessionId);
  publish(sessionId, "task:update", { tasks });
}

export async function broadcastDeliverables(sessionId: string): Promise<void> {
  const deliverables = await getDeliverables(sessionId);
  publish(sessionId, "deliverable:update", { deliverables });
}

// ---------------------------------------------------------------------------
// Validation helpers.
// ---------------------------------------------------------------------------

function cleanTitle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length < 1 || t.length > TITLE_MAX) return null;
  return t;
}

const DELIVERABLE_TYPES: DeliverableType[] = ["TEXT", "LINK", "CODE", "IMAGE"];

function validateDeliverable(
  type: unknown,
  content: unknown
): { type: DeliverableType; content: string } | null {
  if (typeof type !== "string" || !DELIVERABLE_TYPES.includes(type as DeliverableType)) {
    return null;
  }
  if (typeof content !== "string") return null;
  const c = content.trim();
  if (c.length < 1) return null;

  if (type === "LINK" || type === "IMAGE") {
    if (c.length > URL_MAX) return null;
    let url: URL;
    try {
      url = new URL(c);
    } catch {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { type: type as DeliverableType, content: url.toString() };
  }

  if (c.length > TEXT_MAX) return null;
  return { type: type as DeliverableType, content: c };
}

// ---------------------------------------------------------------------------
// Task mutations.
// ---------------------------------------------------------------------------

export async function createTask(
  access: SessionAccess,
  userId: string,
  rawTitle: unknown
): Promise<Result<{ taskId: string }>> {
  if (access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }
  const title = cleanTitle(rawTitle);
  if (!title) return fail(400, "Judul tugas tidak valid (1–120 karakter).");

  const count = await prisma.groupTask.count({
    where: { sessionId: access.sessionId },
  });
  if (count >= MAX_TASKS_PER_SESSION) {
    return fail(409, "Batas jumlah tugas tercapai.");
  }

  const created = await prisma.groupTask.create({
    data: { sessionId: access.sessionId, createdByUserId: userId, title },
    select: { id: true },
  });
  await broadcastTasks(access.sessionId);
  return { ok: true, taskId: created.id };
}

const TASK_STATUSES: TaskStatus[] = ["TODO", "DOING", "DONE"];

export async function updateTask(
  access: SessionAccess,
  userId: string,
  taskId: string,
  patch: { status?: unknown; claim?: unknown; title?: unknown }
): Promise<Result> {
  if (access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }

  const task = await prisma.groupTask.findFirst({
    where: { id: taskId, sessionId: access.sessionId },
  });
  if (!task) return fail(404, "Tugas tidak ditemukan.");

  const isOwnerish =
    access.isTeacher ||
    task.createdByUserId === userId ||
    task.claimedByUserId === userId;

  const data: {
    title?: string;
    status?: TaskStatus;
    claimedByUserId?: string | null;
  } = {};

  if (patch.title !== undefined) {
    if (!isOwnerish) {
      return fail(403, "Hanya pembuat/pengambil tugas yang bisa mengubah judul.");
    }
    const title = cleanTitle(patch.title);
    if (!title) return fail(400, "Judul tugas tidak valid.");
    data.title = title;
  }

  // Release a claim (only the current claimer or a teacher).
  if (patch.claim === false) {
    if (!access.isTeacher && task.claimedByUserId !== userId) {
      return fail(403, "Hanya pengambil tugas yang bisa melepaskannya.");
    }
    data.claimedByUserId = null;
  }

  if (patch.status !== undefined) {
    if (
      typeof patch.status !== "string" ||
      !TASK_STATUSES.includes(patch.status as TaskStatus)
    ) {
      return fail(400, "Status tidak valid.");
    }
    data.status = patch.status as TaskStatus;
  }

  // Taking a task: race-safe guarded claim (only succeeds if unclaimed).
  const wantsClaim =
    patch.claim === true || (data.status === "DOING" && !task.claimedByUserId);
  if (wantsClaim && data.claimedByUserId !== null) {
    await prisma.groupTask.updateMany({
      where: { id: taskId, sessionId: access.sessionId, claimedByUserId: null },
      data: { claimedByUserId: userId },
    });
  }

  if (Object.keys(data).length > 0) {
    await prisma.groupTask.update({
      where: { id: taskId },
      data,
    });
  }

  await broadcastTasks(access.sessionId);
  return { ok: true };
}

export async function deleteTask(
  access: SessionAccess,
  userId: string,
  taskId: string
): Promise<Result> {
  const task = await prisma.groupTask.findFirst({
    where: { id: taskId, sessionId: access.sessionId },
    select: { createdByUserId: true },
  });
  if (!task) return fail(404, "Tugas tidak ditemukan.");

  const canDelete = access.isTeacher || task.createdByUserId === userId;
  if (!canDelete) return fail(403, "Tidak boleh menghapus tugas ini.");
  // Students may only delete while the session is live; teachers anytime.
  if (!access.isTeacher && access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }

  await prisma.groupTask.delete({ where: { id: taskId } });
  await broadcastTasks(access.sessionId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Deliverable mutations.
// ---------------------------------------------------------------------------

export async function createDeliverable(
  access: SessionAccess,
  userId: string,
  rawType: unknown,
  rawContent: unknown
): Promise<Result<{ deliverableId: string }>> {
  if (access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }
  const valid = validateDeliverable(rawType, rawContent);
  if (!valid) return fail(400, "Hasil tidak valid (cek tipe/isi/URL).");

  const count = await prisma.groupDeliverable.count({
    where: { sessionId: access.sessionId },
  });
  if (count >= MAX_DELIVERABLES_PER_SESSION) {
    return fail(409, "Batas jumlah hasil tercapai.");
  }

  const created = await prisma.groupDeliverable.create({
    data: {
      sessionId: access.sessionId,
      authorUserId: userId,
      type: valid.type,
      content: valid.content,
    },
    select: { id: true },
  });
  await broadcastDeliverables(access.sessionId);
  return { ok: true, deliverableId: created.id };
}

const REVIEW_STATUSES: ReviewStatus[] = ["SUBMITTED", "REVIEWED", "APPROVED"];

export async function updateDeliverable(
  access: SessionAccess,
  userId: string,
  deliverableId: string,
  patch: { content?: unknown; teacherStatus?: unknown }
): Promise<Result> {
  const item = await prisma.groupDeliverable.findFirst({
    where: { id: deliverableId, sessionId: access.sessionId },
  });
  if (!item) return fail(404, "Hasil tidak ditemukan.");

  const data: { content?: string; teacherStatus?: ReviewStatus } = {};

  if (patch.teacherStatus !== undefined) {
    if (!access.isTeacher) {
      return fail(403, "Hanya guru yang bisa menilai.");
    }
    if (
      typeof patch.teacherStatus !== "string" ||
      !REVIEW_STATUSES.includes(patch.teacherStatus as ReviewStatus)
    ) {
      return fail(400, "Status penilaian tidak valid.");
    }
    data.teacherStatus = patch.teacherStatus as ReviewStatus;
  }

  if (patch.content !== undefined) {
    if (!access.isTeacher && item.authorUserId !== userId) {
      return fail(403, "Hanya penulis yang bisa mengubah hasil.");
    }
    if (!access.isTeacher && access.status !== "ACTIVE") {
      return fail(409, "Sesi sudah berakhir.");
    }
    const valid = validateDeliverable(item.type, patch.content);
    if (!valid) return fail(400, "Isi hasil tidak valid.");
    data.content = valid.content;
  }

  if (Object.keys(data).length === 0) {
    return fail(400, "Tidak ada perubahan.");
  }

  await prisma.groupDeliverable.update({
    where: { id: deliverableId },
    data,
  });
  await broadcastDeliverables(access.sessionId);
  return { ok: true };
}

export async function deleteDeliverable(
  access: SessionAccess,
  userId: string,
  deliverableId: string
): Promise<Result> {
  const item = await prisma.groupDeliverable.findFirst({
    where: { id: deliverableId, sessionId: access.sessionId },
    select: { authorUserId: true },
  });
  if (!item) return fail(404, "Hasil tidak ditemukan.");

  const canDelete = access.isTeacher || item.authorUserId === userId;
  if (!canDelete) return fail(403, "Tidak boleh menghapus hasil ini.");
  if (!access.isTeacher && access.status !== "ACTIVE") {
    return fail(409, "Sesi sudah berakhir.");
  }

  await prisma.groupDeliverable.delete({ where: { id: deliverableId } });
  await broadcastDeliverables(access.sessionId);
  return { ok: true };
}
