# 🐍 FunPython

> Platform LMS berbasis web untuk pembelajaran Python tingkat SMP di Indonesia, dengan pendekatan **Project-Based Learning** 1-hari.

## ✨ Status saat ini

**Phase 1 — Foundation (✅ selesai)**

- Landing page Duolingo-style (`/`) tetap aktif sebagai marketing entry.
- Auth: register / login / logout berbasis **username + password** (signed cookie JWT, role `STUDENT` / `TEACHER` / `ADMIN`).
- Database **Postgres + Prisma 6** dengan skema lengkap (User, Class, Enrollment, Lesson, Challenge, Submission, LessonProgress, Badge, UserBadge, Certificate).
- Pipeline lesson **Markdown** dengan frontmatter di `content/lessons/*.md` (3 lesson 1-day bootcamp sudah di-seed).
- Editor pelajaran berbasis **Monaco Editor** di setiap halaman lesson, kini terhubung ke **runtime Python sungguhan (Pyodide)** — lihat bagian Visual Learning di bawah.
- Route group:
  - `(marketing)` — landing publik
  - `(auth)` — `/login`, `/register`
  - `/app` — home siswa (auth required)
  - `/learn` & `/learn/[lessonSlug]` — materi
  - `/dashboard` — placeholder teacher view (Phase 3)
- Edge-aware **proxy** (Next.js 16 `src/proxy.ts`) yang menjaga `/app`, `/learn`, `/dashboard`.
- Rate limiting opsional via Redis (`ioredis`) — fallback no-op kalau `REDIS_URL` kosong.

**Visual Learning (✅ selesai)**

Setiap pembelajaran kini punya lapisan visual/UI yang lengkap:

- **Runtime Python di browser** — kode siswa benar-benar dijalankan oleh **Pyodide** (Python WASM) di dalam **Web Worker** (`public/python-worker.js`), terisolasi dari UI. Watchdog otomatis menghentikan loop tak terbatas.
- **Auto-grader** — tombol **Periksa** mengevaluasi `tests` di frontmatter (cocokkan `expectedStdout`, beri `stdin`, atau jalankan `assertions`), menampilkan hasil per-tes + konfeti & suara saat lulus.
- **Output visual (Turtle)** — modul shim `turtle` menggambar ke `<canvas>`; panel output punya tab **Output** (teks) & **🎨 Visual** yang muncul otomatis saat kode menggambar.
- **Visualizer konsep interaktif** — komponen `VariableBox`, `LoopStepper`, `PrintFlow` bisa ditanam di Markdown untuk menjelaskan variabel, loop, dan alur `print()` secara interaktif.
- **Konten lebih bergambar** — kartu **callout** (tip/info/warning/concept), header lesson bergambar maskot, badge XP & durasi, code block bergaya.
- Pesan error Python diterjemahkan ke **Bahasa Indonesia ramah pemula** (`src/lib/python/errors.ts`).

**Phase 3 (Engagement: dashboard guru, submission/XP persist, sertifikat) — belum diimplementasi.** Lihat rencananya di plan internal (`.copilot/session-state/.../plan.md`).


## 🧱 Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 |
| Editor kode | `@monaco-editor/react` |
| Runtime Python | **Pyodide** (Python WASM) di Web Worker |
| Auth | `bcryptjs` + `jose` (signed JWT cookie) |
| DB | PostgreSQL via **Prisma 6** |
| Cache / rate-limit | Redis (opsional) via `ioredis` |
| Konten lesson | Markdown + `gray-matter` + `react-markdown` |
| Validasi | `zod` |

## 🚀 Setup lokal

### 1. Prasyarat

- Node.js ≥ 20
- PostgreSQL 14+ (lokal atau via Docker)
- (Opsional) Redis 6+

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi environment

Salin `.env.example` jadi `.env` dan isi minimal `DATABASE_URL` + `SESSION_SECRET`:

```bash
cp .env.example .env
# lalu edit .env
```

Generate session secret yang aman:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Setup database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Jalankan dev server

```bash
npm run dev
```

Buka <http://localhost:3000>.

| Halaman | Untuk |
|---|---|
| `/` | Landing marketing |
| `/register` | Daftar (pilih role Siswa atau Guru) |
| `/login` | Masuk |
| `/app` | Home siswa (lihat 3 modul bootcamp) |
| `/learn/warmup-digital-identity` | Modul 1 |
| `/learn/logic-tebak-angka` | Modul 2 |
| `/learn/project-turtle-art` | Modul 3 |
| `/dashboard` | Placeholder teacher (Phase 3) |

## 📂 Struktur kode

```
content/
└── lessons/                      ← Markdown lessons (1-day bootcamp track)
prisma/
└── schema.prisma                 ← model database
src/
├── app/
│   ├── (marketing)/page.tsx      ← landing page (kept as-is)
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── app/                      ← student shell (auth required)
│   ├── learn/[lessonSlug]/       ← lesson detail + editor
│   ├── dashboard/                ← teacher (Phase 3 placeholder)
│   └── api/auth/                 ← login / register / logout
├── components/
│   ├── editor/LessonEditor.tsx   ← Monaco shell
│   └── (landing page components)
├── lib/
│   ├── auth.ts                   ← session + password hashing
│   ├── content.ts                ← Markdown lesson loader
│   ├── db.ts                     ← Prisma client singleton
│   └── redis.ts                  ← ioredis + rate limiter
├── hooks/
└── proxy.ts                      ← Next.js 16 proxy (formerly middleware)
```

## ✍️ Menambah / mengedit lesson

Tambahkan file `content/lessons/NN-slug.md`:

```markdown
---
title: "Judul Lesson"
summary: "Ringkasan singkat."
order: 4
projectKey: judul-project
estimatedMinutes: 60
challenges:
  - id: ch-1
    prompt: "Instruksi tantangan."
    xpReward: 20
    starterCode: |
      print("Halo")
    tests:
      - name: "Cek output"
        expectedStdout: "Halo\n"
---

## Markdown konten di sini…
```

Lesson otomatis muncul di `/learn` dan `/app` setelah build/dev refresh.

### Alur lesson berlangkah (LessonPlayer)

Halaman lesson tidak menampilkan semua materi + code editor sekaligus (terlalu
"ramai" untuk anak SMP). Sebagai gantinya, `LessonPlayer` memecah body menjadi
**langkah-langkah fokus** (satu layar per langkah) berdasarkan heading `##`/`###`,
dengan progress bar dan tombol **Lanjut/Kembali**. **Code editor hanya muncul di
langkah terakhir** (fase latihan), jadi materi dan editor tidak pernah tampil
bersamaan. Semua langkah tetap ter-_mount_ (disembunyikan) agar Python (Pyodide)
ikut ter-preload di latar belakang saat siswa membaca materi.

> Konvensi: section `##` terakhir dianggap fase latihan (di sanalah editor
> dirender). Pecah materi menjadi langkah-langkah kecil dengan heading `##`/`###`.

### Menambah blok visual di dalam lesson

Body Markdown mendukung **directive** untuk menyisipkan UI interaktif (lewat `remark-directive`).

**Callout** (kotak tip/info/warning/concept) — pakai blok kontainer `:::`:

```markdown
:::callout{type="tip" title="Ingat ya!"}
Teks yang ingin ditampilkan harus dibungkus tanda kutip.
:::
```

`type` bisa `tip`, `info`, `warning`, atau `concept`.

**Visualizer konsep** — pakai directive baris `::visual{...}`:

```markdown
::visual{type="variable-box" name="umur" value="13"}
::visual{type="variable-box" name="umur" values="13,14,15"}
::visual{type="loop-stepper" start="0" stop="5" varName="i" body="print({i})"}
::visual{type="print-flow" lines="Baris 1|Baris 2|Baris 3"}
```

| `type` | Atribut | Fungsi |
|---|---|---|
| `variable-box` | `name`, `value`, atau `values` (dipisah koma) | Kotak variabel; `values` di-animasikan otomatis (auto-play) |
| `loop-stepper` | `start`, `stop`, `varName`, `body` (gunakan `{i}`) | Animasi iterasi `for ... range()` (auto-play) |
| `print-flow` | `lines` (dipisah `\|`) | Eksekusi `print()` baris per baris (auto-play) |
| `condition-flow` | `varName`, `values`, `op`, `threshold`, `whenTrue`, `whenFalse` | Animasi if/else: menyiklus nilai, menyalakan cabang aktif (auto-play) |

Semua visualizer di atas **berjalan/beranimasi sendiri** dengan kontrol ▶ Putar / ⏸ Jeda / ↻ Ulang.

**Animasi konsep "tonton dulu → materi muncul"** — pakai container directive `:::reveal{...}`:

```markdown
:::reveal{visual="variable" name="nama" value="Sinta" title="Apa itu Variabel?"}
Variabel adalah **kotak untuk menyimpan data**.
(boleh berisi paragraf, list, atau blok kode konsep ini)
:::
```

Animasi SVG buatan tangan diputar lebih dulu; setelah selesai (atau klik **Lewati ▸**), teks & kode di dalamnya muncul. Menghormati `prefers-reduced-motion` (langsung tampil tanpa animasi).

| `visual` | Atribut | Konsep |
|---|---|---|
| `variable` | `name`, `value`, `title` | Kotak variabel diberi label lalu diisi nilai |
| `datatypes` | `title` | Jenis isi variabel: Angka, Kata, dan Ya/Tidak (tanpa istilah teknis) |

Menambah konsep SVG baru: buat komponen di `src/components/lesson/svg/` (terima prop `phase`), lalu daftarkan di `src/components/lesson/svg/index.ts` (`maxPhase` + `captions` per fase).

**Mini-game blok pemrograman** — pakai directive baris `::game{...}`:

```markdown
::game{type="maze" grid="S../##./..G" dir="right" loop="true" title="Pandu Si Kura-kura"}
::game{type="order" lines='nama = "Sinta"|print(nama)'}
::game{type="match" code='print("Halo")' options='Halo|halo|"Halo"' answer="0"}
::game{type="fill" code='___("Halo")' options="print|tampil|tulis" answer="print"}
```

> ⚠️ Jika nilai atribut mengandung tanda kutip ganda (`"`), bungkus nilai itu
> dengan tanda kutip **tunggal** (`'...'`). remark-directive tidak mendukung
> escape `\"`, sehingga directive-nya akan tampil sebagai teks mentah.

Semua game **tanpa mengetik kode** (klik & pilih), memberi umpan balik benar/salah, dan cocok untuk anak (tanpa istilah teknis).

| `type` | Atribut | Fungsi |
|---|---|---|
| `maze` | `grid` (baris dipisah `/`; `S` start, `G` tujuan, `#` tembok, `.` jalan), `dir` (`up`/`right`/`down`/`left`), `loop` (`"true"` menampilkan kontrol 🔁 Ulangi), `title`, `hint` | Susun blok (Maju/Putar) memandu kura-kura ke daun; menganimasikan langkah & memeriksa keberhasilan. Pengantar `turtle.forward()`/`left()` dan konsep loop |
| `order` | `lines` (urutan benar, dipisah `\|`), `title`, `hint` | Urutkan baris kode yang teracak (tombol ▲▼) sampai benar |
| `match` | `code` (`\n` untuk baris baru), `options` (dipisah `\|`), `answer` (indeks 0-based), `title`, `question` | Pilihan ganda: tebak output sebuah kode |
| `fill` | `code` (pakai `___` sebagai rumpang), `options` (dipisah `\|`), `answer` (token benar), `title`, `question` | Pilih token untuk mengisi bagian rumpang pada kode |

Menambah game baru: buat komponen di `src/components/lesson/games/`, lalu daftarkan `type`-nya di `src/components/lesson/GameBlock.tsx`.

**Arena Game (main mandiri)** — selain di dalam pelajaran, semua mini-game juga bisa dimainkan bebas tanpa mengikuti alur lesson di halaman **`/app/games`**. Daftar game-nya diatur di `src/components/lesson/games/catalog.ts` (dikelompokkan per kategori dengan tingkat kesulitan), dan ditampilkan oleh `src/components/lesson/games/GameArcade.tsx`. Untuk menambah game ke arena, cukup tambahkan entri baru ke `GAME_CATALOG` — tidak perlu mengubah markdown lesson.


**Output visual Turtle** — cukup pakai `import turtle` di `starterCode`/kode siswa. Saat dijalankan, tab **🎨 Visual** muncul otomatis dan gambar dirender ke canvas. Fungsi yang didukung: `forward/fd`, `backward/bk`, `left/lt`, `right/rt`, `goto`, `setheading`, `penup`, `pendown`, `pencolor`/`color`, `pensize`/`width`, `dot`, `circle`, dll. (turtle asli berbasis Tkinter tidak tersedia di WASM — ini shim canvas).

## 🛠 Scripts

| Script | Aksi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Buat & jalankan migration baru |
| `npx prisma studio` | UI eksplorasi database |

## 🗺 Roadmap

- **Phase 3 — UX & Engagement:** teacher dashboard, monitoring real-time (Redis pub/sub + SSE), Push-to-Screen, submission API + persisted XP, badges, sertifikat digital, class management.

---

Dibangun mengacu pada **Kurikulum Merdeka** (Kepmendikbudristek No. 12/2024), elemen Algoritma & Pemrograman + Praktik Lintas Bidang.
