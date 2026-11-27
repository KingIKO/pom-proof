---
title: Which numbers help you make quality decisions as a lead? Which have given you the wrong idea?
topic: leadership
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: I pick measures tied to harm to customers and to delivery decisions. I also show what the denominator, the total each count is divided by, leaves out.
looksFor:
  - Name a metric you chose to support a specific decision.
  - Explain how a vanity count, a number that looks good but guides no decision, misled the team.
  - Give a measured result along with its context.
  - Say what you learned about reading the data.
trap: Setting a target for bug counts or automation percentage, then treating that number as a direct measure of product quality.
followUps:
  - question: What could make a release escape rate go down for the wrong reason?
    answer: The escape rate counts defects that reach users after a release. Fewer users could reduce that count without fixing anything. So could changes to reporting or a shorter observation window.
---

I inherited a team dashboard that used the percentage of passing tests as the release measure. That number stayed high through several failed exports. It stayed high because hundreds of unrelated test cases passed.

I defined a new measure, the export failure rate that users see, counted over completed requests. I tracked jobs stuck without a result as a separate number. I also asked support to check a sample of failure messages. They looked at whether each message gave customers a useful next step.

Those numbers changed our decision. We fixed an export retry path, the code that tries a failed export again. We did that before writing more tests for low-risk report filters. Over the next month, failed or stuck exports went from 28 of 1,400 started requests to 11 of 1,350.

I learned to inspect raw counts and exposure before treating a dip as an improvement. Exposure is how much use the feature got, such as the number of started requests.

### Example

When the dashboard showed 98% of tests passing, I brought the 16 stuck exports from that week into planning. They hadn't appeared in the completed-request metric.
