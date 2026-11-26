---
title: How would you use BDD to agree on a discount rule and express it in Given, When, and Then?
topic: agile
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Agree on how the cart should behave using concrete examples, then write the precondition, event, and observable result.
looksFor:
  - Describe BDD as collaboration around behavior before implementation.
  - Show a Given that puts the cart in a known state.
  - Tie a single When to an observable Then in business language.
  - Distinguish the written scenario from the code that runs it.
trap: Writing a script of clicks after the feature ships and calling that the BDD conversation.
followUps:
  - question: Why wouldn't you put the promo field selector in the scenario?
    answer: The rule should still read the same after a redesign. If a browser check is useful, the selector belongs in the code behind the step.
  - question: What would you automate first?
    answer: I'd check the rejection and unchanged discounted subtotal at the cart service level. I'd use a browser check if I also needed evidence that shoppers see the reason.
sources:
  - label: Cucumber docs on behavior-driven development
    url: https://cucumber.io/docs/bdd/#three-practices
  - label: Cucumber Gherkin reference on steps
    url: https://cucumber.io/docs/gherkin/reference/#steps
---

I'd bring a concrete cart example before anyone builds the rule. Say it has a $40 item and a 10 percent referral discount. Should a $5 promo code replace that discount? If we reject the code, what does the shopper see? I'd work through the example with the product owner and a developer so we agree on the result.

In BDD, I'd use the agreed example to guide the implementation and keep it as a repeatable check. In Gherkin, Given describes the starting state, When names the event, and Then gives the observable result. Cucumber needs matching step definitions to run those steps as a test.

### Example

Product chose to keep the referral discount and explain why the code was rejected. We agreed on these steps before building the change:

```gherkin
Given a $40 cart with a 10 percent referral discount
When the shopper applies a $5 promo code
Then the cart says only one discount can be used
And the discounted subtotal remains $36
```
