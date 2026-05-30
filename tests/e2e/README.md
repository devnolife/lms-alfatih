# E2E Browser Tests (Playwright)

Suite uji end-to-end berbasis browser (Chromium headless) untuk FunPython.
Memverifikasi 17 alur utama: marketing, auth (register/login/logout), home siswa,
LessonPlayer + eksekusi Python **Pyodide** + auto-grader, Arena Game, kelas
(buat kelas guru + join siswa), Sesi Live realtime (SSE) untuk guru & siswa, dan
auth guard.

## Prasyarat

- Python + Playwright (`pip install playwright && python -m playwright install chromium`)
- Database ter-seed: `npm run db:seed` (akun `instruktur`/`siswa` password `password123`)
- Dev server berjalan di `http://localhost:3000`

## Menjalankan

```bash
npm run dev            # terminal 1
npm run test:e2e       # terminal 2  (atau: python tests/e2e/run_e2e.py)
```

Override target URL: set env `E2E_BASE_URL`.

Screenshot tiap tahap tersimpan di `tests/e2e/shots/` (di-gitignore).
Exit code `1` jika ada test yang FAIL.
