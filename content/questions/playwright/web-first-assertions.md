---
title: Why use a web-first assertion instead of reading the element yourself?
topic: playwright
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: I use a locator assertion to give the expected UI state time to appear. A captured value gives me only one observation.
looksFor:
  - Explain that the locator assertion checks the condition more than once if needed.
  - Await the assertion.
  - Check a state that matters to the user after the action.
  - Investigate what happened if the assertion times out.
trap: Reading a boolean once and adding a fixed wait when it sometimes reads false.
followUps:
  - question: Does retrying the assertion mean Playwright retries the click?
    answer: No. When I retry a locator assertion, it checks the expected state again. It does not repeat the click.
sources:
  - label: Playwright assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Playwright Python assertions
    url: https://playwright.dev/python/docs/test-assertions
examples:
  - title: Check the saved name before and after reload
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('shows the new name after saving and reloading', async ({ page }) => {
            await page.goto('http://localhost:3000/settings/sample');
            await page.getByLabel('Display name').fill('Avery Green');
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(page.getByRole('status')).toHaveText('Saved');
            const heading = page.getByRole('heading', { name: 'Avery Green' });
            await expect(heading).toBeVisible();
            await page.reload();
            await expect(heading).toBeVisible();
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_saved_name_persists(page):
              page.goto("http://localhost:3000/settings/sample")
              page.get_by_label("Display name").fill("Avery Green")
              page.get_by_role("button", name="Save").click()
              expect(page.get_by_role("status")).to_have_text("Saved")
              expect(page.get_by_role("heading", name="Avery Green")).to_be_visible()
              page.reload()
              expect(page.get_by_role("heading", name="Avery Green")).to_be_visible()
---

The UI may still be changing when my click completes. A locator is a way to find a page element. A web-first assertion checks the locator and its condition again until it passes or times out. For example, I can use `await expect(status).toHaveText('Saved')`. If I read whether the element is visible once, I have only that one result to check.

I choose an assertion about a change the user can see. I'd check the address value and a visible save confirmation instead of a spinner going away. If the expected state never appears, I'd check the saved value and the response to the request before extending the general timeout.

### Example

After changing a name in account settings, I'd check that the profile header shows the new name. If I need to check that the name lasts, I'd reload and look for the same name again.

The local fixture, or test page, starts with a different name and saves in the background. It shows `Saved` once it stores the new name. The test expects `Avery Green` in the header both before and after reloading.
