---
title: A shipping label's address overlaps its barcode, but the text check passes. What would you compare?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: Compare approved images when appearance is part of the requirement and the capture can be repeated reliably.
looksFor:
  - Picks a stable surface with a visual risk.
  - Controls fonts, browser, viewport, and dynamic regions.
  - Explains component and full-page coverage.
  - Gives baseline changes an approval owner.
trap: Regenerating every screenshot after a test failure without looking at what moved.
followUps:
  - question: The print timestamp changes on every run. Would you mask the whole bottom half of the label?
    answer: I'd mask just the timestamp. The address and barcode need to stay in the comparison so their spacing can still fail the check.
sources:
  - label: Playwright visual comparisons and baseline environments
    url: https://playwright.dev/docs/test-snapshots
  - label: Playwright locator screenshot assertion and masks
    url: https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1
  - label: Playwright test options
    url: https://playwright.dev/docs/test-use-options
examples:
  - title: Compare the label preview
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test.use({ viewport: { width: 1024, height: 768 } });

          test('label address stays inside the preview', async ({ page }) => {
            await page.goto('http://localhost:3000/labels/sample');
            const preview = page.getByTestId('label-preview');
            await expect(preview).toHaveScreenshot('sample-label.png', {
              mask: [preview.getByTestId('printed-at')],
            });
          });
---

I'd start with the label preview. Its address and barcode must fit on the printed label, so a comparison can catch overlap that a text assertion misses. I'd use a component image for that risk and add a full-page image only if the arrangement of the whole editor matters. I wouldn't start with a screen whose design changes every week.

I'd fix the viewport and font installation in the browser image and mask fields that legitimately vary. When the baseline changes, I'd ask the person responsible for the design to review the diff before approving it.

### Example

The local sample label always uses the same address. The check compares its preview with the approved image and masks the print timestamp. A shifted address should show up in the diff.
