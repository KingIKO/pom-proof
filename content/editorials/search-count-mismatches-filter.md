---
problem: bug-report/search-count-mismatches-filter
---

## What is going on

Searching for `camp cups` returns 19 matches before filtering. With **In stock** selected, the API reports `total=7`. The settled list shows those seven records. Settled means the page has finished updating. The heading still shows 19.

## The answer

1. Give the defect severity S3, a misleading count with the correct records still available.

   **Why:** Severity describes how much harm the defect causes. Customers can make decisions based on the heading. That holds even when they can retrieve every matching result.

2. Assign P1, in the current search release.

   **Why:** Priority says how soon to fix the defect. The search policy requires a correction to misleading totals in this release. The returned records are correct, so the rollout stop does not apply.

3. Start with the search results and filter summary UI.

   **Why:** The API total and the visible list agree. Only the heading differs. That narrows the investigation. It does not prove which piece of the UI leaves the heading stale, or out of date.

4. Choose a title that says the search count does not change after the user selects In stock.

   Keep the query, browser, build and exact values in the report body.

   **Why:** The title gives readers the symptom and trigger. The report body preserves the details needed to repeat the failure.

5. Reproduce the count mismatch by applying In stock to the fixture search on prepared test data.

   Open the empty search page and run the search without filters. Note the count. Select In stock and wait for the filtered response. Compare the response and the displayed list with the heading.

   **Why:** An old count can be normal while the request is still pending. The settled screenshot shows that the response and list have already updated.

6. Ask for the catalog fixture version and request correlation ID.

   **Why:** The fixture version makes the data repeatable. A correlation ID is a value that links the records of one request. The ID ties that screenshot to the specific filtered response.

7. Record that the heading should show seven after filtering, but shows 19 while the list and API show seven.

   **Why:** Reporting all the observed values separates a stale count from a wrong set of filtered results.

## Why the tempting answer fails

The decoy's S4 and P3 treat an incorrect number as decoration. Sending the ticket to the API ignores the correct filtered response. Keep the request for the correlation ID. The query and filter are already supplied, so ask for the fixture version instead. The decoy's title, steps and comparison still fit.

## What the interviewer listens for

Show exactly what disagrees once the page is settled. Explain why the response narrows where the investigation should start.

## Sources

- [Playwright: testing user-visible behavior](https://playwright.dev/docs/best-practices)
