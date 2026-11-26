# POM Proof

Graded practice for QA, automation and SDET interviews. Everything runs in the browser: no account, no server, progress stays in local storage.

## What you practise

| Kind | How it is graded |
|---|---|
| Test design | Partition and boundary coverage, correct expected results, planted bugs your rows catch |
| How would you test | Timed brainstorm, weighted key with keyword hints you confirm, then prioritising under a budget |
| Locators | CSS, XPath or Playwright-style locator must match exactly the target elements; brittle ones are flagged |
| UI automation | A Playwright-style test must pass on the working app and fail on each broken build |
| Unit and API tests | Your suite must pass on the real code and catch every planted bug (mutation score) |
| Failing tests | Root cause and fix for a failing or flaky test, from its code and log |
| Test code review | Flag the problem lines in a pull request of test code |
| Bug hunts | Bugs count only when you reproduced them in the app and filed a report in the right area |
| SQL | Result set compared with a reference query on realistic data |
| Coding | Visible and hidden cases in JavaScript, TypeScript or Python |

There is also a question bank with spaced review, a timed mock interview with a readiness view per area, and study plans per role.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/pom-proof/
npm run validate   # proves every reference answer, mutant and query in the content
npm run test:e2e   # Playwright smoke tests
npm run build
```

## Adding content

Each practice item is one file in `src/content/items/<kind>/<id>.ts` with a default export typed by `src/content/types.ts`. The registry picks it up automatically. Run `npm run validate` before committing; it fails when a reference solution does not pass, a mutant survives, or a locator example misses its target.

Questions live in `src/content/questions/<topic>.ts` and study plans in `src/content/tracks/<role>.ts`.

## Background

`docs/RESEARCH.md` summarises the research on competing sites, real interview loops and in-browser execution that shaped the product.

## Deployment

Pushes to `main` build and deploy to GitHub Pages through `.github/workflows/deploy.yml`.
