---
title: A library's reminder worker says it finished. Can you prove the right notices were queued?
topic: test-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Use the frozen due-loan list to prove that the worker queued exactly one notice per eligible loan.
looksFor:
  - Shows how the wrong loans can still produce the expected number of notices.
  - Uses the same closing-time snapshot for an interrupted run and a retry.
  - Knows which queue state warrants an alert even if the worker reports success.
  - Separates queued notices from actual delivery.
trap: Accepting two queued notices for two eligible loans without checking which loans they belong to.
followUps:
  - question: Could the same borrower legitimately receive two notices from this run?
    answer: Yes, one for each eligible loan. A duplicate means the same loan and reminder date appear twice.
  - question: Which timestamp decides whether a late return cancels the reminder?
    answer: For this rule, eligibility is frozen at the scheduled cutoff. I'd test a return immediately before it and another immediately after it.
sources:
  - label: SQLite ordinary common table expressions
    url: https://www.sqlite.org/lang_with.html
  - label: SQLite compound SELECT and result processing
    url: https://www.sqlite.org/lang_select.html
examples:
  - title: Check every loan's queued notice count
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH due(loan_id) AS (VALUES (41), (42)),
               queued(loan_id) AS (VALUES (41), (41), (43)),
               keys(id) AS (SELECT loan_id FROM due UNION SELECT loan_id FROM queued)
          SELECT keys.id, COUNT(due.loan_id) > 0 AS eligible, COUNT(queued.loan_id) AS notices
          FROM keys
          LEFT JOIN due ON due.loan_id = keys.id
          LEFT JOIN queued ON queued.loan_id = keys.id
          GROUP BY keys.id
          HAVING COUNT(queued.loan_id) <> (COUNT(due.loan_id) > 0)
          ORDER BY keys.id;
---

I'd ask what an empty queue means. If no loans qualified at closing time, that's fine. If the
worker says it's finished while eligible loans are missing, someone needs an alert. I'd use the
closing-time list to tell those states apart, including on a busy evening when work can back up.
I'd also check that an outright failure reaches the same owner.

The comparison is one notice per eligible loan and date. I can write the expected list by hand
and check it against the real worker's output. If I stop the worker after it commits a notice,
the next attempt should add only what's missing from that same list. Running a complete date
again should add nothing. I would check mail delivery separately from the queue.

### Example

For one date, the due list has unique loan IDs 41 and 42. The captured queue has two notices
for 41 and one for the returned loan 43. The query reports 41 as duplicated, 42 as missing,
and 43 as ineligible. A correct queue would return no rows.
