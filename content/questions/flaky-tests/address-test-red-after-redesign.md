---
title: "An address test fails after a redesign. What do you check first?"
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I find the first step that went wrong. I check whether the test, the data, or what the customer sees changed."
looksFor:
  - "Save details of the failure before trying again."
  - "Check that the result the test expects is still what the requirement says."
  - "Tell a problem finding the control or setting up data apart from a bug in the app."
  - "Explain what an always-passing test could let you miss."
trap: "Changing expectations until the tests pass on the redesigned screen."
followUps:
  - question: "If the request to save fails but the page says Saved, how would you check that the test catches it?"
    answer: "I'd make the save fail in a test environment and run the test unchanged. If it passes, I'd fix that gap first, because just checking the banner could hide a release problem. I'd check the saved value, for example by reading it after reload."
---

I'd look at the first failing step and save its inputs, screenshot, and request result. I'd check whether the test found the right control and whether it reached the action. I'd ask whether the requirement still supports the expected result. If the selector, the rule for finding the field, points to a removed field, the test needs a change. If the redesigned form won't save a valid address, the app may have a bug.

I'd keep the evidence before rerunning with the same data. If the error doesn't tell me which side is wrong, I'd try the address flow myself. After fixing the problem, I'd prove the test fails for the bug it should catch.

### Example

If the redesign moved the postcode field, I'd update the locator, the test's way of finding it. If the redesigned screen still says Saved after a failed request, I'd file a product bug and keep the existing expected result.
