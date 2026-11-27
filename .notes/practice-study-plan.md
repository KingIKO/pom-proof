# Practice context, Practice sets and Study: plan

Owner's requests (2026-11-27, condensed):
1. "When I click a question, work on it, and go back to Practice, the state is never saved, so I have to refilter."
2. "I can't build my own practice curriculum. I'm focused on Playwright, so I keep filtering to Playwright. I should be able to build my own, say Playwright plus another thing, and everything moves to that, so when I click Next it goes to the next question in that curriculum."
3. A Study section: "proper information on all things QA... best practices, framework designs, data handling, how to set up a test, page object models, fixtures... digestible chunks... explain what data-driven development is, how to implement it, why it's good, why it's not... organization is going to be huge, I don't want to be overwhelmed... a lot more will be added."

Owner defaults accepted: all 31 core Study pages, landing module by module; opening a problem from a Track does not change Next in v1; header order Practice, Study, Questions, Tracks, Progress.

Research behind this plan (iko-scout, 2026-11-27): `C:\Users\Owner\AppData\Local\Temp\opencode\study-ux\notes.md` (navigation and organisation, with screenshots) and `C:\Users\Owner\AppData\Local\Temp\opencode\study-research\topic-map.json` plus `brief.md` (Study topic map). Key facts: browser Back already restores Practice filters and scroll; the in-app "Back to practice" link, the header Practice link and Previous/Next ignore filters (Previous/Next are build-time neighbours in the full catalog order, `src/pages/practice/[kind]/[id].astro`). `PracticeList.tsx` writes filters to the URL with `replaceState`. The Questions section already carries filter params on links and keeps an ordered id list in sessionStorage (`src/components/questions/questions.ts`): reuse that pattern.

Design system: `.notes/redesign-plan.md` (palette A, Figtree, title band, cards, one filled primary per view, radius by role, no icons, emoji or gradients; the slop guard in `tests/ui/slop-guard.spec.ts` enforces it). All new learner-facing text follows `.notes/plain-language-rules.md`; the plain-language check in `tests/content/plain-language.test.ts` is enforced on all of `content/` and `src/`.

## 1. Practice navigation fix (PR 1)

The URL stays the source of truth for filters. A stored context only feeds links.

New file `src/lib/practice-context.ts`, used by the list island and the workspace script.
- sessionStorage key `pom-proof:practice-context` holds `{ v: 1, query, label, items: [id, title][] }`. Per tab, so two tabs can hold different lists.
- `PracticeList.tsx` writes it whenever the visible rows change (beside `applyFilters`), in displayed order, and fires a `pomproof:practice-context` event.
- Each row gets `id="row-<kind>-<slug>"`. On load, the island scrolls a row named in the URL hash to the centre and marks it.

Workspace page (`src/pages/practice/[kind]/[id].astro`) reads the context at runtime:
- If the current id is in `items`, rewrite `a[rel=prev]` and `a[rel=next]` to the list neighbours; add or hide a side as needed.
- A new line in `nav.practice-neighbors` reads `Playwright, API: 21 of 33` and links back to the list.
- `a.practice-return` and the `Practice` breadcrumb get `/?<query>#row-<id>`. The text becomes `Back to Playwright, API`. With no filters it stays `Back to practice` (tests `smoke.spec.ts` and `flows.spec.ts` rely on it).
- `Base.astro` marks the header Practice link `data-practice-home`; a small script gives it the stored query. The brand link stays bare as the way to reach all problems.

Label rule: topic labels first, then kind, difficulty, role and status, comma-joined. More than two values become the first two plus `and 2 more`. Search alone reads `Search “login”`.

Continue: `PracticeProgress` listens for the event and picks the next unsolved problem inside the current view.

Fallbacks: no storage, a malformed value, or an id outside the list: the page stays as built (catalog order, bare links).

Tests: `tests/unit/practice-context.test.ts` (label rule, neighbours, malformed storage); `tests/e2e/practice-context.spec.ts` (filter by two topics, open row 2, see `2 of N`, Next opens row 3; Back restores the query, the checked boxes and the row in the viewport; the header link keeps the query; a fresh visit shows catalog neighbours; blocked sessionStorage still works; the last row has no Next).

## 2. Practice sets (PR 2, after PR 1)

A set is a saved filter (name plus query). Problem ids are recomputed on each render, so new problems join on their own. No hand-picked lists in v1.

New file `src/lib/practice-sets.ts`. localStorage key `pom-proof:practice-sets` holds `{ version: 1, activeId, sets: [{ id, name, query, createdAt }] }`. One set is active at a time.

UI, a row above the filters inside `PracticeList.tsx`:
- A `<select>` labelled `Practice set` lists `All problems` and then each set.
- `Save as set` (outline) shows when filters are on and match no saved set. It opens an inline form with a `Set name` field, `Save set` and `Cancel`.
- With a set active and filters changed: `Update set` and `Save as new set`.
- `Rename` and `Delete` are text buttons. Delete confirms inline: `Delete "Playwright and API"? Your progress stays.` with `Delete set` and `Keep set`.
- Every control is outline or text, so Continue stays the one filled primary. A `role="status"` line says `Set saved.`

Behaviour:
- Choosing a set applies its query to the URL and stores `activeId`.
- A bare `/` visit with an active set applies it; the picker shows the name, so the restored filter is visible.
- `All problems` clears the filters and `activeId`.
- Next, Previous, the position line and the back link come from PR 1 with the set name as label: `Playwright and API: 21 of 33`, `Back to Playwright and API`.
- Continue opens the first unsolved problem in the set. When all are solved it is replaced by `Set complete.`

Tracks stay as they are (an ordered plan including questions). No conversion in v1.

Edge states: no matches shows the existing empty state plus the picker; duplicate name: `A set with this name exists. Choose another name.`; storage unavailable hides the row; reread on the `storage` event; unknown values in a saved query are dropped by `readFilters`; names trimmed, 1 to 40 characters.

Export and import: optional `sets` field, decoded the way `review` is in `src/lib/progress.ts`. Version stays 1; old files still import.

Tests: `tests/unit/practice-sets.test.ts` (decode, duplicate names, export round trip) and `tests/e2e/practice-sets.spec.ts` (save, reload, Next follows the set, rename, delete, import).

## 3. Study section (PR 3 shell and two pilot pages, beside PR 2)

Routes: `/study/`, `/study/<module>/`, `/study/<module>/<page>/`. Word slugs, so reordering never breaks a URL or a read mark.

Content:
- `content/study-modules/<module>.yaml`: `title`, `stage` (A to D), `order`, `summary`.
- `content/study/<module>/<page>.md`: frontmatter as in the example in section 4, plus optional `expertsDisagree: [{ question, positions: [{ view, holdsWhen, source }] }]` with at least two positions.
- `examples` reuses `exampleSchema` (`src/content.config.ts`); `CodeExamples.astro` only needs its props type widened.

Page template, top to bottom: title band with module breadcrumb and minutes, prerequisites, outcomes, body, example, "Use it when" and "Avoid it when", what changed (with the date checked), experts disagree, Practice this, sources, `Mark as read`, pager (Previous, Next, Module overview).
- "Practice this" links to `/?topic=a,b` with a build-time count (`Practice 6 problems`) and to `/questions/?topic=x`; omitted when no problem matches.
- `Mark as read` is the page's one filled primary. Once clicked: `Read on 27 Nov` with a `Mark as unread` text button.
- Read state: localStorage `pom-proof:study` as `{ version: 1, read: { "<module>/<page>": date } }`.

Landing: four stage headings, ten module cards (one-line summary, page count, minutes, pages read), one `Start here` link to the first unread page.
Module page: ordered page list with summary, minutes and read state.
Left nav: all modules listed, only the current one open. Narrow screens: one `<details>` above the content.
Header: five links, Practice, Study, Questions, Tracks, Progress. Changes the `section` union in `Base.astro` and the nav-count checks (`toHaveCount(4)`) in `foundation.spec.ts` and `links.spec.ts`. Check the header at 360px.

Launch scope: the 31 core pages, so every module has at least one page. Extended pages appear only when written; no placeholder pages. Adding a page later = one file with an `order` value.

## 4. Study authoring

Body: four headings in order `What it is`, `How it works`, `Why it helps`, `When not to use it`. 200 to 450 words outside code. `summary` at most 2 sentences. Each outcome 1 sentence, 2 to 4 per page. `minutes` = body words / 200 rounded up, plus 1 with an example. Original wording; sources only from the topic map (copied to `.notes/study/topic-map.json`).

Example page `content/study/framework-design/parameterised-tests.md` (topic map m4-c5):

````md
---
title: Parameterised and data-driven tests
module: framework-design
order: 5
level: extended
summary: Run one test body against a table of inputs and expected results. Use it when only the data changes.
minutes: 3
prerequisites: [test-design/equivalence-and-boundaries, automation-fundamentals/test-anatomy]
outcomes:
  - Tell when a table of rows is clearer than separate tests.
  - Write a parameterised test that names each row.
useWhen: [Boundary and partition tables, role matrices and locale sets.]
avoidWhen: [Rows that need different steps or different assertions.]
practiceTopics: [boundary-testing, equivalence-partitioning, decision-tables]
questionTopics: [test-design, framework-design]
examples:
  - title: Delivery fee at the free limit
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          const rows = [
            { name: 'just under the free limit', total: 49.99, fee: 4.99 },
            { name: 'exactly at the free limit', total: 50, fee: 0 },
          ];
          for (const { name, total, fee } of rows) {
            test(`delivery fee: ${name}`, () => {
              expect(deliveryFee(total)).toBe(fee);
            });
          }
      - lang: python
        label: pytest
        code: |
          @pytest.mark.parametrize("total, fee", [
              pytest.param(49.99, 4.99, id="just under the free limit"),
              pytest.param(50, 0, id="exactly at the free limit"),
          ])
          def test_delivery_fee(total, fee):
              assert delivery_fee(total) == fee
sources:
  - { label: "Playwright: Parameterize tests", url: "https://playwright.dev/docs/test-parameterize", type: primary }
  - { label: "pytest: How to parametrize", url: "https://docs.pytest.org/en/stable/how-to/parametrize.html", type: primary }
  - { label: "JUnit: Parameterized classes and tests", url: "https://docs.junit.org/current/writing-tests/parameterized-classes-and-tests.html", type: primary }
  - { label: "Gherkin reference", url: "https://cucumber.io/docs/gherkin/reference/", type: primary }
whatChanged:
  checked: 2026-11-27
  items:
    - JUnit 5 added `@ParameterizedClass`, which runs a whole test class once per row. Its documentation marks it experimental.
---
## What it is

A parameterised test runs the same steps once for each row of data. Each row holds the inputs and the expected result. A test whose rows come from a table or a file is also called a data-driven test.

## How it works

You write the test body once. You then list the rows beside it, and the test runner creates one test per row. Give each row a name that says what it covers. The report then shows "exactly at the free limit" instead of "row 2".

Each tool has its own syntax. Playwright Test builds the tests in a loop. pytest uses the `@pytest.mark.parametrize` decorator. JUnit 5 uses the `@ParameterizedTest` annotation. Gherkin uses a `Scenario Outline` with an `Examples` table.

## Why it helps

Adding a case means adding one row. A reviewer can read the table and see which boundaries the test covers. When one row fails, the runner reports that row by name.

## When not to use it

If a row needs different steps or a different assertion, write a separate test for it. An `if` inside the test body shows this problem. The body then describes more than one behaviour, and a reader must trace each row separately.
````

Validation in `tests/content/study.test.ts` (discovery in `tests/support/study.ts`): headings present and in order, word limits, `minutes` formula; prerequisites resolve with no cycles; each `practiceTopics` value matches at least one problem topic; at least one primary source per page and every URL appears in `.notes/study/topic-map.json`; plain-language check enforced on Study pages; `tests/content/examples.test.ts` parses Study snippets; `links.spec.ts` and `a11y.spec.ts` cover the new routes.

Writers (iko-bedrock, one per module) own only `content/study/<module>/**`. Accuracy review (iko-proof) against the cited sources: every page with `whatChanged` or `expertsDisagree` in full; every page whose topic-map `practice` has no named source in full (m10-c3, m8-c3, m7-c7); one page in two of the rest; one factual error extends the review to the whole module. The page objects page must give both sides on assertions inside page objects.

## 5. Build order

| PR | Change | Owner | Owns |
|---|---|---|---|
| 1 | Practice context | iko-flow | `practice-context.ts`, `PracticeList.tsx`, workspace page, `Base.astro`, new tests |
| 2 | Practice sets (after 1) | iko-flow | `practice-sets.ts`, `PracticeList.tsx`, `progress.ts`, `ProgressDashboard.tsx`, new tests |
| 3 | Study shell and 2 pilot pages (after 1, beside 2) | iko-flow | `Base.astro`, `content.config.ts`, `src/pages/study/**`, `src/components/study/**`, `CodeExamples.astro`, `tests/content/study.test.ts`, nav-count tests |
| 4 | Study progress line and export (after 2 and 3) | iko-flow | `progress.ts`, `ProgressDashboard.tsx`, `progress.spec.ts` |
| 5a-h | Study content per module (after 3) | iko-bedrock writes, iko-proof reviews | `content/study/<module>/**` |

Landing for each PR: `npm run verify`, PR to main as KingIKO, automatic Codex (Astra) review, fixes, merge, live check on GitHub Pages.

## 6. Risks and defaults

- Restored filters could surprise: only in-app links carry them, the picker and checked boxes show them, and the brand link always opens all problems.
- A set filtering on status shrinks as problems get solved, so positions shift: allowed.
- Five header links may wrap on phones: PR 3 checks 360px; fallback is letting the nav scroll sideways.
- Study text can go stale: `whatChanged.checked` shows on the page; a re-check is a content PR.
- Scout-synthesised claims may be wrong: full iko-proof review of those pages.
