---
title: How do you decide what to automate first?
topic: automation-strategy
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I start with a costly failure we check for often and use the least expensive test layer that can catch it.
looksFor:
  - Name a specific risk to customers or the business.
  - Say how often the check runs and what it costs to maintain.
  - State what result the test should expect.
  - Explain why the chosen test layer fits the check.
trap: Scripting the easiest clicks and treating the number of tests as proof of coverage.
followUps:
  - question: What would you leave manual at first?
    answer: I'd explore a new checkout layout by hand. I'd keep it manual until the team agrees on the interaction and I can describe what should happen.
  - question: You have one afternoon before release. Do you automate the expired coupon or the new coupon drawer on mobile?
    answer: If the rule is stable and we'll repeat the check, I'd write an API test for expired coupon rejection. I'd spend some of the afternoon trying the drawer on a phone. I'd record anything that makes the coupon field hard to find.
sources:
  - label: Selenium guidance on CAPTCHAs
    url: https://www.selenium.dev/documentation/test_practices/discouraged/captchas/
  - label: Selenium guidance on two-factor authentication
    url: https://www.selenium.dev/documentation/test_practices/discouraged/two_factor_authentication/
---

I ask what breaks often and what happens to users or the business when it breaks. I also ask which checks people repeat before release. I look for a check with a clear expected result and test data I can recreate. If resetting the environment takes longer than checking by hand, I count that cost before choosing the test.

Then I ask which test layer can see the bug. For a rule that calculates a discount, I can usually test without a browser. I'd use the browser to check whether the customer can apply the discount and see the adjusted total. I'd keep the first batch small so the team can fix failing tests quickly.

I'd explore the changing coupon drawer on a phone to see if shoppers can find it. A script that opens the drawer once won't answer that question. I'd use a signed-in test account for repeat coupon checks. I'd test the live anti-bot prompt and the second factor separately. If the check saves 20 minutes each week after maintenance, it covers an hour of setup in three runs.

### Example

For checkout, I'd start with an API test that checks whether the service rejects expired coupons. I'd also check in the browser that a valid coupon updates the total. Before adding more browser checks, I'd explore how mobile users find the coupon field.
