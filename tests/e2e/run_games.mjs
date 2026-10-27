/**
 * FunPython — in-browser GAME tests (Playwright, Node).
 *
 * Drives a real headless Chromium ON THIS HOST (the VS Code integrated browser
 * cannot reach localhost in this remote setup), logged in as the seeded STUDENT
 * account, and actually PLAYS the mini-games:
 *
 *   1. Render smoke test for every game lesson — advances through the lesson
 *      steps until each expected game card is visible, asserting it mounts with
 *      no uncaught page errors.
 *   2. TeachableMachine CAMERA deep test — switches to camera (a FAKE webcam is
 *      injected via Chromium flags), asserts the <video> actually streams
 *      (video.videoWidth > 0 — this is the bug we fixed), captures training
 *      examples for two categories, trains, predicts, and asserts the work +
 *      completion are POSTed to the server (200).
 *
 * Prereqs: app on http://localhost:3007 (override E2E_BASE_URL), DB seeded
 * (student `siswa` / `password123`), Playwright + Chromium available (reused
 * from a sibling project's ~/.cache/ms-playwright).
 *
 * Run:  npm run test:games   (or: node tests/e2e/run_games.mjs)
 * Exit code 1 if any check FAILs.
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Reuse the Playwright install from a sibling project (no pip / local install).
const { chromium } = require("/home/devnolife/lab/dashboard-lab/node_modules/playwright");

const BASE = (process.env.E2E_BASE_URL || "http://localhost:3007").replace(/\/$/, "");
const USERNAME = process.env.E2E_STUDENT_USER || "siswa";
const PASSWORD = process.env.E2E_STUDENT_PASS || "password123";

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "[PASS]" : "[FAIL]"} ${name}  ${detail}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Game lessons and the visible card titles each one should render.
const GAME_LESSONS = [
  { slug: "warmup-digital-identity", titles: ["Isi Bagian Rumpang", "Tebak Hasilnya", "Urutkan Baris Kode"] },
  { slug: "logic-tebak-angka", titles: ["Pilih Kata Percabangan", "Tebak Hasil Perulangan", "Urutkan Logika If"] },
  { slug: "project-turtle-art", titles: ["Pandu Si Kura-kura", "Lorong Panjang"] },
  { slug: "orientasi-koding-ka", titles: ["Tebak Istilah", "Cocokkan Misi"] },
  { slug: "navigator-berkas", titles: ["Rapikan Berkas", "Misi Penyelamatan Berkas"] },
  { slug: "kreator-konten", titles: ["Kenali Unsur Komunikasi", "Detektif Desain", "Etika Menyebarkan Konten"] },
  { slug: "teknisi-siber", titles: ["Kenali Perangkat"] },
  { slug: "detektif-data", titles: ["Dekomposisi Masalah Kantin", "Detektif Pembersih Data", "Klasifikasi Jarak Perjalanan", "Data Kantin Sekolah"] },
  { slug: "warga-digital", titles: ["Keputusan Warga Digital"] },
  { slug: "pelatih-ai", titles: ["Tebak Fungsi Tools KA", "Susun Prompt yang Baik", "Latih AI Pemilah Sampah Laut", "AI Tebak Gambar Hewan", "Lab Pelatih AI"] },
];

async function login(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("input[autocomplete='username']", USERNAME);
  await page.fill("input[type='password']", PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(app|dashboard)/, { timeout: 20000 }).catch(() => { }),
    page.click("button[type='submit']"),
  ]);
  const ok = /\/(app|dashboard)/.test(page.url());
  record("Login student (browser)", ok, `-> ${page.url().replace(BASE, "")}`);
  await page.close();
  return ok;
}

/** Clicks "Lanjut →" until the given title is visible, or steps run out. */
async function advanceUntilVisible(page, title, maxSteps = 14) {
  for (let i = 0; i <= maxSteps; i++) {
    const loc = page.getByText(title, { exact: false }).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.scrollIntoViewIfNeeded().catch(() => { });
      return true;
    }
    const next = page.getByRole("button", { name: /Lanjut/ });
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click().catch(() => { });
    await sleep(350);
  }
  const loc = page.getByText(title, { exact: false }).first();
  return loc.isVisible().catch(() => false);
}

async function smokeTestLesson(context, slug, titles) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await page.goto(`${BASE}/learn/${slug}`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  for (const title of titles) {
    const found = await advanceUntilVisible(page, title);
    record(`Game renders: ${slug} › ${title}`, found, found ? "" : "not visible");
  }
  const realErrors = pageErrors.filter((e) => !/favicon|ResizeObserver/i.test(e));
  record(`No page errors: ${slug}`, realErrors.length === 0, realErrors.slice(0, 1).join(" | "));
  await page.close();
}

async function testCameraTeachable(context) {
  const page = await context.newPage();
  const posts = { complete: null, work: null };
  page.on("response", (res) => {
    const u = res.url();
    if (u.includes("/api/activities/complete")) posts.complete = res.status();
    if (u.includes("/api/activities/work")) posts.work = res.status();
  });

  await page.goto(`${BASE}/learn/pelatih-ai`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  const reached = await advanceUntilVisible(page, "Lab Pelatih AI");
  record("Reached TeachableMachine step", reached);
  if (!reached) {
    await page.close();
    return;
  }

  // Scope to the visible teachable card.
  const card = page.locator(".not-prose", { hasText: "Lab Pelatih AI" }).first();

  // Switch to camera mode.
  await card.getByRole("button", { name: /Kamera/ }).click();
  // The fix: stream must actually attach to the <video> (videoWidth > 0).
  let vw = 0;
  for (let i = 0; i < 40; i++) {
    vw = await card.locator("video").evaluate((v) => v.videoWidth).catch(() => 0);
    if (vw > 0) break;
    await sleep(250);
  }
  record("Camera stream attached (videoWidth>0)", vw > 0, `videoWidth=${vw}`);
  if (vw === 0) {
    await page.close();
    return;
  }

  // Capture 3 examples for category 1, switch to category 2, capture 3 more.
  async function captureN(n) {
    for (let i = 0; i < n; i++) {
      await card.getByRole("button", { name: /Jepret/ }).click();
      await sleep(300);
    }
  }
  await captureN(3);
  // Activate the second category, then capture for it.
  const pilih = card.getByRole("button", { name: /^pilih$/ }).first();
  await pilih.click().catch(() => { });
  await sleep(200);
  await captureN(3);

  const trainBtn = card.getByRole("button", { name: /Latih AI/ });
  const canTrain = await trainBtn.isEnabled().catch(() => false);
  record("Training enabled after camera examples", canTrain);
  if (canTrain) {
    await trainBtn.click();
    // Wait for predict phase (the "Jepret & Tebak" button).
    const predictBtn = card.getByRole("button", { name: /Jepret & Tebak/ });
    await predictBtn.waitFor({ state: "visible", timeout: 5000 }).catch(() => { });
    await sleep(400);
    // Ensure camera frame is ready again, then predict.
    await predictBtn.click().catch(() => { });
    await sleep(1200);
  }

  record("Activity completion saved (200)", posts.complete === 200, `status=${posts.complete}`);
  record("Game work saved (200)", posts.work === 200, `status=${posts.work}`);
  await page.close();
}

async function main() {
  console.log(`== FunPython game tests against ${BASE} (user=${USERNAME}) ==\n`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--disable-dev-shm-usage",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1600 },
    permissions: ["camera"],
  });

  try {
    const ok = await login(context);
    if (!ok) throw new Error("login failed — aborting");

    for (const { slug, titles } of GAME_LESSONS) {
      await smokeTestLesson(context, slug, titles);
    }
    await testCameraTeachable(context);
  } finally {
    await context.close();
    await browser.close();
  }

  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  console.log("\n" + "=".repeat(60));
  console.log(`  PASS ${pass}   FAIL ${fail}   total ${results.length}`);
  console.log("=".repeat(60));
  if (fail) {
    console.log("\nFailed:");
    for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.name}  ${r.detail}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
