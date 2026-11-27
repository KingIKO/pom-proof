---
problem: diagnosis/renewal-crosses-midnight
---

## What is going on

At `2026-06-02T00:30:00Z`, it is still 8:30 p.m. on June 1 in New York. Both browsers get identical data and follow the same product rule. They show different calendar dates because their time zones differ.

## The answer

1. Name the cause as the time zone: the same instant falls on different local dates in UTC and in New York.

   **Why:** The log shows one `renewalAt` value on both machines and two different zones. The zone is the only input that changed, so nothing was seeded late or cached.

2. Keep the fixed timestamp and set `test.use({ timezoneId: 'America/New_York' })` for this test or its enclosing group.

   **Why:** Playwright uses the system time zone when the option is unset, so the test quietly depended on whichever machine ran it.

3. Keep June 1 as the expected value, and add a separate UTC case that expects June 2.

   **Why:** The test exists to check what a New York viewer sees near midnight. The UTC case shows the page follows the viewer's zone.

4. Confirm with two observations: both browsers receive the same timestamp while reporting UTC and America/New_York, and changing only the context time zone on one runner turns June 2 into June 1.

   **Why:** A controlled experiment changes one thing. If the date moves when only the zone moves, the zone is the cause.

## Why the tempting answer fails

Moving the seed time to midday could make both machines agree. It also removes the case that would expose a UTC-only formatter for a New York viewer. Matching `en-US` locales prove nothing: the locale controls how a date is presented and does not make the browser use a US time zone. A rerun at another hour is no evidence, because the job's start time is irrelevant to a fixed timestamp.

## What the interviewer listens for

A controlled experiment: change only the browser zone, capture the resolved zone and the response timestamp, and show that the displayed date changes.

## Sources

- [Playwright: browser time zone](https://playwright.dev/docs/api/class-testoptions#test-options-timezone-id)
