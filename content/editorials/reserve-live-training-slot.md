---
problem: locator/reserve-live-training-slot
---

## What is going on

The training page can repeat a title for several start times. It can also keep hidden or full sessions in the markup. The goal is the available `Packing basics` session at 14:30. Another card can mention that time in a preparation note. So the test needs the card's actual start time.

The fix uses XPath, a language for finding elements in the page markup. Each part in square brackets is a condition the element must meet. `@` refers to an attribute, and `.//` searches anywhere inside the current element. The `normalize-space` function trims spaces from the ends of the text and turns each run of spaces into one space.

## The fix

```xpath
//article[not(@hidden)][.//h3[normalize-space(.)='Packing basics']][.//span[@data-slot='time'][normalize-space(.)='14:30']]//button[@aria-label='Reserve seat'][not(@disabled)]
```

1. Start with articles that lack the `hidden` attribute.

   **Why:** In `hidden-copy-and-earlier-slot-first`, an inactive copy has the same title and start time. The `hidden` attribute on that copy tells it apart before either identity check runs.

2. Require a descendant heading with the full normalized text `Packing basics`.

   **Why:** A descendant is any element inside another one, at any depth. In `preparation-time-on-another-card`, the supervisor training shares the start time and the start of the title. The exact text match leaves it out. XPath reads the full heading text before it normalizes the spaces. That includes the text wrapped in a span in `archived-session-and-new-card-layout`.

3. Require the `data-slot='time'` span on that same article to read `14:30` after normalization.

   **Why:** In `preparation-time-on-another-card`, one `Packing basics` session mentions 14:30 but starts at 15:00. The marked span holds the actual start time. Using it keeps the title and the actual time tied to one session.

4. Find the descendant button whose `aria-label` is `Reserve seat`.

   **Why:** In `archived-session-and-new-card-layout`, the action gains a wrapper and a translated caption. The `aria-label` attribute gives the button a name that stays the same when the visible text changes. So the label still identifies the button.

5. Reject buttons with the `disabled` attribute.

   **Why:** In `archived-session-and-new-card-layout`, the full session has the right title, time and action label. Only the button's disabled state keeps that reservation from matching.

## Why the tempting answer fails

The decoy takes the first reservation button under `Packing basics`. It works only in the original order. In `hidden-copy-and-earlier-slot-first`, it selects the hidden copy. In `archived-session-and-new-card-layout`, it selects the disabled reservation. In `preparation-time-on-another-card`, it selects the 15:00 session.

A check of the whole card for `14:30` would still let in that 15:00 session, because its note mentions 14:30.

## What the interviewer listens for

Explain where the app puts its state attributes, because this XPath reads those attributes directly. It would not work out visibility that the browser computes, for example from CSS. It would also miss a button disabled through its fieldset, the element that groups form controls. If the app changes how it hides or disables things, use the new explicit state. Or use a locator, an expression that finds elements, that understands the browser's state.

## Sources

- [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate)
- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
