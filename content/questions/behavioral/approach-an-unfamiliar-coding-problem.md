---
title: The later failure appears first in the interview log. How did that affect your solution?
topic: behavioral
roles: [sdet, automation]
level: mid
type: scenario
oneLine: Show how two rows in reverse time order exposed the wrong update rule.
looksFor:
  - Explains why the two reversed rows returned the wrong failure.
  - Compares timestamps without scanning the file again for each test.
  - Makes the tie rule explicit with the interviewer.
  - Shows that reversing the input no longer changes the earliest timestamp.
trap: Treating the first failure listed in the file as the first failure that happened.
followUps:
  - question: Two failures have the same timestamp. How would you get an answer you can implement?
    answer: I'd show both rows to the interviewer, ask which record should win, and state the rule before I change the code.
---

In a practice interview I had 30 minutes to find each test's first failure. I asked whether
first meant earliest timestamp or first row, and whether missing timestamps were possible.
On paper I found a baseline: collect the rows for one test and scan them for the earliest
failure, then repeat for each test. I explained that I could avoid rereading the log by
keeping one candidate per test.

My first version kept the first failure row it saw. The moment I reversed two timestamps in
my sample, the mistake showed up. I talked through that pair and changed the update to
compare timestamps. For ties I got stuck, drew two rows with the same time, and agreed
with the interviewer to keep the first row in that case.

### Example

I had four minutes left to rerun the out-of-order pair and check an empty log, a single failure
and a tie. The reversed pair returned the same earliest timestamp in both input orders.
