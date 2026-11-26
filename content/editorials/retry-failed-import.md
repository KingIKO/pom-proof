---
problem: locator/retry-failed-import
---

```xpath
//button[text()='Retry import']
```

The XPath looks for a `button` with a direct text node equal to `Retry import`. The exercise promises that the caption stays a direct text node, so `text()` works here. The path starts with `//button`, which allows it to find the button even when a container is inserted higher up.

The absolute XPath copies the current path through the main panel and footer. Once the log button moves first, the same path would select `Download log`. When the footer sits inside a new wrapper, the path finds nothing. Each layout maintains the same retry caption, which gives the XPath an anchor unrelated to placement.

Mention the direct text assumption in an interview. If a design revision wraps the caption in a span, `text()` on the button will no longer see that span's text as a direct child. `normalize-space(.)` is an option when the caption can be split across descendants and the combined text is still predictable. In Playwright code without the XPath requirement, a button role and accessible name would express the same user intent.

In Selenium Python, use `driver.find_element(By.XPATH, "//button[text()='Retry import']")`.

Sources: [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate), [XPath node tests](https://www.w3.org/TR/xpath-10/#node-tests), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
