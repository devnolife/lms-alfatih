---
title: "Level 4 — Detektif Data"
summary: "Jadi detektif angka! Olah data kantin sekolah dengan SUM dan AVERAGE, lalu baca grafiknya."
order: 40
level: 4
element: AD
projectKey: detektif-data
estimatedMinutes: 30
activities:
  - id: ad-spreadsheet
    xp: 25
    required: true
---

## 🔎 Misi Detektif Data

Kantin sekolah ingin tahu makanan apa yang paling laris. Sebagai **Detektif
Data**, kamu akan mengolah angka penjualan dan menemukan polanya!

Di level ini kamu belajar:

- Membaca **tabel data** baris demi baris.
- Menghitung **total (SUM)** dan **rata-rata (AVERAGE)**.
- Membaca **grafik batang** untuk melihat pola.

## 📊 Mengenal Data

**Data** adalah kumpulan fakta — misalnya jumlah makanan terjual tiap hari.
Setelah dikumpulkan, data bisa **dihitung** dan **digambar** agar mudah dipahami.

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
