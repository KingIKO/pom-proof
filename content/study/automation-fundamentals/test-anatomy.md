---
title: Test anatomy
module: automation-fundamentals
order: 2
level: core
summary: Arrange the starting state, act on the system and assert the outcome. Clean up any resources the test leaves behind.
minutes: 3
prerequisites: []
outcomes:
  - Separate setup, action and checks so a reader can find each part of a test.
  - Translate a test into Given, When and Then without changing the behaviour it covers.
useWhen:
  - Someone should be able to tell what prompted the result by reading the test once.
avoidWhen:
  - The same test covers unrelated rules that could each have their own test.
questionTopics: [framework-design, bdd]
examples:
  - title: Opening the delivery details reveals the estimate
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test } from '@playwright/test';

          test('opening delivery details reveals the estimate', async ({ page }) => {
            // Arrange
            await page.setContent(`
              <details>
                <summary>Delivery details</summary>
                <p>Standard delivery takes three days.</p>
              </details>
            `);

            // Act
            await page.getByText('Delivery details', { exact: true }).click();

            // Assert
            await expect(page.getByText('Standard delivery takes three days.')).toBeVisible();
          });
sources:
  - { label: "Bill Wake: Arrange, Act, Assert", url: "https://xp123.com/3a-arrange-act-assert/", type: primary }
  - { label: "Martin Fowler: Given When Then", url: "https://martinfowler.com/bliki/GivenWhenThen.html", type: practitioner }
  - { label: "Software Engineering at Google: Unit testing", url: "https://abseil.io/resources/swe-book/html/ch12.html", type: practitioner }
---
## What it is

Arrange, Act and Assert (AAA) is a way to structure a test. Arrange establishes the starting state. Act performs the behaviour under test, and Assert checks the result. An assertion is a check that can fail the test. Gerard Meszaros's Four-Phase Test names one more phase, teardown, which releases or removes what the test set up.

## How it works

Name the test after the behaviour it checks. In the example, setup puts closed delivery details on the page. The action opens them, and the check confirms that the estimate is visible. Blank lines keep the parts easy to spot.

Bill Wake suggests writing the assertion first. Ask how you would tell that the behaviour worked.

Given, When and Then express the same parts in a scenario. Given names the starting state. When names what happens. Then names the expected result. Use those words in plain text when talking through the case with the team.

If a test creates a record or opens a file, make cleanup run even when an assertion fails. A test runner can call a teardown hook, a cleanup function that runs after the test.

## Why it helps

Separate stages show what caused the result. An explicit expected value also gives a reviewer something to compare with the requirement. If the test calculates an expected fee using the same formula as the app, both can make the same mistake.

## When not to use it

Split a test that checks unrelated behaviours. For example, give “change delivery speed” and “remove a cart item” their own tests. If a user journey needs several steps, keep them together when they prove one result. Several assertions can still describe that one result.
