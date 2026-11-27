# Phase 5 question authoring brief

Read your assignment at `C:\Users\Owner\AppData\Local\Temp\opencode\coverage\assignments\<group>.json`, using `G1` through `G5` for `<group>`. Work from its POM Proof IDs, concept notes and example plans. Never open sdetrole, qaladder or the private inventories. Write original questions, answers and code from the concept notes.

| Group | Question topics |
|---|---|
| G1 testing | `fundamentals`, `test-design`, `bug-reports`, `agile`, `bdd`, `behavioral`, `leadership` |
| G2 UI automation | `automation-strategy`, `framework-design`, `locators-waits`, `flaky-tests`, `playwright`, `selenium`, `cypress` |
| G3 API and data | `api`, `sql` |
| G4 languages | `java`, `python`, `javascript-typescript` |
| G5 delivery and specialist | `ci-git-docker`, `containers`, `performance`, `security`, `system-design`, `ai-testing` |

## Write the question

- Use `content/questions/<topic>/<id>.md`. Match `topic` to its folder. Use lowercase hyphenated IDs and never rename existing files. Leave tracks alone.
- Give the title a real feature and a concrete ask, in the words an interviewer might use. Use `junior`, `mid` or `senior` for level and `concept`, `scenario`, `behavioral` or `tooling` for type.
- Write a one-sentence `oneLine`, 3 to 5 `looksFor` points, one `trap`, and 1 to 3 `followUps` with a `question` and an `answer` each. Set `roles` to one or more of `manual-qa`, `automation`, `sdet`, `senior`.
- Write an 80 to 220 word answer a candidate could say out loud. End with `### Example` and a concrete example. If you supply code, introduce the test setup and expected result in that section. The code renders after the answer.
- Check every tool fact in official documentation and cite it under `sources` as a `label` and HTTPS `url`. Fetch sources for AI-testing facts rather than relying on recall.
- Use plain, specific, sentence-case prose. No em dashes or emoji. Exclamation marks are for code only. Avoid `delve`, `leverage`, `unlock`, `tapestry`, `realm`, `seamless`, `robust`, `pivotal`, `harness`, `empower`, `streamline`, `game-changer`, and their inflections, including in code.

Postman and REST Assured go in `api`. Jenkins, pipelines and Git go in `ci-git-docker`. Docker and Kubernetes concepts go in `containers`; `ci-git-docker/docker-for-repeatable-tests` keeps its ID.

## Write the example

`examples` is optional. When present it contains 1 or 2 examples. Each example has an optional `title` and 1 to 3 `variants`. Each variant has a distinct `lang`, a `label` naming the tool, and nonempty `code`. Put the default variant first.

```yaml
examples:
  - title: Count repeated claim IDs
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH exported(id) AS (VALUES (101), (101), (103), (104))
          SELECT id, COUNT(*) AS copies
          FROM exported
          GROUP BY id
          HAVING COUNT(*) > 1;
sources:
  - label: SQLite GROUP BY and HAVING
    url: https://www.sqlite.org/lang_select.html#resultset
```

Allowed languages: `ts`, `js`, `python`, `java`, `sql`, `yaml`, `gherkin`, `bash`, `groovy`, `dockerfile`, `json`, `xml`, `http`, `properties`. Only `ts`, `js`, `python` and `java` can appear together in a multi-variant example.

Keep code lines at **105 characters or fewer**, including indentation. That is the unwrapped limit measured in the question card at a 1280px viewport using 13px JetBrains Mono. Use spaces for indentation, with no tabs or trailing whitespace.

| Case | Variants |
|---|---|
| Tool-neutral | Playwright Test TypeScript first; then pytest with Playwright or Requests; then Selenium 4 with JUnit 5 for browser examples, or REST Assured for API examples |
| `playwright` | TypeScript first, plus Python where the APIs map one to one; `test.extend` fixtures are TypeScript only |
| `selenium` | Java with Selenium 4 and JUnit 5 first, plus Python |
| Single tool | One variant in the natural language of Cypress, Postman, k6, Jenkins, Git, Docker, Kubernetes, SQL or Gherkin |
| `java`, `python`, `javascript-typescript` | One variant |
| Behavioral, leadership and most fundamentals | No code |

Every `java`, `python`, `javascript-typescript`, `sql`, `cypress` and `bdd` question and every `type: tooling` question needs an example unless it has a documented validation exception. Playwright TypeScript examples must be complete test files with imports. SQL examples must be valid SQLite, because the check runs them in an in-memory SQLite database (write dialect differences in prose, not in the code). Gherkin examples must start with a `Feature:` line. YAML may contain several documents separated by `---`. Use each tool's idioms; reject placeholder code, literal translations across languages and claims without sources.

## Done check

Run `npx vitest run tests/content` and resolve failures in your assigned folders. Check each variant against its cited documentation before handing off.
