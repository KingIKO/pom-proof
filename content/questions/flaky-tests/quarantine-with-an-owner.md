---
title: When would you quarantine a flaky test?
topic: flaky-tests
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: Separate a diagnosed noisy check from the merge gate briefly, keep it running, and give someone a deadline to restore it.
looksFor:
  - Evidence that distinguishes test instability from a product defect
  - An owner, repair ticket, and review date
  - Continued visibility into failures
  - Temporary coverage for the risk being removed
trap: Skipping the test indefinitely without documenting what coverage disappeared.
followUps:
  - question: What earns a quarantined check its place back?
    answer: I'd require a fix tied to the cause, clean repeat runs under the failing conditions, and evidence the check catches the original bad outcome.
---

I quarantine a test when the evidence points to the test or environment and the noise is making people ignore the merge gate. If the intermittent behavior can harm a customer, I treat it as product risk and bring it to whoever owns the release decision.

I keep the quarantined test running outside the gate if feasible. It needs a named owner, a ticket with first-failure evidence, and a review date. I also say what checked that path before and what will cover it during repair. A quarantine that nobody looks at is a quiet deletion.

### Example

For an export test broken by competing file cleanup, I'd give its owner two days to isolate the download directory. I'd keep the export API check required and manually check browser downloads on the release candidate until the fixed test returns.
