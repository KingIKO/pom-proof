---
title: The library's reminder job says it finished. How would you check that it queued the right notices?
topic: test-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: I'd compare the queue with the due-loan list saved at closing. I'd check for exactly one notice per eligible loan.
looksFor:
  - Explain how the count can be right even if notices name the wrong loans.
  - Use the same list from closing time for the interrupted run and its retry.
  - Name a queue result that should raise an alert even if the job reports success.
  - Check which notices the worker queued separately from which ones borrowers received.
trap: Seeing two notices for two eligible loans and accepting the count without checking loan IDs.
followUps:
  - question: When would two notices for the same borrower be correct?
    answer: I'd expect two notices if two of the borrower's loans qualify. I'd call it a duplicate only if the same loan and reminder date appear twice.
  - question: Which time decides whether a late return cancels its reminder?
    answer: I'd use the scheduled cutoff because this rule fixes the list of eligible loans at that time. I'd test a return just before it and another just after it.
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

I'd use the closing-time list to tell why the queue, the list of notices waiting to go out, is empty. If no loans qualified at closing, there should be no notices. If notices for eligible loans are missing after the worker reports success, I'd expect an alert. I'd check that on a busy evening when work can pile up. I'd check that an outright failure alerts the same owner.

I'd write the expected list by hand, with one notice per eligible loan and date. I'd compare it with what the real worker, the program that queues notices, produces. If I stop it after it saves a notice, the retry should only add missing notices from the same closing-time list. If I rerun a completed date, I'd expect no new notices. I'd check mail delivery separately.

### Example

For one date, I'd put two unique loan IDs, 41 and 42, on the due list. I'd test a saved queue with two notices for 41 and one for returned loan 43. I'd expect the query to flag 41 as repeated, 42 as missing, and 43 as ineligible. If the queue is right, I'd expect no result rows.
