---
problem: sql/average-defect-close-time
---

## What is going on

The report compares how long closed defects stayed open at each severity. Crossing midnight can take minutes; closing a defect before midnight can take hours. A calendar date alone cannot tell you either duration.

## The fix

```sql
SELECT severity, ROUND(AVG(julianday(closed_at) - julianday(opened_at)), 2) AS avg_days
FROM defects
WHERE closed_at IS NOT NULL
GROUP BY severity;
```

1. Keep only rows with `closed_at IS NOT NULL`.

   **Why:** An open defect has no elapsed time to close. Letting it reach the grouping would still create a row for a severity with only open defects, such as minor in the sample.

2. Subtract the opening Julian day from the closing Julian day.

   **Why:** `julianday()` keeps a fraction for the time of day. A defect opened at 22:00 and closed at 10:00 the next morning contributes half a 24-hour day.

3. Group by `severity`.

   **Why:** A major closure must have no effect on the critical figure. Grouping gives each severity with closed defects its own result.

4. Average the elapsed durations with `AVG`.

   **Why:** A same-instant closure contributes zero days. A short closure and a long closure each contribute once, so the result represents the average defect rather than the longest one.

5. Round the average to two decimal places after aggregation.

   **Why:** Rounding five-minute and eight-minute closures first gives 0.00 and 0.01 days. Averaging those and rounding gives 0.01. Averaging the original durations gives six and a half minutes, which rounds to 0.00 days.

With typed UTC timestamps, PostgreSQL can subtract timestamps and divide `EXTRACT(EPOCH FROM (closed_at - opened_at))` by `86400`. In MySQL, use `TIMESTAMPDIFF(SECOND, opened_at, closed_at) / 86400.0` for these second-resolution inputs. Use UTC consistently in either expression.

## Why the tempting answer fails

The decoy strips the times with `date()`. Every visible closure occurs at the same time of day as its opening, so both queries average two days for critical and major. In the altered data, a nine-hour same-day closure contributes zero to the decoy, and the twelve-hour overnight closure contributes a full day.

## What the interviewer listens for

Explain which duration the report measures, why unfinished work has no place in that average, and why rounding is the last operation.

## Sources

- [SQLite date and time functions](https://www.sqlite.org/lang_datefunc.html)
- [SQLite `AVG`](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite `ROUND`](https://www.sqlite.org/lang_corefunc.html#round)
- [SQLite grouping and filtering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL timestamp subtraction and epoch extraction](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT)
- [MySQL `TIMESTAMPDIFF`](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_timestampdiff)
