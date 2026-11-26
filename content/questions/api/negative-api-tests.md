---
title: "How do you design negative tests for a write endpoint?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Start from a valid request, change one assumption per case, and verify both the rejection and the absence of unintended writes."
looksFor:
  - "Uses a positive control on the same setup."
  - "Separates missing data, invalid values, and incompatible states."
  - "Checks stable error fields that callers rely on."
  - "Looks for partial writes or events."
trap: "Sending five invalid fields together and counting one validation error as coverage for all five."
followUps:
  - question: "When would you combine invalid fields?"
    answer: "When the client depends on receiving multiple error details together or the contract promises which error takes precedence."
---

I start with data that can succeed, then change one field or one bit of setup per test. That helps me tell whether missing values, invalid values, or an incompatible state caused the rejection. I check the error details the client uses and verify the system was left in the expected state. If the operation sends a notification, I also check that no notification was queued on rejection.

### Example

For editing a delivery address I'd try a missing postcode separately from an otherwise valid address submitted after dispatch. I would expect each to fail for its own reason and make sure the order retains the original address after both.
