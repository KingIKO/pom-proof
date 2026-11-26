# Phase 2 shared brief (content and remaining features)

Repo: C:\Users\Owner\Desktop\_Projects\pom-proof, branch `phase-2`. Phases 0 and 1 are merged and live at https://kingiko.github.io/pom-proof/. Read `.notes/phase-1-brief.md` for the UI rules and `docs/DECISIONS.md` for engine decisions; both still apply.

## Rules for every Phase 2 agent

- Twelve agents work in this checkout at the same time. Edit ONLY the files your part owns. If you need a change elsewhere, put the exact proposed diff in your report. Do not commit, push, or change `package.json` / the lockfile.
- Never build into `dist/` and never use port 4405 (part 2H's Playwright config owns both). Build and preview your own copy:
  - `npx astro build --outDir .tmp/<part>-dist`
  - `npx astro preview --outDir .tmp/<part>-dist --port <your port>` (stop it when done; confirm the port is free)
- A builder elsewhere may leave the tree temporarily broken. If a build fails in a file you do not own, report it with the file and retry later; do not fix it.
- No em dashes, emoji, or exclamation marks anywhere in content or UI text. Do not use these words: delve, leverage, unlock, tapestry, realm, seamless, robust, pivotal, harness, empower, streamline, game-changer. Sentence case. Plain, specific, speakable prose.
- All content is ORIGINAL. Do not copy or paraphrase closely from practiceqaautomation.com, qaladder.org (its terms forbid reuse), LeetCode, or any other site. State tool facts only when you are sure, and cite official docs in editorials (Playwright https://playwright.dev/docs/..., Selenium https://www.selenium.dev/documentation/, MDN, ISTQB CTFL v4.0.1 https://www.istqb.org/certifications/certified-tester-foundation-level, OWASP, SQLite https://www.sqlite.org/lang.html).
- Scenarios and test-design problems use real features (login, password reset, cart, checkout, upload, search, payments, booking, notifications, permissions, settings, reports). Never "test a pen" or "test an elevator".
- Tool examples are Playwright first (TypeScript), with about a quarter in Selenium (Java or Python).
- Each problem's editorial (`content/editorials/<id>.md`, frontmatter `problem: <kind>/<id>`) explains why the strong answer beats the plausible weak one (the decoy), the trap, what an interviewer listens for, and links sources. 150 to 400 words.
- The `decoy` must be a plausible weak answer a real candidate would give (for example "added a wait", a positional selector, a query that fits only the visible rows), never a nonsense answer.
- Roles: `manual-qa`, `automation`, `sdet`, `senior` (new in Phase 2: senior and lead QA).
- Finished examples to match in shape and quality: the seven samples under `content/problems/**` and their editorials.

## Checking content (every content part)

Copy C:\Users\Owner\AppData\Local\Temp\opencode\live-solvable.mjs into `.tmp/` in the repo (so it resolves the repo's node_modules), build and preview your copy, then run
`node .tmp/live-solvable.mjs http://localhost:<port>/pom-proof/ . <your kinds comma-separated>`.
Every problem must print PASS (reference scores 1, decoy is graded and below 1, table-mode `rowsReference` scores 1 when present). For code problems also confirm each entry in `solutions` scores 1 (extend your copy of the script; see the code schema below). Paste the per-kind totals in your report.

## Ports

2A 4410 · 2B1 4411 · 2B2 4412 · 2C1 4413 · 2C2 4414 · 2D1 4415 · 2D2 4416 · 2E 4417 · 2F1 4418 · 2F2 4419 · 2G 4420 · 2H uses 4405 via playwright.config.ts.

## Shared decisions (fixed; owners implement them)

### Code problems: solutions in three languages (2A implements in `src/lib/problem-schema.ts`)

Code problems gain an optional `solutions: { js: source, ts: source, python: source }` field. All new code problems must include all three. `reference` stays a single `{ language, source }` (use the JS solution). Python function names are the snake_case form of `exportName` (for example `classifyRetries` becomes `classify_retries`); 2A's Python runner calls that name. Vectors are JSON, so Python receives lists, dicts, str, int, float, bool and None, and must return JSON-compatible values (tuples become lists).

### Questions (2E implements in `src/content.config.ts`)

`content/questions/<topic>/<id>.md`. Frontmatter:

```yaml
title: How do you decide what to automate first?   # the question as an interviewer asks it
topic: automation-strategy                          # one of the topic ids below
roles: [automation, sdet]
level: mid                                          # junior | mid | senior
type: concept                                       # concept | scenario | behavioral | tooling
oneLine: Automate stable, high-risk, frequently repeated checks at the lowest layer that can catch the bug.
looksFor:                                           # 3 to 5 things a strong answer contains
  - ...
trap: Saying "automate everything" or picking by what is easiest to script.
followUps:                                          # 1 to 3
  - question: What would you leave manual?
    answer: ...
sources:                                            # optional; required when the answer states tool or standard facts
  - label: Playwright best practices
    url: https://playwright.dev/docs/best-practices
```

The body (Markdown) is the fuller answer, 80 to 220 words, written as a strong candidate would say it, ending with a short `### Example` section drawn from realistic work.

Topic ids: `fundamentals`, `test-design`, `bug-reports`, `agile`, `automation-strategy`, `locators-waits`, `flaky-tests`, `playwright`, `selenium`, `api`, `ci-git-docker`, `behavioral`, `leadership`.

The existing sample `content/questions/playwright/independent-checkout-contexts.md` is migrated by 2E.

### Tracks (2E implements in `src/content.config.ts`; 2G writes the content and pages)

`content/tracks/<role>.yaml` with `title`, `role`, `summary` (one sentence), and `sections: [{ title, note?, problems: [reference('problems')], questions: [reference('questions')] }]` (each section has at least one problem or question). Four tracks: manual-qa, automation, sdet, senior.

### Review queue API (2E implements `src/lib/review.ts`; 2G imports it)

```ts
export type Rating = 'missed' | 'shaky' | 'solid';
export interface CardState { box: 0 | 1 | 2 | 3 | 4; due: string; seen: number; last: Rating }
export function rate(questionId: string, rating: Rating, now?: Date): CardState;
export function cardState(questionId: string): CardState | undefined;
export function dueIds(allIds: string[], now?: Date): string[];   // due first, then unseen
export function reviewSnapshot(): Record<string, CardState>;      // for export and readiness
```

Leitner intervals in days per box: 0, 1, 3, 7, 16; a missed card returns in 10 minutes. Storage key `pom-proof:review`, separate from progress. Progress export/import (1A's `src/lib/progress.ts`) should include review state: 2E proposes that diff to 1A's file in its report; the chief of staff applies it.

## Landing

When all parts report, the chief of staff runs `npm run verify`, commits each part, pushes `phase-2`, and opens a PR for the automatic Codex (Astra) review. Findings go back to the owning part.
