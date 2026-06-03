---
title: "Logic Flow: Game Tebak Angka"
summary: "Pelajari percabangan if/else dan perulangan for/while sambil membuat mini-game tebak angka."
order: 2
level: 5
element: AP
projectKey: tebak-angka
estimatedMinutes: 60
challenges:
  - id: logic-1
    prompt: "Buat variabel `angka = 7`. Jika angka lebih dari 5, cetak 'Besar'. Jika tidak, cetak 'Kecil'."
    xpReward: 15
    starterCode: |
      angka = 7
      # Tugas: gunakan if/else untuk mencetak 'Besar' atau 'Kecil'
      
    tests:
      - name: "Cabang 'Besar'"
        expectedStdout: "Besar\n"
  - id: logic-2
    prompt: "Cetak angka 1 sampai 5 (masing-masing di baris baru) menggunakan for-loop."
    xpReward: 20
    starterCode: |
      # Tugas: gunakan for + range untuk mencetak 1..5
      
    tests:
      - name: "Cetak 1..5"
        expectedStdout: "1\n2\n3\n4\n5\n"
  - id: logic-3
    prompt: "Game tebak angka: jawaban benar adalah 4. Untuk setiap tebakan dalam list `tebakan = [2, 4, 7]`, cetak 'Salah' atau 'Benar!'."
    xpReward: 25
    starterCode: |
      jawaban = 4
      tebakan = [2, 4, 7]
      # Tugas: loop melalui 'tebakan' dan cetak 'Benar!' jika sama dgn 'jawaban', selain itu 'Salah'.
      
    tests:
      - name: "Game tebak angka"
        expectedStdout: "Salah\nBenar!\nSalah\n"
teacherNotes: |
  Tiga konsep: if/else (percabangan), for + range (perulangan), dan loop list.
  Analogi if/else = persimpangan jalan (kalau ... maka ..., kalau tidak ...).
  range(1, 6) menghasilkan 1..5 — batas akhir tidak ikut. Untuk game tebak angka,
  jelaskan loop memeriksa tiap tebakan satu per satu. Ingatkan INDENTASI (spasi
  menjorok) wajib di Python — error paling sering muncul di sini.
answerKey:
  - ref: "Tantangan 1 — Besar/Kecil"
    answer: 'if angka > 5: print("Besar")  else: print("Kecil")'
    note: "angka = 7 → Besar"
  - ref: "Tantangan 2 — Cetak 1..5"
    answer: 'for i in range(1, 6): print(i)'
    note: "Output: 1 2 3 4 5 (tiap baris)"
  - ref: "Tantangan 3 — Game Tebak Angka"
    answer: 'for t in tebakan: print("Benar!" if t == jawaban else "Salah")'
    note: "Output: Salah, Benar!, Salah"
---

## 🎯 Tujuan

- Mengerti **percabangan** `if`, `elif`, `else`.
- Menggunakan **perulangan** `for` dengan `range()` dan dengan **list**.
- Menggabungkan keduanya untuk membuat logika game.

## 🧠 Konsep

### If / Else

```python
nilai = 80
if nilai >= 75:
    print("Lulus 🎉")
else:
    print("Coba lagi")
```

Lihat animasi di bawah ini berjalan sendiri — perhatikan cabang mana yang menyala untuk tiap nilai:

::visual{type="condition-flow" varName="angka" values="3,7,5,9,2" op=">" threshold="5" whenTrue="Besar" whenFalse="Kecil"}

### Perulangan `for`

```python
for i in range(3):
    print("Hai!", i)
```

Perulangan mengulang kode beberapa kali. Animasi berikut berjalan otomatis — lihat nilai `i` berubah di setiap putaran (bisa dijeda/diulang):

::visual{type="loop-stepper" start="0" stop="5" varName="i" body="print({i})"}

:::callout{type="concept" title="range(0, 5)"}
`range(0, 5)` menghasilkan angka **0, 1, 2, 3, 4** — mulai dari 0 dan **berhenti sebelum** 5.
:::

### Looping list

```python
buah = ["apel", "mangga", "pisang"]
for b in buah:
    print(b)
```

:::callout{type="warning" title="Jangan lupa titik dua!"}
Setiap `if`, `else`, dan `for` harus diakhiri tanda titik dua ( `:` ), dan baris di bawahnya menjorok ke dalam (4 spasi).
:::

## � Ayo Berlatih Dulu

Sebelum menulis kode sungguhan, panaskan dulu logikamu lewat tiga permainan cepat ini. Tidak perlu mengetik — cukup klik dan pilih!

### Isi Bagian Rumpang

::game{type="fill" code='angka = 8\n___ angka > 5:\n    print("Besar")' options="if|for|print" answer="if" title="Pilih Kata Percabangan" question="Kata kunci apa yang dipakai untuk membuat percabangan (memeriksa sebuah syarat)?"}

### Tebak Hasilnya

::game{type="match" code='for i in range(3):\n    print(i)' options='0 1 2|1 2 3|0 1 2 3' answer="0" title="Tebak Hasil Perulangan" question="Angka apa saja yang muncul di layar?"}

### Urutkan Baris Kode

::game{type="order" lines='angka = 8|if angka > 5:|print("Besar")' title="Urutkan Logika If" hint="Variabel dibuat dulu, baru syaratnya diperiksa, baru hasilnya dicetak."}

## 🏆 Misi

Selesaikan tiga tantangan di bawah untuk membangun mini-game tebak angkamu sendiri.

::visual{type="think-check" title="Cek Pemahamanku 🎯" done="Keren! Kamu sudah siap jadi pembuat game logika 🎉" data="✓:Aku paham if / else:Bisa memilih cabang sesuai syarat|✓:Aku paham for + range():Bisa mengulang kode beberapa kali|✓:Aku bisa looping list:Bisa memproses tiap item dalam daftar"}

