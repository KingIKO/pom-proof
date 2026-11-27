---
title: "Tell me about a time you pushed back on a release."
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: "When I push back on a release, I explain why it shouldn't go ahead as planned. I show how to repeat the problem customers would see and give the release owner an option they can act on."
looksFor:
  - "Share the evidence you collected and the option you recommended."
  - "Name who made the release decision."
  - "Show what happened after that decision."
  - "Explain what you learned about deciding when a release can go out."
trap: "Saying QA blocked the release without describing the impact or offering other options."
followUps:
  - question: "What would you do if the release owner shipped the change anyway?"
    answer: "I'd record the risk the owner accepted. Before rollout, I'd agree on what to watch, when to undo the release, and who would act."
---

Two hours before a release, I found a problem with coupons. After I applied a coupon and changed the shipping address, the confirmation could show a higher total than the cart. I needed to give the release owner a recommendation before the time set aside to deploy ran out. I reproduced the issue on two accounts and saved both totals. I checked that the older checkout didn't have the problem.

I recommended shipping the rest of the release with the new checkout flag off. The flag was a setting that turned the new checkout on or off. The release owner agreed. I checked the old checkout in the build we planned to release. I confirmed the fix before the team turned the flag back on two days later.

### Example

I reported a $42 cart total and a $49 confirmation total for the same order. My screenshots and steps let the release owner see the difference without waiting for a meeting. I learned to test the fallback before release day.
