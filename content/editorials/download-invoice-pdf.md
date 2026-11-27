---
problem: locator/download-invoice-pdf
---

## What is going on

The invoice screen offers several downloads with the same caption. The app gives the invoice PDF the filename `IV-638.pdf`, while the signed URL may change on refresh. The filename identifies the document the user is asking for. The signature belongs to the current link and can change without changing that document. This exercise gives you a useful test of that distinction: refreshing the page changes the URL before anyone requests the file.

## The fix

```css
a[download="IV-638.pdf"]
```

1. Find the anchor whose `download` attribute is exactly `IV-638.pdf`.

   **Why:** In `refreshed-download-signature`, the link's URL key and CSS class change, but it still suggests `IV-638.pdf` as the filename. In `receipt-inserted`, the caption is translated and the download links move. Exact equality matches the invoice filename while excluding `IV-638.csv` and `receipt-IV-638.pdf`, even though they share the same caption and the receipt shares the PDF extension.

In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, 'a[download="IV-638.pdf"]')`.

## Why the tempting answer fails

An exact `href` identifies the PDF endpoint in the original fixture and pins the signature from its query string. In `refreshed-download-signature`, the key moves from `728b` to `99ca`, so the decoy returns nothing. The old URL is absent in `receipt-inserted` too. A filename suffix such as `[download$=".pdf"]` avoids the expired key but matches two PDFs there. Either shortcut discards a useful part of the app's contract or makes the test depend on a value the app is free to change.

## What the interviewer listens for

Separate choosing the control from testing the download. Wait for the download event and check the suggested filename; if the contents matter, inspect the saved file too. Matching the HTML attribute alone does not show that the server delivered a valid invoice.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN anchor download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright downloads](https://playwright.dev/docs/downloads)
