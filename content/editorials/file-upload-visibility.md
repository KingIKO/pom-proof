---
problem: scenario/file-upload-visibility
---

## What is going on

The upload service can accept a document for review while the download service must withhold it. Split services make the actual download response more informative than a status label.

## The answer

1. Confirm accepted file types and the size boundary, who can download, and the exact pending download response.

   **Why:** An upload rejection would prevent you from ever reaching the pending state you meant to test. The download contract tells you what the accepted fixture must return in that state.

2. Spend five minutes holding review and checking that the owner cannot download the pending file. Spend seven approving it and checking owner success and second-tenant denial.

   **Why:** The first check catches an early release of bytes. The second proves approval changes availability for the owner without granting it to another tenant.

3. Inspect the pending response at the API and check for returned file bytes.

   **Why:** A correct pending label can coexist with a response that already contains the document.

4. Compare both approved-file responses at the API. Keep tenant data separate and compare the owner's bytes with the fixture.

   **Why:** A success status can hide an empty download, and an independent tenant checks actual access rather than a hidden button.

5. Block release if the endpoint returns pending bytes even to the owner.

   **Why:** The owner-only rule does not waive the requirement to finish review before serving the document.

6. Upload a harmless fixture with review held, check pending download as the owner, release an approval, then check owner success and second-tenant denial.

   **Why:** Holding review makes the pending step deterministic. Reusing the document rules out differences between fixtures as the reason the response changes.

## Why the tempting answer fails

Spinner copy leaves the download contract open. The icon sweep spends the budget for the pre-review check. A UI check cannot establish what bytes either tenant gets in either state. A separate Playwright smoke test can use `setInputFiles()` to check the pending label after attaching a fixture.

## What the interviewer listens for

Control the review decision and collect evidence from both download identities before recommending release.

## Sources

- [Playwright's file input actions](https://playwright.dev/docs/input#upload-files)
- [OWASP's file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
