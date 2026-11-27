---
problem: bug-report/search-count-mismatches-filter
---

## What is going on

Searching for `camp cups` returns 19 matches before filtering. With **In stock** selected, the API reports `total=7` and the settled list shows those seven records. The heading still shows 19.

## The answer

1. Give the defect severity S3, a misleading count with the correct records still available.

   **Why:** Customers can make decisions based on the heading even when they can retrieve every matching result.

2. Assign P1, in the current search release.

   **Why:** The search policy treats misleading totals as a required correction for this release. The returned records are correct, so the rollout stop does not apply.

3. Start with the search results and filter summary UI.

   **Why:** The API total and visible list agree, and only the heading differs. That narrows the investigation without proving which piece of the UI leaves it stale.

4. Use the title “Search result count stays unfiltered after selecting In stock.”

   **Why:** The title names the symptom and the trigger. Keep the query, browser, build and exact values in the report body.

5. Open the empty search page, run the fixture search unfiltered and note its count, select In stock and wait for the filtered response, then compare the response and list with the heading.

   **Why:** An old count can be normal while the request is pending. The settled screenshot shows the response and list have already advanced.

6. Ask for the catalog fixture version and request correlation ID.

   **Why:** The fixture version makes the data repeatable. The ID ties that screenshot to the specific filtered response.

7. Record that the heading should show seven after filtering, but shows 19 while the list and API show seven.

   **Why:** Reporting all the observed values separates a stale count from an incorrect filtered result set.

## Why the tempting answer fails

S4 and P3 treat an incorrect number as decoration. Sending the ticket to the API ignores the correct filtered response. Keep the correlation ID request; the query and filter are already supplied, so ask for the fixture version instead. The decoy's title, steps and comparison still fit.

## What the interviewer listens for

Show exactly what disagrees when the page is settled, and why the response narrows where investigation should start.

## Sources

- [Playwright: testing user-visible behavior](https://playwright.dev/docs/best-practices)
