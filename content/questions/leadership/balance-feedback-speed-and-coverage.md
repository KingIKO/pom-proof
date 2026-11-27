---
title: When have you made test results come back sooner and kept the checks that mattered?
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: For each risk, I run the quickest check I trust soon after the change. I run the slow, costly checks at the point where the team makes a decision.
looksFor:
  - Explain how you found tests that covered the same thing.
  - Name one specific risk you kept testing in the browser.
  - Show the feedback time and the defects caught, before and after the change.
  - Say what you learned about measuring the change.
trap: Removing slow checks without finding out which failures only those checks caught.
followUps:
  - question: What would make you undo the split between early and later checks?
    answer: I'd undo it if relevant defects regularly got past the early checks and showed up only on the later schedule. I'd also undo it if the early suite stopped catching important risks.
---

Our pull request checks took 34 minutes at the median. A pull request is a proposed code change, and these checks ran on it before merge. The median is the middle value when you sort all the run times.

I listed the slowest checkout tests and the failures each one could catch. Many were repeated browser journeys, tests that click through the site in a real browser. Each journey tried a different combination of the same pricing rule. I replaced those repeated combinations with service checks. A service check tests the pricing service directly, without opening a browser.

I kept a browser check for the price a customer sees after applying a coupon. I also kept wider browser coverage on the release candidate, the build we planned to ship.

Before I made the new split required, I reran four known bad changes through it. The checks still caught all four before merge. Over the following month, median feedback time went down to 12 minutes. I learned to record a reason for each slow check and the decision point it serves.

### Example

One test still checked coupon entry in the browser. Separate service checks covered expired coupons and minimum spend. They did this without clicking through checkout each time.
