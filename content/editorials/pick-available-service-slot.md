---
problem: locator/pick-available-service-slot
---

## What is going on

The repair scheduler can show the same time for multiple teams. A booked team can keep its choice on screen, and a sample form can repeat the same time value. The test needs the radio input for the real 14:00 choice that the browser lets a customer select.

## The fix

```css
input[type="radio"][name="service-slot"][value="slot-1400"]:enabled
```

1. Match radio inputs named `service-slot`.

   **Why:** In `translated-slot-groups`, the preview also has a 14:00 radio. The field name distinguishes the real booking group from `preview-slot`, even when controls have the same type and time.

2. Require `value="slot-1400"` within that group.

   **Why:** In `translated-slot-groups`, the caption changes from `14:00` to `14 h`, and 15:30 comes first. The stored value still identifies the requested time without relying on display formatting or order.

3. Keep only `:enabled` controls.

   **Why:** In `booked-session-shown-first`, the booked radio is directly disabled. In `translated-slot-groups`, the booked radio is disabled through its fieldset. `:enabled` checks the browser's form state in both cases. Looking for an absent `disabled` attribute on the input would admit the booked radio in the fieldset.

## Why the tempting answer fails

Matching just the name and value works when only one team lists that time. In `booked-session-shown-first` and `translated-slot-groups`, it matches two real 14:00 inputs, including the booked one. Choosing the first would select the disabled radio in `booked-session-shown-first`. Order can hide that the locator still describes two choices.

## What the interviewer listens for

State that the exercise has only one enabled 14:00 option in the real booking group. If two teams could both take the booking at that time, the flow and its locator would need to specify which team to select.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN :enabled](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:enabled)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
