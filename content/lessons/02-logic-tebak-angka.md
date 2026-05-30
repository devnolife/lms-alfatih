---
title: "Logic Flow: Game Tebak Angka"
summary: "Pelajari percabangan if/else dan perulangan for/while sambil membuat mini-game tebak angka."
order: 2
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

## 🏆 Misi

Selesaikan tiga tantangan di bawah untuk membangun mini-game tebak angkamu sendiri.
