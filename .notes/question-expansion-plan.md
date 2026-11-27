# Question bank expansion plan (phase 5)

Written by the plan agent on 2026-11-27. Research inventories (private, never committed): `C:\Users\Owner\AppData\Local\Temp\opencode\scout-sdetrole\questions.json` and `C:\Users\Owner\AppData\Local\Temp\opencode\scout-qaladder-inventory\{questions.json,summary.json}`.

## Owner request and constraint

- Cover every question that sdetrole.com and qaladder.org ask, and add code examples with a quick language switcher.
- Both sites assert copyright. Their lists are a private coverage checklist only. Every POM Proof question is written in our own words with our own answers, code, ids and taxonomy. Content authors never open the two sites or the inventories; they write from concept notes.

## Decisions (defaults accepted 2026-11-27)

- Exclude qaladder puzzles and the object or machine "how would you test" prompts. Map the software ones and the scenario page against existing topics; write only real gaps.
- Java variants use Selenium 4 with JUnit 5 for browser code and REST Assured for API code.
- Tracks stay unchanged in this work.
- `ci-git-docker/docker-for-repeatable-tests` stays where it is.
- Examples ship with the first variant inline and the rest in `<template>`; page weight of `/questions/` is measured and reported before content lands.

## Coverage method (step 0)

`C:\Users\Owner\AppData\Local\Temp\opencode\coverage\mapping.json`: fold qaladder's banks into concepts with its duplicate clusters, match sdetrole items to them, match each concept against our files (read whole files), and record per concept `covered` (our id), `partial` (our id plus what to add) or `new` (topic, slug, level, roles, type, concept note in our own words), plus an example plan (none, single language, switcher with languages). Write `coverage\assignments\<group>.json` with only our ids, concept notes and example plans.

## Taxonomy

Twelve new topic ids: `framework-design`, `bdd`, `cypress`, `performance`, `security`, `ai-testing`, `system-design`, `sql`, `java`, `python`, `javascript-typescript`, `containers` (label "Docker and Kubernetes"). Postman and REST Assured go in `api`; Jenkins, pipelines and Git in `ci-git-docker`. Levels map beginner, intermediate, advanced to junior, mid, senior.

Topic rail groups:

| Group | Topics |
|---|---|
| Testing | fundamentals, test-design, bug-reports, agile, bdd |
| Automation | automation-strategy, framework-design, locators-waits, flaky-tests, playwright, selenium, cypress |
| API and data | api, sql |
| Languages | javascript-typescript, python, java |
| Delivery | ci-git-docker, containers |
| Specialist | performance, security, system-design, ai-testing |
| People | behavioral, leadership |

## Examples schema

```yaml
examples:            # 1 or 2 per question
  - title: Parametrised refund check   # optional
    variants:        # 1 to 3, unique lang
      - lang: ts
        label: Playwright (TypeScript)
        code: |
          ...
```

`lang` is one of ts, js, python, java, sql, yaml, gherkin, bash, groovy, dockerfile, json, xml, http, properties. A multi-variant example may use only ts, js, python, java. Body rules stay (80 to 220 words, ending in `### Example`); the prose example introduces the code, which renders after the body.

## Switcher

- `src/lib/shiki-config.mjs` holds the theme, the xpath grammar and the code-surface transformer, shared by `astro.config.mjs` and a new `src/components/questions/CodeExamples.astro`, which highlights every variant at build time with Astro's `<Code>`.
- Each example is a `<figure>`: caption with title and visible language label; a group "Example language" of buttons with `aria-pressed` (hidden until the script runs); a Copy button with a `role="status"` "Copied" line; the first variant in the DOM as `<pre tabindex="0" role="region" aria-label="Code example: <label>">`; other variants in `<template>`. Without JavaScript the first variant shows. Single-variant examples have no buttons.
- Preference in `localStorage` key `pom-proof:example-lang` (ts, js, python, java): pressing switches every example on the page that has that variant, keeps the pressed button's viewport offset; a missing variant falls back to the first without changing the saved value; storage errors keep the choice for the page.
- Examples appear in the bank card and on the per-question page with the same markup, via `AnswerContent.astro`. Code is not indexed by search.
- PR #6 width rules apply (`.astro-code`): wrap with a hanging indent, no horizontal scroll. Bedrock measures the characters that fit unwrapped in the card at 1280px; that is the authoring line cap.

## Language policy

| Case | Variants |
|---|---|
| Tool-neutral concepts | ts Playwright Test first, python (pytest with Playwright or requests), java (Selenium 4 + JUnit 5 or REST Assured) |
| playwright topic | ts plus python where the API maps one to one; `test.extend` fixtures ts only |
| selenium topic | java plus python |
| Single tool (Cypress, Postman, k6, Jenkins, Git, Docker, Kubernetes, SQL, Gherkin) | One variant in its natural language |
| java, python, javascript-typescript topics | One variant |
| Behavioral, leadership, most fundamentals | None |

Labels always name the tool.

## Validation (`tests/content/examples.test.ts`)

| Language | Check |
|---|---|
| ts, js | `ts.transpileModule` syntax diagnostics; ts variants importing only `@playwright/test` also get a full type check in one shared program |
| python | one subprocess `ast.parse` over all snippets (`python3`, then `py -3`); fail loudly if no interpreter |
| java | `java-parser` (as written, then wrapped in a class, then in a class and method, imports lifted); a plant settles whether the parser works |
| sql | `sql.js` prepare; "no such table/column" counts as pass |
| yaml, json | `yaml` parseDocument errors, `JSON.parse` |
| gherkin | structural lint |
| others | reviewer |

Plus unique lang per example, non-empty label, no tabs, no trailing whitespace, line-length cap. `questions.test.ts` allows and validates `examples`; `prose.test.ts` exempts `code` from the `!` rule (banned words still apply). Every question in java, python, javascript-typescript, sql, cypress and bdd, and every `type: tooling` question, needs at least one example (allowlist with reasons for exceptions).

## Authoring groups (step 4)

| Group | Folders |
|---|---|
| G1 testing | fundamentals, test-design, bug-reports, agile, bdd, behavioral, leadership |
| G2 UI automation | automation-strategy, framework-design, locators-waits, flaky-tests, playwright, selenium, cypress |
| G3 API and data | api, sql |
| G4 languages | java, python, javascript-typescript |
| G5 delivery and specialist | ci-git-docker, containers, performance, security, system-design, ai-testing |

Brief rules: write from the concept note; house-style titles (a real feature and a concrete ask); schema and prose rules; Playwright first; every tool fact checked on official docs and cited in `sources` (ai-testing facts fetched, never recalled); Playwright TS examples are complete files; never rename existing files; done when `npx vitest run tests/content` passes for the group's folders. Reject placeholder code, transliterations that ignore a tool's idiom, missing sources.

Review (iko-proof): read every code variant against the cited docs; compare each new title with its mapped external prompt and flag rewordings of the same sentence; read one body in five in full.

## Build order

0. Coverage mapping (iko-proof, outside the repo).
1. Schema, topics, switcher, shared Shiki config, two seed examples, `.notes/phase-5-brief.md` (iko-bedrock).
2. Checks (iko-proof, after the schema is fixed).
3. Land PR A (steps 1 and 2).
4. Content G1 to G5 in parallel (iko-bedrock x5).
5. Code and wording review (iko-proof).
6. One PR per group; `docs/RESEARCH.md` gets a short paragraph. Live check after each.
