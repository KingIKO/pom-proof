---
title: The first address test turns red after a redesign. What do you check?
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: concept
oneLine: Find the earliest mismatch and decide whether the test, the data, or the customer outcome changed.
looksFor:
  - Preserves failure evidence before rerunning.
  - Checks whether the expectation still matches the requirement.
  - Separates a locator or setup problem from a product problem.
  - Explains why a test that cannot fail is costly.
trap: Updating every test expectation until the new UI is green.
followUps:
  - question: The save request returns an error but the banner says Saved. What tells you whether the address test would catch that?
    answer: I'd make the save fail in a test environment and run the address case unchanged. If it stays green, I'd fix that blind spot first because the passing banner check could hide a release problem. I'd require evidence of the saved value, such as a read after reload.
---

I'd look at the first failing step with its inputs, screenshot, and request result. Did the test find the right control, reach the action, and check an expectation we still stand behind? A selector that points to a removed field is a test maintenance issue. A valid address that can't be saved through the redesigned form could be a customer-facing defect.

I'd retry with the same data only after keeping that evidence, and I would check the flow directly if the error is ambiguous. Once fixed, I'd prove the check can turn red for the failure it claims to cover.

### Example

If the redesigned form moved the postcode input, I'd update its locator. If the new screen still shows a success banner after the address request fails, I'd report the product bug and keep the failing expectation.
