---
title: Tell me about a production bug you missed and what you changed afterward.
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: Own the missing case, help contain the impact, and show how you checked the prevention.
looksFor:
  - The specific gap you owned
  - Your immediate containment or diagnosis work
  - A measurable impact and a verified regression check
  - A lesson that changes future test design
trap: Blaming the developer or adding a test without proving it would have caught the bug.
followUps:
  - question: How did you know the new check was worth keeping?
    answer: I ran it against both versions and saw it fail before the fix and pass afterward.
---

I signed off on account notifications after testing new accounts. I missed older accounts whose saved preference was blank. After launch, support found 18 customers didn't get their renewal reminder. I reproduced it with a synthetic account using the old data shape and gave the incident owner a clear way to find other affected accounts.

I added a regression check for blank preferences and ran it on the old and fixed builds. I also added a question to release review about existing data whenever a default changes. What I learned was to ask which data shapes already exist before I design tests around a new default.

### Example

The regression check uses a blank preference and looks for one scheduled reminder. It failed on the original build with zero scheduled reminders and passed on the corrected one.
