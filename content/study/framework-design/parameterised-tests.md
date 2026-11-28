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
