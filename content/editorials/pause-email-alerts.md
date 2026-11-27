---
problem: locator/pause-email-alerts
---

## What is going on

The delivery settings repeat Pause and Edit for each channel. The task is to pause email alerts and leave text or push alerts alone. The app uses a stable channel value and a stable button name to route commands. The captions and action order can change without changing where the command goes.

## The fix

```css
[data-channel="email"] button[name="pause-channel"]
```

1. Scope to the element with `data-channel="email"`.

   **Why:** In `channels-reordered`, text alerts move to the top and offer the same action. The channel value identifies the intended row independently of its position. It also stays fixed when the email caption is translated in `grouped-channel-actions`.

2. Find the descendant button named `pause-channel` in that row.

   **Why:** In `grouped-channel-actions`, Edit comes first, Pause reads `Suspendre`, and both buttons move inside a `div`. The name identifies the form action even after translation, and the space in the selector allows the button to sit at any depth below the channel.

In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, '[data-channel="email"] button[name="pause-channel"]')`.

## Why the tempting answer fails

The first direct button in the first list item happens to pause email in the original markup. In `channels-reordered`, that location pauses text alerts. In `grouped-channel-actions`, the buttons are no longer direct children, so the decoy finds nothing. Removing only the direct-child restriction would still put Edit first. To fix the cause, the test needs a way to identify both the channel and the intended command.

## What the interviewer listens for

Explain why these CSS attributes are suitable here: they identify the configured channel and form action the app uses. If they were private values that changed every release, use a documented hook or a named action scoped to the appropriate row.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
