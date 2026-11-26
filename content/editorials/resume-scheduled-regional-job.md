---
problem: locator/resume-scheduled-regional-job
---

```css
tbody[data-queue="scheduled"] tr:has(> td[data-field="region"][data-code="eu-west"]) button[data-action="resume"]:enabled
```

Read the selector from the queue to the job row, then to the control. `:has()` keeps a row only if it contains the specified region cell. The leading `>` inside that selector requires the region cell to be a direct child of the row. The button is selected by its action code and enabled state. It need not be a direct child of its cell.

The first scheduled Resume button belongs to the right region in the initial table. The reorder puts EU North first, while the locked-run layout puts a disabled EU West action first. A row selector that checks only the region would still see two West jobs there. The queue requirement also excludes the matching region in the manual section when both queues appear in one table.

In an interview, explain that `:enabled` answers only the form control state question. The browser can report an enabled button even when a server later rejects the command. A test of the actual action should verify the intended job transitions out of its paused state.

Sources: [MDN :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has), [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
