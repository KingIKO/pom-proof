---
problem: scenario/feature-flag-release-strategy
---

## What is going on

An insurance portal puts a new quote formula behind a flag. Turning it off must restore the old formula for new quotes while preserving the prices people already have open.

## The answer

1. Agree how cohort membership is assigned and how long it stays stable. Define the metrics, the stop owner, and the rules for in-flight quotes on disablement.

   **Why:** If a second request can silently change someone's cohort or nobody knows who can stop the pilot, a passing first quote gives little confidence about expansion.

2. Spend seven minutes comparing quotes for included and excluded fixture accounts, including a second request. Spend nine disabling the flag with a pilot quote open and checking both its completion and new quotes.

   **Why:** The first run detects leakage or unstable assignment. The second catches a flag that restores the old formula by repricing a quote a customer already saw.

3. Compare the deployed, persisted cohort outcomes through the API.

   **Why:** A calculation unit test does not establish which accounts the deployed service actually assigns to the new formula.

4. Verify the open quote through the UI, comparing the price displayed before disablement with its confirmation amount.

   **Why:** Correct stored pricing does not prove the confirmation screen still shows the original amount.

5. Stop expansion if an excluded account receives pilot pricing.

   **Why:** The feature is already reaching customers outside the agreed cohort. An open quote keeping its price is expected.

6. Set the criteria and stop owner, rehearse cohort separation and disablement in staging on the candidate, start a small pilot after the rehearsal passes, then judge the tagged pilot results against those criteria before expanding.

   **Why:** The rehearsal proves recovery before exposing customers, and the tags let you base expansion on evidence from the current candidate.

## Why the tempting answer fails

Approval of the announcement does not define the stop criteria or quote recovery policy. Repeating successful pilot quotes adds no rollback evidence. An API-only rollback check misses the displayed price, and starting the pilot before rehearsal leaves customers exposed before recovery has been tested.

## What the interviewer listens for

Name the decision owner and give a measurable result for both categories of quote after disablement.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 5.2.4, product risk control](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
