---
title: "How do you make a go or no-go recommendation for a risky release?"
topic: agile
roles: [senior, sdet]
level: senior
type: scenario
oneLine: "I'd tell the release owner what I recommend and who a failure could hurt. I'd share the test results and any fallback we'd checked."
looksFor:
  - "Name the build you tested and say what you couldn't check."
  - "Explain who a failure could hurt and what would happen to them."
  - "Check whether a fallback prevents the failure and consider any harm that would last."
  - "Name who decides and what would make them stop or undo the rollout."
trap: "Recommending release because most tests passed, even though one failure could seriously harm customers."
followUps:
  - question: "Would you ship if a feature flag can turn the risky path off?"
    answer: "I'd require two checks before shipping. I'd check that turning off the flag prevents the risky behavior with the release settings. I'd ship only after that check passes and we've checked any changes to shared code or data."
  - question: "What if rolling back the release can't undo the harm?"
    answer: "I'd separate preventing new harm from helping customers already affected. If we can't prevent the failure and have no plan to help affected customers, I'd recommend waiting."
---

I'd tell the release owner whether I recommend shipping or holding. That's my go or no-go recommendation. I'd name the build I tested and say what I couldn't check. I'd explain how a failure could hurt customers. I'd give a repeatable double charge more weight than a long list of passing checkout checks.

If other changes are worth shipping, I'd see whether we can turn off the risky flow and ship the rest. I'd check that the setting works and that both flows still work where they share code or data.

During a later rollout, I'd ask the on-call lead to watch for a second charge on a single-payment order. If it happens, I'd have them turn off the new flow. Rolling back the code won't refund customers it already charged.

### Example

In staging, an environment we use before release, a retry after a payment timeout charged my test customer twice. I recommended holding the new checkout flow. With the flow off, we saw shoppers use the existing checkout. I reran the retry and saw one charge. The release owner shipped the unrelated fixes and held the new flow until we could check the corrected retry.
