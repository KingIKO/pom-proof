---
title: How would you use a decision table to test whether checkout offers pickup?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: concept
oneLine: I'd write an expected result for each combination that can happen. If more than one reason blocks pickup, I'd record which reason should appear.
looksFor:
  - List the conditions separately from what checkout does.
  - Before dropping a combination, check whether it can happen.
  - Check which explanation checkout should show when both reasons apply.
  - Make a test for each rule and check what checkout offers or explains.
trap: Testing each reason on its own and missing what happens when both reasons block pickup.
followUps:
  - question: When can you merge two columns that both block pickup?
    answer: I'd only merge them if the condition that differs changes none of the expected actions. If checkout shows different messages, I'd keep them separate.
  - question: What would you do if the rules don't say which reason should appear?
    answer: I'd show the product owner the combination. I'd ask them to choose the correct message before I test for it.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.3
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd use a decision table to show what checkout should do for each combination of conditions. I'd put the conditions in rows and give each possible combination its own column. Below them, I'd record the expected action and any reason pickup is unavailable. I can spot a missing rule before making test carts.

Before dropping columns, I'd check whether stock and pickup eligibility can change independently. Pickup eligibility says whether an item qualifies for pickup. I'd first test one cart for each combination that can happen. If two columns differ only in a condition that changes no action, I'd merge them. I'd keep extra tests where the risk calls for them.

### Example

I'd expect pickup when every item qualifies and is in stock at the chosen store. If stock is the only problem, I'd expect an out-of-stock message. If an item doesn't qualify, I'd expect the message to explain that. I'd test an item that doesn't qualify both with and without stock to check which explanation takes priority.
