---
problem: locator/reserve-live-training-slot
---

## What is going on

The training page can repeat a title for several start times and keep hidden or full sessions in the markup. The goal is the available `Packing basics` session at 14:30. Another card can mention that time in a preparation note, so the test needs the card's actual start time.

## The fix

```xpath
//article[not(@hidden)][.//h3[normalize-space(.)='Packing basics']][.//span[@data-slot='time'][normalize-space(.)='14:30']]//button[@aria-label='Reserve seat'][not(@disabled)]
```

1. Start with articles that lack the `hidden` attribute.

   **Why:** In `hidden-copy-and-earlier-slot-first`, an inactive copy has the same title and start time. The specified attribute distinguishes it before either identity check.

2. Require a descendant heading with the full normalized text `Packing basics`.

   **Why:** In `preparation-time-on-another-card`, the supervisor training shares the start time and the start of the title. Equality excludes it, and normalization handles the inline span in `archived-session-and-new-card-layout`.

3. Require the `data-slot='time'` span on that same article to read `14:30` after normalization.

   **Why:** In `preparation-time-on-another-card`, a `Packing basics` session mentions 14:30 but starts at 15:00. Using the marked span keeps the title and the actual time tied to one session.

4. Find the descendant button whose `aria-label` is `Reserve seat`.

   **Why:** In `archived-session-and-new-card-layout`, the action gains a wrapper and a translated caption. The stable label still identifies the button regardless of the visible copy.

5. Reject buttons with the `disabled` attribute.

   **Why:** In `archived-session-and-new-card-layout`, the full session has the right title, time, and action label. Only the button's disabled state keeps that reservation from matching.

## Why the tempting answer fails

The first reservation under `Packing basics` works only in the original order. In `hidden-copy-and-earlier-slot-first`, it selects the hidden copy; in `archived-session-and-new-card-layout`, it selects the disabled reservation. In `preparation-time-on-another-card`, it selects the 15:00 session. Checking the whole card for `14:30` would still admit that last result.

## What the interviewer listens for

Explain where the app puts its state attributes. This XPath reads those attributes and would not infer computed visibility or fieldset-disabled state. If those mechanisms change, use the new explicit state or a locator that understands the browser's state.

## Sources

- [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate)
- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
