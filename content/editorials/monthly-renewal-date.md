---
problem: test-design/monthly-renewal-date
---

Keep the original billing day at 31. Starting in January, expect February 28 in 2025 and February 29 in 2024. Include February 1900 and February 2000 as target months. Both years are divisible by four and by 100, but only 2000 is divisible by 400. Using both century examples distinguishes code that treats all century years as leap years from code that excludes all of them.

Next, compute the renewal from February with the original day still set to 31. The result is March 31. That case catches an implementation that carries forward February's shorter billing day. March moving to April with a day of 31 checks the 30-day rule outside February. A December example with a single-digit billing day lets you assert the new year and the full padded date in one row.

The weaker answer includes a common February, an ordinary mid-month date, and December rollover. It catches a year that fails to advance. It never shows that the original day is restored after a short month.

An interviewer listens for calendar dates rather than elapsed days. Some JavaScript date operations carry an overflowing day into the following month. Assert the exact date so an impossible day or a silent move to the wrong month has nowhere to hide.

Source: [MDN, Date components and overflow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_components_and_time_zones).
