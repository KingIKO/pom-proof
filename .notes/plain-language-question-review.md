# Plain-language question review: findings to fix

An iko-proof reviewer read all 284 changed question files against `git diff HEAD`. No numbers lost, every answer stays first person, no clearly false facts. But about 58 places changed a fact, condition or qualifier, or made a definition imprecise, and about 35 titles or follow-up questions now ask a different or narrower question or drop the concept term.

## Rules for the fix round (all batches)

1. Titles and follow-up questions keep the concept term the question is about (verification, validation, shift-left, test pyramid, quarantine, flaky, test double, Definition of Done, unique constraint, stale element reference, canary, automatic fixture, dropped iterations, and so on). Keep it plain by adding a short gloss in the answer, not by removing the term (house rule 6). Titles must ask the same question as before: no yes/no forms that hint at the answer, no narrowing, no embedded answer.
2. Conditions stay conditions: "only if A and B", "provided X", "if they agree" must not become a flat statement or a separate "I'd also".
3. Keep qualifiers that carry meaning: sometimes, only, may, must, should, could, will, on a fast path, plausible, before release.
4. Definitions must be precise (overloading: same name, different parameter lists, by number or types; Docker anonymous volume: Docker gives it a random name; cross-origin includes subdomains; a test type is not a test level; concurrency vs parallelism).
5. A follow-up question must still match its answer.
6. Keep every fix within the plain-language rules (25 words, no semicolons, short paragraphs). When a term is restored, explain it in plain words once.

## Q1: agile, ai-testing, api, automation-strategy, bdd

Must fix (field: before -> after, why):
- api/undocumented-api Example: "empty results sometimes appear as an empty list" -> "If the account screen gets an empty list": restore "sometimes" (the inconsistency is the point).
- bdd/when-bdd-stops-paying-off body: the disputed rule is now stated as settled; restore "if they can use it to agree that a reader keeps Plus on June 30, that scenario has a reason to stay" as a condition.
- agile/release-go-no-go follow-up answer: restore both conditions as required ("only if ... and we have checked shared code or data changes").
- api/put-vs-patch oneLine: restore that PATCH behaviour depends on the patch format.
- ai-testing/evaluate-llm-output-quality body: restore "make delivery count a required field" (schema idea); "references" means reference answers, not source records.
- automation-strategy/choose-browser-automation-tool body: restore that a missing supported browser rules out a candidate regardless of speed.
- bdd/step-definitions looksFor: "without relying on the Gherkin keywords" (Cucumber ignores keywords when matching), not "without changing".
- agile/three-amigos-waitlist body: restore "guarantee".
- automation-strategy/when-visual-regression-pays-off oneLine: restore "when appearance is part of the requirement".
- ai-testing/judge-self-healing-locators title: restore "What should count as a pass?".
- bdd/scenario-outline-and-examples title: restore "Where does that case belong in the bus fare feature?".
- automation-strategy/undocumented-appointment-portal follow-up answer: restore "will fail for the wrong reason".
- bdd/background-keyword body and looksFor: restore the rule "a Before hook is for setup readers don't need to understand the rule" and "an invisible Before hook".
Minor: titles bdd-discount-example, argue-for-automation-roi ("pay for itself"), cucumber-hooks, bad-request-vs-unprocessable ("explain the difference"), map-json-to-java-classes (gives away the answer), service-virtualisation-or-mocks ("test double"), testing-a-late-story, price-rule-patch, run-postman-collections ("smoke test"), explain-your-framework ("framework"). Terms: definition-of-done-vs-acceptance follow-up ("Definition of Done"), reusable-rest-assured-specifications ("base URI", "media type"), test-concurrent-requests ("unique constraint"), api-tests-versus-unit-tests ("serializer or response model"), page-objects-without-ceremony ("base class"), judge-self-healing-locators ("attributes", "similarity-based", follow-up "only", Example back to fact), use-llms-in-testing-responsibly ("boundary cases"; avoid "pass/fail" for accepted/rejected), versioning-backward-compatibility ("enum value", "verifies rollout assumptions"), ai-agents-and-mcp ("A tester would replay"; clarify "only page two"), test-an-llm-support-chatbot (looksFor 3, "regression examples"), risks-of-generated-test-code (Example "The first late day is free"), review-production-code (oneLine), idempotency-keys ("against the contract"), test-tokens-and-oauth ("according to the issuer"), when-bdd-stops-paying-off (looksFor 4), evaluate-llm-output-quality (curly apostrophe).

## Q2: behavioral, bug-reports, ci-git-docker, containers, cypress, flaky-tests, framework-design

Must fix:
- flaky-tests/common-causes-of-flaky-tests Example: restore "sometimes" (intermittency).
- flaky-tests/quarantine-with-an-owner body and title: restore "If the intermittent behavior can harm a customer"; title keeps "quarantine" and "flaky".
- containers/compose-a-test-environment oneLine: "never became ready" (readiness), not "never started".
- containers/autoscale-selenium-grid-in-kubernetes trap: "no spare browser slots".
- framework-design/data-driven-tests body: restore "provided the test validates its columns" as a condition.
- cypress/intercept-and-stub-requests trap: restore "on a fast path".
- ci-git-docker/parallelize-across-ci-jobs Example: restore "The combined test list should match an unsharded run".
- behavioral/learn-a-tool-under-deadline body: "A teammate could run them" (possible), not "ran".
- containers/write-a-test-runner-dockerfile follow-up: "What if the tests can reach staging".
- cypress/cypress-architecture-and-limits looksFor and body: "cross-origin" (subdomains are different origins and need cy.origin; explain once), and keep the capability claim "A plugin can reach carrier popups" as stated.
- ci-git-docker/docker-for-repeatable-tests Example: gloss for anonymous volume must say Docker gives it a random name.
- framework-design/review-test-code trap: "passes even when cancellation fails".
- containers/run-tests-as-a-kubernetes-job Example: "The Job succeeds only on HTTP 200".
- cypress/fix-flaky-cypress-tests looksFor and trap: "an alias or a retrying assertion" (Cypress retries built in), restore "detached".
- flaky-tests/measure-first-attempt-flake body: restore "documented" and the term "test race" (explain once).
- bug-reports/defect-lifecycle-and-retest looksFor: restore "and other outcomes".
- bug-reports/report-a-cross-service-defect looksFor: restore "or guesses about ownership".
- behavioral/where-the-qa-role-is-heading looksFor: restore "a check the team would otherwise have missed".
- behavioral/disagree-on-a-bug trap: restore "treating the bug discussion as something to win".
- bug-reports/measure-triage-improvement title: "whether a change to defect triage is working".
Minor: titles contain-incorrect-pickup-notices, disagree-with-product ("disagreed"), own-a-quality-metric ("metric"), push-back-on-a-release ("pushed back"), defect-lifecycle-and-retest, report-an-intermittent-bug ("intermittent"; trap "race condition"), parity-where-it-matters ("parity", "sandbox"), write-a-useful-commit-history ("fixture", "commit", trap "bisect"), framework-styles-compared (do not reveal the criterion), headless-browser-tradeoffs ("with a headed run"). Follow-ups: flakes-that-block-merges ("quarantine"), approach-an-unfamiliar-coding-problem (question must match answer). Terms: design-patterns-in-test-code ("pattern", "facade"), mocks-stubs-spies-and-fakes ("test double"), kubernetes-basics-for-testers ("selector", "endpoints", "before blaming the test"), compose-a-test-environment ("service_healthy" dependencies), learn-a-tool-under-deadline ("endpoint"), jenkins-declarative-or-scripted (`post`), why-cypress-commands-are-not-promises ("alias", "callback", oneLine "only"), common-causes-of-flaky-tests ("environment"), review-test-code ("toast"). jenkins-test-reports follow-up wording.

## Q3: fundamentals, java, javascript-typescript, leadership, locators-waits

Must fix:
- fundamentals/test-types trap: restore the type-versus-level mix-up ("treating performance testing as a level that can happen only after system testing").
- fundamentals/smoke-sanity-regression oneLine: restore "that a change might affect".
- fundamentals/test-pyramid body: restore "where components may disagree about the data".
- fundamentals/judge-a-suite-beyond-coverage body: restore "before release".
- fundamentals/absence-of-defects-fallacy Example: keep the condition ("If the billing team needs ... they'd still reconcile by hand").
- fundamentals/risk-based-testing follow-up answer: "plausible", not "possible".
- leadership/set-release-gates follow-up and title: "move a check from a nightly run to a required check"; title keeps "quality gate".
- fundamentals/verification-validation title and trap: title "How do verification and validation differ?" (explain both in the answer); trap balanced.
- fundamentals/requirements-traceability-matrix title: restore "What should link those checks?" (or equivalent same question).
- java/equals-and-hashcode-contract title: "keep" (observed fact), not "might store".
- java/overloading-or-overriding definition: different parameter lists (number or types).
- java/interface-or-abstract-class follow-up: must match the answer (a default method cannot replace the class).
- javascript-typescript/any-unknown-and-never follow-up: "What changes if a third status is added?" (answer describes the compiler).
Minor: fundamentals titles must keep their concept terms: early-testing-shift-left ("shift-left"), defect-clustering, entry-exit-criteria ("entry and exit criteria", "agree"; Example "migration"), exhaustive-testing, exploratory-testing, qa-qc-and-testing ("release review"), smoke-sanity-regression, test-pyramid, testing-shows-defects (same question), tests-wear-out ("ISTQB", "tests wear out"), test-strategy-for-new-product ("test strategy"), judge-a-suite-beyond-coverage ("CI"); selenium-stale-after-render ("stale element reference"), frames-and-shadow-roots ("how would you locate"), how-a-hashmap-works ("key"), interface-or-abstract-class ("page object", "contract"), typed-api-client-with-generics ("route"; trap "type parameter", "casting"). try-with-resources (follow-up not leading; "suppressed"), final-keyword (follow-up explicit "No").

## Q4: performance, playwright, python, security, selenium, sql, system-design, test-design

Must fix:
- selenium/handle-selects-alerts-frames-and-windows Example: restore "wait for the outer page to report".
- sql/isolation-levels-and-double-booking oneLine and body: "two committed attempts"; restore "the simplest direct rule".
- system-design/test-with-canary-and-blue-green body and title: automate the check along with duplicate invoices, errors and latency; title keeps "canary".
- test-design/state-transitions-listing-review body: restore "I can cover several moves in one test sequence".
- playwright/context-isolation-and-backend body: restore "opening another tab isn't an isolation strategy", "session state", "consequences of earlier writes".
- test-design/test-login follow-up answer: "a service-level session check can't tell me".
- security/probe-for-injection-and-xss follow-up answer: at the output boundary, using the encoder appropriate to each destination.
- security/security-scans-in-ci Example and title: "a pull request adding a dependency with a known high-severity advisory should fail this job"; title "stop promotion".
- performance/k6-scenarios-and-thresholds follow-up: "What does a nonzero dropped iteration count tell you?" (explain dropped iterations in the answer).
- performance/percentiles-not-averages follow-up answer: restore "Fast failures can make a combined latency figure look better."
- python/threads-processes-and-the-gil looksFor: "execute Python in parallel" (parallelism, not concurrency).
- test-design/verify-role-revocation follow-up: restore "agreed propagation window" and "against that policy".
Minor: titles load-stress-soak-and-spike ("Which performance tests"), security-checks-in-everyday-qa ("own"), grid-4-when-and-why ("What does it do"), boundary-values-room-booking and equivalence-partitions-pickup-alerts (technique names), test-file-upload, independent-checkout-contexts, choose-selenium-locators ("locator"), when-bidi-is-useful ("what does it add"), data-integrity-queries ("backfill"), test-strategy-for-microservices (release evidence). Follow-ups: custom-fixtures-with-test-extend ("automatic fixture"; trap "worker fixture"), mock-a-failing-request ("recovery"), choose-selenium-locators ("relative locator"), when-bidi-is-useful (do not presume migration), choose-load-levels (not yes/no; "diagnosis"). Other: security-checks-in-everyday-qa ("dependency alert", "rather than a QA sign-off"), what-a-webdriver-command-does ("browser-specific"), expired-workshop-links (trap "cache"), observability-for-testers ("rule tests"), pick-a-browser-and-device-matrix ("dominates"), test-results-dashboard ("can mark").
