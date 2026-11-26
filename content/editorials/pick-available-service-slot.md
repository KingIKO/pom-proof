---
problem: locator/pick-available-service-slot
---

```css
input[type="radio"][name="service-slot"][value="slot-1400"]:enabled
```

Keep the form group and requested schedule time in the selector. The `name` distinguishes real service slots from preview inputs. The `value` identifies the time, which remains stable when `14:00` is displayed as `14 h`. The `:enabled` pseudo-class limits the result to a control that is enabled under the browser's form rules.

Matching `name` and `value` is enough for the original page. It becomes ambiguous once the same time is listed separately for a team that is booked. Choosing the first of the identical values would select a disabled control in the first variant. Checking only for an absent `disabled` attribute on the input would fail in the translated layout, where the booked input is disabled through its fieldset.

In an interview, explain the assumption that only one real 14:00 option is enabled. If two teams can both take the booking, time and state are no longer enough. The booking flow would need to choose a team, and the locator would have to express that choice.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices). See [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled) for the CSS state selector.
