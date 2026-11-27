---
problem: locator/export-ledger-csv
---

## What is going on

The ledger can export the same records in several formats. On the original page, the CSV and PDF buttons both say `Export`. A button's accessible name is the name the browser reports to assistive tools, and here both buttons share it. So the name alone cannot tell the test which file a button would produce. The toolbar's generated class name says nothing about the format either.

Instead, the app gives each format its own test ID, an attribute added for tests to use.

## The fix

```ts
page.getByTestId('ledger-export-csv')
```

1. Find the control with the test ID `ledger-export-csv`.

   **Why:** In the `pdf-first` layout, the order changes and the `Export` captions stay identical. Each test ID still stays with its own format. In `separate-format-groups`, XLSX comes first, each button gets its own wrapper, and the shared caption becomes `Exporter`. The CSV test ID still names the format. It does not depend on which button comes first, how it is nested, or what its caption says.

In this app, the test ID is an explicit contract, a value the app promises to keep for tests. It lets the test ask for the CSV export even when the buttons show the same information.

## Why the tempting answer fails

The tempting answer takes the first button named exactly `Export`. That works only while CSV comes first and the caption stays in English. In `pdf-first`, it still finds one button, but that button would start a PDF download. In `separate-format-groups`, it finds no button with that exact name.

Updating only the caption in the locator, the expression that finds the button, would still leave XLSX first. A test that only checks whether a download started would miss a switch to the wrong format.

## What the interviewer listens for

Explain how the test ID settles the question that the shared caption leaves open. Distinct accessible names such as `Export CSV` and `Export PDF` would also help users tell the actions apart. A test ID alone leaves that accessibility gap in place.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
