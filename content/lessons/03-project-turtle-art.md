---
title: "Project Core: Turtle Art ASCII"
summary: "Project penutup: kombinasikan fungsi, loop, dan kreativitas untuk membuat seni ASCII layaknya Turtle Art."
order: 3
level: 5
element: AP
projectKey: turtle-art
estimatedMinutes: 90
challenges:
  - id: project-1
    prompt: "Buat fungsi `garis(n)` yang mencetak tanda '*' sebanyak `n` kali dalam satu baris. Panggil `garis(5)`."
    xpReward: 20
    starterCode: |
      def garis(n):
          # Tugas: cetak '*' sebanyak n kali dalam satu baris
          pass
      
      garis(5)
    tests:
      - name: "garis(5) mencetak 5 bintang"
        expectedStdout: "*****\n"
  - id: project-2
    prompt: "Gunakan loop untuk membuat segitiga: baris 1 berisi 1 bintang, baris 2 berisi 2 bintang, ..., sampai baris 5."
    xpReward: 25
    starterCode: |
      # Tugas: cetak segitiga bintang dari 1 sampai 5 baris
      
    tests:
      - name: "Segitiga 5 baris"
        expectedStdout: "*\n**\n***\n****\n*****\n"
  - id: project-3
    prompt: "Buat fungsi `kotak(sisi)` yang mencetak kotak bujur sangkar dari karakter '#'. Panggil `kotak(4)`."
    xpReward: 30
    starterCode: |
      def kotak(sisi):
          # Tugas: cetak bujur sangkar #
          pass
      
      kotak(4)
    tests:
      - name: "kotak(4) menghasilkan 4x4"
        expectedStdout: "####\n####\n####\n####\n"
---

## 🎯 Tujuan Akhir 1-Day Bootcamp

Di akhir project ini kamu akan:

- Membuat dan memanggil **fungsi** sendiri.
- Memakai **loop** untuk menggambar pola.
- Mendapat badge **Turtle Artist** dan sertifikat **FunPython Certified**.

## 🧠 Konsep Baru: Fungsi

```python
def sapa(nama):
    print(f"Halo, {nama}!")

sapa("Andi")
sapa("Sinta")
```

Fungsi membantu kita **menghindari menulis kode yang sama berulang-ulang**.

:::callout{type="tip" title="Lihat hasilnya secara visual!"}
Di project ini kamu bisa menggambar dengan modul **`turtle`**. Saat kodemu memakai turtle, tab **🎨 Visual** akan muncul di panel output — gambarmu tampil di sana!
:::

Coba kode ini, lalu klik **Run** dan buka tab **🎨 Visual**:

```python
import turtle

for _ in range(4):
    turtle.forward(100)
    turtle.left(90)
```

::visual{type="loop-stepper" start="0" stop="4" varName="sisi" body="gambar sisi ke-{i}"}

## 🎮 Mini-Game: Pandu Si Kura-kura

Sebelum menulis kode sungguhan, ayo berlatih **berpikir urut** lewat permainan! Susun blok perintah supaya kura-kura sampai ke daun. Ini persis seperti `turtle.forward()` dan `turtle.left()` — tapi pakai blok, bukan ketikan.

::game{type="maze" grid="S../##./..G" dir="right" title="Pandu Si Kura-kura" hint="Susun blok: Maju & Putar, antar kura-kura ke daun 🥬"}

:::callout{type="tip" title="Petunjuk"}
Kura-kura menghadap ke arah panah. **Maju** menggerakkannya satu kotak ke arah panah, **Putar** mengubah arah panahnya. Coba: Maju, Maju, lalu Putar — lihat apa yang terjadi!
:::

## 🔁 Mini-Game: Hemat Langkah dengan "Ulangi"

Lorong ini panjang! Daripada menaruh blok **Maju** berkali-kali, pakai tombol **🔁 Ulangi semua langkah**. Cukup taruh satu blok **Maju**, lalu atur pengulangannya. Ini ide yang sama dengan **loop** `for ... range()` di Python!

::game{type="maze" grid="S....G" dir="right" loop="true" title="Lorong Panjang" hint="Taruh 1 blok Maju, lalu atur 🔁 Ulangi agar cukup sampai daun 🥬"}

## 🎨 Inspirasi Proyek

Coba kreasikan setelah selesai 3 tantangan:

- Segitiga terbalik.
- Pohon natal ASCII.
- Inisial namamu dari pola `*`.

## 🏆 Selesaikan untuk Naik Level

Selesaikan ketiga tantangan untuk membuka sertifikat digital **FunPython Certified** kamu!
