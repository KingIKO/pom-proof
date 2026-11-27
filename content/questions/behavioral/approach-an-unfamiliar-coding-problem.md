---
title: "A later failure comes first in the interview log. How did that change your solution?"
topic: behavioral
roles: [sdet, automation]
level: mid
type: scenario
oneLine: "I used two rows in reverse time order to show why my code picked the wrong failure."
looksFor:
  - "Explain why reversing the two rows gave the wrong result."
  - "Compare timestamps, or recorded times, without rereading the log for each test."
  - "Agree with the interviewer on what to do when the times match."
  - "Show that both input orders give the same earliest time."
trap: "Assuming the first failure in the file happened first."
followUps:
  - question: "If two failures have the same timestamp, how would you agree on a rule you can code?"
    answer: "I'd show both rows to the interviewer and ask which one to keep. I'd state the rule before changing my code."
---

In a practice interview, I had 30 minutes to find each test's first failure. I asked if first meant the earliest timestamp, or recorded time, or the first row in the log. I also asked whether a row could be missing its timestamp.

On paper, I started with a simple solution. I'd collect the rows for one test and find its earliest failure. I'd do that again for each test. I explained that I could read the log once if I kept one candidate row per test.

My first version kept the first failure it saw. I reversed two rows in my sample and saw the mistake. I talked through those rows and changed the code to compare timestamps. I got stuck on ties, so I drew two rows with the same time. The interviewer and I agreed to keep the first row if the times matched.

### Example

I had four minutes left to test both orders, an empty log, a single failure, and a tie. I got the same earliest timestamp both ways.
