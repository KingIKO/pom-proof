---
title: A second library branch places a hold on a loan. How would that change the tests you choose?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd tell apart cases I get from the public renewal rule and cases I get from how the system stores or checks holds.
looksFor:
  - Explain why storing a branch with each hold suggests a test for a reservation at another branch.
  - Tell that test apart from making the code take both paths in its hold check.
  - Give a case that follows from the library's public renewal rule.
  - Group cases by how you chose them, regardless of where they run.
trap: Calling every API check grey-box, meaning it uses some knowledge of the system's inner workings, just because it skips the browser.
followUps:
  - question: If the table that stores holds changes but the renewal rule stays the same, which case would you keep as written?
    answer: I'd keep the case based on the public no-hold rule. I'd review any fixture, or test data, that depends on the old table. I'd also review any case meant to run a specific part of the code.
sources:
  - label: ISTQB CTFL v4.0.1, sections 2.2.2 and 4.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: NIST glossary, grey-box testing
    url: https://csrc.nist.gov/glossary/term/gray_box_testing
---

If I know that the hold table records a branch, I get a case I might otherwise miss. I'd add a hold at the second branch as test data. Then I'd call the renewal API, the way apps request renewals. This is grey-box testing. I use inside knowledge to set up the case and still judge it by the response.

If I choose a case from the public rule alone, I can use the same API for a black-box test. If I read the renewal function to test both paths in its hold check, I design a white-box test. I could also test the function directly against its contract, or promise to its callers. A unit test runs a small piece of code. That tells me where the test runs, regardless of how I chose the case.

### Example

For a library renewal, I'd use the public no-hold rule to check an eligible loan. I'd read the renewal function and make it take each path in its hold check. I'd also use the hold table to add a reservation from a second branch before calling the renewal API again.
