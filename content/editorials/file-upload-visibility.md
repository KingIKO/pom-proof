---
problem: scenario/file-upload-visibility
---

## What is going on

The upload service can accept a document for review while the download service must still withhold it. Because two separate services do this work, the actual download response tells you more than a status label.

## The answer

1. Confirm the accepted file types, the size boundary, who can download, and the exact download response while review is pending.

   **Why:** If the upload is rejected, you never reach the pending state you meant to test. The download contract is the agreed response for each state. It tells you what the accepted fixture, your prepared test file, must return in the pending state.

2. Spend five minutes on the pending file and seven minutes on the approved file.

   Hold the review and confirm that the owner cannot download the pending file. After approving it, check that the owner can download it and a second tenant cannot. A tenant is one customer account with its own data.

   **Why:** The pending check catches the file's bytes, its actual content, being released early. The approved check proves approval opens the file to the owner without opening it to another tenant.

3. At the API, inspect the pending response and check whether it returns any file bytes.

   **Why:** The pending label can be correct while the response already contains the document.

4. Compare the approved-file responses for both tenants at the API.

   Keep each tenant's data separate. Compare the file bytes the owner receives with the fixture.

   **Why:** A success status can hide an empty download. An independent tenant checks actual access, not just a hidden button.

5. If the endpoint returns pending bytes even to the owner, block the release.

   **Why:** The rule that only the owner may download does not waive the other requirement. Review must still finish before the service sends the document.

6. Check download access before and after approving a harmless fixture upload.

   Hold back the review after uploading. Try the pending download as the owner. Release the review with an approval. Then check that the owner can download the file and the second tenant cannot.

   **Why:** Holding the review makes the pending step deterministic, meaning it behaves the same on every run. Reusing one document rules out differences between fixtures as the reason the response changes.

## Why the tempting answer fails

The spinner's wording leaves the download contract open. Comparing icons spends the budget meant for the check before review. A UI check cannot establish which bytes either tenant gets in either state. A smoke test is a quick check of the main path. A separate Playwright smoke test can attach a fixture with `setInputFiles()` and then check the pending label.

## What the interviewer listens for

Control the review decision. Before you recommend release, collect evidence from both download identities, the owner and the second tenant.

## Sources

- [Playwright's file input actions](https://playwright.dev/docs/input#upload-files)
- [OWASP's file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
