---
problem: scenario/feature-flag-release-strategy
---

## What is going on

An insurance portal puts a new quote formula behind a feature flag. A feature flag is a switch that turns a feature on or off without a new release. Turning the flag off must bring back the old formula for new quotes. It must also keep the prices of quotes that people already have open.

## The answer

1. Agree on the rules for running and stopping the pilot.

   Decide how accounts join the cohort, the group that gets the new formula. Agree how long that membership stays stable. Define the metrics and the stop owner who can end the pilot. Decide what happens to in-flight quotes, the ones still open, when the flag is turned off.

   **Why:** Suppose a second request can silently change someone's cohort. Then a passing first quote gives little confidence about expansion. The same is true if nobody knows who can stop the pilot.

2. Spend seven minutes on cohort separation and nine minutes on turning the flag off.

   Compare quotes for included and excluded fixture accounts, the prepared test accounts. Repeat the comparison on a second request. With a pilot quote still open, turn the flag off. Check how that quote completes and how the service prices new quotes.

   **Why:** Comparing the accounts catches pilot pricing outside the cohort or a change in who gets it. The flag-off run catches a switch that restores the old formula by repricing a quote a customer already saw.

3. Through the API, compare the cohort outcomes that the deployed service saved.

   **Why:** A unit test of the calculation does not establish which accounts the deployed service actually assigns to the new formula.

4. Through the UI, compare the open quote's price shown before the flag was turned off with its confirmation amount.

   **Why:** A correct stored price does not prove that the confirmation screen still shows the original amount.

5. If an excluded account receives pilot pricing, stop the expansion.

   **Why:** The feature is already reaching customers outside the agreed cohort. An open quote that keeps its price is expected.

6. Run a small pilot with a staging rehearsal and a decision before expansion.

   Set the criteria and the stop owner. On the candidate build in staging, the pre-release test environment, rehearse keeping the cohorts separate and turning the flag off. After the rehearsal passes, start the pilot. Before expanding, judge the tagged pilot results against the criteria.

   **Why:** The rehearsal proves recovery before any customers are exposed. The tags mark which build produced each result. They let you base expansion on evidence from the current candidate.

## Why the tempting answer fails

Approval of the announcement does not define the stop criteria or the quote recovery policy. Repeating successful pilot quotes adds no rollback evidence. Rollback means turning the change off again. An API-only rollback check misses the displayed price. Starting the pilot before the rehearsal leaves customers exposed before anyone has tested recovery.

## What the interviewer listens for

Name the decision owner. Give a measurable result for both categories of quote, open and new, after the flag is turned off.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 5.2.4, product risk control](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
