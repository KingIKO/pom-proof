---
title: How would a past settings bug help you choose what to test next?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd use a past failure to make a specific guess about what could break. I'd write a check that can show whether I'm right.
looksFor:
  - Name the earlier bug report or observation behind the guess.
  - Find another flow or control where the problem could happen again.
  - Give setup steps someone else can repeat and say what should happen.
  - Keep the tests for agreed rules and add the check based on the guess.
trap: Clicking through settings at random and only writing down which screens you visited.
followUps:
  - question: How would you choose a guess if you're new to the product?
    answer: I'd read a few recent bug reports or ask a teammate which changes broke something that used to work. I'd pick one pattern I can test.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.4.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd use error guessing, which means using past failures to decide where a similar bug might show up. If Cancel once saved an edit on a profile screen, I'd check other settings that use the same panel. I'd record the starting value and the steps to check for that bug. I'd read the saved setting again to see whether it changed.

I'd still run tests for the written Save and Cancel rules. The guess gives me another case those tests might miss.

### Example

In a staff portal, the display name panel once kept a canceled edit. I'd try the same issue in the separate time zone panel. I'd change the time zone and click Cancel. I'd save a change to the display name. After refreshing, I'd expect the new name and the original time zone.

That would catch a canceled value that waits until the next save to take effect.
