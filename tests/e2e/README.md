# E2E Browser Tests (Playwright)

Suite uji end-to-end berbasis browser (Chromium headless) untuk FunPython.
Memverifikasi 17 alur utama: marketing, auth (register/login/logout), home siswa,
LessonPlayer + eksekusi Python **Pyodide** + auto-grader, Arena Game, kelas
(buat kelas guru + join siswa), Sesi Live realtime (SSE) untuk guru & siswa, dan
auth guard.

## Prasyarat

- Python + Playwright (`pip install playwright && python -m playwright install chromium`)
- Database ter-seed: `npm run db:seed` (akun `instruktur`/`siswa` password `password123`)
- Dev server berjalan di `http://localhost:3007`

## Menjalankan

```bash
npm run dev            # terminal 1
npm run test:e2e       # terminal 2  (atau: python tests/e2e/run_e2e.py)
npm run test:e2e:roles # matriks akses per-role x per-halaman
```

Override target URL: set env `E2E_BASE_URL`.

Screenshot tiap tahap tersimpan di `tests/e2e/shots/` (di-gitignore).
Exit code `1` jika ada test yang FAIL.

## Suite role × halaman (`run_role_pages.py`)

Uji **otorisasi** secara menyeluruh: tiap halaman dikunjungi oleh **setiap level
akses** (publik / STUDENT / TEACHER / ADMIN) lalu diverifikasi apakah halaman
**tampil** atau **redirect** persis sesuai `src/proxy.ts`.

Akun ter-seed (`npm run db:seed`, semua password `password123`):
`admin` (ADMIN), `instruktur` (TEACHER), `siswa` (STUDENT), plus konteks publik
tanpa sesi.

Matriks yang dicek:

| Halaman | publik | STUDENT | TEACHER | ADMIN |
|---|---|---|---|---|
| `/`, `/design`, `/certificate/<token>` | tampil | tampil | tampil | tampil |
| `/app`, `/app/games`, `/app/classes`, `/app/sessions/[id]` | →`/login` | tampil | tampil | tampil |
| `/learn`, `/learn/[slug]`, `/learn/level/1` | →`/login` | tampil | tampil | tampil |
| `/dashboard` | →`/login` | →`/app` | tampil | tampil |

Plus guard `/login?next=…` untuk akses tanpa sesi.
