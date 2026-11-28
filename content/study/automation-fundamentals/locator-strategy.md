---
title: Locator strategy
module: automation-fundamentals
order: 4
level: core
summary: A locator tells a test how to find an element. Pick one that depends on what should stay the same for that test.
minutes: 3
prerequisites: [automation-fundamentals/test-anatomy]
outcomes:
  - Choose between a user-facing name and a dedicated test attribute.
  - Find the right button when two parts of a screen use the same label.
useWhen:
  - A meaningful label or a stable attribute identifies the element you need.
avoidWhen:
  - A generated class or a row number is the only reason the locator finds the right element today.
practiceTopics: [test-code-review]
questionTopics: [locators-waits]
examples:
  - title: Find the Save button in the delivery form
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test } from '@playwright/test';

          test('finds Save in the delivery address group', async ({ page }) => {
            await page.setContent(`
              <fieldset>
                <legend>Billing address</legend>
                <button data-cy="save-billing">Save</button>
              </fieldset>
              <fieldset>
                <legend>Delivery address</legend>
                <button data-cy="save-delivery">Save</button>
              </fieldset>
            `);

            const delivery = page.getByRole('group', { name: 'Delivery address' });
            const save = delivery.getByRole('button', { name: 'Save', exact: true });
            await expect(save).toHaveAttribute('data-cy', 'save-delivery');
          });
sources:
  - { label: "Playwright: Locators", url: "https://playwright.dev/docs/locators", type: primary }
  - { label: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", type: primary }
  - { label: "Testing Library: Query priority", url: "https://testing-library.com/docs/queries/about/", type: primary }
  - { label: "Selenium: Tips on working with locators", url: "https://www.selenium.dev/documentation/test_practices/encouraged/locators/", type: primary }
  - { label: "Cypress: Best practices for selecting elements", url: "https://docs.cypress.io/app/core-concepts/best-practices", type: primary }
  - { label: "Playwright: Version 1.27 release notes", url: "https://playwright.dev/docs/release-notes", type: primary }
whatChanged:
  checked: 2026-11-27
  items:
    - "Playwright v1.27 shipped on 7 October 2022. It added locators such as `getByRole`, `getByText` and `getByLabel`. It also added `getByTestId` for dedicated test attributes."
expertsDisagree:
  - question: Which locator should you try first?
    note: Follow the tool you use. Decide which changes ought to break this test before you choose a locator.
    positions:
      - view: Playwright starts with role for interactive controls and recommends including the accessible name. It also supports test IDs as a deliberate choice.
        holdsWhen: Use role and name when they identify the control and you care how users recognise it.
        source: https://playwright.dev/docs/locators
      - view: Testing Library ranks role first in its general guide and recommends labels for form fields. It puts test IDs last.
        holdsWhen: Use a test ID if the other queries do not fit, such as when the text changes and its value does not matter.
        source: https://testing-library.com/docs/queries/about/
      - view: Cypress prefers dedicated `data-*` attributes. It recommends text or role queries when the test should fail if that content or role changes.
        holdsWhen: Use a dedicated attribute when the test needs a stable target through copy and style changes.
        source: https://docs.cypress.io/app/core-concepts/best-practices
      - view: Selenium starts with a unique, predictable HTML `id`. It prefers a short CSS selector next and leaves XPath as the fallback.
        holdsWhen: When a stable `id` is missing, use CSS if it can identify the element clearly.
        source: https://www.selenium.dev/documentation/test_practices/encouraged/locators/
---
## What it is

A locator identifies an element, such as a button, that a test can use or check. A locator can depend on the element's role, meaning its purpose, or its accessible name, the label assistive technology can read. Other locators use an HTML attribute, such as an `id` or a test ID added for automation.

## How it works

Decide which part of the element matters to the test. Playwright's `getByRole` locator can find a button by its role and name. When an action needs one target, Playwright fails if its locator matches more than one element. This rule is called strict mode. The example searches inside the delivery address group so only one Save button matches.

If the label may change without breaking the behaviour, agree on a dedicated attribute with the developers. Cypress can find that same button with `cy.get('[data-cy="save-delivery"]')`, a lookup by its test attribute.

## Why it helps

A locator tied to a role and name can catch a change in how the control is exposed to users of assistive technology. Finding the same control by test ID keeps a click test working when the label changes. Add a separate check if the label still matters. Neither locator replaces an accessibility review.

## When not to use it

Avoid picking an element by its position if the order can change. A long chain through the page structure can also break when developers move a button. This applies to both CSS selectors, which can match attributes or structure, and XPath, a language that can describe paths through the page.
