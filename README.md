# POM Proof

POM Proof is a free, static [interview practice site](https://kingiko.github.io/pom-proof/) for QA, test automation, and SDET roles. It has graded exercises, interview questions with model answers, and study tracks by role.

## How practice is graded

| Kind | What the grader checks |
| --- | --- |
| Scenario, diagnosis, and bug report | The selections or order for each item against the published answer key. These exercises do not grade free text. |
| Test design | Whether the submitted test function or test rows pass on the original implementation and catch its faulty versions. |
| Locator | Whether the locator matches exactly the target elements in the original fixture and its variants. Some problems require CSS, XPath, or a Playwright-style locator. |
| SQL | Whether the query returns the expected results on the visible and hidden SQLite datasets. |
| Code | Whether a JavaScript, TypeScript, or Python function returns the expected result for each input. |

Grading runs in the browser. Answer keys and test inputs ship with the site, so results are for practice. Progress is stored in the browser. The first Python run downloads Pyodide. Locator practice uses Playwright-first examples, with Selenium covered in examples and reading. The site does not run Selenium or support Java submissions.

## How it looks

The site has one light theme: a dark ink header with four section links, a white title band on every page (breadcrumb, heading, one meta line, optional tabs), and flat white cards on a pale blue-grey canvas. Cobalt marks actions and links, and amber appears only in the header. Text is set in Figtree, self-hosted under the site's base path, with JetBrains Mono for code only.

The practice list is a column of problem rows beside a filter sidebar of checkbox groups. Several values in one group join with commas in the URL (`?kind=sql,code`), and single-value links such as `?kind=sql` still work. The question bank lists every question as a card that expands to show the answer, follow-up questions and the common trap. Each question also has its own page with a "Show answer" gate for recall practice.

Colours, type sizes, spacing and radii are tokens in `src/styles/tokens.css`. Shared components (buttons, inputs, chips, cards, filters, tabs, result panels, progress bars, callouts) are in `src/styles/components.css`.

## Design checks

`tests/ui/slop-guard.spec.ts` loads every page type, plus the result states and an expanded question card, and fails on:

- gradients, `backdrop-filter`, blur, text shadows, emoji, em dashes, and any SVG, image or background image
- a corner radius other than 0, 6px (buttons and inputs), 10px (`[data-card]` panels) or a pill (only on `[data-chip]` chips and progress tracks)
- any shadow except the one raised token on a dialog or on a filter bar marked `data-stuck` while it is stuck
- more than one visible filled primary button in a page state
- a focus ring that is missing, not 2px solid, or below 3:1 against what is behind it
- a Figtree face that did not load, a body font other than Figtree, or a font request outside `/pom-proof/`
- the first practice row or the first question card below the fold at 1440 by 900

Each rule has a planted violation in the same file that must be reported, so a rule that stops detecting fails the run. `tests/unit/tokens-contrast.test.ts` checks the palette tokens for WCAG AA contrast, and `tests/ui/a11y.spec.ts` runs axe on each page type.

## Run locally

Use Node 24.

```sh
npm ci
npm run dev
```

Open `http://localhost:4321/pom-proof/` to browse locally. To check the site, run:

```sh
npx playwright install chromium
npm run verify
```

`verify` checks types, builds the site, runs unit tests, and runs Chromium against the built site.

## Add a problem

1. Create `content/problems/<kind>/<id>.md`. Use an existing exercise of the same kind as a template. Give the problem a full-credit `reference` answer and a plausible weaker `decoy`. Use lowercase letters, digits, and hyphens for the ID, and keep it unique across kinds. If a locator prompt requires a format, set `syntax` to `css`, `xpath`, or `playwright` and write both answers in that format.
2. Create `content/editorials/<id>.md` with `problem: <kind>/<id>` in its frontmatter. Explain why the reference works, where the decoy fails, and what an interviewer looks for. Link to primary sources when explaining a tool or standard.

Run `npm run verify`. The solvable gate checks every problem in Chromium. A reference must score 1, a decoy must be graded and score below 1, and every listed alternate solution must score 1.

The project research is in [docs/RESEARCH.md](docs/RESEARCH.md).
