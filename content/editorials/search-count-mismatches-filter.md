---
problem: bug-report/search-count-mismatches-filter
---

Give the search UI team the first look. The unfiltered count is 19, and the filtered response and visible rows agree on seven. The heading remains at the earlier count after the filtered response. That points to a visible summary defect without proving which part of the UI produced it.

Open the blank search page, run the fixture query without filters, then select In stock. Wait for the filtered result before comparing the API response and list with the heading. The wait matters because a snapshot taken while the request is pending could show the old count by design. Ask for the fixture version and correlation ID, which link the screenshot to repeatable data and the same response. The query and selected filter are already in the ticket.

Use S3 and P1 under the listed rules. The decoy treats the number as decoration, but customers can act on it even when every matching record is present.

See [Playwright on testing user-visible behavior](https://playwright.dev/docs/best-practices). An interviewer wants the exact disagreement among the UI elements and the returned data.
