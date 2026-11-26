---
title: How would you build a decision table for whether a cart can be picked up?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: concept
oneLine: Write one rule for each feasible combination of conditions and record the expected action, including which reason wins when rules overlap.
looksFor:
  - Separates the conditions from the actions.
  - Checks whether each combination can happen before removing it.
  - Confirms which explanation wins when both blocking conditions apply.
  - Derives a test from each rule and checks the offered option and explanation.
trap: Testing each reason for blocking pickup on its own and missing the case where both apply.
followUps:
  - question: Can you combine two columns that both block pickup?
    answer: Only if the differing condition does not affect any expected action. Two blocked results with different messages are still different rules.
  - question: What if the rules do not say which message wins?
    answer: I'd show that combination to the product owner and ask for a decision before treating either message as correct.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.3
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd put the conditions in rows and give each feasible combination its own column. Below the conditions I'd record what checkout should do, including the reason it gives when pickup is unavailable. That makes it easy to see a missing rule before I start creating carts.

I'd check whether stock and pickup eligibility are independent before assuming some columns can be dropped. I'd first run one cart per feasible rule. If two columns differ on a condition that has no effect on any action, I can merge them and keep extra cases where the risk warrants it.

### Example

A store offers pickup if every item is pickup-eligible and in stock at the chosen store. With both conditions true, offer pickup. If only stock is missing, say the store is out of stock. If an item is ineligible, show the eligibility reason whether stock is available or missing. I'd test both of those last cases while checking which explanation is supposed to take priority.
