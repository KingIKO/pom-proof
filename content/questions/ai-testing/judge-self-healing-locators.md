---
title: A healed checkout test opened the gift card panel. What should count as a pass?
topic: ai-testing
roles: [automation, sdet]
level: mid
type: concept
oneLine: Require evidence that the shopper can apply a discount, and review any locator change against that purpose.
looksFor:
  - Requires a discount code to change the expected order total.
  - Keeps the original failure visible when the proposed button opens a different panel.
  - Uses the saved attributes to explain why the gift card button looked like a match.
  - Requires someone to approve any saved locator change against the intended action.
trap: Updating the saved locator automatically whenever a substitute lets the test pass.
followUps:
  - question: In one checkout build Apply discount was renamed, and in another it was removed. Which suggestion would you accept?
    answer: >-
      I'd accept a replacement only in the renamed build, after checking that it still applies a
      discount. In the build without the feature, the original failure must remain visible.
sources:
  - label: Nass and colleagues, Similo matching method and evaluation (accessed 2026-11-27)
    url: https://arxiv.org/html/2208.00677v1
  - label: Healenium, recovery candidates and disabling healing (accessed 2026-11-27)
    url: https://github.com/healenium/healenium-web
---

I'd keep the original run failed. Opening a gift card panel doesn't demonstrate that the
discount control works. I'd strengthen the test by requiring the discount field and checking
that applying a valid code changes the order total as expected.

A similarity-based locator can compare saved attributes with elements on the current page.
Its highest score is only a suggestion; nearby controls can share an appearance and have
different effects. I'd record the proposed change for review, then update the saved locator
only if someone confirms it still refers to the same control.

### Example

The checkout page loses its Apply discount button, and the closest candidate is Apply gift
card. Both open a panel, so a test that only checks for a panel can turn green. I'd reject the
substitution and check for the discount code field as part of the original behavior.
