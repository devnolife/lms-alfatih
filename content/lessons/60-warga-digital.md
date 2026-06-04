---
title: "Level 6 — Warga Digital Bijak"
summary: "Setiap klik punya akibat! Latih dirimu mengambil keputusan bijak di dunia digital lewat skenario bercabang."
order: 60
level: 6
element: DSI
projectKey: warga-digital
estimatedMinutes: 25
activities:
  - id: dsi-genai
    xp: 20
    required: true
  - id: dsi-dataquality
    xp: 20
    required: false
  - id: dsi-deepfake
    xp: 20
    required: true
  - id: dsi-branching
    xp: 25
    required: true
teacherNotes: |
  Level etika digital. Jelaskan hierarki AI → ML → Deep Learning → GenAI dengan
  bahasa sederhana (GenAI = AI yang MEMBUAT konten baru: teks/gambar/suara).
  Tekankan "sampah masuk, sampah keluar": AI sepintar datanya. Bahas DEEPFAKE
  (konten palsu yang tampak nyata) dan cara mengeceknya. Ajarkan THINK (True,
  Helpful, Inspiring, Necessary, Kind) sebelum posting, dan lindungi data pribadi.
  Bawakan sebagai DISKUSI kelas, bukan sekadar memilih jawaban benar.
answerKey:
  - ref: "Paham AI Generatif — Soal 1"
    answer: "Bisa membuat konten baru seperti teks, gambar, dan suara"
  - ref: "Paham AI Generatif — Soal 2"
    answer: "AI → Machine Learning → Deep Learning → GenAI"
  - ref: "Paham AI Generatif — Soal 3"
    answer: "Karena GenAI hanya menebak pola sehingga bisa salah (halusinasi)"
  - ref: "Penjaga Kualitas Data — Soal 1"
    answer: "AI bisa salah karena datanya kurang beragam"
  - ref: "Penjaga Kualitas Data — Soal 2"
    answer: "Karena AI belajar dari data — data buruk, hasil buruk"
  - ref: "Penjaga Kualitas Data — Soal 3"
    answer: "Menjaga privasi & izin pemilik data"
  - ref: "Detektif Deepfake — Soal 1"
    answer: "Cek dari sumber resmi sebelum percaya/menyebar"
  - ref: "Detektif Deepfake — Soal 2"
    answer: "Konten palsu (video/foto/suara) buatan AI yang tampak nyata"
  - ref: "Detektif Deepfake — Soal 3"
    answer: "Menolak — itu melanggar etika dan bisa menyakiti"
  - ref: "Skenario Bercabang Keputusan Digital"
    answer: "Pilih keputusan paling bijak di tiap cabang: verifikasi sebelum percaya, jaga data pribadi, bersikap baik, dan pikirkan akibat sebelum mengeklik."
---

## 🛡️ Misi Warga Digital Bijak

Teknologi itu hebat, tapi harus dipakai dengan **bijak**. Di level terakhir ini
kamu belajar menjadi **warga digital** yang aman, sopan, dan bertanggung jawab.

Di level ini kamu belajar:

- Mengenal **Kecerdasan Artifisial Generatif** (GenAI) dan cara kerjanya.
- Memahami kenapa **kualitas data** menentukan hasil AI.
- Mengenali **deepfake** dan risiko penyalahgunaan AI.
- Menjaga **data pribadi** dan berpikir tentang **akibat** sebelum mengeklik.

## 🤖 Kenalan dengan AI Generatif

Kamu mungkin pernah memakai **ChatGPT**, **Gemini**, atau aplikasi pembuat
gambar. Itu semua contoh **Kecerdasan Artifisial Generatif** (GenAI) — AI yang
bisa **menghasilkan konten baru** berupa teks, gambar, suara, atau video.

:::reveal{title="Dari AI sampai GenAI — apa bedanya?"}
- **AI (Kecerdasan Artifisial)** — mesin yang melakukan tugas yang biasanya butuh
  kecerdasan manusia (memahami bahasa, mengenali gambar).
- **Machine Learning (ML)** — cabang AI: mesin **belajar dari data**, bukan
  diprogram aturan satu per satu.
- **Deep Learning** — ML yang lebih canggih, butuh **data sangat banyak**.
- **GenAI** — deep learning yang bisa **membuat konten baru**. Contoh: ChatGPT,
  Gemini, DALL·E. 🧠
:::

AI generatif dibuat lewat dua tahap. Tekan ▶ Putar untuk melihat alurnya:

::visual{type="step-sequence" title="Cara Kerja AI Generatif" steps="Kumpulkan data latih|Latih jadi Model AI|Beri masukan (prompt)|AI menghasilkan konten" emojis="📚|🧠|⌨️|✨"}

:::callout{type="warning" title="AI bisa salah (halusinasi)"}
GenAI bekerja dengan **menebak** keluaran berdasarkan pola yang dipelajari. Karena
hanya "menebak", jawabannya **berpotensi salah** walau terdengar meyakinkan. Inilah
kenapa kamu harus selalu **memeriksa ulang** jawaban AI. ⚠️
:::

::game{type="quiz" activityId="dsi-genai" title="Paham AI Generatif" data="Apa yang membuat AI Generatif (GenAI) istimewa?|Bisa membuat konten baru seperti teks, gambar, dan suara;Hanya bisa menghitung angka;Hanya bisa menyalakan komputer|0|GenAI dapat MENGHASILKAN konten baru, bukan sekadar memilih jawaban yang sudah ada.~Urutkan dari yang paling luas ke paling khusus.|AI lalu Machine Learning lalu Deep Learning lalu GenAI;GenAI lalu AI lalu Machine Learning;Deep Learning lalu AI lalu GenAI|0|GenAI adalah bagian dari Deep Learning, yang merupakan cabang Machine Learning, yang merupakan bagian dari AI.~Kenapa jawaban GenAI harus selalu kita periksa ulang?|Karena GenAI hanya menebak pola sehingga bisa salah (halusinasi);Karena GenAI tidak punya listrik;Karena GenAI selalu benar|0|GenAI menebak keluaran dari pola, jadi jawabannya bisa keliru walau terdengar meyakinkan."}

## 📊 Sampah Masuk, Sampah Keluar

AI sepintar **data** yang dipakai melatihnya. Kalau datanya buruk, hasilnya pun
buruk — prinsip ini disebut *"garbage in, garbage out"*.

:::reveal{title="Ciri data yang berkualitas"}
- **Akurat** — sesuai kenyataan.
- **Lengkap** — cukup banyak dan tidak banyak yang kosong.
- **Konsisten** — tidak saling bertentangan.
- **Relevan** — sesuai dengan tujuan.
- **Terkini** — tidak kedaluwarsa.
- **Bersih & aman** — sudah dibersihkan dan menjaga privasi.
:::

::game{type="quiz" activityId="dsi-dataquality" title="Penjaga Kualitas Data" data="Sebuah AI pengenal kucing hanya dilatih pakai foto kucing oranye. Apa yang terjadi saat diberi foto kucing hitam?|AI bisa salah karena datanya kurang beragam;AI pasti benar;AI jadi lebih pintar|0|Data yang kurang beragam (tidak lengkap) membuat AI bias dan gampang salah.~Kenapa kualitas data penting untuk AI?|Karena AI belajar dari data — data buruk, hasil buruk;Karena data membuat AI cepat;Data tidak penting|0|AI belajar dari data, jadi kualitas data menentukan kualitas hasil.~Manakah yang TERMASUK menjaga data secara beretika?|Menjaga privasi & izin pemilik data;Mencuri data orang;Memakai data palsu|0|Data harus dipakai sesuai aturan privasi dan dengan izin."}

## 🎭 Awas Deepfake!

GenAI bisa membuat **video atau foto palsu** yang tampak sangat nyata — misalnya
wajah seseorang ditempel mengucapkan hal yang tak pernah ia katakan. Ini disebut
**deepfake** dan bisa dipakai untuk menipu atau menyebar hoaks.

:::callout{type="tip" title="Cara mengenali deepfake"}
Perhatikan: kedipan mata yang aneh, pencahayaan/bayangan tidak konsisten, tepi
wajah yang "meleleh", suara yang tidak sinkron dengan bibir, dan **selalu cek
sumber aslinya**. 🔍
:::

::game{type="quiz" activityId="dsi-deepfake" title="Detektif Deepfake" data="Kamu lihat video seorang tokoh terkenal mengucapkan hal aneh. Langkah pertama yang bijak?|Cek dari sumber resmi sebelum percaya/menyebar;Langsung sebarkan ke grup;Percaya 100%|0|Selalu verifikasi ke sumber asli sebelum mempercayai atau menyebarkan.~Apa itu deepfake?|Konten palsu (video/foto/suara) buatan AI yang tampak nyata;Jenis kamera baru;Aplikasi edit foto biasa|0|Deepfake adalah konten sintetis buatan AI yang meniru orang sungguhan.~Temanmu membuat deepfake wajah guru untuk bahan ejekan. Sikapmu?|Menolak — itu melanggar etika dan bisa menyakiti;Ikut membuat;Menyebarkannya|0|Membuat deepfake untuk merendahkan orang melanggar etika dan bisa berbahaya."}

## 🌐 Dampak Sosial Informatika

Setiap hal yang kamu lakukan online meninggalkan **jejak digital**. Sekali
dibagikan, sebuah foto atau pesan bisa tersebar dan sulit ditarik kembali.

:::callout{type="warning" title="Ingat THINK sebelum posting"}
Sebelum membagikan sesuatu, tanyakan: apakah ini **True** (benar), **Helpful**
(bermanfaat), **Inspiring**, **Necessary** (perlu), dan **Kind** (baik)? 💭
:::

Coba centang tiap pertanyaan di bawah ini sebelum membayangkan kamu menekan
tombol "bagikan":

::visual{type="think-check" title="THINK sebelum membagikan" data="T:True:Apakah ini benar?|H:Helpful:Apakah ini bermanfaat?|I:Inspiring:Apakah ini menginspirasi?|N:Necessary:Apakah ini perlu dibagikan?|K:Kind:Apakah ini baik & sopan?"}

### Lindungi Data Pribadi

Jangan pernah membagikan **kata sandi**, **alamat rumah**, atau **nomor telepon**
ke orang yang tidak dikenal di internet. Itu seperti memberi kunci rumahmu ke
orang asing! 🔐

### Lawan Perundungan

Kalau melihat teman dirundung online, jangan ikut menyebarkan. Bersikap **baik**
dan laporkan ke orang dewasa yang dipercaya.

### Pikirkan Akibatnya Dulu

Setiap klik punya **akibat**. Sebelum membagikan atau membalas sesuatu, ambil
keputusan seperti alur ini:

::visual{type="flowchart-diagram" read="Mau membagikan / membalas" decision="Benar, baik & perlu?" yes="Boleh dibagikan" no="Jangan dibagikan"}

## 🎮 Latihan: Skenario Digital

Bacalah situasi berikut dan pilih keputusan paling **bijak**. Setiap pilihan
punya akibat — pilih dengan hati-hati!

::game{type="branching" activityId="dsi-branching" title="Keputusan Warga Digital" data="start>>Seorang tak dikenal mengirim pesan minta nomor HP dan alamat rumahmu. Apa yang kamu lakukan?>>Tidak memberi dan blokir dia::node2::wise|Memberikan saja biar tidak dimarahi::node2~node2>>Temanmu mengirim foto memalukan teman lain dan menyuruhmu sebarkan. Kamu...>>Menolak dan menasihatinya::end::wise|Ikut menyebarkan ke grup::end"}

## 🏆 Tamat — Kamu Lulus!

Kalau kamu sudah menyelesaikan skenario ini ✅ dan **keenam level** sebelumnya,
kamu resmi jadi **Warga Digital Bijak** dan berhak atas **Sertifikat Informatika
Kelas 7**! Selamat, kamu menyelesaikan seluruh petualangan! 🎓🎉

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Kamu Warga Digital Bijak 🛡️" data="✓:Aku berpikir sebelum membagikan:Benar, baik, dan perlu|✓:Aku menjaga data pribadi:Tidak memberi info ke orang asing|✓:Aku berani menolak hal buruk:Tidak ikut menyebarkannya"}
