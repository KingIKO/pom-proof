---
problem: locator/resume-scheduled-regional-job
---

## What is going on

The job table can list manual and scheduled work for the same region. It can also list more than one scheduled run for EU West, including a locked run. The goal is the available Resume action on the scheduled `eu-west` job, which depends on the queue, the row, and the control's state.

## The fix

```css
tbody[data-queue="scheduled"] tr:has(> td[data-field="region"][data-code="eu-west"]) button[data-action="resume"]:enabled
```

1. Start in the `tbody` identified as the `scheduled` queue.

   **Why:** In `manual-queue-and-reordered-jobs`, a manual EU West job is present in the same table and has an enabled Resume button. The queue attribute keeps it out of scope.

2. Keep rows with a direct region cell with the code `eu-west`.

   **Why:** In `manual-queue-and-reordered-jobs`, the first scheduled row is EU North. `:has(> td…)` checks a cell directly owned by each candidate row. In `locked-run-and-localized-actions`, the region caption becomes `UE Ouest`, but its code still matches.

3. Find the descendant button whose action code is `resume`.

   **Why:** In `locked-run-and-localized-actions`, the action reads `Reprendre` and sits inside a wrapper beside a Details button. The code separates the two commands, and the descendant lookup does not require the button to be a direct child of its cell.

4. Keep only a button matching `:enabled`.

   **Why:** In `locked-run-and-localized-actions`, two scheduled rows have the correct region. The first has a disabled Resume button. The browser's enabled state leaves the action the user can take.

## Why the tempting answer fails

The original first scheduled row belongs to EU West. In `manual-queue-and-reordered-jobs`, the decoy returns the EU North action. In `locked-run-and-localized-actions`, it points at the disabled EU West button. Adding the region alone would still leave both West rows in the latter case.

## What the interviewer listens for

Explain that `:enabled` describes form control state; a server can still reject an enabled action. Verify that the intended job actually transitions out of its paused state.

## Sources

- [MDN :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has)
- [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
