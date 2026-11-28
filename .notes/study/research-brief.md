# Study section topic map: research brief

Full map: `C:\Users\Owner\AppData\Local\Temp\opencode\study-research\topic-map.json`. It parses, holds 10 modules and 64 concept pages (31 marked core), and every concept has at least one primary source. All 135 unique source URLs returned HTTP 200 when re-fetched on 2026-11-27.

Decision this feeds (inferred from the handoff): which pages Study contains, in what order, and what each page is allowed to claim.

## Answer

Build Study as 10 modules in 4 stages and launch with the 31 core pages. Each page is one concept with four fixed parts, so nothing reads as a wall of text.

| Stage | Module | Pages | Core | Needs first |
|---|---|---|---|---|
| A. Foundations | 1. Testing foundations | 6 | 4 | nothing |
| A. Foundations | 2. Test design and manual testing | 7 | 3 | 1 |
| B. Automation craft | 3. Automation fundamentals | 8 | 8 | 1 |
| B. Automation craft | 4. Framework design | 7 | 3 | 3 |
| C. Tools | 5. Playwright with TypeScript | 8 | 5 | 3, 4 |
| C. Tools | 6. Selenium 4 with Java and Python | 6 | 2 | 3, 4 |
| C. Tools | 7. API, contract and database testing | 8 | 3 | 1, 3 |
| D. Scale and beyond | 8. CI and running at scale | 5 | 1 | 3, plus 5 or 6 |
| D. Scale and beyond | 9. Accessibility, performance and security | 5 | 1 | 1 |
| D. Scale and beyond | 10. AI-assisted testing | 4 | 1 | 5 |

Module 3 is tool-neutral on purpose. Locators, waits, assertions, isolation, flakiness and test doubles are taught once there, and modules 5 and 6 show the same ideas in each tool. That removes the largest source of repetition.

Page shape, matching the JSON fields: a one-line definition, the recommended practice, "use when" and "avoid when", and sources. Two optional boxes appear only where they apply: "what changed" (10 pages) and "experts disagree" (9 pages, pointing at 6 disputes).

The core and extended split is my judgement, not something a source prescribes (Inferred).

## Findings

### What changed recently

- Playwright user-facing locators arrived in v1.27 on 2022-10-07 (`getByRole`, `getByText`, `getByLabel`, `getByTestId`). Best practices now say to prefer user-facing attributes, and codegen picks role, text and test id locators first. Verified: https://playwright.dev/docs/release-notes, https://playwright.dev/docs/locators, https://playwright.dev/docs/codegen. The release date comes from the GitHub releases API.
- Playwright fixtures: the docs list fixtures as better than before/after hooks (setup and teardown together, reusable, on demand, composable) and recommend project dependencies over `globalSetup`. Verified: https://playwright.dev/docs/test-fixtures, https://playwright.dev/docs/test-global-setup-teardown. I found no date for this guidance and no Playwright page that says to prefer fixtures over page-object inheritance. The page object page is still current and calls page objects "one such approach" (https://playwright.dev/docs/pom). Treat "Playwright moved away from page objects" as unconfirmed.
- Playwright ARIA snapshots (`toMatchAriaSnapshot`) arrived in v1.49 on 2024-11-18. Verified: https://playwright.dev/docs/aria-snapshots.
- Playwright Test Agents (planner, generator, healer, set up with `npx playwright init-agents`) arrived in v1.56 on 2025-10-06. Verified: https://playwright.dev/docs/test-agents.
- Selenium and BiDi: Selenium calls WebDriver BiDi "the cross-browser replacement for the Chrome DevTools Protocol", says "CDP support is temporary until WebDriver BiDi has been implemented", and says it is updating its whole implementation from Classic to BiDi. It is enabled with the `webSocketUrl` capability. Verified: https://www.selenium.dev/documentation/webdriver/bidi/ (page modified 2026-08-15). Mozilla announced CDP deprecation from Firefox 129 on 2024-05-28. Verified: https://fxdx.dev/deprecating-cdp-support-in-firefox-embracing-the-future-with-webdriver-bidi/. The spec is still a W3C Editor's Draft, so "BiDi is a finished standard" would be wrong. Verified: https://w3c.github.io/webdriver-bidi/.
- Test shapes: pyramid (Mike Cohn, 2009 book, per Fowler), honeycomb (Spotify, January 2018), trophy (Kent C. Dodds tweet 2018-02-06, article 2021-06-03). Fowler wrote on 2021-06-02 that the dispute is partly about what "unit" means. Google's SMURF post of 2024-10-15 says to go beyond the pyramid and weigh speed, maintainability, utilization, reliability and fidelity per test. Verified: https://martinfowler.com/articles/2021-test-shapes.html, https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications, https://engineering.atspotify.com/2018/01/testing-of-microservices, https://testing.googleblog.com/2024/10/smurf-beyond-test-pyramid.html.
- AI-assisted testing: besides the agents, the Playwright MCP server drives pages through "structured accessibility snapshots, bypassing the need for screenshots". Verified: https://github.com/microsoft/playwright-mcp. OWASP publishes a 2025 Top 10 for LLM applications (LLM01 Prompt Injection, LLM06 Excessive Agency). Verified: https://genai.owasp.org/llm-top-10/.
- Version facts that existing question text may have stale: ISTQB CTFL is v4.0.1 (2024-09-15) and includes shift left, the test pyramid and testing quadrants. OWASP Top 10 is the 2025 release, with A03 Software Supply Chain Failures. ASVS is 5.0.0. OpenAPI is 3.2.1 (2026-09-10). RFC 9110 (June 2022) obsoletes RFC 7231. REST Assured docs now live at rest-assured.io and show 7.0.0. JUnit's `@ParameterizedClass` is marked experimental. All verified; URLs are in `recent_changes` in the JSON.

### Where experts disagree

1. Page objects, and assertions inside them. Selenium says page objects "should never make verifications or assertions", apart from checking the right page loaded (https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/). Fowler favours no assertions and records "differences of opinion" (https://martinfowler.com/bliki/PageObject.html). Playwright's own example calls `expect(...).toBeVisible()` inside a page object method (https://playwright.dev/docs/pom). Serenity/JS argues for Screenplay on large suites (https://serenity-js.org/handbook/design/screenplay-pattern/). A 2019 Cypress blog argues for app actions instead, and now carries a note that it was an opinion piece (https://www.cypress.io/blog/stop-using-page-objects-and-start-using-app-actions). All verified. No measured comparison was found, so no side has stronger evidence. Selenium's docs do not mention Screenplay.
2. Whether BDD is worth it. For: Cucumber defines BDD as collaboration through Discovery, Formulation and Automation (https://cucumber.io/docs/bdd/), and Dan North introduced it in 2006 (https://dannorth.net/blog/introducing-bdd/). Against using it as a test tool only: Cucumber's creator wrote in 2014 "If you think Cucumber is a testing tool, please read on, because you are wrong" (https://cucumber.io/blog/collaboration/the-worlds-most-misunderstood-collaboration-tool/), and Andy Knight wrote in 2017 that without full team collaboration "the justification for BDD diminishes" (https://automationpanda.com/2017/07/26/bdd-automation-without-collaboration/). Verified. Both sides agree on the condition: the value depends on non-testers reading the scenarios.
3. Mocks or real dependencies. Google says to avoid overusing mocks and to "Prefer Realism Over Isolation" (https://testing.googleblog.com/2013/05/testing-on-toilet-dont-overuse-mocks.html, https://abseil.io/resources/swe-book/html/ch13.html). Playwright says "Only test what you control" and to mock third parties (https://playwright.dev/docs/best-practices). Fowler describes classical and mockist schools without naming a winner (https://martinfowler.com/articles/mocksArentStubs.html). Verified. Read together they answer different questions: real for what you own, doubles for what you do not (Inferred).
4. Pyramid, trophy or honeycomb. Covered above. No source gives measured results for one shape.
5. Which locator first. Playwright and Testing Library put role first and test id last (https://testing-library.com/docs/queries/about/). Cypress recommends `data-*` attributes (https://docs.cypress.io/app/core-concepts/best-practices). Selenium prefers id, then CSS, with XPath last (https://www.selenium.dev/documentation/test_practices/encouraged/locators/). Verified. Each is the tool maker's own guidance, so the page should say "follow the tool you use".
6. Retries. Playwright builds retries in and labels a pass-on-retry as flaky (https://playwright.dev/docs/test-retries). pytest's docs call permanent reruns or quarantine "rather dangerous" (https://docs.pytest.org/en/stable/explanation/flaky.html). Verified. Compatible if retries are treated as detection.

One conflict inside a single source: Playwright's CI page recommends `workers: 1` on CI for stability, while its sharding and parallel pages teach splitting runs (https://playwright.dev/docs/ci, https://playwright.dev/docs/test-sharding). Verified. A Study page on CI should state both.

### Existing free guides

| Guide | How it is organised | Licence | Status |
|---|---|---|---|
| Software Engineering at Google, ch. 11 to 14 | Long prose chapters with a TL;DR list | CC BY-NC-ND 4.0 | Verified |
| ISTQB CTFL syllabus v4.0.1 | 6 chapters, numbered sections, learning objectives | Copyright ISTQB; non-commercial extracts with acknowledgement | Verified |
| goldbergyoni/javascript-testing-best-practices | 6 numbered sections of bullets, each with Do, Otherwise, code | MIT | Verified |
| Microsoft Engineering Fundamentals Playbook | Checklist, then a section per test type | CC BY 4.0 | Verified |
| OWASP Web Security Testing Guide | Categories of numbered test cases | CC BY-SA 4.0 | Verified |
| Selenium test practices | Encouraged, discouraged, design strategies | Apache 2.0 (docs repo) | Verified |
| Playwright docs | Task guides plus one best-practices page | Apache 2.0 (repo) | Repo verified; that it covers docs text is inferred |
| web.dev Learn Testing | Ordered short articles | CC BY 4.0 per Google's site policy | Reported |
| roadmap.sh QA | Visual node map with progress tracking | Personal use only, no republishing | Licence verified; content not read |
| Test Automation University | Free video courses in learning paths | All rights reserved | Footer verified; structure reported |
| Ministry of Testing | Community site with paid certificates | Not found | Not verified |

URLs for each are in `existing_guides` in the JSON.

## Contested and not found

- ISTQB's Testing with Generative AI syllabus returned HTTP 500 on every attempt. Nothing in the map relies on it.
- Playwright's position on BDD was not verified. The only item found is a feature request issue whose content I did not read.
- The first publication date of WCAG 2.2 was not read. The page shows the 12 December 2024 edition.
- The first release date of the Playwright MCP server was not captured.
- roadmap.sh and Test Automation University render their content with scripts, so their topic lists were not read.
- Ministry of Testing's content licence was not found (its terms page returned 404). Licences for Fowler, Kent C. Dodds and the Google Testing Blog were not checked. Treat all four as all rights reserved.
- No study measuring page objects against Screenplay, or BDD against code-first tests, was found. Those pages rest on expert opinion.
- Method limit: pages were fetched and read through keyword snippets around the claims, not line by line. Quoted phrases were seen in the page text. Sentences in a `practice` field that do not quote or name a source are my synthesis (Inferred). The clearest cases are the AI review checklist (m10-c3), the retry policy wording (m8-c3) and the SQL patterns for duplicates and orphans (m7-c7).

## What this means for the work

- Write original text and link out. Only the Microsoft playbook (CC BY) and goldbergyoni's guide (MIT) can be adapted freely. The Google book forbids derivatives, WSTG is share-alike, and roadmap.sh forbids republishing.
- Borrow structure, which is not restricted: goldbergyoni's Do and Otherwise pattern maps onto "use when" and "avoid when", and Selenium's encouraged and discouraged split is a clear model for a practices list. ISTQB's section numbers work as a coverage checklist for modules 1 and 2.
- Against overwhelm, ship stages A and B first (28 pages, 18 core) because every later module depends on them, and show one stage at a time with the prerequisites as the default path.
- The disagreement pages are the strongest interview material. State both sides and the condition under which each holds; do not pick a winner where no evidence does.
- Risk: the existing question bank is named for the Page Object Model. The sources support page objects as a valid default, with the assertion rule openly disputed, so Study pages should not teach "no assertions in page objects" as settled Playwright practice.
- Risk: date-stamped facts will age (BiDi's draft status, tool versions, the OWASP lists). Keep them in the "what changed" box with the date checked, so one field per page needs review.
- My pick: adopt the 10-module tree as written, launch the 31 core pages, and add the extended pages by stage.