---
problem: diagnosis/renewal-crosses-midnight
---

## What is going on

The timestamp `2026-06-02T00:30:00Z` means half past midnight in UTC, the common time standard. At that instant, it is still 8:30 p.m. on June 1 in New York. Both browsers receive the same data. Both follow the same rule: display the date in the viewer's browser time zone. The dates differ because the time zones differ.

## The answer

1. The same instant falls on different local dates in the two browser time zones.

   **Why:** Both machines log the same `renewalAt` field, which gives the moment of renewal. The same instant falls on different dates in UTC and in New York. Only the time zone changed. The difference does not come from test data set up late or from the browser reusing old data.

2. Keep the fixed timestamp. Set `test.use({ timezoneId: 'America/New_York' })` for this test or its group.

   **Why:** If you leave this option unset, Playwright uses the machine's time zone. The test then depends on which machine runs it. A fixed timestamp makes every run check the same instant near midnight.

3. Keep June 1 as the expected date in New York. Add a separate UTC case that expects June 2.

   **Why:** The New York case tests what a viewer in that time zone sees near midnight. The separate UTC case shows the page follows the viewer's time zone.

4. Confirm that both browsers receive the same timestamp. Check that CI reports UTC and the local browser reports `America/New_York`.

   On one runner, change only the time zone of the browser context, the separate browser session the test uses. Check that the displayed date changes from June 2 to June 1.

   **Why:** The matching timestamp rules out different test data. If changing only the time zone moves the date, the change points to that setting.

## Why the tempting answer fails

Moving the test timestamp to midday could make both machines agree. It would remove the case that would catch a page showing the UTC date to a New York viewer. The `en-US` locale controls how the date looks. Matching locales don't show that both browsers use a US time zone. Running the job at another hour proves nothing because the timestamp stays fixed.

## What the interviewer listens for

Change only the browser time zone. Record the time zone the browser reports and the timestamp from the response. Show how the displayed date changes.

## Sources

- [Playwright: browser time zone](https://playwright.dev/docs/api/class-testoptions#test-options-timezone-id)
