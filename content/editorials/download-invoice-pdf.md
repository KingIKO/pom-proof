---
problem: locator/download-invoice-pdf
---

```css
a[download="IV-638.pdf"]
```

The link's `download` attribute gives the filename the app requests. Use exact equality on that value. This identifies the invoice PDF and excludes the CSV and the separate receipt PDF, even though the page uses the same caption for all the links.

An exact `href` selector is tempting because it shows which endpoint serves the PDF. It also pins the signature in the query string. The refreshed fixture changes that signature without changing the requested file, so the selector returns nothing. The localized layout moves the links and translates their captions. It also adds a receipt PDF, so a broad suffix check such as `[download$=".pdf"]` would match both PDFs. Exact filename equality still gives one link.

In an interview, distinguish choosing the control from testing the download. The locator uses the application's naming contract. An actual download test would also inspect the download event and the suggested filename, and it could read the downloaded file if its contents are part of the requirement. Matching the attribute alone does not show that the server delivered a valid invoice.

In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, 'a[download="IV-638.pdf"]')`.

Sources: [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
