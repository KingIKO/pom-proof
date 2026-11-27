---
problem: locator/resume-scheduled-regional-job
---

## What is going on

The job table can list manual and scheduled work for the same region. It can also list more than one scheduled run for EU West, including a locked run. The goal is the available Resume action on the scheduled `eu-west` job. Finding it depends on three things, the queue, the row and the state of the control.

The fix uses a CSS selector, a pattern that matches page elements. Square brackets make an attribute selector, which matches an attribute value. `:has()` keeps an element only if a match for its inner selector sits inside it. `:enabled` keeps only form controls that the user can use.

## The fix

```css
tbody[data-queue="scheduled"] tr:has(> td[data-field="region"][data-code="eu-west"]) button[data-action="resume"]:enabled
```

1. Start in the `tbody` marked as the `scheduled` queue.

   **Why:** A `tbody` is the element that groups a table's body rows. In `manual-queue-and-reordered-jobs`, a manual EU West job sits in the same table and has an enabled Resume button. The queue attribute keeps that job out of the search.

2. Keep rows that have a direct region cell with the code `eu-west`.

   **Why:** In `manual-queue-and-reordered-jobs`, the first scheduled row is EU North. `:has(> td…)` checks for a cell directly inside each candidate row. The `>` means a direct child, with no element in between. In `locked-run-and-localized-actions`, the region caption becomes `UE Ouest`, but its code still matches.

3. Find the descendant button whose action code is `resume`.

   **Why:** A descendant is any element inside another one, at any depth. In `locked-run-and-localized-actions`, the action reads `Reprendre` and sits inside a wrapper beside a Details button. The action code tells the two commands apart. The descendant lookup does not need the button to be a direct child of its cell.

4. Keep only a button that matches `:enabled`.

   **Why:** In `locked-run-and-localized-actions`, two scheduled rows have the right region. The first has a disabled Resume button. The browser's enabled state leaves only the action the user can take.

## Why the tempting answer fails

The decoy picks the Resume button in the first scheduled row. On the original page, that row belongs to EU West. In `manual-queue-and-reordered-jobs`, the decoy returns the EU North action. In `locked-run-and-localized-actions`, it points at the disabled EU West button. In that case, adding only the region check would still leave both EU West rows.

## What the interviewer listens for

Explain that `:enabled` describes the state of a form control. A server can still reject an action whose button is enabled. So check that the intended job actually leaves its paused state.

## Sources

- [MDN :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has)
- [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
