---
title: A shipping-price patch is ready for review but has no unit tests. How would you handle it?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: Ask the patch author to pin down the $50 cutoff in the same change, and use the review to make those checks easy to run.
looksFor:
  - Asks the patch author to put the $49.99 and $50 cases next to the pricing rule.
  - Offers to pair on the expected prices or remove shared setup that slows the check.
  - Chooses cases that belong below the browser.
  - Answers a time objection with observed costs.
trap: Sending implementation to one queue and asking a separate team to discover its intended behavior afterward.
followUps:
  - question: The author can add two cases before review closes. Which cases do you ask for, and why those?
    answer: I'd ask for $49.99 to retain the charge and $50.00 to drop it. That pair catches a misplaced cutoff without waiting for a checkout build. I'd compare the time to add it with what the last pricing mismatch cost after integration.
---

I'd ask the author to add a price table in the patch, right next to the code that decides whether shipping is free. We can settle what should happen at $50 during the review, and the author can run the table again after changing the comparison. If the only way to run it involves setting up a full basket, I'd pair with them on a small fixture the next pricing change can also use.

If the team says it has no time, I'd ask what it spent last time a pricing bug made it to a shared environment. We can compare that with the effort of adding a few cases to a function that takes plain inputs and returns a price.

### Example

For free shipping at $50 I'd ask the developer for $49.99 and $50 boundary checks. I'd add a browser check only for the separate risk that checkout fails to show the recalculated charge.
