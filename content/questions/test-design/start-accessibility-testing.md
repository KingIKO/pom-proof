---
title: The library refuses a renewal and focus stays in the dialog. What should a reader hear and do next?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: I'd listen to what the screen reader announces when renewal fails. I'd check what the reader can do next and how they return to the loan list.
looksFor:
  - Check that the screen reader announces the refusal and tells the reader what they can do.
  - Follow keyboard focus as the reader closes the dialog and returns to the loan list.
  - Scan the open dialog for problems the tool can detect.
  - Compare the findings with the WCAG version and level the team follows.
trap: Treating a clean automated scan as proof a reader can use the full renewal flow.
followUps:
  - question: Escape closes the dialog and sends the reader to the top of the page. What would you record?
    answer: I'd record the loan and which control had focus before the dialog opened. I'd record where focus goes after Escape. I'd say whether the reader can resume at the same loan.
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

I'd make the service refuse a renewal on a known loan. I'd use a screen reader, which reads the interface aloud, to listen for the reason and what I can do next. I'd repeat the test with just the keyboard. I'd follow focus, the control that receives keyboard input, from the loan into the dialog and back out. I'd expect to close the dialog and continue from the same loan.

I'd compare the results with the team's target under the Web Content Accessibility Guidelines (WCAG). If the target is WCAG 2.2 AA, I'd scan the open dialog for issues the tool can detect, such as missing labels. I'd read the cover image's alternative text, its written description, myself. I'd check whether it helps the reader identify the book.

### Example

I'd use the saved sign-in for a test account with one renewable loan. I'd point the Playwright project's base URL, the starting app address, at the library app. I'd expect no scan findings for the covered WCAG 2.2 A and AA rules. That includes applicable rules from 2.0 and 2.1.
