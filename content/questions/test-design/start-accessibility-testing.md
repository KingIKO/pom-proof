---
title: A refused renewal leaves focus in the library dialog. What should a reader hear and be able to do next?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: Follow the refused renewal from the error announcement to the reader's next action and return to the loan list.
looksFor:
  - Checks whether the refusal is announced and explains what the reader can do.
  - Traces focus through dismissal and back to the loan list.
  - Uses the scan to catch detectable problems in the open dialog.
  - Relates the findings to the team's WCAG version and level.
trap: Taking a clean automated scan as proof the renewal journey is accessible.
followUps:
  - question: The reader dismisses the refusal with Escape and ends up at the top of the page. What would you record?
    answer: I'd record the loan and focused control before opening the dialog, where Escape sent focus, and whether the reader could resume at the same loan.
sources:
  - label: W3C Recommendation, WCAG 2.2
    url: https://www.w3.org/TR/WCAG22/
  - label: Playwright accessibility testing with axe
    url: https://playwright.dev/docs/accessibility-testing
  - label: Playwright role locators
    url: https://playwright.dev/docs/locators#locate-by-role
  - label: axe-core rule tags by WCAG version and level
    url: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
examples:
  - title: Scan the opened renewal dialog
    variants:
      - lang: ts
        label: Playwright Test with axe-core (TypeScript)
        code: |
          import AxeBuilder from '@axe-core/playwright';
          import { expect, test } from '@playwright/test';

          test('open renewal dialog has no detected WCAG violations', async ({ page }) => {
            await page.goto('/loans');
            await page.getByRole('button', { name: 'Renew loan' }).click();
            await expect(page.getByRole('dialog', { name: 'Renew loan' })).toBeVisible();

            const { violations } = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
              .analyze();
            expect(violations).toEqual([]);
          });
---

I'd make the service refuse a renewal on a known loan. With a screen reader I'd listen for the
reason and the available next action. I'd run it again with only the keyboard and follow focus
from the loan into the dialog and back out. The user should be able to dismiss the refusal and
pick up at the loan they were working on.

I'd use the team's agreed Web Content Accessibility Guidelines target to evaluate the findings.
For WCAG 2.2 AA I'd also scan the open state for detectable issues like missing labels. I'd read
the cover image's alternative text myself to see whether it helps the reader identify the book.

### Example

On a test account with one renewable loan, point the Playwright project's base URL at the library
app and use that account's signed-in state. The example expects the open dialog to have no automated
violations for the WCAG 2.2 A and AA rules the scanner covers, including applicable rules from 2.0 and 2.1.
