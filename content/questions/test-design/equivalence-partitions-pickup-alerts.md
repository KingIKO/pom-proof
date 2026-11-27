---
title: How would you use equivalence partitioning to test a pickup alert preference?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd group inputs by what the product should do with them. I'd test one choice from each allowed and rejected group.
looksFor:
  - Group inputs by what the app should do, even if the inputs look alike.
  - Put supported choices that behave differently in separate groups.
  - If the rules distinguish a missing choice from an unsupported one, test both.
  - Check what the app saves and whether it sends the alert as expected.
trap: Putting all supported choices in one group because they all save successfully.
followUps:
  - question: When would you test a second value from a group?
    answer: I'd do it if I have reason to expect a different result. If the app handles blank input differently from an unknown alert channel name, I'd put them in separate groups.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd use equivalence partitioning, which groups inputs that should give the same kind of result. I'd start with what the app should do after saving the choice. If email and text send messages to different places, I'd put them in separate groups for a delivery test. I'd choose one input per group and check what sets that result apart. For invalid input, I'd check both what the user sees and what happens to the saved choice.

### Example

I'd use a grocery pickup service that offers email, text, or no alerts. I'd trigger a pickup-ready event for each choice and check the test inboxes. The settings API requires a choice and treats a missing choice differently from an unsupported one. I'd send an unsupported choice, such as `fax`, and then leave it out of another request. I'd expect each request to return its documented error and leave the saved choice unchanged.
