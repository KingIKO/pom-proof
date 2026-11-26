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
