---
title: "Level 2 — Navigator Digital"
summary: "Kuasai dunia file & folder, lalu buktikan kemampuanmu di Misi Penyelamatan Berkas dengan upload ZIP sungguhan!"
order: 20
level: 2
element: TIK
projectKey: navigator-berkas
estimatedMinutes: 35
activities:
  - id: tik-filesort
    xp: 20
    required: true
missions:
  - key: berkas-rescue
    required: true
teacherNotes: |
  Tujuan: siswa rapi mengelola file & folder, lalu membuat ZIP sungguhan. Analogi
  folder = sekat lemari supaya barang mudah dicari; ekstensi (.jpg, .docx, .mp3)
  = "nama belakang" yang menunjukkan jenis berkas. Bagian tersulit adalah MEMBUAT
  ZIP — dampingi langkah klik kanan → Compress/Kirim ke folder zip. Pastikan tiap
  siswa berhasil mengunggah ZIP (misi harus LULUS) sebelum lanjut ke Level 3.
answerKey:
  - ref: "Rapikan Berkas"
    answer: "foto-kucing.jpg → Gambar · tugas-ipa.docx → Dokumen · lagu-indah.mp3 → Musik · poster.png → Gambar · jadwal.pdf → Dokumen"
  - ref: "Misi Penyelamatan Berkas (ZIP)"
    answer: "Unduh berkas → buat folder Gambar/Dokumen/Musik → pindahkan tiap file → kompres jadi .zip → unggah."
    note: "Diperiksa otomatis: ZIP harus berisi 3 folder dengan file yang benar."
---

## 🧭 Misi Navigator Digital

Komputermu penuh berkas berantakan! Sebagai **Navigator Digital**, tugasmu
merapikan file ke folder yang benar dan paham cara teknologi menyimpan data.

Di level ini kamu belajar:

- Mengenal jenis **berkas (file)**: gambar, dokumen, musik, video.
- Memahami **folder** sebagai tempat menyimpan berkas yang serupa.
- Membuat file **ZIP** untuk membungkus banyak berkas jadi satu.

## 📁 File & Folder

Setiap berkas punya **nama** dan **ekstensi** (akhiran setelah titik) yang
menandakan jenisnya:

| Ekstensi | Jenis | Contoh |
|---|---|---|
| `.jpg` `.png` | Gambar | foto liburan |
| `.docx` `.pdf` | Dokumen | tugas sekolah |
| `.mp3` | Musik | lagu favorit |
| `.mp4` | Video | rekaman |

:::callout{type="tip" title="Kenapa pakai folder?"}
Bayangkan lemari tanpa sekat — semua baju campur aduk! Folder adalah "sekat" agar
berkasmu mudah dicari. 🗄️
:::

Begini contoh berkas yang sudah rapi di dalam folder-foldernya. Perhatikan
**ekstensi** berwarna di tiap berkas — warnanya menandakan jenis berkas:

::visual{type="folder-tree" title="Berkas yang sudah rapi" root="Tugas-Sekolah" data="Gambar: 🖼️ foto-kucing.jpg, 🖼️ poster.png | Dokumen: 📄 tugas-ipa.docx, 📄 jadwal.pdf | Musik: 🎵 lagu-indah.mp3"}

## 🎮 Latihan: Sortir Berkas

Klik sebuah berkas, lalu klik **folder** yang tepat. Rapikan semuanya!

::game{type="filesort" activityId="tik-filesort" title="Rapikan Berkas" files="🖼️ foto-kucing.jpg:Gambar|📄 tugas-ipa.docx:Dokumen|🎵 lagu-indah.mp3:Musik|🖼️ poster.png:Gambar|📄 jadwal.pdf:Dokumen"}

## 📦 Misi Penyelamatan Berkas (Upload Nyata!)

Sekarang misi sesungguhnya! Ikuti langkah berikut di komputermu:

1. **Unduh** berkas latihan yang masih berantakan di bawah.
2. Buat 3 folder: **Gambar**, **Dokumen**, **Musik**.
3. Pindahkan tiap berkas ke folder yang benar.
4. **Kompres** ketiga folder itu menjadi satu file `.zip`.
5. **Unggah** ZIP-mu di bawah untuk diperiksa otomatis!

:::callout{type="info" title="Cara membuat ZIP"}
Pilih ketiga folder → klik kanan → **Compress** / **Kirim ke → Folder terkompres
(zip)**. Mudah, kan? 📦
:::

::filemission{missionKey="berkas-rescue" folders="Gambar;Dokumen;Musik" download="/missions/berkas-rescue.zip"}

## 🏆 Selesai!

Setelah sortir berkas ✅ dan misi ZIP **LULUS**, gerbang **Level 3 — Teknisi
Siber** terbuka. Navigasi yang hebat! 🧭

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Navigasi hebat! 🧭" data="✓:Aku bisa menata file & folder:Mengelompokkan berkas dengan rapi|✓:Aku bisa membuat ZIP:Memampatkan banyak file jadi satu|✓:Aku tahu di mana menyimpan berkas:Setiap jenis di folder yang tepat"}
