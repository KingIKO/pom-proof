---
title: "A self-healing checkout test opened the gift card panel. What should count as a pass?"
topic: ai-testing
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd check that a shopper can still apply a discount. I'd review a proposed change to how the test finds the button against that goal."
looksFor:
  - "Check that applying a discount code changes the total to the expected amount."
  - "Keep the original failure visible if the suggested button opens the wrong panel."
  - "Use the original button's saved attributes to explain why the gift card button looked like a match."
  - "Have someone check the intended action before approving a permanent change to the locator."
trap: "Saving a new locator automatically because the test passed with it."
followUps:
  - question: "One build renames Apply discount and another removes it. When would you accept a replacement?"
    answer: "I'd accept a replacement only in the renamed build and only after checking that it still applies a discount. In the build without the feature, I'd keep the original failure visible."
sources:
  - label: Nass and colleagues, Similo matching method and evaluation (accessed 2026-11-27)
    url: https://arxiv.org/html/2208.00677v1
  - label: Healenium, recovery candidates and disabling healing (accessed 2026-11-27)
    url: https://github.com/healenium/healenium-web
---

I would leave the original run marked as failed. Opening a gift card panel doesn't show that shoppers can apply a discount. I'd check that the discount field appears. Then I'd apply a valid code and check that the total changes to the expected amount.

A locator tells a test how to find a page element. If it can't find the element, a self-healing test can try a replacement. A similarity-based locator compares saved attributes, or details like the button's name, with those of elements on the current page. I treat the highest score as a suggestion because nearby buttons can look alike and do different things.

I'd record the proposed change for review. I'd update the saved locator only after someone checks that it finds the intended control.

### Example

The checkout page loses Apply discount, and Apply gift card is the closest match. Both buttons open a panel, so a test that checks only for a panel can pass. I'd reject the replacement and check for the original discount code field.
