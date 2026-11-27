---
problem: locator/download-invoice-pdf
---

## What is going on

The invoice screen offers several downloads with the same caption. The app gives the invoice PDF the filename `IV-638.pdf`. Its link uses a signed URL, which carries a signature in its query string, the part after `?`. That URL may change when the page refreshes.

The filename identifies the document the user asks for. The signature belongs to the current link only. It can change while the document stays the same. This exercise tests that difference, because refreshing the page changes the URL before anyone requests the file.

The link is an anchor, the HTML `a` element. Its `download` attribute suggests a filename for the saved file. The fix uses a CSS selector, a pattern that matches elements by tag name and attributes.

## The fix

```css
a[download="IV-638.pdf"]
```

1. Find the anchor whose `download` attribute is exactly `IV-638.pdf`.

   **Why:** In the `refreshed-download-signature` layout, the link's URL key and CSS class change. The link still suggests `IV-638.pdf` as the filename. In `receipt-inserted`, the caption is translated and the download links move. An exact match on the filename leaves out `IV-638.csv` and `receipt-IV-638.pdf`. Both share the caption, and the receipt also has the `.pdf` extension.

In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, 'a[download="IV-638.pdf"]')`.

## Why the tempting answer fails

The tempting answer matches the exact `href`, the link's URL. On the original page, that finds the PDF link. It also locks the signature from the query string into the selector. In `refreshed-download-signature`, the key changes from `728b` to `99ca`, so the tempting selector returns nothing. The old URL is missing in `receipt-inserted` too.

A filename suffix such as `[download$=".pdf"]` avoids the expired key. But in `receipt-inserted` it matches two PDFs. The app's contract is the set of values it promises to keep stable. Each shortcut either drops a useful part of that contract or depends on a value the app is free to change.

## What the interviewer listens for

Treat finding the link and testing the download as two separate jobs. Wait for the download event and check the suggested filename. If the contents matter, inspect the saved file too. Matching the HTML attribute alone does not show that the server delivered a valid invoice.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN anchor download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright downloads](https://playwright.dev/docs/downloads)
