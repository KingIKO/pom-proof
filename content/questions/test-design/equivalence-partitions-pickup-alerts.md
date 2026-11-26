---
title: How would you use equivalence partitioning to test a pickup alert preference?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Group inputs by how the product should handle them, then pick one representative from each valid and invalid group.
looksFor:
  - Groups values by expected handling rather than by how they look.
  - Splits supported choices when they produce different effects.
  - Includes unsupported and missing input when the contract distinguishes them.
  - Uses the saved setting and delivery outcome to check the result.
trap: Putting every supported choice in one group because each one shows a successful save.
followUps:
  - question: When would you test a second value from a group?
    answer: When I have a reason to expect different handling. If the feature treats blank input differently from unknown channel names, I'd split those into separate groups.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd start with what the setting is supposed to do after it saves. If email sends a message to one place and text sends it to another, those are different groups for a delivery test. I'd choose one representative of each group and check the result that makes it different. For invalid input, I'd check what happens to the setting already on the account as well as what the user sees.

### Example

A grocery pickup service supports email, text, and no alerts. Its settings API requires a choice and distinguishes a missing choice from an unsupported one. I'd check a pickup-ready event for each of the supported settings using test inboxes. Then I'd submit an unsupported choice such as `fax` and a request with the choice omitted. Each should return its documented error and leave the saved preference alone.
