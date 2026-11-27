---
title: How do you decide what to automate first?
topic: automation-strategy
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Start with a costly failure you check often, then use the cheapest test layer that can catch it.
looksFor:
  - A concrete customer or business risk
  - Frequency and maintenance cost
  - Expected results that can be stated clearly
  - A reason to use the chosen test layer
trap: Picking the easiest clicks to script and claiming the resulting test count proves coverage.
followUps:
  - question: What would you leave manual at first?
    answer: I would explore a new checkout layout manually until the team settles the interaction and I can describe the expected behavior.
  - question: You have one afternoon before release. Do you automate the expired coupon or the new coupon drawer on mobile?
    answer: I'd automate rejection of the expired coupon at the API if the rule is stable and we'll use the check again. I'd spend some of the afternoon using the drawer on a phone and record anything that makes the field hard to find.
sources:
  - label: Selenium guidance on CAPTCHAs
    url: https://www.selenium.dev/documentation/test_practices/discouraged/captchas/
  - label: Selenium guidance on two-factor authentication
    url: https://www.selenium.dev/documentation/test_practices/discouraged/two_factor_authentication/
---

I ask what breaks often, what hurts when it breaks, and what people are checking over and over before release. A good first candidate has an outcome I can put into words and data I can recreate. If resetting the environment takes longer than running the check manually, I account for that before committing to it.

Then I ask where the bug could be detected. A rule about what a discount costs can usually be exercised below the browser. I'd save browser time for proving a customer can apply a discount and see the adjusted amount. A first batch should be small enough that the team can fix it quickly when it fails.

I'd explore the changing coupon drawer on a phone to see if shoppers find it. A one-off script that clicks the drawer won't tell me that. I'd run recurring coupon checks with a signed-in test account and check the live anti-bot prompt and second factor separately. If a weekly check saves 20 minutes after upkeep, an hour of setup pays back in three runs.

### Example

For checkout I'd start with an API check that rejects expired coupons and a browser check that a valid coupon updates the total. I'd still explore how mobile users find the coupon field before committing to more browser checks.
