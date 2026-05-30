---
title: "Level 1 — Ksatria Logika"
summary: "Latih otak berpikir komputasional: pecahkan teka-teki logika dan lengkapi diagram alir seperti seorang ksatria sejati!"
order: 10
level: 1
element: BK
projectKey: ksatria-logika
estimatedMinutes: 30
activities:
  - id: bk-quiz
    xp: 20
    required: true
  - id: bk-flowchart
    xp: 30
    required: true
---

## 🎯 Misi Ksatria Logika

Selamat datang, calon **Ksatria Logika**! Sebelum bisa menyuruh komputer bekerja,
kamu harus pintar **berpikir runtut** dulu. Di level ini kamu belajar:

- Memecah masalah besar jadi langkah-langkah kecil (**dekomposisi**).
- Menemukan **pola** dan urutan yang benar.
- Membaca dan melengkapi **diagram alir** (flowchart).

## 🧠 Apa itu Berpikir Komputasional?

Berpikir komputasional artinya menyelesaikan masalah **selangkah demi selangkah**,
seperti memberi petunjuk ke robot yang hanya menurut perintah persis.

:::callout{type="tip" title="Contoh sehari-hari"}
Membuat mie instan punya algoritma: didihkan air → masukkan mie → tunggu 3 menit →
tiriskan → campur bumbu. Kalau urutannya ditukar, hasilnya kacau! 🍜
:::

Coba lihat **algoritma berangkat sekolah** ini berjalan runtut dari langkah 1 ke
langkah terakhir — tekan ▶ Putar:

::visual{type="step-sequence" title="Algoritma: Berangkat Sekolah" steps="Bangun|Mandi|Sarapan|Pakai seragam|Berangkat" emojis="⏰|🚿|🍳|👕|🎒"}

### Diagram Alir (Flowchart)

**Diagram alir** adalah gambar langkah-langkah sebuah algoritma. Bentuknya:

- ⬭ **Mulai / Selesai** — awal dan akhir.
- ▭ **Proses** — sebuah aksi, misalnya "Tuang air".
- ◇ **Keputusan** — pertanyaan ya/tidak.

Beginilah ketiga bentuk itu dirangkai menjadi diagram alir yang utuh. Perhatikan
kotak **Keputusan** ◇ yang memecah alur menjadi cabang **Ya** dan **Tidak**:

::visual{type="flowchart-diagram" read="Baca nilai" decision="Nilai >= 75?" yes="Tampilkan 'Lulus'" no="Tampilkan 'Belum'"}

## 🎮 Ayo Berlatih

### Teka-teki Logika

Uji nalarmu dengan kuis cepat berikut. Jawab semua dengan benar untuk lanjut!

::game{type="quiz" activityId="bk-quiz" title="Teka-teki Ksatria" data="Robot hanya menurut perintah persis. Apa nama urutan langkah penyelesaian masalah?|Algoritma;Tebakan;Kebetulan|0|Algoritma = urutan langkah yang jelas dan runtut.~Memecah masalah besar menjadi bagian-bagian kecil disebut...|Dekomposisi;Dekorasi;Diskusi|0|Dekomposisi membuat masalah lebih mudah diselesaikan.~Manakah urutan yang benar untuk berangkat sekolah?|Bangun, mandi, sarapan, berangkat;Berangkat, mandi, bangun;Sarapan, berangkat, bangun|0|Langkah harus runtut dari awal ke akhir."}

### Lengkapi Diagram Alir

Sebuah program menebak apakah seorang siswa **lulus** (nilai ≥ 75). Lengkapi
kotak rumpang pada diagram alir dari atas ke bawah!

::game{type="flowchart" activityId="bk-flowchart" title="Diagram Alir Kelulusan" steps="Mulai|Baca nilai|___|___|Selesai" answers="Apakah nilai >= 75?;Tampilkan hasil" bank="Apakah nilai >= 75?;Tampilkan hasil;Hapus nilai;Matikan komputer" hint="Pikirkan: setelah membaca nilai, komputer harus memeriksa lalu menampilkan hasilnya."}

## 🏆 Selesai!

Kalau kedua tantangan sudah ✅, kamu resmi jadi **Ksatria Logika** dan gerbang
**Level 2 — Navigator Digital** akan terbuka. Maju terus! ⚔️
