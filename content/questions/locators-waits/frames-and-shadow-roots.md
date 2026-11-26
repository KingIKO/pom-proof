---
title: How would you locate a control inside an iframe or shadow DOM?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Identify which kind of boundary you have before changing the selector.
looksFor:
  - An iframe has a separate document
  - How to target a frame in Playwright
  - Limits around closed shadow roots and XPath
  - Correct Selenium equivalents when asked
trap: Making a longer top-level XPath without checking whether the target lives in a different document.
followUps:
  - question: What if a component uses a closed shadow root?
    answer: I'd test its public behavior or agree on a component test interface instead of depending on access to private nodes.
sources:
  - label: Playwright frames
    url: https://playwright.dev/docs/frames
  - label: Playwright locators and shadow DOM
    url: https://playwright.dev/docs/locators#locate-in-shadow-dom
  - label: Selenium frames
    url: https://www.selenium.dev/documentation/webdriver/interactions/frames/
  - label: Selenium element finders
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
---

I inspect where the control lives. An iframe has its own document, so in Playwright I'd use `frameLocator` to reach it and then locate the control within that frame. In Selenium I'd switch to the frame before searching and switch back when I need the outer page.

A shadow root belongs to a host element. Playwright locators generally reach into open shadow roots; XPath doesn't cross them, and closed roots aren't supported by that locator behavior. In Selenium Java I'd get the host's shadow root with `getShadowRoot()` and search from the returned context.

### Example

If a shipping estimator sits in a named iframe and uses a custom date component, I'd first locate the frame, then use the date field's label inside its open shadow DOM. I'd assert the resulting estimate on whichever document actually displays it.
