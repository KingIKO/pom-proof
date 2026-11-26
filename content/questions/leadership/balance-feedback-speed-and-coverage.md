---
title: Tell me about a time you made test feedback faster without losing important coverage.
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: Keep the quickest credible check for each risk close to the change and run expensive evidence at the right decision point.
looksFor:
  - How you identified duplicate coverage
  - A concrete risk you preserved at the browser layer
  - Before-and-after time and defect detection evidence
  - What you learned about measuring the change
trap: Removing slow checks without accounting for which failures were only caught there.
followUps:
  - question: What would make you reverse the split?
    answer: I'd reverse it if relevant defects regularly escaped to the later schedule or if the early suite stopped catching important risks.
---

Our pull request checks took 34 minutes at the median. I mapped the slowest checkout tests to the failures they could catch and saw repeated browser journeys for different combinations of the same pricing rule. I replaced those repeated combinations with service checks. I kept a browser check for the price a customer sees after applying a coupon and kept wider browser coverage on the release candidate.

I reran four known bad changes against the new split before making it required. All four were still detected before merge, and median feedback went to 12 minutes over the following month. I learned to keep a reason and a decision point for each slow check.

### Example

One test still verified coupon entry in the browser. Separate service checks covered expired coupons and minimum spend without navigating through checkout each time.
