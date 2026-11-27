---
problem: locator/export-ledger-csv
---

## What is going on

The ledger can export the same records in several formats. The original CSV and PDF controls both say `Export`, so the accessible button name alone cannot tell the test which file it would get. The toolbar's generated class gives no information about format, either. The app exposes a separate test ID for each format.

## The fix

```ts
page.getByTestId('ledger-export-csv')
```

1. Find the control with the test ID `ledger-export-csv`.

   **Why:** In `pdf-first`, the order changes and the `Export` captions remain identical, but the test IDs stay attached to their own formats. In `separate-format-groups`, XLSX comes first, the controls gain separate wrappers, and their shared caption becomes `Exporter`. The CSV hook still names the format without depending on which button leads the toolbar, how it is nested, or what its caption says.

That hook is an explicit contract in this app. It gives the test a way to request the CSV action even when the information visible on the buttons is the same.

## Why the tempting answer fails

The first button named exactly `Export` works only while CSV is first and the caption stays in English. In `pdf-first`, the decoy still finds one button and would start a PDF download. In `separate-format-groups`, it finds no button with that exact name. Updating the caption alone would still put XLSX first. A test that checks only whether a download started would miss a switch to the wrong format.

## What the interviewer listens for

Explain why the test ID resolves an ambiguity left by the shared caption. Distinct accessible names such as `Export CSV` and `Export PDF` would help users distinguish the actions, too; a test ID alone leaves that accessibility gap in place.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
