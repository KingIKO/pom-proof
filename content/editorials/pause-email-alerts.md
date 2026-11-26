---
problem: locator/pause-email-alerts
---

```css
[data-channel="email"] button[name="pause-channel"]
```

The selector names the channel and then the action. `[data-channel="email"]` identifies the email delivery row. Within it, `button[name="pause-channel"]` picks Pause rather than Edit. The space means the button can be at any depth beneath the channel element, which matters when the toolbar gains a wrapper.

The first-channel, first-button selector gets the initial layout right. After channel reordering it points at Pause for text alerts. In the translated layout it matches no button because the actions are nested. Even if you removed the direct-child combinator, the first action would be Edit. The app uses the same channel and action values to interpret the command in either locale.

A strong interview answer explains why each attribute is stable enough to depend on. `data-channel` stands for a configured delivery channel, and the button name identifies the form action. CSS is a reasonable choice under those contracts. If those values were private implementation details that changed on every release, ask for a stable test hook or select a named action within the corresponding row.

In Selenium Python, use `driver.find_element(By.CSS_SELECTOR, '[data-channel="email"] button[name="pause-channel"]')`.

Sources: [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
