---
problem: locator/retry-failed-import
---

## What is going on

After an inventory import fails, the panel offers `Retry import`. It also offers a separate action to download the log. The app may move those buttons or add containers around them. The exercise promises that `Retry import` stays as direct text in its button. So the caption gives the XPath a stable place to start.

XPath is a language for finding elements in the page markup. A text node is a run of text in the markup. A direct text node sits immediately inside an element, not inside one of its child elements.

## The fix

```xpath
//button[text()='Retry import']
```

1. Use `//button` to search for button elements without a fixed path from the page root.

   **Why:** `//` searches the whole document at any depth. In `action-wrapper`, the footer moves inside a new `div`. A search for buttons anywhere in the document still reaches the retry control inside that container.

2. Require a direct text node equal to `Retry import`.

   **Why:** `text()` reads only the direct text nodes of the button. In `log-button-first`, `Download log` comes first, but only the retry button has that direct text. In `action-wrapper`, other wording is translated. The same caption stays a direct child, so `text()` still sees it.

Selenium is another browser automation tool. In Selenium Python, use `driver.find_element(By.XPATH, "//button[text()='Retry import']")`.

## Why the tempting answer fails

The decoy is an absolute XPath, a full path from the page root. It records the original route through `main`, the section and the footer to the first button. In `log-button-first`, it reaches a button at that path, but that button downloads the log. In `action-wrapper`, the footer has a new parent, so the decoy finds nothing.

Neither result tells you whether the app can retry an import. In both cases, the locator, the expression that finds the button, never reaches the retry action.

## What the interviewer listens for

Explain that wrapping the caption in a span would move its text out of the button's direct text nodes. If the button's full text, including text in child elements, stays predictable, use `normalize-space(.)`. That expression reads all of that text and tidies its spaces. If XPath were not required, a Playwright role and accessible name could express the same intent. The accessible name is what assistive technology, such as a screen reader, announces for the button.

## Sources

- [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [XPath node tests](https://www.w3.org/TR/xpath-10/#node-tests)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
