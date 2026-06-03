"""
FunPython — student storage & security integration tests (HTTP API level).

Logs in with the seeded STUDENT account and exercises EVERY persistence
endpoint a student can reach, asserting both happy-path storage and the
security/validation guards:

  * auth            login (ok / wrong password / missing fields) + logout
  * authorization   protected endpoints reject anonymous callers (401)
  * /api/submissions          challenge attempts + XP idempotency + bounds
  * /api/activities/complete  activity first-solve + XP idempotency
  * /api/activities/work      game work payload + size/field bounds
  * /api/missions/file-rescue ZIP grading: correct / wrong / rearranged / junk

The XP/idempotency assertions are RERUN-SAFE: each award is called twice and we
assert the invariant (a second identical call awards 0 XP, marks
`alreadyAwarded`, and leaves `totalXp` unchanged) — this proves the DB write is
persisted and guarded regardless of whatever state previous runs left behind.

Prereqs:
  * App running at http://localhost:3007  (override with E2E_BASE_URL)
  * DB seeded: `npm run db:seed`  (student `siswa` / `password123`)
  * `pip install requests`

Run:
  npm run test:student        (or: python tests/e2e/run_student_api.py)

Exit code 1 if any test FAILs.
"""

import io
import os
import sys
import time
import zipfile

import requests

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3007").rstrip("/")
USERNAME = os.environ.get("E2E_STUDENT_USER", "siswa")
PASSWORD = os.environ.get("E2E_STUDENT_PASS", "password123")

# Fixtures discovered from seeded content/DB. Override via env if your content
# changes. These must reference ACTIVE rows/manifest entries.
CHALLENGE_ID = os.environ.get("E2E_CHALLENGE_ID", "warmup-1")
ACTIVITY_LESSON = os.environ.get("E2E_ACTIVITY_LESSON", "orientasi-koding-ka")
ACTIVITY_ID = os.environ.get("E2E_ACTIVITY_ID", "orient-terminologi")
MISSION_KEY = os.environ.get("E2E_MISSION_KEY", "berkas-rescue")
MISSION_LESSON = os.environ.get("E2E_MISSION_LESSON", "navigator-berkas")

# Expected correct layout for the `berkas-rescue` file mission (mirrors
# src/lib/missions.ts). Folder -> files that belong in it.
MISSION_LAYOUT = {
    "Gambar": ["foto-liburan.jpg", "screenshot.png"],
    "Dokumen": ["tugas-ipa.docx", "jadwal.pdf"],
    "Musik": ["lagu-favorit.mp3"],
}

results = []  # (name, status, detail)


def record(name, status, detail=""):
    results.append((name, status, detail))
    icon = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]", "SKIP": "[SKIP]"}.get(
        status, status
    )
    print(f"{icon} {name}  {detail}", flush=True)


def check(name, cond, detail=""):
    record(name, "PASS" if cond else "FAIL", detail)
    return cond


def make_zip(layout, wrapper=None, junk=False):
    """Builds an in-memory ZIP from {folder: [files]}.

    wrapper: optional top-level folder name wrapping everything (simulates a
             user who zipped the parent folder, e.g. 'berkas-rescue/Gambar/..').
    junk:    when True, also add OS metadata entries (__MACOSX, .DS_Store) that
             a real archive often contains and that grading must ignore.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for folder, files in layout.items():
            path = f"{wrapper}/{folder}" if wrapper else folder
            for fname in files:
                zf.writestr(f"{path}/{fname}", b"x")
        if junk:
            zf.writestr("__MACOSX/._foo", b"\x00")
            zf.writestr(".DS_Store", b"\x00")
            top = f"{wrapper}/Gambar" if wrapper else "Gambar"
            zf.writestr(f"{top}/.DS_Store", b"\x00")
    buf.seek(0)
    return buf.read()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
def test_auth():
    anon = requests.Session()

    r = anon.post(f"{BASE}/api/auth/login", json={"username": USERNAME, "password": "salah-banget"})
    check("Login wrong password rejected", r.status_code == 401, f"-> {r.status_code}")

    r = anon.post(f"{BASE}/api/auth/login", json={"username": USERNAME})
    check("Login missing field rejected", r.status_code == 400, f"-> {r.status_code}")

    # Anonymous caller must not reach a protected write endpoint.
    r = anon.post(f"{BASE}/api/activities/complete", json={"lessonSlug": "x", "activityId": "y"})
    check("Anonymous write blocked (401)", r.status_code == 401, f"-> {r.status_code}")

    # Real login.
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"username": USERNAME, "password": PASSWORD})
    ok = r.status_code == 200 and r.json().get("ok")
    role = (r.json().get("user") or {}).get("role") if r.status_code == 200 else None
    check("Login success (student)", ok and role == "STUDENT", f"-> {r.status_code} role={role}")
    has_cookie = any("session" in c.name for c in s.cookies)
    check("Session cookie issued", has_cookie, f"cookies={[c.name for c in s.cookies]}")

    # A production build marks the session cookie `Secure`. Browsers treat
    # http://localhost as a secure context and still send it; Python requests
    # does not, so over plain http to localhost we clear the flag to behave like
    # a browser. (No effect on a real HTTPS deployment.)
    if BASE.startswith("http://"):
        for c in s.cookies:
            c.secure = False
    return s


# ---------------------------------------------------------------------------
# Challenge submissions  (/api/submissions)
# ---------------------------------------------------------------------------
def test_submissions(s):
    # Validation guards.
    r = s.post(f"{BASE}/api/submissions", json={"challengeId": CHALLENGE_ID})
    check("Submission missing fields -> 400", r.status_code == 400, f"-> {r.status_code}")

    r = s.post(
        f"{BASE}/api/submissions",
        json={"challengeId": "tidak-ada", "code": "print(1)", "passed": True},
    )
    check("Submission unknown challenge -> 404", r.status_code == 404, f"-> {r.status_code}")

    r = s.post(
        f"{BASE}/api/submissions",
        json={"challengeId": CHALLENGE_ID, "code": "x" * 20_001, "passed": True},
    )
    check("Submission oversized code -> 400", r.status_code == 400, f"-> {r.status_code}")

    # Happy path + idempotency invariant (rerun-safe).
    payload = {"challengeId": CHALLENGE_ID, "code": "print('hi')", "passed": True}
    r1 = s.post(f"{BASE}/api/submissions", json=payload)
    j1 = r1.json() if r1.status_code == 200 else {}
    check("Submission stored (200)", r1.status_code == 200 and j1.get("ok"), f"-> {r1.status_code}")

    r2 = s.post(f"{BASE}/api/submissions", json=payload)
    j2 = r2.json() if r2.status_code == 200 else {}
    invariant = (
        r2.status_code == 200
        and j2.get("alreadyAwarded") is True
        and j2.get("xpAwarded") == 0
        and j2.get("totalXp") == j1.get("totalXp")
    )
    check(
        "Challenge XP awarded once (idempotent)",
        invariant,
        f"xp2={j2.get('xpAwarded')} totalXp {j1.get('totalXp')}->{j2.get('totalXp')}",
    )


# ---------------------------------------------------------------------------
# Activity completion  (/api/activities/complete)
# ---------------------------------------------------------------------------
def test_activity_complete(s):
    r = s.post(f"{BASE}/api/activities/complete", json={"lessonSlug": "x"})
    check("Activity missing field -> 400", r.status_code == 400, f"-> {r.status_code}")

    r = s.post(
        f"{BASE}/api/activities/complete",
        json={"lessonSlug": ACTIVITY_LESSON, "activityId": "tidak-ada"},
    )
    check("Activity unknown id -> 404", r.status_code == 404, f"-> {r.status_code}")

    payload = {"lessonSlug": ACTIVITY_LESSON, "activityId": ACTIVITY_ID}
    r1 = s.post(f"{BASE}/api/activities/complete", json=payload)
    j1 = r1.json() if r1.status_code == 200 else {}
    check("Activity stored (200)", r1.status_code == 200 and j1.get("ok"), f"-> {r1.status_code}")

    r2 = s.post(f"{BASE}/api/activities/complete", json=payload)
    j2 = r2.json() if r2.status_code == 200 else {}
    invariant = (
        r2.status_code == 200
        and j2.get("alreadyAwarded") is True
        and j2.get("xpAwarded") == 0
        and j2.get("totalXp") == j1.get("totalXp")
    )
    check("Activity XP awarded once (idempotent)", invariant,
          f"xp2={j2.get('xpAwarded')} totalXp {j1.get('totalXp')}->{j2.get('totalXp')}")


# ---------------------------------------------------------------------------
# Game work payload  (/api/activities/work)
# ---------------------------------------------------------------------------
def test_game_work(s):
    good = {
        "lessonSlug": ACTIVITY_LESSON,
        "activityId": ACTIVITY_ID,
        "game": "teachable",
        "score": 80,
        "data": {"tebakan": "kucing", "contoh": 3},
    }
    r = s.post(f"{BASE}/api/activities/work", json=good)
    j = r.json() if r.status_code == 200 else {}
    check("Game work stored (200)", r.status_code == 200 and j.get("id"), f"-> {r.status_code}")

    bad_activity = dict(good, activityId="tidak-ada")
    r = s.post(f"{BASE}/api/activities/work", json=bad_activity)
    check("Game work unknown activity -> 404", r.status_code == 404, f"-> {r.status_code}")

    oversized = dict(good, data={"blob": "y" * 9000})
    r = s.post(f"{BASE}/api/activities/work", json=oversized)
    check("Game work oversized data -> 400", r.status_code == 400, f"-> {r.status_code}")

    too_many = dict(good, data={f"f{i}": i for i in range(101)})
    r = s.post(f"{BASE}/api/activities/work", json=too_many)
    check("Game work too many fields -> 400", r.status_code == 400, f"-> {r.status_code}")


# ---------------------------------------------------------------------------
# File rescue ZIP mission  (/api/missions/file-rescue)
# ---------------------------------------------------------------------------
def post_zip(s, zip_bytes, name="rapi.zip", mission=MISSION_KEY):
    return s.post(
        f"{BASE}/api/missions/file-rescue",
        data={"missionKey": mission},
        files={"file": (name, io.BytesIO(zip_bytes), "application/zip")},
    )


def test_file_mission(s):
    # Non-zip extension rejected before any parsing.
    r = post_zip(s, b"hello", name="catatan.txt")
    check("File mission non-.zip -> 415", r.status_code == 415, f"-> {r.status_code}")

    # Unknown mission key.
    r = post_zip(s, make_zip(MISSION_LAYOUT), mission="tidak-ada")
    check("File mission unknown key -> 404", r.status_code == 404, f"-> {r.status_code}")

    # Wrong folder placement -> graded, not passed.
    wrong = {"Dokumen": ["foto-liburan.jpg"], "Gambar": ["tugas-ipa.docx"]}
    r = post_zip(s, make_zip(wrong))
    j = r.json() if r.status_code == 200 else {}
    check("File mission wrong layout not passed", r.status_code == 200 and j.get("passed") is False,
          f"-> {r.status_code} passed={j.get('passed')}")

    # Correct, flat layout -> passed.
    r = post_zip(s, make_zip(MISSION_LAYOUT))
    j = r.json() if r.status_code == 200 else {}
    check("File mission correct layout passed", r.status_code == 200 and j.get("passed") is True,
          f"-> {r.status_code} {j.get('correct')}/{j.get('total')}")

    # Regression: a re-zipped / rearranged archive with a WRAPPER folder and OS
    # junk (__MACOSX/.DS_Store) must still pass — this is the bug that made the
    # upload fail after students "atur ulang" their ZIP.
    r = post_zip(s, make_zip(MISSION_LAYOUT, wrapper="berkas-rescue", junk=True))
    j = r.json() if r.status_code == 200 else {}
    check("File mission wrapped+junk ZIP passed (regression)",
          r.status_code == 200 and j.get("passed") is True,
          f"-> {r.status_code} {j.get('correct')}/{j.get('total')}")


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------
def test_logout(s):
    r = s.post(f"{BASE}/api/auth/logout")
    check("Logout (200)", r.status_code == 200, f"-> {r.status_code}")
    # After logout the session cookie is gone -> protected write rejected.
    r = s.post(f"{BASE}/api/activities/complete", json={"lessonSlug": "x", "activityId": "y"})
    check("Post-logout write blocked (401)", r.status_code == 401, f"-> {r.status_code}")


def main():
    print(f"== FunPython student API tests against {BASE} (user={USERNAME}) ==\n", flush=True)
    try:
        requests.get(f"{BASE}/login", timeout=10)
    except requests.RequestException as e:
        record("Server reachable", "FAIL", repr(e))
        _summary()
        sys.exit(1)

    s = test_auth()
    test_submissions(s)
    test_activity_complete(s)
    test_game_work(s)
    test_file_mission(s)
    test_logout(s)
    _summary()


def _summary():
    n_pass = sum(1 for _, st, _ in results if st == "PASS")
    n_fail = sum(1 for _, st, _ in results if st == "FAIL")
    n_warn = sum(1 for _, st, _ in results if st in ("WARN", "SKIP"))
    print("\n" + "=" * 60, flush=True)
    print(f"  PASS {n_pass}   FAIL {n_fail}   WARN/SKIP {n_warn}   total {len(results)}", flush=True)
    print("=" * 60, flush=True)
    if n_fail:
        print("\nFailed:", flush=True)
        for name, st, detail in results:
            if st == "FAIL":
                print(f"  - {name}  {detail}", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
