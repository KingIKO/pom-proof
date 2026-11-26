# Research behind POM Proof

Collected on 2026-11-26 by three research passes: a teardown of two seed sites, a survey of about 40 competing products, and a review of what QA and SDET interviews contain plus what can run in a browser without a server. Figures marked as estimates are estimates. Everything else was read on the cited page that day.

## Seed sites

[practiceqaautomation.com](https://www.practiceqaautomation.com/interview) pairs a 502-question bank (320 theory, 124 coding, 58 behavioural) with 52 element challenges, 34 mock apps, 37 graded SQL exercises and seeded-bug hunts whose answers are revealed on the page. Theory is read and reveal. Automation code is run on your own machine and marked done by ticking a box.

[qaladder.org](https://qaladder.org/) has 227 questions in six banks with the best answer format we found: a one-line answer, a fuller answer, an example, follow-ups and "the trap". It grades 27 Python functions in the browser and runs a locator lab. Its terms forbid bulk reuse, so all POM Proof content is written fresh.

Neither site grades automation code, test design, bug reports or spoken answers.

## Competitors

The closest free product is [SDETRole](https://sdetrole.com), which already grades test design by mutation, runs a timed locator gym, scores a bug hunt and offers SQL on in-browser SQLite. [TargetQA](https://targetqa.com) runs Playwright tasks in cloud browsers behind a subscription. Question banks are a commodity (900+ at qa.codes, 1,500+ in GitHub lists), and free graded sets are small.

Gaps no fetched product filled well:

- "How would you test X" graded against a published key instead of an AI judge
- bug report quality (steps, expected versus actual, severity)
- diagnosing a failing or flaky test from its code and log
- reviewing test code in a pull request
- prioritising tests under a budget
- API test design graded against buggy APIs on a free site
- one readiness view across round types
- editorials that explain why one answer beats another

## What interviews contain

From 14 first-person reports (2022 to 2026) and interviewer guides, with the frequency figures as estimates from that small sample:

| Round | Weight |
|---|---|
| Easy, tester-flavoured coding (strings, arrays, maps, parsing) | High for automation and SDET |
| Test design on a real feature (login, cart, upload) | High for every role |
| Locators, waits, flaky tests, page objects | High for automation and SDET |
| Behavioural (STAR) | High, heaviest for senior roles |
| SQL (joins, GROUP BY, duplicates, second highest salary) | Medium to high |
| API testing (status codes, auth, negative cases) | Medium |
| CI/CD, Docker, Git | Medium for SDET |
| Performance, mobile, security | Low |

Tool demand from job postings in late 2026 (PassRidge, QA Job Board, OffWreck, IT Jobs Watch): Playwright appears in 53 to 60 percent of automation postings, Selenium in 49 to 52 percent, Cypress in 27 to 34 percent, and about half of postings name two or more. Python and Java lead language demand, with JavaScript and TypeScript strongest in SDET roles. POM Proof teaches Playwright first, keeps Selenium as a second dialect, and offers JavaScript, TypeScript and Python for coding.

Practitioners advise against "test a pen" questions and use real features, so scenarios here are real features.

Strong candidates ask clarifying questions first, group cases into functional and non-functional, investigate flakiness instead of adding sleeps, and put numbers on their work.

## In-browser execution

| Need | Choice | Why |
|---|---|---|
| JavaScript and TypeScript | Web Worker, sucrase to strip types | Worker termination stops runaway loops; TypeScript 7 has no in-browser transpile API |
| Python | Pyodide 314.0.8 from jsDelivr, loaded on first use | About 6 MB, so it never loads unless a Python problem runs |
| SQL | sql.js 1.17.0 | In-memory SQLite, about 340 KB of WebAssembly |
| Locators | Native `querySelectorAll` and `document.evaluate`, plus a small Playwright-style engine | No dependency, grading compares element sets |
| API tests | A handler-based fake `request` fixture modelled on Playwright's APIRequestContext | No service worker needed |

No cross-origin isolation headers are needed, so any static host works. GitHub Pages' terms rule out commercial use; move to a paid host if the site ever earns money.
