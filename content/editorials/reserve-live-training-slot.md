---
problem: locator/reserve-live-training-slot
---

```xpath
//article[not(@hidden)][.//h3[normalize-space(.)='Packing basics']][.//span[@data-slot='time'][normalize-space(.)='14:30']]//button[@aria-label='Reserve seat'][not(@disabled)]
```

Both identity checks belong to the same article. Match the full training title and the structured start-time span. Then require an available reservation button inside that card. The card and button use explicit `hidden` and `disabled` attributes in this exercise, so the XPath can exclude the inactive copies by reading those attributes.

The first reservation under `Packing basics` works when the target begins the list. It can then select a hidden duplicate or a disabled reservation on a full session. In the version with a preparation note, the first card mentions `14:30` in prose but starts at `15:00`. Checking all the card text for `14:30` would still admit that card. Exact title matching also excludes `Packing basics for supervisors`.

In an interview, say which parts of this answer rely on markup. XPath here checks for attributes in places the app specifies. It does not infer computed visibility from a CSS class or whether a button is disabled through a fieldset. If those mechanisms change, check an explicit app state or choose a locator strategy that can use the browser's state.

Sources: [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space), [MDN document.evaluate](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
