---
problem: sql/average-defect-close-time
---

## What is going on

The report compares how long closed defects stayed open for each severity. A defect that stays open across midnight may close within minutes. A defect that closes before midnight may stay open for hours. The dates alone cannot tell you how long either defect stayed open.

## The fix

```sql
SELECT severity, ROUND(AVG(julianday(closed_at) - julianday(opened_at)), 2) AS avg_days
FROM defects
WHERE closed_at IS NOT NULL
GROUP BY severity;
```

1. Keep only rows with `closed_at IS NOT NULL`.

   **Why:** An open defect has no time to close yet. If the query groups it with the others, the results would include a row for minor severity, even though all minor defects are open.

2. Subtract the opening Julian day from the closing Julian day.

   **Why:** The `julianday()` function represents a date and time as a day number with a fraction for the time of day. A defect opened at 22:00 and closed at 10:00 the next morning adds half a 24-hour day.

3. Group by `severity`.

   **Why:** The time to close a major defect must leave the critical result unchanged. Grouping gives each severity with closed defects a separate result.

4. Average the elapsed durations with `AVG`.

   **Why:** If a defect closes as soon as it opens, it adds zero days. Each defect contributes once, regardless of how long it stayed open. The `AVG` function returns their average.

5. Round the average to two decimal places after you calculate it.

   **Why:** If you round five-minute and eight-minute durations first, they become 0.00 and 0.01 days. The rounded average of those values is 0.01. The average of the original durations is six and a half minutes. That rounds to 0.00 days.

If the columns use UTC timestamp types, PostgreSQL can find the difference in seconds with `EXTRACT(EPOCH FROM (closed_at - opened_at))`. Divide that value by `86400`. In MySQL, the inputs are precise to the second, so use `TIMESTAMPDIFF(SECOND, opened_at, closed_at) / 86400.0`. Use UTC for both timestamps in either database.

## Why the tempting answer fails

The decoy uses `date()` to drop the time of day. In the visible data, each defect opens and closes at the same time of day. Both queries therefore average two days for critical and major defects. In the altered data, the decoy counts a nine-hour closure on the same day as zero. It also counts a twelve-hour overnight closure as a full day.

## What the interviewer listens for

Explain which duration the report measures and why the average excludes unfinished work. Show why you round only after you calculate the average.

## Sources

- [SQLite date and time functions](https://www.sqlite.org/lang_datefunc.html)
- [SQLite `AVG`](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite `ROUND`](https://www.sqlite.org/lang_corefunc.html#round)
- [SQLite grouping and filtering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL timestamp subtraction and epoch extraction](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT)
- [MySQL `TIMESTAMPDIFF`](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_timestampdiff)
