"""
FunPython role x page ACCESS-MATRIX test suite (Playwright).

Where run_e2e.py walks the happy-path *flows*, this suite is exhaustive about
*authorization*: it visits every page in the app as every access level
(public / STUDENT / TEACHER / ADMIN) and asserts the page either renders or
redirects exactly as src/proxy.ts dictates.

Why this exists: the curriculum games (e.g. the "Jalan Panjang" maze) and the
gated lesson levels are easy to break per-role -- a student should NOT reach the
teacher dashboard, an unauthenticated visitor should be bounced to /login, and
every authed role should still reach /app, /learn and the games arcade. This
test pins all of that down in one place.

Roles & seeded accounts (npm run db:seed, all password "password123"):
    admin       -> ADMIN
    instruktur  -> TEACHER
    siswa       -> STUDENT
    (public)    -> no session

Run:
    npm run dev                 # terminal 1
    python tests/e2e/run_role_pages.py     # terminal 2
    # or: npm run test:e2e:roles
Override target: set E2E_BASE_URL (default http://localhost:3007).
Exit code 1 if any case FAILs.
"""
import sys, os, time, re
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3007").rstrip("/")
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(SHOTS, exist_ok=True)

PASSWORD = "password123"
ACCOUNTS = {
    "admin": "admin",
    "teacher": "instruktur",
    "student": "siswa",
}

results = []  # (name, status, detail)


def record(name, status, detail=""):
    results.append((name, status, detail))
    icon = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]"}.get(status, status)
    print(f"{icon} {name}  {detail}", flush=True)


def goto(page, path, wait="domcontentloaded", timeout=30000):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=timeout)
    try:
        page.wait_for_load_state(wait, timeout=timeout)
    except PWTimeout:
        pass


def rel_path(url):
    """Return the path portion of a URL relative to BASE, stripping query and
    trailing slash (but keeping the root "/")."""
    p = url
    if p.startswith(BASE):
        p = p[len(BASE):]
    p = p.split("?")[0].split("#")[0]
    if len(p) > 1:
        p = p.rstrip("/")
    return p or "/"


def login(ctx, username, password=PASSWORD):
    """Log a context in via the real /login form. Returns the landing path."""
    page = ctx.new_page()
    goto(page, "/login")
    page.wait_for_selector("input[autocomplete='username']", timeout=15000)
    page.fill("input[autocomplete='username']", username)
    page.fill("input[type='password']", password)
    page.click("button[type='submit']")
    try:
        page.wait_for_url(re.compile(r"/(app|dashboard)"), timeout=20000)
    except PWTimeout:
        pass
    landed = rel_path(page.url)
    page.close()
    return landed


def discover_lesson_slug(ctx):
    """Pick a real, unlocked lesson slug from the student's /learn index so the
    lesson-page check uses live content instead of a hard-coded guess."""
    page = ctx.new_page()
    slug = "ksatria-logika"  # Level 1, always unlocked -> safe fallback
    try:
        goto(page, "/learn", wait="networkidle")
        for el in page.locator("a[href^='/learn/']").all():
            href = el.get_attribute("href") or ""
            cand = href.split("/learn/")[-1].strip("/")
            if cand and not cand.startswith("level/"):
                slug = cand
                break
    except Exception:
        pass
    page.close()
    return slug


def main():
    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])

        # --- Build one logged-in context per role + a clean public context ---
        contexts = {}
        for role, username in ACCOUNTS.items():
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            landed = login(ctx, username)
            # Sanity: student/teacher/admin must land inside the app.
            ok_land = landed.startswith("/app") or landed.startswith("/dashboard")
            record(f"Login {role} ({username})", "PASS" if ok_land else "FAIL",
                   f"-> {landed}")
            if not ok_land:
                failures += 1
            contexts[role] = ctx
        public_ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        contexts["public"] = public_ctx

        # Discover a live lesson slug (use the student session).
        slug = discover_lesson_slug(contexts["student"])
        record("Discover lesson slug", "PASS", f"slug={slug}")

        # --- Access matrix -------------------------------------------------
        # Expectation per role: "ok" = page renders at requested path,
        # "login" = bounced to /login, "bounce_app" = bounced to /app.
        OK, LOGIN, BOUNCE = "ok", "login", "bounce_app"

        # Public (unauthenticated) pages: render for everyone.
        public_pages = [
            ("Marketing landing", "/"),
            ("Design system", "/design"),
            ("Certificate (invalid token)", "/certificate/INVALIDTOKEN404"),
        ]
        # Protected pages with a per-role expectation.
        # roles order: public, student, teacher, admin
        protected_pages = [
            ("Student home",        "/app",                       LOGIN, OK, OK, OK),
            ("Games arcade",        "/app/games",                 LOGIN, OK, OK, OK),
            ("Classes",             "/app/classes",               LOGIN, OK, OK, OK),
            ("Live session (bogus id)", "/app/sessions/NOPE404",  LOGIN, OK, OK, OK),
            ("Learn index",         "/learn",                     LOGIN, OK, OK, OK),
            ("Lesson player",       f"/learn/{slug}",             LOGIN, OK, OK, OK),
            ("Level overview L1",   "/learn/level/1",             LOGIN, OK, OK, OK),
            ("Teacher dashboard",   "/dashboard",                 LOGIN, BOUNCE, OK, OK),
        ]

        def check(role, label, path, expected):
            page = contexts[role].new_page()
            try:
                goto(page, path)
                page.wait_for_timeout(400)
                final = rel_path(page.url)
            except Exception as e:
                page.close()
                return "FAIL", f"error: {e!r}"
            page.close()
            requested = rel_path(BASE + path)
            if expected == LOGIN:
                ok = final == "/login"
                want = "/login"
            elif expected == BOUNCE:
                ok = final == "/app"
                want = "/app"
            else:  # OK -> rendered at requested path (not bounced to /login or /app)
                ok = final == requested
                want = requested
            return ("PASS" if ok else "FAIL"), f"want {want}, got {final}"

        # Public pages across every access level.
        for label, path in public_pages:
            for role in ("public", "student", "teacher", "admin"):
                status, detail = check(role, label, path, OK)
                record(f"[{role}] {label}", status, detail)
                if status == "FAIL":
                    failures += 1

        # Protected pages across every access level.
        for row in protected_pages:
            label, path = row[0], row[1]
            exp = {"public": row[2], "student": row[3], "teacher": row[4], "admin": row[5]}
            for role in ("public", "student", "teacher", "admin"):
                status, detail = check(role, label, path, exp[role])
                record(f"[{role}] {label}", status, detail)
                if status == "FAIL":
                    failures += 1

        # --- Auth-guard with next= round-trip ------------------------------
        # Unauthenticated /dashboard must redirect to /login?next=/dashboard.
        try:
            page = public_ctx.new_page()
            goto(page, "/dashboard")
            page.wait_for_timeout(300)
            has_next = "next=" in page.url and "/login" in page.url
            record("[public] Auth guard carries next=", "PASS" if has_next else "WARN",
                   f"url={rel_path(page.url)}{'?' + page.url.split('?',1)[1] if '?' in page.url else ''}")
            page.close()
        except Exception as e:
            record("[public] Auth guard carries next=", "WARN", repr(e))

        for ctx in contexts.values():
            ctx.close()
        browser.close()

    # --- Summary -----------------------------------------------------------
    total = len(results)
    passed = sum(1 for _, s, _ in results if s == "PASS")
    warned = sum(1 for _, s, _ in results if s == "WARN")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    print("\n" + "=" * 60)
    print(f"ROLE x PAGE MATRIX: {passed} PASS / {warned} WARN / {failed} FAIL  (total {total})")
    print("=" * 60)
    if failed:
        print("FAILURES:")
        for name, s, d in results:
            if s == "FAIL":
                print(f"  - {name}: {d}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
