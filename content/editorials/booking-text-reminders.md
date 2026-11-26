---
problem: locator/booking-text-reminders
---

```ts
page.getByLabel('Text reminders', { exact: true })
```

The `label` contains a checkbox, so the browser associates its text with that control. The locator returns the checkbox rather than the label around it. Moving the input to the other side of the caption or putting the caption in a span keeps the association intact. A wrapper around the entire label makes no difference either.

`page.getByRole('checkbox').nth(0)` finds the intended control only as long as the text option comes first. With email first, it still finds one checkbox. That silent success matters: a test that checks the wrong box and only confirms it became checked could pass without testing text reminders. Repeating the action or waiting for the layout would do nothing to correct the selection.

A strong interview answer can also use the checkbox role with the exact accessible name `Text reminders`. Explain that either solution ties the test to what the customer chooses. For a full booking test, verify the saved text preference after reopening the form. A checked box alone says little about whether the preference was saved.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
