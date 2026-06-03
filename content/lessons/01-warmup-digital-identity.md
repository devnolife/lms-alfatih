---
title: "Warm-up: Identitas Digital"
summary: "Kenalan dengan Python lewat input dan output sederhana — bikin kartu nama digitalmu sendiri!"
order: 1
level: 5
element: AP
projectKey: digital-identity
estimatedMinutes: 45
challenges:
  - id: warmup-1
    prompt: "Tampilkan tulisan 'Halo, dunia!' ke layar."
    xpReward: 10
    starterCode: |
      # Tugas: Tampilkan kalimat 'Halo, dunia!' menggunakan print()
      
    tests:
      - name: "Print Halo, dunia!"
        expectedStdout: "Halo, dunia!\n"
  - id: warmup-2
    prompt: "Buat variabel `nama` berisi namamu, lalu cetak kalimat 'Aku <nama>'."
    xpReward: 15
    starterCode: |
      nama = "Budi"
      # Tugas: cetak 'Aku Budi'
      
    tests:
      - name: "Print kalimat perkenalan"
        expectedStdout: "Aku Budi\n"
teacherNotes: |
  Pertama kali menulis Python. Tekankan: Python jalan baris per baris dari atas
  ke bawah. print() = cara komputer "berbicara", teks harus dibungkus tanda kutip.
  Variabel = kotak berlabel untuk menyimpan satu nilai, isinya bisa diganti.
  Dampingi siswa mengetik persis termasuk tanda kutip dan kurung — kesalahan
  paling umum: lupa kutip atau lupa kurung pada print.
answerKey:
  - ref: "Tantangan 1 — Halo, dunia!"
    answer: 'print("Halo, dunia!")'
    note: "Output: Halo, dunia!"
  - ref: "Tantangan 2 — Perkenalan"
    answer: 'print(f"Aku {nama}")   (atau: print("Aku", nama))'
    note: "Output: Aku Budi"
---

## 🎯 Tujuan

Di akhir modul ini kamu bisa:

- Menggunakan `print()` untuk menampilkan teks.
- Membuat dan memakai **variabel**.
- Menggabungkan teks dengan operator `+` atau f-string.

## 🧠 Konsep Singkat

Python menjalankan kode **baris per baris dari atas ke bawah**. Fungsi `print()` adalah cara paling dasar untuk "berbicara" dengan pengguna.

```python
print("Halo, calon programmer!")
```

Animasi di bawah berjalan otomatis — perhatikan bagaimana Python menjalankan tiap baris `print()` satu per satu (bisa dijeda atau diulang):

::visual{type="print-flow" lines="Halo, calon programmer!|Selamat belajar Python|Sampai jumpa!"}

:::callout{type="tip" title="Ingat ya!"}
Teks yang ingin ditampilkan harus dibungkus tanda kutip: `"..."` atau `'...'`.
:::

### Variabel

:::reveal{visual="variable" name="nama" value="Sinta" title="Apa itu Variabel?"}
Variabel adalah **kotak untuk menyimpan data**. Sebuah kotak berlabel yang menyimpan satu nilai — seperti animasi di atas:

```python
nama = "Sinta"
umur = 13
print(nama)
print(umur)
```
:::

Isi kotak bisa diganti kapan saja. Animasi berjalan sendiri memperlihatkan nilai `umur` berubah (gunakan ▶/⏸ untuk mengontrol):

::visual{type="variable-box" name="umur" values="13,14,15"}

### Jenis Isi Kotak

:::reveal{visual="datatypes" title="Isi Kotak Itu Bermacam-macam"}
Nilai yang disimpan di variabel punya beberapa **jenis**. Kamu tidak perlu menghafal istilah rumit — cukup kenali bentuknya:

- **Angka** untuk berhitung, misalnya `umur = 13`.
- **Kata atau kalimat** yang ditulis di dalam tanda kutip, misalnya `nama = "Sinta"`.
- **Benar / Salah** untuk pilihan ya–tidak, misalnya `lulus = True`.

```python
umur = 13          # angka
nama = "Sinta"     # kata
lulus = True       # benar / salah
```

Python akan otomatis tahu jenisnya dari cara kamu menulisnya — pakai tanda kutip berarti kata, tanpa kutip dan berupa angka berarti angka.
:::

### Menggabungkan teks

```python
nama = "Sinta"
print("Halo, " + nama + "!")
# atau dengan f-string
print(f"Halo, {nama}!")
```

## 🎮 Ayo Berlatih Dulu

Sebelum mengetik kode sendiri, mainkan beberapa permainan singkat ini. Tidak perlu mengetik — cukup klik dan pilih!

### Isi Bagian Rumpang

::game{type="fill" code='___("Halo, dunia!")' options="print|tampil|tulis" answer="print" title="Isi Bagian Rumpang" question="Kata apa yang dipakai untuk menampilkan teks ke layar?"}

### Tebak Hasilnya

::game{type="match" code='nama = "Sinta"\nprint(nama)' options='Sinta|nama|"Sinta"' answer="0" title="Tebak Hasilnya" question="Apa yang akan muncul di layar?"}

### Urutkan Baris Kode

::game{type="order" lines='nama = "Sinta"|print(nama)' title="Urutkan Baris Kode" hint="Variabel harus dibuat dulu, baru bisa ditampilkan."}

## 🏆 Tantangan

Selesaikan dua tantangan di bawah. Klik **Run** untuk menjalankan kodemu, lalu **Periksa** untuk mengecek jawabanmu.

:::callout{type="info" title="Cara kerja tombol"}
**Run** = jalankan kode dan lihat hasilnya. **Periksa** = cek apakah jawabanmu sudah benar (kalau lulus, ada kejutan! 🎉).
:::

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Mantap! Kamu siap melangkah ke logika 🎉" data="✓:Aku bisa pakai print():Menampilkan teks ke layar|✓:Aku bisa membuat variabel:Menyimpan nilai dalam sebuah nama|✓:Aku bisa menggabungkan teks:Memakai + atau f-string"}
