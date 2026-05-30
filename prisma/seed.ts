/**
 * Seed test accounts for local development.
 *
 * Run with:
 *   npm run db:seed
 *
 * Accounts created (all use password "password123"):
 *   admin       / password123   → ADMIN
 *   instruktur  / password123   → TEACHER
 *   siswa       / password123   → STUDENT
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getAllLessons } from "../src/lib/content";

const prisma = new PrismaClient();

interface SeedUser {
  username: string;
  displayName: string;
  role: Role;
  password: string;
  xp?: number;
  lives?: number;
}

const USERS: SeedUser[] = [
  {
    username: "admin",
    displayName: "Admin FunPython",
    role: Role.ADMIN,
    password: "password123",
  },
  {
    username: "instruktur",
    displayName: "Bu Guru Python",
    role: Role.TEACHER,
    password: "password123",
  },
  {
    username: "siswa",
    displayName: "Siswa Demo",
    role: Role.STUDENT,
    password: "password123",
    xp: 0,
    lives: 5,
  },
];

async function syncContent() {
  console.log("\nSyncing lessons & challenges from markdown...");
  const lessons = await getAllLessons();

  const liveLessonSlugs: string[] = [];
  const liveChallengeIds: string[] = [];

  for (const lesson of lessons) {
    liveLessonSlugs.push(lesson.slug);
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        summary: lesson.summary,
        order: lesson.order,
        projectKey: lesson.projectKey,
        active: true,
      },
      create: {
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        order: lesson.order,
        projectKey: lesson.projectKey,
        active: true,
      },
    });

    for (let i = 0; i < lesson.challenges.length; i++) {
      const c = lesson.challenges[i];
      liveChallengeIds.push(c.id);
      await prisma.challenge.upsert({
        where: { id: c.id },
        update: {
          lessonSlug: lesson.slug,
          order: i,
          prompt: c.prompt,
          starterCode: c.starterCode,
          tests: c.tests,
          xpReward: c.xpReward ?? 10,
          active: true,
        },
        create: {
          id: c.id,
          lessonSlug: lesson.slug,
          order: i,
          prompt: c.prompt,
          starterCode: c.starterCode,
          tests: c.tests,
          xpReward: c.xpReward ?? 10,
          active: true,
        },
      });
    }
  }

  // Soft-deactivate rows whose IDs no longer exist in markdown (never delete, to
  // preserve historical submissions and FK integrity).
  const deLessons = await prisma.lesson.updateMany({
    where: { slug: { notIn: liveLessonSlugs }, active: true },
    data: { active: false },
  });
  const deChallenges = await prisma.challenge.updateMany({
    where: { id: { notIn: liveChallengeIds }, active: true },
    data: { active: false },
  });

  console.log(
    `  ✓ ${lessons.length} lessons, ${liveChallengeIds.length} challenges synced` +
      ` (deactivated ${deLessons.count} lessons, ${deChallenges.count} challenges)`
  );
}

async function main() {
  console.log("Seeding test accounts...\n");
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash,
        displayName: u.displayName,
        role: u.role,
      },
      create: {
        username: u.username,
        passwordHash,
        displayName: u.displayName,
        role: u.role,
        xp: u.xp ?? 0,
        lives: u.lives ?? 5,
      },
    });
    console.log(
      `  ✓ ${user.role.padEnd(7)}  ${user.username.padEnd(12)} (password: ${u.password})`
    );
  }

  await syncContent();
  console.log("\nDone. Login at /login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
