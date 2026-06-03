/**
 * One-off: replace all STUDENT accounts with the real class roster.
 *
 * Deletes every existing user with role STUDENT (cascades to their progress,
 * submissions, enrollments, badges, etc.) then creates fresh accounts for the
 * Akhwat & Ikhwan roster below.
 *
 * Run: npx tsx --env-file=.env scripts/seed-students.ts
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Shared class password (min 6 chars). Students can change it later. */
const CLASS_PASSWORD = "funpython";

const AKHWAT: string[] = [
  "Afiyah Permata Achmad",
  "Afza Danisya Hulwah",
  "Almirah Fahimah Firdaus",
  "Cahya Wasylah",
  "Dzakirah Azzahra",
  "Faizah Mufidah Ahmadi",
  "Hafizhatulhuda",
  "Keisha Nadila Qonita",
  "Khansa Faith Alauna Putrisyah",
  "Lutfiah Zahra Firdaus",
  "Maeza Kanya Aesar Fadantya",
  "Nabila Khadijah Az-Zahra",
  "Nadiah Risyana Khairunnisa",
  "Nayla Aulia Zhatifa",
  "Nayla Zuhratul Amaliyyah",
  "Nur Khadijah Fatimah Talib",
  "Qanita Saajidah",
  "Salsabila Usman",
  "Siti Aisyah Ghasali",
  "Siti Rania Aliyah Putri Riyadi",
  "Andi Pertiwi Ardevi",
  "Current Alysia Humaira",
];

const IKHWAN: string[] = [
  "Afghan Alghani Basyir Siata",
  "Ahmad Kaysan Syawal",
  "Aryasatya Balapradana",
  "Mohammad Al Khatiri Rohandi",
  "Muhammad Ikram Kabir",
  "Muh. Andika",
  "Muh. Baso Farid Hidayatullah",
  "Muh. Haidil Fitrah.S",
  "Muh. Raehan Saputra",
  "Muhammad Fauzan S.",
  "Muhammad Ihya Al-Ma'aarif Hayat",
  "Navil Dwi Putra Rahmat",
  "Risqullah Ramadhana Rusmana",
  "Taufiq Rahman",
  "Veto Ibnusani Ardhika",
  "Zhafran Dirgantara Efdiono",
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
  let base = (tokens.slice(0, 2).join("") || tokens[0] || "siswa").slice(0, 24);
  if (base.length < 3) base = (base + "siswa").slice(0, 24);

  let username = base;
  let n = 2;
  while (taken.has(username)) {
    const suffix = String(n++);
    username = (base.slice(0, 24 - suffix.length) + suffix);
  }
  taken.add(username);
  return username;
}

async function main() {
  const passwordHash = await bcrypt.hash(CLASS_PASSWORD, 10);
  const taken = new Set<string>();

  const roster = [
    ...AKHWAT.map((displayName) => ({ displayName, group: "Akhwat" })),
    ...IKHWAN.map((displayName) => ({ displayName, group: "Ikhwan" })),
  ].map((r) => ({ ...r, username: makeUsername(r.displayName, taken) }));

  console.log(`Roster: ${roster.length} siswa (${AKHWAT.length} akhwat + ${IKHWAN.length} ikhwan)`);

  const deleted = await prisma.user.deleteMany({ where: { role: Role.STUDENT } });
  console.log(`Deleted ${deleted.count} akun STUDENT lama.`);

  for (const r of roster) {
    await prisma.user.create({
      data: {
        username: r.username,
        displayName: r.displayName,
        passwordHash,
        role: Role.STUDENT,
        xp: 0,
        lives: 5,
      },
    });
  }

  console.log(`\nCreated ${roster.length} akun siswa baru. Password (semua): "${CLASS_PASSWORD}"\n`);
  console.log("Group  | Username                  | Nama");
  console.log("-------|---------------------------|------------------------------");
  for (const r of roster) {
    console.log(
      `${r.group} | ${r.username.padEnd(25)} | ${r.displayName}`
    );
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
