import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Minimal local-filesystem storage abstraction for uploaded files. Kept behind
 * a small interface so it can later be swapped for object storage (S3, etc.)
 * on the production server without touching callers.
 *
 * Files live under `<cwd>/uploads/` which is gitignored. Uploads used only for
 * one-shot grading can be deleted immediately after via `deleteUpload`.
 */
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export interface StoredFile {
  /** Opaque id (also the on-disk filename). */
  id: string;
  /** Absolute path on disk. */
  path: string;
}

export async function saveUpload(
  data: Buffer | Uint8Array,
  ext = "bin"
): Promise<StoredFile> {
  await ensureDir();
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
  const id = `${crypto.randomUUID()}.${safeExt}`;
  const filePath = path.join(UPLOAD_DIR, id);
  await fs.writeFile(filePath, data);
  return { id, path: filePath };
}

export async function deleteUpload(id: string): Promise<void> {
  // Guard against path traversal: only allow plain filenames.
  if (id.includes("/") || id.includes("\\") || id.includes("..")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, id));
  } catch {
    // already gone — ignore
  }
}
