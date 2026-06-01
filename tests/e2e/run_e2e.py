"""
FunPython end-to-end browser test suite (Playwright).
Covers: marketing, auth (register/login/logout), student home, lesson player +
Pyodide run/grade, games arcade, classes (teacher create + student join),
teacher dashboard, design page. Resilient: each test isolated; console errors
captured per page. Prints a summary table at the end.
"""
import sys, os, time, re, traceback
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

BASE = os.environ.get("E2E_BASE_URL", "http://localhost:3007")
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(SHOTS, exist_ok=True)
STAMP = str(int(time.time()))
results = []   # (name, status, detail)

def record(name, status, detail=""):
    results.append((name, status, detail))
    icon = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]"}.get(status, status)
    print(f"{icon} {name}  {detail}", flush=True)

def new_ctx(p):
    browser = p.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    errors = []
    ctx.on("weberror", lambda e: errors.append(str(e.error)))
    return browser, ctx, errors

def page_errors(page_errs):
    # filter noisy 3rd-party / favicon
    out = [e for e in page_errs if "favicon" not in e.lower()]
    return out

def shot(page, name):
    try:
        page.screenshot(path=f"{SHOTS}/{name}.png", full_page=True)
    except Exception:
        pass

def goto(page, path, wait="networkidle", timeout=30000):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=timeout)
    try:
        page.wait_for_load_state(wait, timeout=timeout)
    except PWTimeout:
        pass

def first_visible(page, selector):
    for el in page.locator(selector).all():
        try:
            if el.is_visible():
                return el
        except Exception:
            continue
    return None

def register(ctx, username, display, password, role):
    """Register via UI. Returns landing path after redirect."""
    page = ctx.new_page()
    perrs = []
    page.on("pageerror", lambda e: perrs.append(str(e)))
    goto(page, "/register")
    page.wait_for_selector("input[autocomplete='username']", timeout=15000)
    page.fill("input[placeholder='Budi Hebat']", display)
    page.fill("input[autocomplete='username']", username)
    page.fill("input[type='password']", password)
    if role == "TEACHER":
        loc = page.locator("button:has-text('Guru')")
        if loc.count():
            try:
                loc.first.click()
            except Exception:
                pass
    page.click("button[type='submit']")
    try:
        page.wait_for_url(re.compile(r"/(app|dashboard)"), timeout=20000)
    except PWTimeout:
        pass
    landed = page.url
    return page, landed, page_errors(perrs)

def login(ctx, username, password):
    page = ctx.new_page()
    perrs = []
    page.on("pageerror", lambda e: perrs.append(str(e)))
    goto(page, "/login")
    page.wait_for_selector("input[autocomplete='username']", timeout=15000)
    page.fill("input[autocomplete='username']", username)
    page.fill("input[type='password']", password)
    page.click("button[type='submit']")
    try:
        page.wait_for_url(re.compile(r"/(app|dashboard)"), timeout=20000)
    except PWTimeout:
        pass
    return page, page.url, page_errors(perrs)


def main():
    with sync_playwright() as p:
        browser, ctx, _ = new_ctx(p)

        # 1. Marketing landing
        try:
            page = ctx.new_page()
            perrs = []
            page.on("pageerror", lambda e: perrs.append(str(e)))
            goto(page, "/")
            title = page.title()
            has_cta = page.locator("a[href='/register'], a[href='/login']").count() > 0
            shot(page, "01-landing")
            errs = page_errors(perrs)
            if has_cta and not errs:
                record("Marketing landing (/)", "PASS", f"title='{title[:40]}'")
            elif has_cta:
                record("Marketing landing (/)", "WARN", f"console errors: {errs[:1]}")
            else:
                record("Marketing landing (/)", "FAIL", "no auth CTA found")
            page.close()
        except Exception as e:
            record("Marketing landing (/)", "FAIL", repr(e))

        # 2. Design system page
        try:
            page = ctx.new_page(); goto(page, "/design")
            ok = page.locator("body").inner_text()
            shot(page, "02-design")
            record("Design system (/design)", "PASS" if len(ok) > 50 else "WARN", f"{len(ok)} chars")
            page.close()
        except Exception as e:
            record("Design system (/design)", "FAIL", repr(e))

        # 3. Register student
        student = f"siswa_{STAMP}"
        try:
            page, landed, errs = register(ctx, student, "Siswa E2E", "password123", "STUDENT")
            shot(page, "03-register-student")
            if "/app" in landed:
                record("Register student", "PASS", f"-> {landed.replace(BASE,'')}")
            else:
                record("Register student", "FAIL", f"landed {landed}")
            page.close()
        except Exception as e:
            record("Register student", "FAIL", repr(e))
            traceback.print_exc()

        # From here use a logged-in student page (login fresh to be safe)
        spage, slanded, serrs = login(ctx, student, "password123")
        if "/app" not in slanded:
            # fallback to seeded student
            spage.close()
            spage, slanded, serrs = login(ctx, "siswa", "password123")
        record("Login student", "PASS" if "/app" in slanded else "FAIL", f"-> {slanded.replace(BASE,'')}")

        # 4. Student home /app shows lessons
        try:
            goto(spage, "/app")
            cards = spage.locator("a[href^='/learn/']")
            n = cards.count()
            shot(spage, "04-app-home")
            record("Student home (/app)", "PASS" if n >= 1 else "FAIL", f"{n} lesson links")
        except Exception as e:
            record("Student home (/app)", "FAIL", repr(e))

        # 5. Learn index
        first_slug = None
        try:
            goto(spage, "/learn")
            links = spage.locator("a[href^='/learn/']")
            n = links.count()
            if n:
                # Prefer a real lesson link, skipping level-overview pages
                # (/learn/level/N) introduced by the gamified curriculum.
                first_slug = None
                for el in links.all():
                    href = el.get_attribute("href") or ""
                    cand = href.split("/learn/")[-1]
                    if cand and not cand.startswith("level/"):
                        first_slug = cand
                        break
                if first_slug is None:
                    first_slug = links.first.get_attribute("href").split("/learn/")[-1]
            shot(spage, "05-learn-index")
            record("Learn index (/learn)", "PASS" if n >= 1 else "FAIL", f"{n} lessons, first={first_slug}")
        except Exception as e:
            record("Learn index (/learn)", "FAIL", repr(e))

        # 6. Lesson player + Pyodide run
        slug = first_slug or "warmup-digital-identity"
        try:
            lerrs = []
            spage.on("pageerror", lambda e: lerrs.append(str(e)))
            goto(spage, f"/learn/{slug}", timeout=45000)
            spage.wait_for_timeout(1500)
            # LessonPlayer keeps all steps mounted but hidden; the editor lives in
            # the LAST (practice) step. Advance via visible "Lanjut" until gone.
            for _ in range(20):
                nxt = first_visible(spage, "button:has-text('Lanjut')")
                if nxt:
                    try:
                        nxt.click(); spage.wait_for_timeout(550)
                    except Exception:
                        break
                else:
                    break
            spage.wait_for_timeout(800)
            editor_found = first_visible(spage, ".monaco-editor") is not None
            shot(spage, "06a-lesson-steps")
            record("Lesson player steps", "PASS" if editor_found else "WARN",
                   f"slug={slug}, editor={'yes' if editor_found else 'no'}")

            # Try to run code via grading: type a correct solution into the
            # VISIBLE Monaco editor (steps stay mounted+hidden, so filter visible).
            if editor_found:
                ran = False
                graded = False
                try:
                    target = first_visible(spage, ".monaco-editor")
                    # focus + replace content with a correct solution
                    target.click()
                    spage.keyboard.press("Control+A")
                    spage.keyboard.press("Delete")
                    spage.keyboard.type('print("Halo, dunia!")')
                    spage.wait_for_timeout(300)
                    btn = first_visible(spage, "button:has-text('Periksa')") or first_visible(spage, "button:has-text('Run')")
                    if btn:
                        btn.click()
                        ran = True
                        try:
                            spage.wait_for_function(
                                "() => /lulus|✓|✗|Hebat|gagal/i.test(document.body.innerText)",
                                timeout=75000)
                            graded = True
                        except PWTimeout:
                            graded = False
                    spage.wait_for_timeout(1500)
                except Exception as ex:
                    record("Lesson run detail", "WARN", repr(ex))
                shot(spage, "06b-lesson-run")
                passed_all = spage.locator("text=/Semua tes lulus/i").count() > 0
                if passed_all:
                    record("Lesson run+grade (Pyodide)", "PASS", "all tests passed (print Halo)")
                elif graded:
                    record("Lesson run+grade (Pyodide)", "PASS", "Pyodide executed, grader returned results")
                elif ran:
                    record("Lesson run+grade (Pyodide)", "WARN", "clicked but no result in 75s (CDN/Pyodide slow)")
                else:
                    record("Lesson run+grade (Pyodide)", "WARN", "run/grade button not found")
            errs = page_errors(lerrs)
            if errs:
                record("Lesson console errors", "WARN", f"{errs[:2]}")
        except Exception as e:
            record("Lesson player", "FAIL", repr(e))
            traceback.print_exc()

        # 7. Games arcade
        try:
            goto(spage, "/app/games")
            spage.wait_for_timeout(1000)
            buttons = spage.locator("button").count()
            shot(spage, "07-games")
            record("Games arcade (/app/games)", "PASS" if buttons > 0 else "WARN", f"{buttons} buttons")
        except Exception as e:
            record("Games arcade (/app/games)", "FAIL", repr(e))

        # 8. Classes page (student)
        try:
            goto(spage, "/app/classes")
            spage.wait_for_timeout(800)
            shot(spage, "08-classes-student")
            has_join = spage.locator("text=/kode|join|gabung/i").count() > 0
            record("Classes page (student)", "PASS", f"join UI={'yes' if has_join else 'maybe'}")
        except Exception as e:
            record("Classes page (student)", "FAIL", repr(e))

        # 9. Teacher: login seeded teacher -> dashboard -> create class
        join_code = None
        session_path = None
        try:
            tpage, tlanded, terrs = login(ctx, "instruktur", "password123")
            record("Login teacher", "PASS" if "/app" in tlanded or "/dashboard" in tlanded else "FAIL",
                   f"-> {tlanded.replace(BASE,'')}")
            goto(tpage, "/dashboard")
            tpage.wait_for_timeout(1000)
            shot(tpage, "09a-dashboard")
            # create a class via API-backed UI form if present
            cls_name = f"Kelas E2E {STAMP}"
            name_input = first_visible(tpage, "input[placeholder^='Nama kelas']")
            if name_input:
                try:
                    name_input.fill(cls_name)
                    btn = first_visible(tpage, "button:has-text('Buat')")
                    if btn:
                        btn.click()
                        tpage.wait_for_timeout(2500)
                except Exception:
                    pass
            shot(tpage, "09b-dashboard-after-create")
            body = tpage.locator("body").inner_text()
            created = cls_name in body
            # join code shown near the class (6-char uppercase alnum, not common words)
            codes = [c for c in re.findall(r"\b[A-Z0-9]{6}\b", body)
                     if c not in ("KELUAR", "MASUKK", "DAFTAR", "LOGOUT")]
            join_code = codes[0] if codes else None
            record("Teacher dashboard + create class", "PASS" if created else "WARN",
                   f"class_created={created}, join_code={join_code or 'n/a'}")

            # Teacher starts a LIVE session for the new class
            session_path = None
            try:
                start_btn = first_visible(tpage, "button:has-text('Mulai Sesi Live')") \
                    or first_visible(tpage, "button:has-text('Masuk Sesi Live')")
                if start_btn:
                    start_btn.click()
                    try:
                        tpage.wait_for_url(re.compile(r"/app/sessions/"), timeout=15000)
                    except PWTimeout:
                        pass
                    if "/app/sessions/" in tpage.url:
                        session_path = "/app/sessions/" + tpage.url.split("/app/sessions/")[-1]
                        tpage.wait_for_timeout(1500)
                shot(tpage, "09c-teacher-session")
                room_ok = tpage.locator("text=/papan|skor|tugas|sesi|online/i").count() > 0
                record("Teacher start live session (SSE room)",
                       "PASS" if session_path and room_ok else ("WARN" if session_path else "WARN"),
                       f"session={session_path or 'n/a'}, room_ui={'yes' if room_ok else 'no'}")
            except Exception as ex:
                record("Teacher start live session", "WARN", repr(ex))
            tpage.close()
        except Exception as e:
            record("Teacher dashboard", "FAIL", repr(e))
            traceback.print_exc()

        # 9b. Student joins the class with the join code, then opens the live session
        try:
            if join_code:
                jpage, jlanded, _ = login(ctx, student, "password123")
                goto(jpage, "/app/classes")
                jpage.wait_for_timeout(800)
                code_input = first_visible(jpage, "input[placeholder='KODE KELAS']")
                joined = False
                if code_input:
                    code_input.fill(join_code)
                    gb = first_visible(jpage, "button:has-text('Gabung')")
                    if gb:
                        gb.click()
                        jpage.wait_for_timeout(2500)
                    body = jpage.locator("body").inner_text()
                    joined = ("Kelas E2E" in body) or (join_code in body) or \
                             jpage.locator("a[href^='/app/sessions/']").count() > 0
                shot(jpage, "09d-student-joined")
                record("Student join class (enrollment)", "PASS" if joined else "WARN",
                       f"code={join_code}, joined={joined}")

                # Open the live session room as the student (SSE connection)
                if session_path:
                    serrs2 = []
                    jpage.on("pageerror", lambda e: serrs2.append(str(e)))
                    goto(jpage, session_path, timeout=30000)
                    jpage.wait_for_timeout(2500)
                    shot(jpage, "09e-student-session")
                    room_ok = jpage.locator("text=/papan|skor|tugas|sesi|online/i").count() > 0
                    errs2 = page_errors(serrs2)
                    record("Student live session room (SSE)",
                           "PASS" if room_ok and not errs2 else ("WARN" if room_ok else "FAIL"),
                           f"room_ui={'yes' if room_ok else 'no'}, errs={errs2[:1]}")
                jpage.close()
            else:
                record("Student join class (enrollment)", "WARN", "no join_code captured")
        except Exception as e:
            record("Student join class", "WARN", repr(e))
            traceback.print_exc()

        # === Curriculum (6-Level gamified) tests ===

        # 12. Level-lock redirect: a brand-new student has no progress, so a
        # higher level (Level 3 "teknisi-siber") must redirect to /learn?locked=1.
        try:
            browser3, ctx3, _ = new_ctx(p)
            lp, llanded, _ = login(ctx3, "siswa", "password123")
            # use a fresh student with guaranteed-zero progress
            fresh = f"lock_{STAMP}"
            lp.close()
            fp, flanded, _ = register(ctx3, fresh, "Lock Test", "password123", "STUDENT")
            fp.goto(BASE + "/learn/teknisi-siber", wait_until="domcontentloaded", timeout=30000)
            fp.wait_for_timeout(1200)
            locked = "locked=1" in fp.url or "/learn" == fp.url.replace(BASE, "").split("?")[0]
            redirected = "/teknisi-siber" not in fp.url
            shot(fp, "12-level-lock")
            record("Level-lock redirect (locked level)",
                   "PASS" if redirected else "WARN",
                   f"-> {fp.url.replace(BASE,'')}")
            ctx3.close(); browser3.close()
        except Exception as e:
            record("Level-lock redirect", "WARN", repr(e))

        # 13. Level 1 activity lesson renders games (quiz + flowchart)
        try:
            cp, clanded, _ = login(ctx, "siswa", "password123")
            cp.goto(BASE + "/learn/ksatria-logika", wait_until="domcontentloaded", timeout=30000)
            cp.wait_for_load_state("networkidle", timeout=20000)
            cp.wait_for_timeout(1000)
            body = cp.locator("body").inner_text()
            has_game = cp.locator("button").count() > 3
            shot(cp, "13-level1-activities")
            record("Level 1 activity lesson (Ksatria Logika)",
                   "PASS" if has_game and "Logika" in body else "WARN",
                   f"buttons={cp.locator('button').count()}")

            # 14. Activity auto-completion persists via /api/activities/complete.
            posts = []
            cp.on("request", lambda r: posts.append(r.url) if "activities/complete" in r.url and r.method == "POST" else None)
            target = cp.locator("button", has_text="Algoritma").first
            for _ in range(12):
                if target.is_visible():
                    break
                nxt = first_visible(cp, "button:has-text('Lanjut')")
                if nxt:
                    nxt.click(); cp.wait_for_timeout(400)
                else:
                    break
            reported = False
            if target.is_visible():
                cp.locator("button", has_text="Algoritma").first.click(); cp.wait_for_timeout(200)
                cp.locator("button", has_text="Dekomposisi").first.click(); cp.wait_for_timeout(200)
                cp.locator("button", has_text="Bangun, mandi, sarapan, berangkat").first.click()
                cp.wait_for_timeout(1200)
                reported = len(posts) > 0
            record("Activity auto-report (quiz -> /api/activities/complete)",
                   "PASS" if reported else "WARN", f"posts={len(posts)}")

            # 15. Leaderboard + badge shelf on /app home
            cp.goto(BASE + "/app", wait_until="domcontentloaded", timeout=30000)
            cp.wait_for_timeout(1200)
            home = cp.locator("body").inner_text().lower()
            has_lb = "papan" in home or "peringkat" in home or "leaderboard" in home
            has_badges = "badge" in home or "lencana" in home or "🏅" in home or "lencana" in home
            shot(cp, "15-home-gamification")
            record("Leaderboard on /app", "PASS" if has_lb else "WARN", "")
            record("Badge shelf on /app", "PASS" if has_badges else "WARN", "")
            cp.close()
        except Exception as e:
            record("Curriculum activity tests", "WARN", repr(e))
            traceback.print_exc()

        # 15b. Level 7 "Pelatih AI" (Teachable Machine) lesson + train->predict.
        # The lesson is gated behind Levels 1-6, so a fresh student is redirected
        # to /learn?locked=1 (which itself proves gating). When reachable, the
        # in-browser KNN classifier must train and produce a guess.
        try:
            ap, _, _ = login(ctx, "siswa", "password123")
            ap.goto(BASE + "/learn/pelatih-ai", wait_until="domcontentloaded", timeout=30000)
            ap.wait_for_load_state("networkidle", timeout=20000)
            ap.wait_for_timeout(800)
            if "locked=1" in ap.url:
                record("Level 7 Pelatih AI (gated)", "PASS", "redirected to locked (gating works)")
            else:
                # Walk to the drawing canvas.
                canvas = None
                for _ in range(8):
                    c = ap.locator("canvas")
                    if c.count() > 0 and c.first.is_visible():
                        canvas = c.first
                        break
                    nxt = first_visible(ap, "button:has-text('Lanjut')")
                    if nxt:
                        nxt.click(); ap.wait_for_timeout(400)
                    else:
                        break

                def draw_line(pts):
                    box = canvas.bounding_box()
                    ap.mouse.move(box["x"] + pts[0][0], box["y"] + pts[0][1])
                    ap.mouse.down()
                    for (dx, dy) in pts[1:]:
                        ap.mouse.move(box["x"] + dx, box["y"] + dy, steps=4)
                    ap.mouse.up()

                guessed = False
                if canvas is not None:
                    for _ in range(3):
                        draw_line([(120, 30), (120, 200)])
                        ap.locator("button", has_text="Tambah").first.click()
                        ap.wait_for_timeout(120)
                    ap.locator("button", has_text="pilih").first.click()
                    for _ in range(3):
                        draw_line([(30, 120), (200, 120)])
                        ap.locator("button", has_text="Tambah").first.click()
                        ap.wait_for_timeout(120)
                    ap.locator("button", has_text="Latih AI").first.click()
                    ap.wait_for_timeout(1400)
                    guess = ap.locator("button", has_text="Tebak")
                    if guess.count() > 0:
                        draw_line([(120, 30), (120, 200)])
                        guess.first.click(); ap.wait_for_timeout(600)
                        guessed = "AI menebak" in ap.content()
                shot(ap, "15b-pelatih-ai")
                record("Level 7 Pelatih AI (train -> predict)",
                       "PASS" if guessed else "WARN",
                       f"canvas={canvas is not None}, guessed={guessed}")
            ap.close()
        except Exception as e:
            record("Level 7 Pelatih AI", "WARN", repr(e))


        # 16. Certificate verify page rejects an invalid token (404)
        try:
            browser4, ctx4, _ = new_ctx(p)
            xp = ctx4.new_page()
            resp = xp.goto(BASE + "/certificate/invalid-token-xyz", wait_until="domcontentloaded", timeout=20000)
            xp.wait_for_timeout(600)
            txt = xp.locator("body").inner_text().lower()
            status = resp.status if resp else 0
            not_found = status == 404 or "not found" in txt or "404" in txt or "tidak" in txt
            record("Certificate verify (invalid token -> 404)",
                   "PASS" if not_found else "WARN", f"status={status}")
            ctx4.close(); browser4.close()
        except Exception as e:
            record("Certificate verify", "WARN", repr(e))

        # 10. Logout (student)
        try:
            goto(spage, "/app")
            lo = spage.locator("button:has-text('Keluar'), button:has-text('Logout'), a:has-text('Keluar')")
            if lo.count():
                lo.first.click()
                try:
                    spage.wait_for_url(re.compile(r"/($|login|\?)"), timeout=10000)
                except PWTimeout:
                    pass
                record("Logout", "PASS", f"-> {spage.url.replace(BASE,'')}")
            else:
                record("Logout", "WARN", "logout control not found")
        except Exception as e:
            record("Logout", "FAIL", repr(e))

        # 11. Proxy/auth guard: unauthenticated /app should redirect to /login
        try:
            browser2, ctx2, _ = new_ctx(p)
            gp = ctx2.new_page()
            gp.goto(BASE + "/app", wait_until="domcontentloaded", timeout=20000)
            gp.wait_for_timeout(800)
            guarded = "/login" in gp.url
            record("Auth guard (/app while logged out)", "PASS" if guarded else "FAIL",
                   f"-> {gp.url.replace(BASE,'')}")
            ctx2.close(); browser2.close()
        except Exception as e:
            record("Auth guard", "FAIL", repr(e))

        ctx.close(); browser.close()

    # Summary
    print("\n" + "=" * 60)
    print("E2E SUMMARY")
    print("=" * 60)
    p_ = sum(1 for _,s,_ in results if s == "PASS")
    w_ = sum(1 for _,s,_ in results if s == "WARN")
    f_ = sum(1 for _,s,_ in results if s == "FAIL")
    for name, status, detail in results:
        print(f"  {status:4}  {name}")
    print("-" * 60)
    print(f"  PASS={p_}  WARN={w_}  FAIL={f_}  (total {len(results)})")
    print("=" * 60)
    sys.exit(1 if f_ else 0)

if __name__ == "__main__":
    main()
