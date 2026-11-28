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
useWhen:
  - Boundary and partition tables, role matrices and locale sets.
avoidWhen:
  - Cases differ in their steps or checks, not only in their data.
  - You need only a few of the combinations that stacked lists would make.
practiceTopics: [boundary-testing, equivalence-partitioning, decision-tables]
questionTopics: [test-design, framework-design]
examples:
  - title: Delivery fee at the free limit
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          // Amounts are whole cents, so no rounding can move a row across the limit.
          const rows = [
            { name: 'just under the free limit', totalCents: 4999, feeCents: 499 },
            { name: 'exactly at the free limit', totalCents: 5000, feeCents: 0 },
          ];
          for (const { name, totalCents, feeCents } of rows) {
            test(`delivery fee: ${name}`, () => {
              expect(deliveryFeeCents(totalCents)).toBe(feeCents);
            });
          }
      - lang: python
        label: pytest
        code: |
          # Amounts are whole cents, so no rounding can move a row across the limit.
          @pytest.mark.parametrize("total_cents, fee_cents", [
              pytest.param(4999, 499, id="just under the free limit"),
              pytest.param(5000, 0, id="exactly at the free limit"),
          ])
          def test_delivery_fee(total_cents, fee_cents):
              assert delivery_fee_cents(total_cents) == fee_cents
sources:
  - { label: "Playwright: Parameterize tests", url: "https://playwright.dev/docs/test-parameterize", type: primary }
  - { label: "pytest: How to parametrize", url: "https://docs.pytest.org/en/stable/how-to/parametrize.html", type: primary }
  - { label: "pytest: pytest.param reference", url: "https://docs.pytest.org/en/stable/reference/reference.html#pytest.param", type: primary }
  - { label: "JUnit: Parameterized classes and tests", url: "https://docs.junit.org/current/writing-tests/parameterized-classes-and-tests.html", type: primary }
  - { label: "JUnit 5.13.0 release notes", url: "https://docs.junit.org/5.13.0/release-notes/", type: primary }
  - { label: "Gherkin reference", url: "https://cucumber.io/docs/gherkin/reference/", type: primary }
whatChanged:
  checked: 2026-11-27
  items:
    - "`@ParameterizedClass` arrived in JUnit 5.13 (May 2025). It runs every test in a class once per row. The current guide (6.1.3) still marks it experimental."
---
## What it is

A parameterised test runs the same steps once for each row of data. Each row holds the inputs and the expected result. When the rows live outside the code, such as in a CSV file, people often call it data-driven testing. Many teams use both names for the same thing.

## How it works

You write the test body once and list the rows beside it. Each row then runs as its own test. A loop inside one test body is different: it stops at the first failing row and reports one test. Give each row a name that says what it covers. The report then shows "exactly at the free limit" instead of "row 2".

Each tool has its own syntax. Playwright Test calls `test()` inside a loop, and each title must be unique. It can also run a whole suite once per project, with different options. pytest uses the `@pytest.mark.parametrize` decorator, and `pytest.param` names a row with `id`. JUnit uses `@ParameterizedTest` with a source such as `@CsvSource`, and its `name` attribute labels each row. Gherkin, the plain-text format that Cucumber runs, uses a `Scenario Outline` with an `Examples` table.

## Why it helps

Adding a case means adding one row. A reviewer can read the table and see which boundaries the test covers. When one row fails, the runner reports that row by name.

## When not to use it

If a row needs different steps or a different assertion, write a separate test for it. An `if` inside the test body shows this problem. The body then describes more than one behaviour, and a reader must trace each row separately.

In pytest, stacked `parametrize` decorators run every combination of their values. Two lists of five values make 25 tests, and many of them may check nothing new.
