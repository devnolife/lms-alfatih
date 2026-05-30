import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getCurriculum, LEVELS } from "@/lib/curriculum";

export interface EarnedBadge {
  code: string;
  name: string;
  description: string;
  iconKey: string;
  awardedAt: Date;
}

const CERTIFICATE_PROJECT_KEY = "informatika-kelas-7";

/**
 * Reconciles a user's earned badges and certificate with their progress.
 *
 * - Awards the level badge (e.g. `level-1-bk`) for every Level the user has
 *   fully completed. Idempotent via the UserBadge composite PK.
 * - Issues the curriculum completion Certificate once ALL six Levels are done.
 *
 * Returns the list of badge codes newly awarded in this call (for toasts).
 */
export async function syncUserBadges(userId: string): Promise<string[]> {
  const groups = await getCurriculum(userId);
  const doneCodes = groups
    .filter((g) => g.state === "done")
    .map((g) => g.meta.badgeCode);

  if (doneCodes.length === 0) return [];

  const badges = await prisma.badge.findMany({
    where: { code: { in: doneCodes } },
    select: { id: true, code: true },
  });

  const existing = await prisma.userBadge.findMany({
    where: { userId, badgeId: { in: badges.map((b) => b.id) } },
    select: { badgeId: true },
  });
  const have = new Set(existing.map((e) => e.badgeId));

  const toAward = badges.filter((b) => !have.has(b.id));
  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((b) => ({ userId, badgeId: b.id })),
      skipDuplicates: true,
    });
  }

  // Certificate when every level (all six) is complete.
  const allLevelsDone =
    groups.length === LEVELS.length && groups.every((g) => g.state === "done");
  if (allLevelsDone) {
    await prisma.certificate.upsert({
      where: {
        userId_projectKey: { userId, projectKey: CERTIFICATE_PROJECT_KEY },
      },
      update: {},
      create: {
        userId,
        projectKey: CERTIFICATE_PROJECT_KEY,
        verifyToken: crypto.randomUUID().replace(/-/g, ""),
      },
    });
  }

  return toAward.map((b) => b.code);
}

export async function getUserBadges(userId: string): Promise<EarnedBadge[]> {
  const rows = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { awardedAt: "desc" },
    select: {
      awardedAt: true,
      badge: { select: { code: true, name: true, description: true, iconKey: true } },
    },
  });
  return rows.map((r) => ({
    code: r.badge.code,
    name: r.badge.name,
    description: r.badge.description,
    iconKey: r.badge.iconKey,
    awardedAt: r.awardedAt,
  }));
}

export interface CertificateInfo {
  projectKey: string;
  verifyToken: string;
  issuedAt: Date;
  holderName: string;
}

export async function getUserCertificate(
  userId: string
): Promise<CertificateInfo | null> {
  const cert = await prisma.certificate.findUnique({
    where: {
      userId_projectKey: { userId, projectKey: CERTIFICATE_PROJECT_KEY },
    },
    select: {
      projectKey: true,
      verifyToken: true,
      issuedAt: true,
      user: { select: { displayName: true } },
    },
  });
  if (!cert) return null;
  return {
    projectKey: cert.projectKey,
    verifyToken: cert.verifyToken,
    issuedAt: cert.issuedAt,
    holderName: cert.user.displayName,
  };
}

export async function verifyCertificate(
  token: string
): Promise<CertificateInfo | null> {
  const cert = await prisma.certificate.findUnique({
    where: { verifyToken: token },
    select: {
      projectKey: true,
      verifyToken: true,
      issuedAt: true,
      user: { select: { displayName: true } },
    },
  });
  if (!cert) return null;
  return {
    projectKey: cert.projectKey,
    verifyToken: cert.verifyToken,
    issuedAt: cert.issuedAt,
    holderName: cert.user.displayName,
  };
}
