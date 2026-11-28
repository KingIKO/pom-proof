---
title: Assertions that retry and fail clearly
module: automation-fundamentals
order: 6
level: core
summary: An assertion checks a result against what you expect. A retrying assertion reads the result again while the app finishes its work.
minutes: 3
prerequisites: [automation-fundamentals/waiting-and-synchronisation]
outcomes:
  - Choose between a one-time check and a check that can try again.
  - Write an assertion that shows the expected and actual result when it fails.
useWhen:
  - The app may need time to display the outcome you want to check.
avoidWhen:
  - The value is already final, so checking again cannot tell you anything new.
practiceTopics: [assertions]
questionTopics: [playwright, framework-design]
examples:
  - title: Check the result after saving
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test } from '@playwright/test';

          test('saving confirms the order', async ({ page }) => {
            await page.setContent(`
              <button>Save order</button>
              <p role="status">Draft</p>
              <script>
                document.querySelector('button').onclick = () => {
                  document.querySelector('[role="status"]').textContent = 'Saving';
                  setTimeout(() => {
                    document.querySelector('[role="status"]').textContent = 'Order saved';
                  }, 150);
                };
              </script>
            `);

            await page.getByRole('button', { name: 'Save order' }).click();
            const status = page.getByRole('status');
            await expect(status, 'Order status after saving').toHaveText('Order saved');
          });
sources:
  - { label: "Playwright: Assertions", url: "https://playwright.dev/docs/test-assertions", type: primary }
  - { label: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", type: primary }
  - { label: "Software Engineering at Google: Unit testing", url: "https://abseil.io/resources/swe-book/html/ch12.html", type: practitioner }
---
## What it is

An assertion compares an actual result with an expected one. A retrying assertion reads the current result again and again. It stops when the result matches or when it reaches its time limit. The test action, such as clicking Save, still happens once.

## How it works

Choose the result a user can observe, such as the text that confirms an order was saved. In Playwright, pass a locator, which tells the tool how to find an element, to `expect`. The `toHaveText` check reads the element again if the text does not match. Playwright calls this a web-first assertion.

If you read the text first and pass that string to a one-time assertion, it can only compare the value you already read. Adding `await` to the read does not turn it into a retrying check. The example passes the locator itself, so the assertion can see the change from Saving to Order saved.

Playwright gives web-first assertions five seconds by default. For a value outside the page, use `expect.poll` to call a function again and check what it returns. For example, the function can read the latest status from an API.

## Why it helps

Retrying a check gives a result that arrives later time to appear. A specific text check catches the wrong message even if the page shows a status. Checking that an internal save method ran could pass even if the user sees no confirmation.

Use a failure message that identifies the result under test. Show the expected and actual values so the next person can tell what went wrong.

## When not to use it

Check a finished calculation once. If the total is already final, waiting longer cannot fix a wrong answer. Pick an expectation that reflects what the product promises. For example, if the order of a list can vary, waiting for one exact order adds a rule the product never agreed to.
