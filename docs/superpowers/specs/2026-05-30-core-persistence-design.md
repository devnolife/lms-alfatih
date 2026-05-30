# Core Persistence — Design Spec

**Date:** 2026-05-30
**Status:** Draft (awaiting user review)
**Topic:** Persist student progress — real XP, lesson progress, and challenge submissions.

---

## 1. Problem & Motivation

FunPython looks like a working LMS, but the most important loop — a student
solving a challenge and *keeping* their reward — is not real yet.

Verified facts from the codebase:

- **Grading is 100% client-side.** `LessonEditor.tsx` → `gradeChallenge()` runs
  the student's code in Pyodide (browser Web Worker) and compares
  stdout/assertions. There is no server involvement.
- **XP is ephemeral.** On a pass, `LessonEditor` calls `awardXp()` from
  `RewardProvider`, which is explicitly documented as *"XP earned this session,
  NOT saved to the account."* Refresh the page and it's gone.
- **No submission/progress is persisted.** The only API routes are
  `/api/auth/{login,register,logout}`. There is no `/api/submissions`.
- **The header shows real DB values that never change.** The `/app` shell reads
  `User.xp` and `User.lives` via `getCurrentUser()`; these only ever reflect the
  seed/default values because nothing writes to them.
- **The schema is already designed for this.** `Submission`, `LessonProgress`,
  `Badge`/`UserBadge`, and `Certificate` all exist in `prisma/schema.prisma`.
- **Content lives in markdown, not the DB.** `prisma/seed.ts` seeds only 3 user
  accounts. Lessons and challenges are parsed at runtime from
  `content/lessons/*.md` by `src/lib/content.ts`. Challenge IDs come from
  markdown frontmatter (`ChallengeSpec.id`). The `Lesson` and `Challenge` tables
  are currently empty, so `Submission.challengeId` / `LessonProgress.lessonSlug`
  foreign keys have nothing to point at.

**Goal of this spec:** make a solved challenge durably award XP to the account,
record the submission for teacher review, and advance lesson progress — within
the existing schema and design language.

**Non-goals (v1):** lives mechanics, badges, certificates, teacher dashboard,
leaderboards, server-side re-grading. These are described as future phases in
§8 but are explicitly out of scope here.

---

## 2. Approaches Considered

**A. Content→DB sync + Submission FK (RECOMMENDED).**
Upsert `Lesson` and `Challenge` rows from the markdown content so the existing
foreign keys resolve, then persist submissions/progress against real rows.
- *Pros:* Keeps the schema as designed; gives referential integrity, reliable
  completion logic, and clean teacher/admin queries later.
- *Cons:* Introduces a sync step and stale-content edge cases (renamed/removed
  challenge IDs) that must be handled deliberately.

**B. Decouple submissions from the Challenge FK.**
Drop the FK and store progress keyed by raw `lessonSlug` + challenge string id.
- *Pros:* No sync step.
- *Cons:* No referential integrity, weaker reporting, completion logic has to
  trust free-form strings. Worse long-term. Rejected.

**C. Server-side re-grading.**
Re-run the student's Python on the server to verify a pass before awarding XP.
- *Pros:* Trustworthy XP.
- *Cons:* Pyodide is browser-only here; a server Python sandbox is a large,
  separate project. Overkill for a kids' MVP. Deferred (see §6 trust model).

**Decision:** Approach **A**. It matches the schema's intent and unblocks every
future phase (dashboard, certificates) with trustworthy structural data.

---

## 3. Data Model Changes

Additions to `prisma/schema.prisma`:

```prisma
// Tracks the FIRST passing solve of a challenge per user. Existence of a row
// is the idempotency guard for awarding XP exactly once.
model ChallengeCompletion {
  userId      String
  challengeId String
  xpAwarded   Int      @default(0)
  completedAt DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@id([userId, challengeId]) // <-- award-once guard at the DB level
}
```

Add `active Boolean @default(true)` to both `Lesson` and `Challenge` so the
content sync can soft-deactivate rows that disappear from markdown instead of
hard-deleting them (preserves historical submissions and FK integrity).

Add the back-relations: `completions ChallengeCompletion[]` on `User` and
`Challenge`.

No other schema changes. `Submission`, `LessonProgress`, `User.xp` are reused
as-is. A Prisma migration will be generated for these additions.

---

## 4. Content → DB Sync

A new sync routine (added to `prisma/seed.ts`, also runnable standalone via
`npm run db:seed`) reads all lessons via `getAllLessons()` and upserts:

- For each lesson: `upsert Lesson { slug, title, summary, order, projectKey,
  active: true }`.
- For each challenge in the lesson: `upsert Challenge { id, lessonSlug, order,
  prompt, starterCode, tests, xpReward, active: true }`.
- After upserting, **deactivate** (`active = false`) any `Lesson`/`Challenge`
  rows whose IDs are no longer present in markdown. Never delete.

**Stable-ID contract (documented in `content/` README + frontmatter comment):**
frontmatter challenge `id`s are permanent. If a challenge changes meaning, author
a *new* id so old submissions don't satisfy a different exercise.

---

## 5. API: `POST /api/submissions`

**Auth:** `readSession()`; 401 if no session. Rate-limited via the existing
`rateLimit()` helper (e.g. `submit:{userId}` → 60 / 60s) to bound abuse and row
growth.

**Request body:** `{ challengeId: string, code: string, passed: boolean,
results: TestResult[] }`.
*Note:* the client does **not** send `lessonSlug` for authorization — the server
derives it from the challenge (see below). `passed`/`results` are accepted for UX
and audit but treated as untrusted (§6).

**Server logic (single Prisma `$transaction`):**

1. Load `Challenge` by `challengeId` (select `id, lessonSlug, xpReward, active`).
   404 if missing; 409 if `active === false`. **`lessonSlug` is taken from this
   row — any client-supplied slug is ignored.**
2. Validate payload shape and size (cap `code` length, ensure `results` is an
   array). 400 on violation.
3. Always `create` a `Submission` row (passing or failing) for teacher review.
4. If `passed === true`:
   a. Attempt `create ChallengeCompletion { userId, challengeId,
      xpAwarded: challenge.xpReward }`.
   b. On success (first solve) → `update User { xp: { increment:
      challenge.xpReward } }` and set `Submission.xpAwarded = challenge.xpReward`.
   c. On unique-constraint violation (already completed) → award nothing
      (idempotent). `Submission.xpAwarded = 0`.
5. Recompute `LessonProgress` for `challenge.lessonSlug`:
   - Count **distinct active challenges** in the lesson (`totalActive`).
   - Count distinct `ChallengeCompletion` rows for this user across those active
     challenges (`done`).
   - `status = COMPLETED` (set `completedAt`) iff `totalActive > 0 && done ===
     totalActive`; else `IN_PROGRESS`. Upsert the row.

**Response:** `{ xpAwarded: number, alreadyAwarded: boolean, totalXp: number,
lessonStatus: "IN_PROGRESS" | "COMPLETED" }`.

The award-once guarantee comes from the `@@id([userId, challengeId])` constraint
on `ChallengeCompletion`, so concurrent/double POSTs cannot double-award even
under a race — the second insert fails and is caught as "already awarded".

---

## 6. Trust Model (explicit limitation)

Because grading runs in the browser, a technically savvy user can POST
`passed: true` without solving. **v1 accepts this risk** for a kids' MVP rather
than building server-side Python execution.

Mitigations baked into the design so this stays contained:

- Every submission stores the actual `code`, enabling teacher audit.
- Rate limiting on the endpoint.
- **No irreversible/high-stakes artifacts are derived from this data in v1** —
  no certificates, no public leaderboards. Those wait until (optional) server
  verification exists. This is the key boundary: XP/progress are "client-verified"
  and must not silently become authoritative for credentials later.

This limitation is documented in the README's roadmap section.

---

## 7. Client Wiring

In `LessonEditor.tsx` `handleCheck()`, when `grade.passed` is true for the first
time this session (`!solved.has(activeIdx)`):

1. Keep the existing celebration + ephemeral `awardXp()` popup (instant feedback).
2. `POST /api/submissions` with `{ challengeId: active.id, code, passed: true,
   results }`. (Also fire-and-persist failing checks if cheap, but the priority
   is persisting passes.)
3. On a response with `xpAwarded > 0`, call `router.refresh()` so the `/app`
   shell header re-reads `getCurrentUser()` and shows the new total. (Within the
   lesson route the header isn't visible, but the value is correct on return to
   `/app`.)
4. Network failure is non-fatal: the UI still celebrates; we log and optionally
   show a subtle "progress belum tersimpan" hint. (Retry/offline queue is out of
   scope for v1.)

`getCurrentUser()` already surfaces real `User.xp`, so no header changes are
needed beyond ensuring a refresh occurs.

---

## 8. Future Phases (context only — NOT in this spec)

1. Lives mechanics (cooldown/reset, what counts as a failure) — deliberately
   deferred; risk of being punitive for kids learning syntax.
2. Badges & `UserBadge` awarding tied to milestones.
3. Teacher dashboard + classes (join codes, enrollment, progress monitoring),
   replacing the current placeholder.
4. Certificates — gated on a trustworthy verification story (see §6).
5. Optional server-side re-grading to make XP authoritative.
6. Automated tests (there are currently none in the repo).

---

## 9. Testing & Verification

- **Migration:** `prisma migrate dev` succeeds; `ChallengeCompletion` and the
  `active` columns exist.
- **Sync:** running `npm run db:seed` populates `Lesson`/`Challenge` from
  markdown; removing a challenge from markdown and re-running flips its `active`
  to false (no delete).
- **Award-once:** solving a challenge increments `User.xp` by exactly
  `xpReward`; solving the same challenge again (and a simulated double POST)
  awards 0 and creates no duplicate `ChallengeCompletion`.
- **Completion:** completing all active challenges in a lesson sets
  `LessonProgress.status = COMPLETED` with `completedAt`; partial completion is
  `IN_PROGRESS`.
- **Auth:** unauthenticated POST → 401; unknown/inactive challenge → 404/409.
- **End-to-end (Playwright):** register a user, solve a challenge, confirm XP in
  the `/app` header persists across a full page reload.
- **Lint/build:** `npm run lint` clean; `npm run build` succeeds.

---

## 10. Open Questions for the User

1. Should failing checks also be persisted as `Submission` rows (richer teacher
   audit, more rows), or only passing solves? *Default: persist both, rate-limited.*
2. Confirm lives stay out of v1.
3. Confirm the accepted client-trust limitation (§6) is acceptable for now.
