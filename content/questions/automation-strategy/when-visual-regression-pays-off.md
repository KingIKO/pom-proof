---
title: "A shipping label's address overlaps its barcode, but the text check passes. What would you compare?"
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: "If appearance is part of the requirement and I can repeat the capture reliably, I'd compare the screenshot with an approved image."
looksFor:
  - "Pick a part of the app with a stable design where a layout mistake matters."
  - "Keep the browser, fonts, and window size fixed and account for content that changes."
  - "Explain when to compare one part of a screen and when to compare the whole page."
  - "Name who reviews and approves a new reference image."
trap: "Updating all the approved screenshots after a failure without checking what moved."
followUps:
  - question: "The print time changes on each run. Would you hide the bottom half of the label?"
    answer: "I'd hide only the print time. I'd keep the address and barcode visible so a spacing problem can fail the check."
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

I'd start with the label preview. The address and barcode have to fit on the printed label. A screenshot comparison can catch an overlap even when the text itself is right. I'd capture the label by itself. I'd add a screenshot of the full page only if the whole editor layout matters.

I wouldn't start on a screen whose design changes every week. I'd keep the browser setup, fonts, and viewport, or visible page size, fixed. I'd mask fields that are supposed to change by leaving them out of the comparison. If the new image differs from the approved one, I'd ask the design owner to review the difference before approving it.

### Example

I'd use the local sample label, which always uses the same address. I'd compare its preview with the approved image and mask the print time. If the address moves, I'd expect that change to appear in the difference image.
