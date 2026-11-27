---
problem: locator/retry-failed-import
---

## What is going on

After an inventory import fails, the panel offers `Retry import` and a separate action to download the log. The app may move those buttons or add containers around them. The exercise promises that `Retry import` stays as direct text in its button, so the caption gives the XPath a stable place to start.

## The fix

```xpath
//button[text()='Retry import']
```

1. Use `//button` to search for button elements without a fixed path from the page root.

   **Why:** In `action-wrapper`, the footer moves inside a new `div`. Searching for buttons anywhere in the document still reaches the retry control through that container.

2. Require a direct text node equal to `Retry import`.

   **Why:** In `log-button-first`, `Download log` comes first, but only the retry button has that direct text. In `action-wrapper`, other wording is translated and the same caption remains a direct child, so `text()` still sees it.

In Selenium Python, use `driver.find_element(By.XPATH, "//button[text()='Retry import']")`.

## Why the tempting answer fails

The absolute XPath records the original path through `main`, the section, and the footer to the first button. In `log-button-first`, it reaches a button at that path, but it downloads the log. In `action-wrapper`, the footer has a new parent, so the decoy finds nothing. Neither outcome tells you whether the app can retry an import, because neither locator reaches the retry action there.

## What the interviewer listens for

Explain that wrapping the caption in a span would put its text outside the button's direct text nodes. If the combined descendant text remains predictable, use `normalize-space(.)`. Without the XPath requirement, a Playwright role and accessible name could express the same intent.

## Sources

- [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [XPath node tests](https://www.w3.org/TR/xpath-10/#node-tests)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
