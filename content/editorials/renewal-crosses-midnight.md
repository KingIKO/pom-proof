---
problem: diagnosis/renewal-crosses-midnight
---

At `2026-06-02T00:30:00Z`, it is still 8:30 p.m. on June 1 in New York. The browsers get identical data and follow the same product rule. They produce different calendar dates because their time zones differ. `en-US` controls how a date is presented; it does not make the browser use a US time zone.

Set `test.use({ timezoneId: 'America/New_York' })` for this test or its enclosing group. Keep the response fixed and keep June 1 as the expected value. In a separate UTC case, the same instant should render June 2. Playwright defaults to the system time zone when the option is unset, so the original case quietly depended on the runner.

Moving the seed time to midday could make both machines agree. That removes the case that would expose a UTC-only formatter for a New York viewer. An interviewer will listen for a controlled experiment: change only the browser zone, capture the resolved zone and response timestamp, and show that the displayed date changes. The job's start time is irrelevant to a fixed timestamp.

[Playwright: browser time zone](https://playwright.dev/docs/api/class-testoptions#test-options-timezone-id)
