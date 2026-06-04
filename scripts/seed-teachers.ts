/**
 * Idempotent: create TEACHER accounts for the facilitator roster below.
 *
 * Unlike seed-students.ts this does NOT delete anyone. Each teacher is created
 * if missing, or left untouched if a user with the same username already exists.
 *
 * Run: npx tsx --env-file=.env scripts/seed-teachers.ts
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Shared password (min 6 chars). Teachers can change it later. */
const TEACHER_PASSWORD = "funpython";

const TEACHERS: string[] = [
  "Sitti Syuhada",
  "Gunawan Majid",
  "Ulfi Aulia",
  "Andi Afrida Irianti",
  "Rahmawati",
  "Muhammad Said",
];

/** Strip diacritics and non-alphanumeric characters. */
function slugTokens(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Build a unique username (first two name tokens), max 24 chars. */
function makeUsername(name: string, taken: Set<string>): string {
  const tokens = slugTokens(name);
  let base = (tokens.slice(0, 2).join("") || tokens[0] || "guru").slice(0, 24);
  if (base.length < 3) base = (base + "guru").slice(0, 24);

  let username = base;
  let n = 2;
  while (taken.has(username)) {
    const suffix = String(n++);
    username = base.slice(0, 24 - suffix.length) + suffix;
  }
  taken.add(username);
  return username;
}

async function main() {
  const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);

  // Seed the "taken" set with every existing username so we never collide.
  const existing = await prisma.user.findMany({ select: { username: true } });
  const taken = new Set(existing.map((u) => u.username));

  const created: { username: string; displayName: string }[] = [];
  const skipped: { username: string; displayName: string }[] = [];

  for (const displayName of TEACHERS) {
    const baseUsername = makeUsername(displayName, new Set(taken));

    // If a user with this exact display name already exists as a teacher, skip.
    const already = await prisma.user.findFirst({
      where: { displayName, role: Role.TEACHER },
      select: { username: true },
    });
    if (already) {
      skipped.push({ username: already.username, displayName });
      continue;
    }

    // Reserve a free username (recompute against the live taken set).
    const username = makeUsername(displayName, taken);
    void baseUsername;

    await prisma.user.create({
      data: {
        username,
        displayName,
        passwordHash,
        role: Role.TEACHER,
        xp: 0,
        lives: 5,
      },
    });
    created.push({ username, displayName });
  }

  console.log(
    `\nGuru dibuat: ${created.length}, dilewati (sudah ada): ${skipped.length}. Password (baru): "${TEACHER_PASSWORD}"\n`
  );
  console.log("Status   | Username                  | Nama");
  console.log("---------|---------------------------|------------------------------");
  for (const r of created) {
    console.log(`BARU     | ${r.username.padEnd(25)} | ${r.displayName}`);
  }
  for (const r of skipped) {
    console.log(`ADA      | ${r.username.padEnd(25)} | ${r.displayName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
