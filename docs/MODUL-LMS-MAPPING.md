# Patokan Implementasi Modul → LMS Alfatih

Dokumen ini menjadi **patokan** untuk menerjemahkan 5 modul pelatihan "Koding & Kecerdasan Artifisial" (Kemendikdasmen, Fase D / SMP) ke dalam LMS Alfatih.

Setiap modul dibedah menjadi:
1. **Brainstorm** — inti tujuan & intent modul (kenapa modul ini ada, apa yang ingin dicapai).
2. **Isi Utama** — materi/aktivitas pokok di dalam modul.
3. **Implementasi di LMS** — pemetaan ke building block LMS yang sudah ada.

---

## 0. Building Block LMS yang Tersedia (acuan teknis)

Sumber dibaca dari kode: `src/lib/content.ts`, `src/lib/curriculum.ts`, `prisma/schema.prisma`, `src/components/lesson/*`.

### Frontmatter lesson (`content/lessons/NN-slug.md`)
```yaml
---
title: string
summary: string
order: number          # urutan global
level: number          # 1..7 (quest)
element: "AP"|"BK"|"TIK"|"SK_JKI"|"AD"|"DSI"|"AI"
projectKey: string     # unik, dipakai sertifikat & badge
estimatedMinutes: number
challenges: []         # tantangan Python (auto-grade via tests)
activities: []         # mini-game (XP, required, active)
missions: []           # misi upload file (key, required)
---
```

### 7 Level (quest) yang sudah ada
| Level | Judul | Element | Emoji |
|---|---|---|---|
| 1 | Ksatria Logika | BK (Berpikir Komputasional) | 🧠 |
| 2 | Navigator Digital | TIK | 🧭 |
| 3 | Teknisi Siber | SK_JKI | 🛠️ |
| 4 | Detektif Data | AD (Analisis Data) | 🔎 |
| 5 | Pembuat Game Pemula | AP (Algoritma & Pemrograman) | 🎮 |
| 6 | Warga Digital Bijak | DSI (Dampak Sosial Informatika) | 🛡️ |
| 7 | Pelatih AI | AI | 🤖 |

### Directive markdown (di body lesson)
- `:::callout{type="tip|info|warning|concept" title="..."}` — kotak sorotan
- `:::reveal{visual="..." title="..."}` — konsep yang bisa dibuka
- `::visual{type="..."}` — animasi konsep (`variable-box`, `loop-stepper`, `print-flow`, `condition-flow`, `step-sequence`, `flowchart-diagram`, `pixel-grid`, `bar-chart`, `folder-tree`, `device-parts`, `think-check`)
- `::game{type="..."}` — mini-game interaktif
- `::filemission{missionKey="..."}` — UI upload misi

### Tipe game yang sudah ada (`src/components/lesson/GameBlock.tsx`)
`maze`, `order`, `match`, `fill`, `quiz`, `flowchart`, `filesort`, `hardware`, `spreadsheet`, `branching`, `teachable` (latih classifier di browser), `errorguard` (pakai AI).

### Penilaian & progres (`prisma/schema.prisma`)
- `ChallengeCompletion` — tantangan Python lulus (idempoten XP).
- `ActivityCompletion` — mini-game/aktivitas selesai.
- `FileMissionSubmission` — upload file (LK PDF) + feedback.
- `LessonProgress` — `NOT_STARTED | IN_PROGRESS | COMPLETED`.
- `Badge` / `UserBadge` / `Certificate` (per `projectKey`).
- Kolaborasi kelas: `ClassSession`, `GroupTask`, `GroupDeliverable`, `GameRound`, `GameScore`.

### AI
- AI Tutor (`useAiChat` → `/api/ai/chat`, Ollama lokal, streaming) dapat di-embed per-lesson.
- Game ber-AI: `teachable` (klasifikasi gambar/ink) & `errorguard`.

### Pola berulang di SEMUA modul SMP (2.1, 2.2, 3, 4)
Setiap modul punya struktur yang identik → bisa dijadikan **template lesson**:
1. **Kesepakatan Belajar** → step pembuka (callout info).
2. **Mindfulness (Teknik STOP)** → step singkat (callout tip / `think-check`).
3. **LK Memahami** (mind-map Cornell + 3 soal + umpan balik 2 rekan, unggah 1 PDF) → `::filemission` + activity quiz.
4. **Materi (Section B/C)** → step konsep + `::visual` + `:::reveal`.
5. **Aktivitas (Plugged/Unplugged)** → `::game` atau `GroupDeliverable` (kerja kelompok).
6. **LK Mengaplikasi / LK Refleksi** → `::filemission`.
7. **Kuis Pemahaman** → `::game{type="quiz"}`.
8. **Penutup / Terima Kasih** → step penutup + sertifikat per `projectKey`.

> Rekomendasi: buat 1 komponen template "ModulSMP" sehingga 4 sub-modul memakai pola langkah yang sama, hanya beda materi.

---

## Modul 1 — Pengenalan Koding & KA di Dikdasmen (45 slide)

### 🧠 Brainstorm
Modul **fondasi/orientasi** untuk guru. Intent: menyamakan persepsi *apa itu koding & KA*, kenapa penting (urgensi SDM, ekonomi, adaptasi teknologi), dan bagaimana posisinya dalam Kurikulum (6 elemen pembelajaran, learning progression Fase C–F). Ini bukan modul aktivitas siswa, melainkan *peta besar* kurikulum.

### 📚 Isi Utama
- Urgensi pendidikan koding & KA.
- 6 elemen pembelajaran: berpikir komputasional, literasi digital, algoritma pemrograman, analisis data, literasi & etika KA, pemanfaatan & pengembangan KA.
- Coding Learning Progression (Fase D: Scratch/Blockly → Fase E/F: Python/C/Pascal).
- Terminologi Koding (plugged/unplugged) & Terminologi KA (AI/ML/DL/GenAI).
- Peta kompetensi & materi per fase (C/D/E/F).
- Strategi pembelajaran & kompetensi afektif.

### 🛠️ Implementasi di LMS
- **Bukan 1 lesson biasa** — jadikan **halaman "Peta Kurikulum"** (onboarding) di `src/app/learn/page.tsx` atau halaman intro sebelum Level 1.
- 6 elemen pembelajaran = **justifikasi 7 level** yang sudah ada → tampilkan mapping elemen → level di LevelMap (tooltip "elemen: BK/AD/AI ...").
- Terminologi pakai `:::reveal` (kartu istilah: Koding, AI, ML, Deep Learning, GenAI).
- Learning progression pakai `::visual{type="step-sequence"}` (Fase C → D → E → F).
- Tidak perlu challenge/quiz wajib; sifatnya literasi. Boleh ada 1 kuis ringan `::game{type="quiz"}` "Cek Pemahaman Terminologi" untuk XP onboarding.
- `element`: lintas-elemen → tandai sebagai lesson `level: 1` opsional atau halaman statis.

---

## Modul 2.1 — Literasi Algoritma & Pengelolaan Data (44 slide)

### 🧠 Brainstorm
Intent: melatih **berpikir komputasional terhadap data** — dari masalah nyata → dipecah (dekomposisi) → data dibersihkan/divalidasi → diklasifikasi → diabstraksi → disusun jadi algoritma/instruksi. Inti: *"data mentah dunia nyata diolah sistematis menjadi informasi & instruksi."*

### 📚 Isi Utama
- Konsep data: sifat (kualitatif/kuantitatif, diskrit/kontinu), sumber (primer/sekunder), keakuratan.
- **Dekomposisi** (Aktivitas 1): pecah masalah besar → identifikasi data & sumber.
- **Pembersihan & Validasi** (Aktivitas 2): standardisasi, outlier, deduplikasi, missing values, validasi.
- **Klasifikasi & pengelompokan** (Aktivitas 3): beri label berdasar rentang/kategori.
- **Abstraksi data** (Aktivitas 4).
- **Penyusunan instruksi / Algoritma** (Aktivitas 5).
- Tools: spreadsheet (Excel/Google Sheets) plugged; kertas unplugged.

### 🛠️ Implementasi di LMS
- **Level 4 — Detektif Data (`element: AD`)** adalah rumahnya. Cocok dengan tema "Detektif Data".
- Aktivitas data → **`::game{type="spreadsheet"}`** (sudah ada): tabel data perjalanan, peserta membersihkan/mengelompokkan → auto-cek.
- Dekomposisi → `::visual{type="flowchart-diagram"}` + `::game{type="flowchart"}` (susun langkah memecah masalah).
- Klasifikasi/label → `::game{type="match"}` atau `filesort` (drag data ke kategori: dekat/menengah/jauh, pagi/siang/sore).
- Pembersihan data (outlier/duplikat/missing) → kuis `::game{type="quiz"}` + visual `bar-chart` untuk outlier.
- Penyusunan algoritma → `::game{type="order"}` (urutkan langkah) atau **Challenge Python ringan** (mis. hitung rata-rata, filter data) lewat `challenges` (auto-grade `tests`).
- **LK Memahami / Mengaplikasi** (unggah PDF) → `::filemission{missionKey="lk-2-1-memahami"}` → tabel `FileMissionSubmission`.
- Dataset contoh (`s.id/bimtekkkasmpla2025`) → simpan di `public/missions/` atau link eksternal di callout.
- `projectKey`: `data-literasi-algoritma`.

---

## Modul 2.2 — Produksi & Diseminasi Konten Digital (24 slide)

### 🧠 Brainstorm
Intent: dari *data/informasi* → **mengomunikasikannya** sebagai konten digital yang efektif lalu menyebarkannya secara beretika. Inti: *"literasi digital produktif — membuat & menyebarkan konten yang tepat sasaran."*

### 📚 Isi Utama
- Unsur komunikasi: komunikator, pesan, media, komunikan, timbal balik.
- Strategi pesan: tujuan, audiens, storytelling, inti pesan, nilai emosional, manfaat, visual.
- Prinsip tata letak: unity, balance, proportion, rhythm, dominance, contrast, repetition.
- Alat produksi: teks/blog, desain grafis (Canva dll), video, audio, animasi, screen capture.
- **Aktivitas 6**: produksi konten digital sesuai audiens.
- **Aktivitas 7**: diseminasi konten digital.

### 🛠️ Implementasi di LMS
- **Level 2 — Navigator Digital (`element: TIK`)**.
- Materi konsep (unsur komunikasi, prinsip tata letak) → step konsep + `:::reveal` (7 prinsip layout sebagai kartu) + `::game{type="match"}` (pasangkan prinsip ↔ contoh).
- **Aktivitas 6 & 7 bersifat produktif (membuat karya)** → tidak bisa auto-grade. Gunakan jalur **kerja kelompok/submission**:
  - `::filemission` untuk unggah hasil konten (gambar/video/PDF), atau
  - `GroupDeliverable` (type `LINK`/`IMAGE`/`TEXT`) di `ClassSession` → guru me-review (`teacherStatus: SUBMITTED→REVIEWED→APPROVED`).
- Kuis prinsip desain → `::game{type="quiz"}`.
- AI Tutor di-embed untuk membantu brainstorming ide konten (`useAiChat`).
- `projectKey`: `produksi-konten-digital`.

---

## Modul 3 — Etika & Resiko KA (Fase D, 48 slide)

### 🧠 Brainstorm
Intent: **literasi & etika KA generatif**. Peserta memahami cara kerja GenAI (training → inference, prediksi probabilistik → bisa salah/halusinasi), peran kualitas data, lalu **mengkritisi risiko**: bias, etika penggunaan, dan deepfake. Inti: *"gunakan KA secara sadar, kritis, dan bertanggung jawab."*

### 📚 Isi Utama
- Definisi AI → ML → Deep Learning → **Generative AI** (teks/gambar/suara/video).
- Prinsip kerja: tahap **Training** (data latih → model) & **Inference** (input → output).
- GenAI = prediksi probabilistik → **berpotensi salah** (halusinasi).
- **Kualitas data**: 7 faktor (akurasi, kelengkapan, konsistensi, relevansi, ketepatan waktu, kebersihan, keamanan/privasi). Platform dataset: Kaggle, Hugging Face.
- **Aktivitas 1**: implementasi KA generatif.
- **Etika & risiko**: penggunaan beretika, **deepfake** (Aktivitas 2 analisis konten deepfake).
- LK Mengaplikasi & LK Refleksi.

### 🛠️ Implementasi di LMS
- **Level 6 — Warga Digital Bijak (`element: DSI`)** untuk sisi etika/risiko, dengan keterkaitan ke **Level 7 (AI)** untuk konsep GenAI.
- Konsep AI→ML→DL→GenAI → `:::reveal` bertingkat + `::visual{type="step-sequence"}` (alur Training→Model→Inference).
- "GenAI menebak/probabilistik bisa salah" → `::game{type="branching"}` (skenario: percaya/cek-ulang output AI → konsekuensi). `branching` memang dipakai Level 6.
- 7 faktor kualitas data → `::game{type="match"}` (pasangkan faktor ↔ definisi) atau `quiz`.
- **Deepfake** → `::game{type="quiz"}` "asli vs deepfake" (gambar di `public/missions/`) + diskusi; atau `errorguard`-style "deteksi". Bila ingin interaktif klasifikasi → `::game{type="teachable"}` (latih classifier untuk merasakan bias data).
- Etika → `branching` skenario dilema (pakai AI untuk tugas, plagiarisme, privasi).
- LK Memahami/Mengaplikasi/Refleksi → `::filemission` (3 misi: `lk-3-memahami`, `lk-3-mengaplikasi`, `lk-3-refleksi`).
- AI Tutor di-embed untuk tanya-jawab etika.
- `projectKey`: `etika-resiko-ka`.

---

## Modul 4 — Komunikasi melalui Tools KA (Fase D, 53 slide)

### 🧠 Brainstorm
Intent: **berinteraksi dengan KA secara efektif** — mengenal jenis tools komunikasi KA, memberi **input bermakna (prompt)**, memakai chatbot, lalu memahami **konsep klasifikasi/ML** di baliknya (training data, accuracy, confusion matrix, supervised learning). Inti: *"dari pengguna pasif menjadi pengguna cerdas & paham cara kerja KA."*

### 📚 Isi Utama
- Jenis tools KA komunikasi: chatbot, asisten virtual, penerjemah, pengenal suara.
- Peran KA: efisiensi, terjemahan, aksesibilitas, optimasi informasi.
- **Section B**: aktivitas unplugged (mana yang pakai KA) & plugged (penjadwalan via HP).
- **Section C — KA berbasis input**: **Pola Prompt** (Persona, Context, Task, Format, dst).
- **Klasifikasi dalam KA**: training data, accuracy, accuracy/loss per epoch, **confusion matrix**, **supervised machine learning**.
- Aktivitas unplugged & plugged (latih/pakai classifier), kuis pemahaman, refleksi.

### 🛠️ Implementasi di LMS
- **Level 7 — Pelatih AI (`element: AI`)**.
- **Pola Prompt** → `:::reveal` (kartu tiap pola) + `::game{type="fill"}` / `order` (susun prompt yang baik) + AI Tutor live (`useAiChat`) untuk mencoba prompt langsung → feedback nyata.
- Jenis tools KA → `::game{type="match"}` (tool ↔ fungsi) ; "pakai KA / tidak" → `::game{type="quiz"}` atau `filesort` (3 keranjang: Memakai / Mungkin / Tidak).
- **Klasifikasi & supervised ML** → **`::game{type="teachable"}`** (sudah ada!) — peserta melatih classifier di browser, lihat akurasi & confidence → langsung merasakan training data & accuracy.
- Confusion matrix / accuracy per epoch → `::visual{type="bar-chart"}` + callout konsep.
- Chatbot sederhana → embed AI Tutor sebagai "chatbot latihan".
- Aktivitas plugged penjadwalan → `::filemission` (screenshot hasil) atau `GroupDeliverable`.
- LK + Kuis + Refleksi → `::filemission` + `::game{type="quiz"}`.
- `projectKey`: `komunikasi-tools-ka`.

---

## Ringkasan Pemetaan Modul → Level

| Modul | Fokus | Level LMS | Element | Game/komponen utama |
|---|---|---|---|---|
| 1. Pengenalan Koding-KA | Orientasi kurikulum | Onboarding / Peta | lintas | `reveal`, `step-sequence`, `quiz` ringan |
| 2.1 Literasi Algoritma & Data | Olah data → algoritma | **4 Detektif Data** | AD | `spreadsheet`, `flowchart`, `order`, `filesort`, challenge Python |
| 2.2 Produksi & Diseminasi Konten | Komunikasi konten digital | **2 Navigator Digital** | TIK | `match`, `quiz`, `GroupDeliverable`, AI Tutor |
| 3. Etika & Resiko KA | Literasi & etika GenAI | **6 Warga Digital Bijak** (+7) | DSI/AI | `branching`, `match`, `teachable`, `quiz`, deepfake |
| 4. Komunikasi via Tools KA | Prompt & klasifikasi ML | **7 Pelatih AI** | AI | `teachable`, `fill`/`order` prompt, AI Tutor, `bar-chart` |

## Komponen yang Mungkin Perlu Ditambah (gap)
Sebagian besar sudah tertangani oleh building block existing. Yang mungkin perlu dibuat:
1. **Template "ModulSMP"** — langkah baku (Kesepakatan → Mindfulness → LK → Materi → Aktivitas → Refleksi → Kuis).
2. **Mindfulness/STOP step** — komponen kecil (bisa pakai `::visual{type="think-check"}`).
3. **Halaman Peta Kurikulum** untuk Modul 1 (mapping 6 elemen → 7 level).
4. **Game "asli vs deepfake"** — bila ingin khusus; jika tidak, pakai `quiz` bergambar.
5. **Alur review GroupDeliverable untuk karya produktif** (Modul 2.2 Aktivitas 6/7) — sudah ada di schema, tinggal UI guru.

> Catatan: Modul 5 (PDF "Modul Pedagogi") bukan format Office yang dibaca OfficeCLI; isinya panduan pedagogi guru, relevan sebagai materi referensi guru, bukan lesson siswa.

---

## ✅ Status Implementasi (sudah dieksekusi)

| Modul | Lesson di LMS | Status | Aktivitas ditambahkan |
|---|---|---|---|
| 1. Pengenalan Koding & KA | `05-orientasi-koding-ka.md` (Level 1, **baru**) | ✅ Dibuat | `orient-terminologi`, `orient-elemen` |
| 2.1 Literasi Algoritma & Data | `40-detektif-data.md` (Level 4) | ✅ Diperkaya | `ad-dekomposisi`, `ad-cleaning`, `ad-klasifikasi` |
| 2.2 Produksi & Diseminasi Konten | `25-kreator-konten.md` (Level 2, **baru**) | ✅ Dibuat | `tik-komunikasi`, `tik-layout`, `tik-diseminasi` |
| 3. Etika & Risiko KA | `60-warga-digital.md` (Level 6) | ✅ Diperkaya | `dsi-genai`, `dsi-dataquality`, `dsi-deepfake` |
| 4. Komunikasi via Tools KA | `70-pelatih-ai.md` (Level 7) | ✅ Diperkaya | `ai-tools`, `ai-prompt` |
| 5. Pedagogi (PDF) | — | 📄 Referensi guru | (bukan lesson siswa) |

**Catatan teknis:**
- Lesson baru (`05-`, `25-`) sudah disinkron ke tabel DB `Lesson` via `npm run db:seed` (11 lesson total). Wajib jalankan `db:seed` setiap menambah lesson baru karena `LessonProgress.lessonSlug` punya FK ke `Lesson.slug`.
- Enrich lesson existing **tidak** butuh perubahan DB (`ActivityCompletion` tak ber-FK ke Lesson).
- Tidak menambah `::filemission` baru (registry ZIP-folder di `src/lib/missions.ts`); LK/karya produktif diarahkan ke callout + fitur GroupDeliverable (Sesi Kelas).
