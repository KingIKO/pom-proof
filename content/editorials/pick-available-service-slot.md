---
problem: locator/pick-available-service-slot
---

## What is going on

The repair scheduler can show the same time for several teams. A team that is already booked can keep its choice on screen. A sample form can also repeat the same time value. The test needs the radio input for the real 14:00 choice that the browser lets a customer select. A radio input is a round button that lets the user pick one option from a group.

The fix uses a CSS selector, a pattern that matches page elements. Each part in square brackets is an attribute selector, which matches one attribute value. `:enabled` is a pseudo-class, a filter that matches elements by their current state.

## The fix

```css
input[type="radio"][name="service-slot"][value="slot-1400"]:enabled
```

1. Match radio inputs whose `name` is `service-slot`.

   **Why:** Radio inputs that share a `name` form one group. In `translated-slot-groups`, the preview form also has a 14:00 radio, in a group named `preview-slot`. The field name tells the real booking group apart from the preview, even when both controls have the same type and time.

2. Require `value="slot-1400"` within that group.

   **Why:** In `translated-slot-groups`, the caption changes from `14:00` to `14 h`, and 15:30 comes first. The stored value still names the requested time. It does not depend on how the time is displayed or on the order of the choices.

3. Keep only `:enabled` controls.

   **Why:** A disabled control is one the user cannot choose. In `booked-session-shown-first`, the booked radio itself is disabled. In `translated-slot-groups`, the booked radio is disabled through its fieldset, the element that groups related form controls. `:enabled` checks the browser's form state in both cases. A check for a missing `disabled` attribute on the input would let in the booked radio inside the fieldset.

## Why the tempting answer fails

The decoy matches just the name and value. That works when only one team lists that time. In `booked-session-shown-first` and `translated-slot-groups`, it matches two real 14:00 inputs, including the booked one. Choosing the first match would select the disabled radio in `booked-session-shown-first`. Picking by order can hide the fact that the locator, the expression that finds the element, still describes two choices.

## What the interviewer listens for

State the exercise's assumption that the real booking group has only one enabled 14:00 option. If two teams could both take the booking at that time, the flow would need to say which team to select. Its locator would need to say the same.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
