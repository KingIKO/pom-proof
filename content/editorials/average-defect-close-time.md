---
problem: sql/average-defect-close-time
---

Subtract `julianday(opened_at)` from `julianday(closed_at)` for each closed defect. Since the Julian day value includes a fraction for time of day, the difference measures elapsed days. Take the average by severity before rounding so short and long durations contribute at their actual precision.

```sql
SELECT severity, ROUND(AVG(julianday(closed_at) - julianday(opened_at)), 2) AS avg_days
FROM defects
WHERE closed_at IS NOT NULL
GROUP BY severity;
```

The decoy strips the times with `date()` before subtracting. The visible closed defects each open and close at the same time of day, so both approaches yield two days for critical and major. For a defect opened at 22:00 and closed at 10:00 the next morning, the calendar dates differ by one day but only half a day elapsed. A same-day closure has the opposite trap: it can take hours even though both dates match.

In an interview, state which duration is wanted and how unfinished work is handled. With typed UTC timestamps, [PostgreSQL](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT) can subtract timestamps and divide `EXTRACT(EPOCH FROM (closed_at - opened_at))` by `86400`. In [MySQL](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_timestampdiff), use `TIMESTAMPDIFF(SECOND, opened_at, closed_at) / 86400.0` for these second-resolution inputs. Use UTC consistently when evaluating either expression.

See [SQLite date and time functions](https://www.sqlite.org/lang_datefunc.html).
