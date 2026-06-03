---
title: "Level 4 — Detektif Data"
summary: "Jadi detektif angka! Olah data kantin sekolah dengan SUM dan AVERAGE, lalu baca grafiknya."
order: 40
level: 4
element: AD
projectKey: detektif-data
estimatedMinutes: 30
activities:
  - id: ad-dekomposisi
    xp: 20
    required: true
  - id: ad-cleaning
    xp: 20
    required: true
  - id: ad-klasifikasi
    xp: 20
    required: false
  - id: ad-spreadsheet
    xp: 25
    required: true
teacherNotes: |
  Bawa konteks nyata: "makanan apa yang paling laris di kantin?" Empat langkah:
  pecah masalah (dekomposisi) → bersihkan data (duplikat/outlier/data hilang/format
  beda) → kelompokkan → hitung. Jelaskan SUM = jumlahkan semua angka; AVERAGE =
  total dibagi banyaknya data. Trik cek: rata-rata selalu di antara nilai terkecil
  dan terbesar. Grafik batang: makin tinggi batang, makin besar angkanya.
answerKey:
  - ref: "Dekomposisi Masalah Kantin"
    answer: "Kotak rumpang: 'Data apa yang dibutuhkan?' lalu 'Hitung total tiap makanan'"
  - ref: "Detektif Pembersih Data — Soal 1"
    answer: "Duplikat"
  - ref: "Detektif Pembersih Data — Soal 2"
    answer: "Outlier"
  - ref: "Detektif Pembersih Data — Soal 3"
    answer: "Menyeragamkan formatnya (standardisasi)"
  - ref: "Klasifikasi Jarak Perjalanan"
    answer: "Dekat: 5 km & 8 km · Menengah: 25 km & 20 km · Jauh: 40 km & 35 km"
  - ref: "Data Kantin Sekolah (SUM & AVERAGE)"
    answer: "Total = 150 porsi; Rata-rata = 150 ÷ 5 = 30 porsi"
    note: "32 (Bakso) + 25 (Mie Ayam) + 40 (Es Teh) + 18 (Gorengan) + 35 (Nasi Goreng) = 150."
---

## 🔎 Misi Detektif Data

Kantin sekolah ingin tahu makanan apa yang paling laris. Sebagai **Detektif
Data**, kamu akan mengolah angka penjualan dan menemukan polanya!

Di level ini kamu belajar:

- **Memecah** masalah besar jadi bagian kecil (**dekomposisi**).
- **Membersihkan** data dari kesalahan (duplikat, nilai aneh, data hilang).
- **Mengelompokkan** data berdasarkan kategori (**klasifikasi**).
- Menghitung **total (SUM)** dan **rata-rata (AVERAGE)** lalu membaca grafiknya.

## 🧩 Pecahkan Dulu Masalahnya

Sebelum mengolah data, detektif hebat **memecah** masalah besar jadi pertanyaan
kecil yang mudah dijawab. Ini disebut **dekomposisi**.

:::callout{type="concept" title="Apa itu dekomposisi?"}
Dekomposisi = memecah masalah besar menjadi sub-masalah yang lebih kecil sehingga
data lebih mudah dikelola. Contoh: "Rute mana yang tercepat ke sekolah?" dipecah
menjadi → data apa yang dibutuhkan? (jarak, waktu tempuh, kondisi lalu lintas) →
dari mana sumbernya? (GPS, aplikasi navigasi, catatan harian). 🧩
:::

Urutkan langkah seorang Detektif Data dari awal sampai akhir — tekan ▶ Putar:

::visual{type="step-sequence" title="Alur Mengolah Data" steps="Identifikasi data|Kumpulkan data|Bersihkan data|Kelompokkan data|Baca polanya" emojis="🔍|📥|🧹|🏷️|📊"}

Lengkapi alur memecah masalah "makanan terlaris di kantin" berikut:

::game{type="flowchart" activityId="ad-dekomposisi" title="Dekomposisi Masalah Kantin" steps="Tentukan pertanyaan|___|Kumpulkan data penjualan|___|Simpulkan yang terlaris" answers="Data apa yang dibutuhkan?;Hitung total tiap makanan" bank="Data apa yang dibutuhkan?;Hitung total tiap makanan;Hapus semua data;Beli makanan baru" hint="Setelah tahu pertanyaannya, tentukan data yang dibutuhkan; setelah data terkumpul, hitung dulu sebelum menyimpulkan."}

## 🧹 Bersihkan Datanya

Data mentah sering **kotor**: ada yang tertulis dua kali, ada nilai aneh, atau
ada yang kosong. Data kotor membuat kesimpulan jadi salah, jadi harus
**dibersihkan** dulu.

:::reveal{title="4 masalah data yang sering muncul"}
- **Duplikat** — baris data yang sama tercatat dua kali. ➜ hapus salinannya.
- **Outlier** — nilai yang menyimpang jauh (mis. waktu tempuh 0,1 menit). ➜
  periksa: salah catat atau memang nyata?
- **Nilai hilang (missing)** — sel kosong karena lupa diisi. ➜ isi perkiraan
  atau tandai untuk dicek.
- **Format beda (standardisasi)** — tanggal "01-12" vs "12/01", satuan km vs
  meter. ➜ samakan formatnya.
:::

:::callout{type="tip" title="Langkah terakhir: validasi"}
Setelah dibersihkan, **periksa ulang** apakah semua nilai sudah masuk akal dan
seragam. Inilah yang disebut **validasi data** — pemeriksaan akhir sebelum data
dianalisis. ✅
:::

Uji pemahamanmu soal membersihkan data:

::game{type="quiz" activityId="ad-cleaning" title="Detektif Pembersih Data" data="Catatan penjualan \"Bakso\" muncul dua kali dengan angka sama persis. Ini masalah...|Duplikat;Outlier;Nilai hilang|0|Data yang sama tercatat dua kali disebut duplikat — salah satunya dihapus.~Ada waktu tempuh tertulis 600 menit ke sekolah yang biasanya 15 menit. Ini...|Outlier;Duplikat;Standardisasi|0|Nilai yang menyimpang jauh disebut outlier — perlu diperiksa.~Tanggal ditulis campur \"01-12-2025\" dan \"12/01/2025\". Yang harus dilakukan?|Menyeragamkan formatnya;Menghapus semua tanggal;Membiarkannya|0|Menyamakan format disebut standardisasi agar data konsisten."}

## 🏷️ Kelompokkan Datanya

Setelah bersih, data **dikelompokkan** (klasifikasi) berdasarkan kategori agar
polanya mudah terlihat — misalnya jarak "dekat / menengah / jauh", atau waktu
"pagi / siang / sore".

Seret tiap data ke kelompok jaraknya yang benar:

::game{type="filesort" activityId="ad-klasifikasi" title="Klasifikasi Jarak Perjalanan" files="🏠 5 km:Dekat|🏫 25 km:Menengah|🏖️ 40 km:Jauh|🛒 8 km:Dekat|🏞️ 35 km:Jauh|🏪 20 km:Menengah"}

:::callout{type="info" title="Kenapa dikelompokkan?"}
Dengan mengelompokkan data, kita bisa membuat **variabel turunan** (mis.
kecepatan rata-rata per kelompok) yang memperkaya analisis. 🏷️
:::

## 📊 Mengolah Angka

Sekarang data sudah bersih dan terkelompok. Saatnya **menghitung**: data bisa
**dijumlahkan** dan **digambar** agar mudah dipahami.

### SUM dan AVERAGE

- **SUM (Total)** = menjumlahkan semua angka.
  Contoh: `3 + 5 + 2 = 10`.
- **AVERAGE (Rata-rata)** = total dibagi banyaknya angka.
  Contoh: `10 ÷ 3 = 3,3`.

:::callout{type="tip" title="Trik rata-rata"}
Rata-rata selalu berada di **tengah-tengah** angka terkecil dan terbesar. Kalau
hasilmu di luar itu, pasti ada yang salah hitung! 🧮
:::

### Grafik Batang

Grafik batang mengubah angka jadi **batang** — makin tinggi batang, makin besar
angkanya. Sekali lihat, kamu langsung tahu mana yang juara! 🏆

::visual{type="bar-chart" title="Penjualan Kantin Hari Ini" unit="porsi" data="Bakso:32|Mie Ayam:25|Es Teh:40|Gorengan:18|Nasi Goreng:35"}

Tekan **🧮 Hitung SUM & AVERAGE** pada grafik di atas untuk melihat total dan
rata-rata semua penjualan sekaligus.

## 🎮 Latihan: Olah Data Kantin

Hitung **total** dan **rata-rata** porsi terjual dari tabel berikut. Perhatikan
grafiknya untuk membantu!

::game{type="spreadsheet" activityId="ad-spreadsheet" title="Data Kantin Sekolah" labelHeader="Makanan" valueHeader="Terjual" rows="Bakso:32|Mie Ayam:25|Es Teh:40|Gorengan:18|Nasi Goreng:35"}

:::callout{type="info" title="Petunjuk hitung"}
Total = 32 + 25 + 40 + 18 + 35. Rata-rata = total dibagi 5 (karena ada 5 jenis
makanan).
:::

## 🏆 Selesai!

Total dan rata-rata tepat ✅? Kamu **Detektif Data** sejati! Gerbang **Level 5 —
Pembuat Game Pemula** terbuka — saatnya menulis kode Python! 🔎

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Detektif Data sejati! 🔎" data="✓:Aku bisa menghitung total:Menjumlahkan semua data|✓:Aku bisa menghitung rata-rata:Total dibagi banyak data|✓:Aku bisa membaca grafik:Memahami data lewat gambar"}
