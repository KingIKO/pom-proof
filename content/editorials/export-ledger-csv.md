---
problem: locator/export-ledger-csv
---

```ts
page.getByTestId('ledger-export-csv')
```

The app exposes a test ID for each export format, so the locator can ask for CSV directly. The two original controls both say `Export`. Their accessible names alone do not tell the test which output to expect, and the toolbar's generated class gives no information about format.

Selecting the first button called `Export` works in the original toolbar. It starts a PDF download when formats switch places. In the translated version it finds no button with the exact name `Export`, and the new spreadsheet button leads the toolbar as well. The test ID stays on the CSV action in each layout and survives both markup and copy changes.

Tell the interviewer why you chose a test ID here: the app supplies it as an explicit testing contract where the visible text is shared. In a real product, distinct accessible names such as `Export CSV` and `Export PDF` would also make the controls easier to distinguish. The test ID identifies an element for a test, so it does not address that accessibility gap by itself.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
