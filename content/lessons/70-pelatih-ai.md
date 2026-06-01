---
title: "Level 7 — Pelatih AI"
summary: "Jadi pelatih kecerdasan buatan! Beri AI contoh gambar, latih, lalu lihat AI menebak gambarmu sendiri."
order: 70
level: 7
element: AI
projectKey: pelatih-ai
estimatedMinutes: 25
activities:
  - id: ai-tools
    xp: 15
    required: false
  - id: ai-prompt
    xp: 20
    required: true
  - id: ai-oceans
    xp: 25
    required: true
  - id: ai-quickdraw
    xp: 25
    required: true
  - id: ai-teachable
    xp: 30
    required: true
  - id: ai-error-detective
    xp: 20
    required: false
---

## 🤖 Misi Pelatih AI

Pernah dengar **kecerdasan buatan** (AI)? Itu lho, "otak" di balik fitur yang
bisa mengenali wajah, menyaring email spam, atau menebak lagu yang kamu suka.
Di level terakhir ini kamu jadi **Pelatih AI** — kamu yang mengajari komputer!

Di level ini kamu belajar:

- Apa arti **melatih** sebuah AI.
- Bagaimana AI belajar dari **contoh** (data).
- Bagaimana komputer **melihat** gambar sebagai angka.
- Mengapa **makin banyak contoh**, makin pintar tebakannya.

## 💡 Apa Itu AI?

**Kecerdasan Buatan (AI)** adalah program komputer yang bisa **belajar** dan
**mengambil keputusan** sendiri — tidak cuma menjalankan perintah baku.

| Program biasa | AI (mesin yang belajar) |
| --- | --- |
| Kamu tulis **aturan** persis, contoh: "kalau nilai ≥ 75, lulus". | Kamu beri **contoh**, AI menemukan aturannya sendiri. |
| Tidak berubah kalau tidak diprogram ulang. | Makin sering dilatih, makin pintar. |

:::callout{type="concept" title="Inti kecerdasan buatan"}
AI tidak "berpikir" seperti manusia. Ia mencari **pola** dari banyak contoh,
lalu memakai pola itu untuk menebak hal baru. Itulah yang akan kamu lakukan
hari ini! 🧠
:::

## 💬 Tools KA untuk Berkomunikasi

Setiap hari kamu mungkin sudah memakai AI tanpa sadar! Banyak **alat (tools)**
KA yang membantu kita **berkomunikasi**:

| Jenis | Contoh | Gunanya |
| --- | --- | --- |
| Chatbot | ChatGPT, Gemini, Copilot | Menjawab pertanyaan otomatis |
| Asisten Virtual | Google Assistant, Siri | Cari info, atur jadwal |
| Penerjemah | Google Translate, DeepL | Terjemah antar bahasa |
| Pengenal Suara | Speech-to-Text | Ubah ucapan jadi teks |

Pasangkan tiap tools KA dengan fungsinya:

::game{type="match" activityId="ai-tools" title="Tebak Fungsi Tools KA" question="Google Translate termasuk tools KA untuk apa?" code="Google Translate" options="Menerjemahkan antar bahasa|Mengedit video|Bermain musik" answer="0"}

:::callout{type="info" title="Kenapa AI membantu komunikasi?"}
AI mempercepat respon, membantu **terjemahan** antar bahasa secara instan, dan
meningkatkan **aksesibilitas** — misalnya teks dibacakan untuk teman tunanetra. 🌍
:::

## ⌨️ Rahasia Prompt yang Baik

AI berbasis **input**: kualitas jawabannya tergantung kualitas **pertanyaan**
(disebut *prompt*) yang kamu beri. Prompt yang baik biasanya punya bagian ini:

:::reveal{title="Pola prompt yang baik"}
- **Peran** — minta AI berperan, mis. "Jadilah guru IPA."
- **Konteks** — beri latar, mis. "untuk murid kelas 7."
- **Tugas** — perintah jelas, mis. "jelaskan fotosintesis."
- **Format** — bentuk jawaban, mis. "dalam 3 poin sederhana."
:::

Lengkapi prompt berikut agar lebih jelas dan terarah:

::game{type="fill" activityId="ai-prompt" title="Susun Prompt yang Baik" code="Jadilah guru IPA. ___ fotosintesis untuk murid kelas 7 dalam 3 poin sederhana." options="Jelaskan|Hapus|Nyanyikan" answer="Jelaskan" question="Pilih kata tugas yang tepat untuk melengkapi prompt:"}

:::callout{type="tip" title="Makin jelas, makin bagus"}
Bandingkan "ceritakan tentang hewan" vs "sebutkan 3 ciri kucing dalam kalimat
pendek untuk anak SD". Prompt kedua memberi hasil yang jauh lebih tepat! 🎯
:::

## 🧠 Bagaimana AI Belajar?

AI tidak lahir pintar. Ia jadi pintar karena diberi **banyak contoh** lalu
diminta mencari **polanya**. Sama seperti kamu belajar mengenali kucing: setelah
melihat banyak kucing, kamu langsung tahu walau ketemu kucing yang baru.

Proses melatih AI selalu lewat 4 langkah ini — tekan ▶ Putar untuk melihatnya
berjalan:

::visual{type="step-sequence" title="Cara Kerja Melatih AI" steps="Kumpulkan contoh|Latih AI|AI menebak|Perbaiki contoh" emojis="🖼️|🧠|🔮|🔁"}

:::callout{type="tip" title="Contoh sehari-hari"}
Aplikasi galeri di HP bisa mengelompokkan foto "pantai" dan "gunung". Itu karena
ia sudah dilatih dengan ribuan contoh foto pantai dan gunung sampai paham
polanya. 🏖️⛰️
:::

### Contoh vs Pola

- **Contoh (data)** = gambar-gambar yang kamu berikan ke AI sambil berkata "ini
  kategori A, itu kategori B".
- **Pola** = ciri-ciri yang AI temukan sendiri dari contoh-contoh itu, misalnya
  "kalau bentuknya bulat berarti kategori Bola".

:::callout{type="info" title="Kunci AI yang pintar"}
Beri **contoh yang banyak dan beragam**. Kalau contohnya cuma sedikit atau
mirip-mirip semua, AI gampang salah tebak — sama seperti murid yang cuma belajar
satu soal lalu bingung saat soal diganti. 📚
:::

## 🌊 Coba Sendiri: Latih AI Pemilah Sampah Laut

Sekarang giliranmu jadi pelatih! Beri label tiap benda — **Ikan** atau
**Sampah** — untuk **melatih** AI. Setelah itu AI akan memilah benda **baru**
sendirian. Perhatikan: kalau labelmu konsisten, AI menebak tepat. Kalau asal,
AI ikut salah!

::game{type="oceans" activityId="ai-oceans" title="Latih AI Pemilah Sampah Laut" xp="25"}

:::callout{type="concept" title="AI hanya sebaik datanya"}
Inilah pelajaran terpenting: **AI belajar dari contoh yang KAMU berikan**. Data
latih yang baik → AI pintar. Data latih yang salah/berat sebelah → AI ikut keliru
(disebut **bias**). 🧭
:::

## 👁️ Bagaimana Komputer Melihat Gambar?

Saat kamu menggambar, mata kita melihat **bentuk**. Tapi komputer tidak punya
mata — ia mengubah gambar menjadi **kotak-kotak angka** (disebut *piksel*). Tiap
kotak menyimpan satu angka: makin gelap coretannya, makin besar angkanya.

Tekan tombolnya untuk melihat gambar yang sama lewat "mata" AI:

::visual{type="pixel-grid" title="Gambar = kumpulan angka" human="❤️" pattern="0990990/9999999/9999999/0999990/0099900/0009000"}

Saat melatih AI di lab nanti, di balik layar komputer mengubah tiap gambarmu
menjadi grid angka seperti ini, lalu **membandingkan** angka-angkanya untuk
menebak. Gambar yang bentuknya mirip akan punya angka yang mirip pula. 🔢

## 📊 Tingkat Keyakinan AI

AI tidak menjawab "pasti benar". Ia memberi **persentase keyakinan** untuk tiap
kategori — seperti kamu menebak "kayaknya 80% ini kucing, 20% anjing".

- Bar paling tinggi = tebakan utama AI.
- Kalau dua bar **hampir sama tinggi**, berarti AI **ragu** — gambarnya mirip
  dua kategori, atau contohnya masih kurang.

:::callout{type="tip" title="Bikin AI makin yakin"}
Mau bar keyakinannya makin tinggi? Beri lebih banyak contoh yang **jelas
berbeda** antar kategori, lalu latih ulang. 📈
:::

:::callout{type="concept" title="Inilah Supervised Learning"}
Saat kamu memberi contoh **berlabel** ("ini kategori A, itu kategori B") lalu AI
belajar darinya, itu disebut **supervised machine learning** (pembelajaran
terbimbing). Makin banyak **training data** berlabel yang benar, makin tinggi
**akurasi** tebakan AI. 🎓
:::

## � AI yang Sudah Terlatih: Tebak Gambar Hewan

Kalau AI sudah dilatih dengan **jutaan** contoh, ia bisa langsung menebak tanpa
kamu latih dulu! AI di bawah ini sudah belajar dari **Google Quick, Draw!** —
kumpulan jutaan coretan dari orang di seluruh dunia. Gambar seekor hewan, lalu
lihat AI menebaknya beserta tingkat keyakinannya. 🖍️

::game{type="quickdraw" activityId="ai-quickdraw" title="AI Tebak Gambar Hewan" xp="25"}

:::callout{type="info" title="Dari mana AI tahu?"}
AI ini memakai **dataset** (kumpulan data) bernama *Quick, Draw!* yang berisi
jutaan gambar berlabel. Ia membandingkan coretanmu dengan pola yang sudah
dipelajari, lalu memilih hewan yang **paling mirip**. Inilah kekuatan **data**
dalam KA! 📚
:::

## �🎮 Lab: Latih AI-mu Sendiri

Sekarang giliranmu! Ikuti **dua tahap** berikut:

1. **Latih** — buat minimal 2 kategori (beri nama bebas, misalnya "Rumah" dan
   "Bintang"), lalu beri **minimal 3 contoh** untuk tiap kategori dan tekan
   *Tambah*. Kalau sudah cukup, tekan **🚀 Latih AI**.
2. **Tebak** — beri contoh baru, tekan **🔮 Tebak!**, dan lihat AI menebak
   lengkap dengan tingkat keyakinannya!

Ada **dua cara** memberi contoh: pilih **✏️ Gambar** untuk menggambar, atau
**📷 Kamera** untuk memotret benda nyata di sekitarmu (seperti Teachable Machine
sungguhan dari Google!).

::game{type="teachable" activityId="ai-teachable" title="Lab Pelatih AI" minCategories="2" minExamples="3" xp="30"}

:::callout{type="tip" title="Eksperimen seru"}
Coba beri contoh yang **mirip** untuk dua kategori sekaligus — lihat AI jadi
ragu (bar keyakinannya seimbang). Lalu tambahkan lebih banyak contoh dan latih
ulang; tebakannya pasti makin yakin! 🔁
:::

:::callout{type="concept" title="Pembelajaran lanjut: latih AI pakai kamera"}
Tekan tombol **📷 Kamera**, lalu **Jepret** beberapa foto tiap kategori —
misalnya kategori "Pensil" vs "Penghapus", atau "Tangan terbuka" vs "Jempol".
Komputer mengubah tiap foto jadi grid angka (persis seperti yang kamu lihat di
atas), lalu membandingkannya untuk menebak. Inilah cara kerja AI pengenal
gambar di dunia nyata! 📸🤖
:::

## ⚖️ AI Juga Bisa Salah

AI hanya sepintar **contoh** yang kita berikan. Kalau contohnya kurang, keliru,
atau berat sebelah, tebakannya pun ikut salah. Inilah kenapa AI sungguhan pun
kadang keliru mengenali wajah atau menyaring informasi.

:::callout{type="warning" title="Jadi pengguna AI yang bijak"}
Karena AI bisa salah, jangan telan mentah-mentah jawabannya. Selalu **periksa
ulang** dengan akal sehat — sama seperti yang kamu pelajari di **Level 6: Warga
Digital Bijak**. 🛡️
:::

## 🕵️ Lab 2: Detektif Error

Tadi kamu melatih AI mengenali **gambar**. Sekarang kita pakai ide yang sama —
**klasifikasi** — tapi untuk **kode Python**! Kamu akan melatih AI menebak:
sebuah kode itu **AMAN** (bisa jalan) atau **AKAN ERROR**?

Cara mainnya sama persis dengan Pelatih AI:

1. **Latih** — AI sudah punya contoh kode berlabel *aman* dan *error*. Kamu
   boleh menambah contohmu sendiri, lalu tekan **🚀 Latih AI**.
2. **Tebak & Buktikan** — tulis atau pilih sebuah kode. AI menebak *aman/error*
   beserta **petunjuk** yang ia lihat (kurung seimbang? titik dua ada?). Lalu
   tekan **Jalankan & Buktikan** untuk menjalankan kode sungguhan dan melihat
   apakah tebakan AI benar!

::game{type="errorguard" activityId="ai-error-detective" title="Detektif Error" hint="Latih AI menebak kode aman atau error" xp="20"}

:::callout{type="concept" title="AI melihat 'bentuk', bukan 'isi'"}
Coba kode `umur = 12` lalu `print(Umur)` (huruf U besar). AI menebak **AMAN**
karena semua tanda kurung dan titik dua rapi — padahal saat dijalankan justru
**error** (`Umur` tidak dikenal)! AI hanya melihat **pola bentuk** kode, bukan
memahami isinya. Persis seperti tadi: AI sepintar contoh dan petunjuk yang ia
punya. 🧠
:::

## 🏆 Selesai!

Selamat, **Pelatih AI**! 🎉 Kamu sudah mengajari komputer mengenali gambar dari
nol — persis cara kerja AI sungguhan: **contoh → latih → tebak → perbaiki**.
Kamu kini paham rahasia di balik teknologi pintar di sekitarmu. 🤖✨

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Selamat, Pelatih AI! 🤖" data="✓:Aku bisa melatih AI dengan contoh:Memberi banyak gambar berlabel|✓:Aku paham alur kerja AI:Contoh, latih, tebak, perbaiki|✓:Aku tahu AI melihat pola:Bukan memahami isi sebenarnya"}
