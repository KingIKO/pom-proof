---
title: How would you use error guessing after a settings bug?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Use past failures to form a specific guess about what could break, then design a check that can prove or rule it out.
looksFor:
  - Names a defect history or prior observation that informs the guess.
  - Identifies a similar path or component where the issue might recur.
  - Gives a repeatable setup and a concrete expected result.
  - Uses error guessing to supplement tests for agreed rules.
trap: Clicking through settings at random and writing down only the screens visited.
followUps:
  - question: What if you are new and have never seen this product fail?
    answer: I'd read a few recent bug reports or ask a teammate which changes have caused regressions, then pick one failure pattern I can turn into a check.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.4.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd use a past defect to tell me where to look and what to check. If a profile screen once saved an edit when someone clicked Cancel, I'd look at other settings that use the same editing panel. I'd write down the starting value and what I'd do to expose the suspected behavior. Then I'd read the saved setting again to see if anything changed.

I'd still run the tests for the written save and cancel rules. The guess helps me pick an extra path that those tests might miss.

### Example

A staff portal lets people change their display name and time zone in separate panels. The display name panel once kept a canceled edit. I'd change the time zone, cancel, then save a display name change. After refresh, I should see the new name and the original time zone. That catches a canceled value that sits around until the next save.
