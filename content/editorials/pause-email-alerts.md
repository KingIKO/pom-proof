---
problem: locator/pause-email-alerts
---

## What is going on

The delivery settings repeat Pause and Edit for each channel. A channel is one way to send alerts, such as email, text or push. The task is to pause email alerts and leave text or push alerts alone. The app sends each command to the right place by two stable values. One is the row's channel value, and the other is the button's name.

The captions and the order of the actions can change, and the command still goes to the same place. The fix uses a CSS selector, a pattern that matches page elements. Square brackets make an attribute selector. For example, `[data-channel="email"]` matches elements whose `data-channel` attribute is `email`.

## The fix

```css
[data-channel="email"] button[name="pause-channel"]
```

1. Narrow the search to the element with `data-channel="email"`.

   **Why:** In `channels-reordered`, text alerts move to the top and offer the same action. The channel value picks out the intended row wherever it sits. It also stays the same when the email caption is translated in `grouped-channel-actions`.

2. Find the descendant button whose `name` is `pause-channel` in that row.

   **Why:** A descendant is any element inside another one, at any depth. In `grouped-channel-actions`, Edit comes first, Pause reads `Suspendre`, and both buttons move inside a `div`. The button's name identifies the form action, even after translation. The space in the selector lets the button sit at any depth below the channel row.

Selenium is another browser automation tool. In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, '[data-channel="email"] button[name="pause-channel"]')`.

## Why the tempting answer fails

The decoy picks the first direct button in the first list item. A direct child sits immediately inside its parent, with no element between them. In the original markup, that button happens to pause email. In `channels-reordered`, the same spot pauses text alerts. In `grouped-channel-actions`, the buttons are no longer direct children, so the decoy finds nothing.

Removing only the direct-child rule would still pick Edit first. To fix the cause, the test needs a way to identify both the channel and the intended command.

## What the interviewer listens for

Explain why these CSS attributes suit this case. They identify the configured channel and the form action that the app itself uses. They might instead be private values that change every release. In that case, use a documented hook, meaning a value the team publishes for tests to rely on. Or find the action by its name within the right row.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
