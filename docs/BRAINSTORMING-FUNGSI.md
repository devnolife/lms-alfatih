# 🧠 Brainstorming Fungsi — FunPython

> Dokumen ini memetakan **apa yang dikerjakan di setiap bagian/fungsi** project
> FunPython: sebuah LMS berbasis web (Next.js 16 + Prisma + Pyodide) untuk
> pembelajaran Python tingkat SMP dengan pendekatan *Project-Based Learning* 1-hari.
>
> Tujuan dokumen: jadi peta mental sebelum lanjut mengembangkan fitur baru —
> mencakup runtime Python, auth, konten lesson, gamifikasi, kelas/sesi langsung,
> dan UI.

---

## 1. Gambaran Besar (Arsitektur)

```
Pengunjung ──► (marketing) landing page ──► /register, /login
                                                    │ (JWT cookie)
                                                    ▼
Siswa ──► /app (home) ──► /learn/[slug] ──► LessonPlayer ──► Pyodide Worker
   │                                              │
   │                                              ├─ Auto-grader (tests frontmatter)
   │                                              ├─ Turtle canvas, visualizer, mini-game
   │                                              └─ POST /api/submissions ──► XP + progress (DB)
   │
   └──► /app/classes ──► join kelas ──► /app/sessions/[id] (SessionRoom, SSE realtime)

Guru ──► /dashboard ──► kelola kelas ──► mulai ClassSession ──► papan skor + tugas + game langsung
```

**Lapisan utama:**

| Lapisan | Lokasi | Peran |
|---|---|---|
| Runtime Python | `public/python-worker.js`, `src/hooks/usePython.ts` | Jalankan kode siswa (Pyodide WASM) di Web Worker terisolasi |
| Penilaian | `src/lib/python/grader.ts`, `errors.ts` | Cek tes & terjemahkan error ke Bahasa Indonesia |
| Konten | `content/lessons/*.md`, `src/lib/content.ts`, `remarkDirectives.ts` | Lesson Markdown + directive UI interaktif |
| Auth | `src/lib/auth.ts`, `src/proxy.ts`, `api/auth/*` | JWT cookie, proteksi route, role |
| Data | `prisma/schema.prisma`, `src/lib/db.ts` | Postgres via Prisma |
| Realtime/Kelas | `src/lib/realtime.ts`, `sessions.ts`, `groupwork.ts`, `games.ts` | SSE + Redis pub/sub untuk sesi langsung |
| UI | `src/components/**`, `src/app/**` | Halaman, editor, gamifikasi, festivity |

---

## 2. Runtime Python (eksekusi kode siswa)

### `public/python-worker.js` (Web Worker — bukan modul ekspor)
- Memuat **Pyodide** dari CDN, lalu mendaftarkan **shim `turtle`** (gambar ke
  canvas via `DrawCommand`, karena Tkinter tak ada di WASM).
- Menjalankan kode siswa **berurutan (serialized)**, menangkap `stdout`/`stderr`,
  dan mengirim pesan `status` / `exec` / `done` ke main thread.
- Mengisolasi eksekusi dari UI agar loop berat tak membekukan halaman.

### `src/hooks/usePython.ts`
- `usePython()` — mengelola **satu** Pyodide worker: ekspos `preload()` dan
  `run(code, stdin)`. Mengatur **watchdog** boot & eksekusi (hentikan loop tak
  terbatas), serta lifecycle worker (`PythonStatus`).

### `src/utils/interpreter.ts` (mini-interpreter fallback, sisi klien)
- `runPython(code)` — pseudo-interpreter Python kecil: komentar, assignment,
  `print()`, `for range(n)`, perkalian string, dan math. Mengembalikan `{ output, error }`.
- `evaluateExpression(expr, loopIndex, env)` — resolusi variabel & evaluasi ekspresi.
- `safeEvalMath(expr)` — evaluasi aritmetika aman (whitelist).

### Penilaian — `src/lib/python/`
- **`grader.ts › gradeChallenge(run, challenge, code)`** — jalankan tiap tes via
  runner yang disuntikkan, cek `expectedStdout` / `stdin` / `assertions`, balikan
  `GradeResult` (detail lulus/gagal per-tes).
- **`errors.ts › friendlyError(raw)`** — ubah traceback Python mentah jadi pesan
  ramah pemula dalam **Bahasa Indonesia**.
- **`types.ts`** — tipe: `TurtleLine`, `TurtleDot`, `DrawCommand`, `RunResult`
  (stdout/stderr, error mentah & ramah, perintah gambar, flag turtle/timeout).

---

## 3. Auth & Proteksi Route

### `src/lib/auth.ts`
- `hashPassword(plain)` / `verifyPassword(plain, hash)` — bcrypt hash & verifikasi.
- `createSession(payload)` — tandatangani JWT (jose) & set cookie sesi 14 hari.
- `destroySession()` — hapus cookie sesi.
- `readSession()` — baca & verifikasi JWT cookie → payload `{ userId, role, username }` atau null.
- `getCurrentUser()` — ambil profil user dari DB berdasarkan sesi.
- `isValidUsername()` / `isValidPassword()` — validasi format input.

### `src/proxy.ts` (middleware Next.js 16)
- `proxy(req)` — proteksi `/app`, `/learn`, `/dashboard`; redirect tamu ke
  `/login`; batasi `/dashboard` hanya **TEACHER/ADMIN** dengan verifikasi JWT.
- `config` — matcher prefix route terproteksi.

### API auth — `src/app/api/auth/`
- **`login` POST** `{username,password}` — rate-limit per IP, verifikasi, buat sesi.
- **`register` POST** `{username,password,displayName,role}` — rate-limit, cek unik,
  buat user (role hanya STUDENT/TEACHER, selain itu jadi STUDENT), buat sesi.
- **`logout` POST** — `destroySession()`.

---

## 4. Konten Lesson (Markdown + directive interaktif)

### `src/lib/content.ts`
- `getAllLessons()` — baca `content/lessons/*.md`, parse frontmatter (gray-matter),
  cache & urutkan berdasarkan `order`.
- `getLessonBySlug(slug)` — satu lesson by slug.
- Tipe `ChallengeSpec`, `LessonMeta`, `Lesson` (metadata + body Markdown).

### `src/lib/markdown/remarkDirectives.ts`
- `remarkDirectives` (plugin Remark) — ubah node directive (`:::callout`, `::visual`,
  `::game`, `:::reveal`) jadi elemen HAST dengan menyalin nama/atribut ke
  `data.hName`/`data.hProperties`.

### Frontmatter lesson (`content/lessons/*.md`)
- Tiap lesson punya `title`, `summary`, `order`, `projectKey`, `estimatedMinutes`,
  dan daftar `challenges` (id, prompt, xpReward, starterCode, tests).
- 3 modul bootcamp ter-seed: **warm-up identitas digital**, **logika tebak angka**,
  **project turtle art**.

---

## 5. Data Model (Prisma — `prisma/schema.prisma`)

| Model | Fungsi |
|---|---|
| `User` | Akun + role (STUDENT/TEACHER/ADMIN), `xp`, `lives` |
| `Class` / `Enrollment` | Kelas guru + keanggotaan siswa (join code unik) |
| `Lesson` / `Challenge` | Mirror lesson Markdown ke DB (challenge simpan `tests` JSON) |
| `ChallengeCompletion` | **Idempoten**: primary key komposit `(userId, challengeId)` → XP cuma diberi sekali |
| `Submission` | Riwayat submit kode + hasil tes + XP |
| `LessonProgress` | Status NOT_STARTED/IN_PROGRESS/COMPLETED per user |
| `Badge` / `UserBadge` / `Certificate` | Gamifikasi & sertifikat |
| `ClassSession` | Sesi kelas langsung (ACTIVE/ENDED) |
| `GroupTask` | Papan tugas kolaboratif (TODO/DOING/DONE, claim) |
| `GroupDeliverable` | Kiriman hasil (TEXT/LINK/CODE/IMAGE) + status review guru |
| `GameRound` / `GameScore` | Ronde kuis langsung + skor per pemain |

### `prisma/seed.ts`
- Buat 3 akun demo (admin/instruktur/siswa, password `password123`).
- `syncContent()` — upsert lesson & challenge dari Markdown; **soft-deactivate**
  baris yang sudah tak ada (jaga integritas FK & riwayat submission).

### `src/lib/db.ts`
- `prisma` — singleton Prisma client.

---

## 6. Submission & XP

### `src/app/api/submissions/route.ts` (POST)
- Wajib login + rate-limit per user; validasi (`code` ≤ 20k, `results` ≤ 100).
- **Transaksi**: `challengeCompletion.createMany(skipDuplicates)` → `user.update(xp increment)`
  → `submission.create` → `lessonProgress.upsert` (hitung ulang progres).
- Best-effort `broadcastUserActivity(userId)` agar papan skor sesi langsung ikut update.
- Balikan `{ xpAwarded, alreadyAwarded, totalXp, lessonStatus }`.

---

## 7. Kelas & Sesi Langsung (Realtime)

### `src/lib/classes.ts`
- `generateJoinCode()` — kode kelas acak.
- `getTeacherClasses(teacherId)` / `getStudentClasses(userId)` — daftar kelas + jumlah anggota + sesi aktif.
- `createClass(teacherId, name)` — buat kelas (retry kalau join code bentrok).
- `joinClassByCode(userId, joinCode)` — daftarkan siswa (404 kode salah, 409 sudah join).

### `src/lib/sessions.ts`
- `getSessionAccess(sessionId, userId, role)` — otorisasi (guru/admin atau siswa terdaftar).
- `getActiveSessionForClass(classId)` — id sesi aktif.
- `startSession(...)` / `endSession(...)` — mulai (reuse satu ACTIVE) / akhiri sesi.
- `getSessionBoard(sessionId, classId)` — papan skor langsung (XP, jumlah solve, status online).
- `broadcastUserActivity(userId)` — publish papan terbaru ke semua sesi aktif user.

### `src/lib/realtime.ts`
- `publish(sessionId, type, data)` — emit event in-process + Redis pub/sub (kalau ada).
- `subscribe(sessionId, handler)` — listener in-memory (balikan unsubscribe).
- `getOnlineUsers` / `addPresence` / `removePresence` — pelacakan presence (online).

### `src/lib/groupwork.ts`
- `getTasks` / `getDeliverables` — ambil + resolusi nama.
- `createTask` / `updateTask` / `deleteTask` — CRUD tugas (validasi cap & permission, lalu broadcast).
- `createDeliverable` / `updateDeliverable` / `deleteDeliverable` — CRUD kiriman + status review guru.
- `broadcastTasks` / `broadcastDeliverables` — publish event update.

### `src/lib/games.ts`
- `GAME_CATALOG`, `isValidGameKey` — katalog kuis langsung.
- `getGameState(sessionId)` — ronde aktif + papan skor.
- `startRound` (guru) / `submitScore` (best score) / `closeRound` (guru) — siklus ronde + broadcast.

### `src/lib/redis.ts`
- `redis` singleton (atau null), `redisEnabled()`, dan `rateLimit(key, limit, window)`
  (INCR + EXPIRE; fallback no-op kalau Redis kosong).

### API sesi — `src/app/api/sessions/...`
- `POST /sessions` mulai sesi; `GET /sessions/[id]` snapshot (board+tasks+deliverables+game+online);
  `GET /sessions/[id]/stream` **SSE** (subscribe + presence + heartbeat 20s);
  `POST /sessions/[id]/end`; CRUD `tasks`, `deliverables`, dan `game` (start/score/close).

### `src/hooks/useSessionStream.ts`
- `useSessionStream(sessionId)` — buka **EventSource (SSE)**, fetch snapshot awal,
  merge update realtime ke state lokal → state sesi langsung untuk UI.

---

## 8. UI — Halaman (`src/app/**`)

| Route | Fungsi |
|---|---|
| `layout.tsx` | Shell HTML root, font (Fredoka/Nunito), metadata |
| `(marketing)/page.tsx` | Landing publik (hero, fitur, kurikulum, sandbox, FAQ, CTA) |
| `(auth)/*` | Layout split brand + form; `LoginForm`, register (toggle role) |
| `app/layout.tsx` | Shell siswa terautentikasi, nav, XP/lives, `LearningExperienceProvider` |
| `app/page.tsx` | Home siswa: salam, total XP, kartu lesson, link Arena Game |
| `app/games/page.tsx` | Hub `GameArcade` (main bebas) |
| `app/classes/page.tsx` | Daftar kelas (guru/siswa) + `JoinClassPanel` |
| `app/sessions/[id]/page.tsx` | Ruang sesi langsung (`SessionRoom`) |
| `learn/page.tsx` | Indeks lesson |
| `learn/[lessonSlug]/page.tsx` | Detail lesson + `LessonPlayer` (static params) |
| `dashboard/page.tsx` | Dashboard guru (`TeacherClassManager`) |
| `design/page.tsx` | Design system reference (warna, tipografi, komponen) |

---

## 9. UI — Komponen Pembelajaran (`src/components/lesson/`)

- **`LessonPlayer.tsx`** — pecah body lesson jadi **langkah fokus** (1 layar/heading `##`/`###`),
  progress bar + tombol Lanjut/Kembali; **editor kode hanya di langkah terakhir**
  (semua langkah tetap mounted agar Pyodide preload di latar).
- **`LessonContent.tsx`** — render Markdown (react-markdown + remark-gfm + directive).
- **`LessonEditor.tsx`** (editor) — shell Monaco; tombol **Jalankan** & **Periksa**
  (auto-grader), tab Output/🎨 Visual.
- **`TurtleCanvas.tsx`** — render `DrawCommand` turtle ke `<canvas>`.
- **`Callout.tsx`** — kartu tip/info/warning/concept (`:::callout`).
- **`ConceptReveal.tsx`** — animasi "tonton dulu → materi muncul" (`:::reveal`), hormati `prefers-reduced-motion`.
- **`VisualBlock.tsx` / `GameBlock.tsx`** — dispatcher directive `::visual` & `::game`.
- **`visualizers/`** — `VariableBox`, `LoopStepper`, `PrintFlow`, `ConditionFlow`
  (animasi konsep auto-play) + `PlayControls` (▶/⏸/↻).
- **`svg/`** — `VariableSvg`, `DataTypeSvg`, `index.ts` (registry `maxPhase`+captions).
- **`games/`** — `MazeGame`, `OrderGame`, `MatchGame`, `FillBlankGame` (main tanpa
  ketik kode), `GameArcade` + `catalog.ts` (`GAME_CATALOG` untuk Arena Game).

---

## 10. UI — Gamifikasi & Festivity

- **`festivity/`** — `SoundProvider`, `RewardProvider`, `RewardLayer`, `MuteToggle`,
  `LearningExperienceProvider` (gabungan provider), `CompletionCard` (kartu selesai).
- **`src/lib/client/celebrate.ts`** — `popConfetti()` / `burstConfetti()` (hormati reduced-motion).
- **Hooks**: `useGameState` (XP/lives context), `useGameFeedback` (click/correct/wrong/solved → suara+konfeti+reward),
  `useAudio` (`playSuccess`/`playError`), `useAutoStepper` (counter auto-advance untuk visualizer),
  `useGameFeedback`.

---

## 11. UI — Kelas/Sesi & Marketing & UI dasar

- **`session/`** — `SessionRoom` (ruang langsung), `TaskBoard`, `GamePanel`,
  `DeliverablePanel`, `quizBank.ts` (bank soal kuis).
- **`classes/`** — `TeacherClassManager` (kelola kelas guru), `JoinClassPanel` (siswa join).
- **`marketing/`** — `MarketingHero/Header/Footer/CTA`, `FeaturesGrid`,
  `CurriculumSection`, `ForTeachersSection`, `FAQSection`.
- **`ui/`** — `Button` (loading/variant/tactile), `PendingLink` (spinner saat navigasi),
  `BackButton`, `Spinner`, `Skeleton`, `LogoutButton`, `FloatingDecor`.
- **Landing lama**: `Hero`, `Header`, `Features`, `Testimonials`, `CTA`, `Sandbox`,
  `RefillModal`, `Quiz`, `Pathway`, `MascotSvg`, `Leaderboard`.

---

## 11b. Kurikulum Gamified 6-Level (Informatika Fase D)

Transformasi dari 3 lesson Python datar menjadi **kurikulum Informatika
Kurikulum Merdeka** dengan 6 Level/Quest. Pemetaan Level ↔ elemen & aktivitas:

| Level | Slug lesson | Elemen | Aktivitas |
|---|---|---|---|
| 1 Ksatria Logika | `ksatria-logika` | BK | `quiz` + `flowchart` |
| 2 Navigator Berkas | `navigator-berkas` | TIK | `filesort` + misi upload ZIP `berkas-rescue` |
| 3 Teknisi Siber | `teknisi-siber` | SK_JKI | `hardware` + `quiz` |
| 4 Detektif Data | `detektif-data` | AD | `spreadsheet` |
| 5 Pembuat Game | (3 lesson Python lama) | AP | Pyodide + `::scratch` |
| 6 Warga Digital | `warga-digital` | DSI | `branching` |

**Fungsi-fungsi inti yang dikerjakan:**

- **`src/lib/curriculum.ts`** — `getCurriculum(userId)` mengelompokkan lesson per
  Level + menghitung status (terkunci/terbuka/selesai); `isLessonLocked()` untuk
  guard; `lessonXp()` menjumlah XP challenge + activity. **Level-lock berurutan**:
  Level N+1 terkunci sampai semua lesson Level N `COMPLETED`. Akses langsung ke
  lesson terkunci → redirect `/learn?locked=1`.
- **`src/lib/progress.ts`** — `recomputeLessonProgress(tx, userId, lessonSlug)`:
  **satu sumber kebenaran** penyelesaian lesson. Lesson `COMPLETED` iff SEMUA
  dimensi wajibnya terpenuhi: challenge (`ChallengeCompletion`), activity
  (`ActivityCompletion`), mission (`FileMissionSubmission` lulus). Derivasi dari
  baris persist → idempoten & race-safe. Dipanggil ketiga route penilaian.
- **`src/components/lesson/GameBlock.tsx`** — dispatcher 10 tipe game dari
  directive `::game{type=... activityId=...}`. Saat ada `activityId`, dibungkus
  `ActivityProvider`.
- **`src/components/lesson/ActivityContext.tsx`** — context + `reportActivityComplete()`
  (dedup via Set, POST `/api/activities/complete`). `useGameFeedback().solved()`
  memicu pelaporan otomatis saat siswa menyelesaikan game.
- **`src/app/api/activities/complete/route.ts`** — validasi activity terhadap
  manifest frontmatter, XP idempoten (`ActivityCompletion` PK), panggil
  recompute, `syncUserBadges()` saat baru selesai.
- **`src/app/api/missions/file-rescue/route.ts`** — misi upload ZIP Level 2:
  unzip + validasi struktur folder (anti zip-slip), simpan `FileMissionSubmission`,
  feedback granular.
- **`src/lib/leaderboard.ts`** — `getGlobalLeaderboard()` (home `/app`) &
  `getClassLeaderboard()` (per-kelas, untuk guru). UI di
  `src/components/curriculum/LeaderboardBoard.tsx`.
- **`src/lib/badges.ts`** — `syncUserBadges()` award badge per-Level otomatis;
  `getUserBadges()` untuk rak badge (`BadgeShelf.tsx`); `getUserCertificate()` +
  `verifyCertificate(token)` untuk sertifikat & halaman verifikasi publik
  `/certificate/[token]`.
- **`src/lib/content.ts`** — parsing frontmatter manifest `activities`/`missions`
  (`ActivitySpec`/`MissionSpec`) yang dipakai recompute & validasi endpoint.

> Penilaian game **client-side (honor-system)** — endpoint activity mempercayai
> klien. Diterima untuk alat kelas berisiko-rendah; UI tetap menggerbang siswa.

---

## 12. Status & Celah (untuk pengembangan lanjutan)

**Sudah jalan (Phase 1 + Visual Learning):** auth, runtime Pyodide + auto-grader,
turtle canvas, visualizer/mini-game, konten Markdown, submission+XP+progress
(idempoten), kelas/sesi langsung (SSE+Redis), papan skor, tugas & deliverable, kuis langsung.

**Sudah jalan (Kurikulum Gamified 6-Level):** sistem Level + penguncian berurutan,
model penyelesaian terpusat (challenge + activity + mission), 5 tipe aktivitas baru
(flowchart, filesort, hardware, spreadsheet, branching), misi upload ZIP, embed
Scratch, leaderboard per-kelas + global, **Badge per-Level otomatis**, **Sertifikat
+ halaman verifikasi `/certificate/[token]`**.

**Belum / roadmap:**
- Dashboard guru analitik mendalam & monitoring real-time penuh (Push-to-Screen).
- `lives`/RefillModal belum terhubung ke konsekuensi gameplay nyata.
- Anti-skip berbasis server-grading (saat ini honor-system).
- Storage upload masih filesystem lokal (`uploads/`) — abstraksi siap pindah ke
  object storage.

> Catatan: dua spec desain sudah ada di `docs/superpowers/specs/`
> (`2026-05-27-python-is-fun-design.md`, `2026-05-30-core-persistence-design.md`).
