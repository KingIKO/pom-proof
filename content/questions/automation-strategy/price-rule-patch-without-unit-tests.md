---
title: "A shipping-price patch is ready for review but has no unit tests. How would you handle it?"
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd ask the author to test the $50 cutoff in the same change. I'd help make those checks easy to run."
looksFor:
  - "Ask the author to test $49.99 and $50 near the pricing code."
  - "Offer to work out the expected prices together or remove setup that slows the check."
  - "Pick cases that can run without a browser."
  - "Compare the time to add checks with the cost of an earlier pricing bug."
trap: "Sending the change to a separate team to work out what it should do after it's built."
followUps:
  - question: "The author has time for two cases before review closes. Which ones would you choose, and why?"
    answer: "I'd check that $49.99 still has a charge and $50.00 drops it. Together they catch a wrong cutoff without waiting for checkout to build. I'd compare the time to add them with what the last pricing bug cost after the code was put together."
---

I'd ask the author to add a table of prices to the patch, the proposed code change. The table would go next to the code that decides whether shipping is free. We'd agree on what happens at $50 in the review. The author could rerun those checks after changing the comparison. If the check needs a full basket, I'd work with the author on a smaller fixture, or test setup, we can reuse.

If the team is short on time, I'd ask how long the last pricing bug took to fix after it reached a shared environment. I'd compare that with adding a few cases to a function that takes simple inputs and returns a price.

### Example

For free shipping at $50, I'd ask the developer to check $49.99 and $50 in a unit test that runs the pricing code by itself. I'd add a browser check only for the separate risk that checkout shows the wrong charge after recalculating.
