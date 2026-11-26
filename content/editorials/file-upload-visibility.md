---
problem: scenario/file-upload-visibility
---

Confirm the server's acceptance rules and the exact download contract first. An upload may be accepted for review even though the file still cannot be served. A status label alone cannot distinguish a denied download from a temporary file response that already contains bytes.

Use the held review to check pending denial, then approve the same fixture and compare the two tenant identities. That five-plus-seven-minute pairing tests the state change and the access rule without needing a broad device pass. At the API, assert the response and whether file bytes were returned. Once approved, compare the owner's downloaded bytes with the fixture to catch an empty success response. Keep the second tenant's test data separate.

The decoy's icon sweep might find a visible defect but spends the only time to check downloads before review. A separate Playwright UI smoke check can attach the fixture with `setInputFiles()` and check that the pending state is shown. See [Playwright's file input actions](https://playwright.dev/docs/input#upload-files) and [OWASP's file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

Returning pending bytes to the owner violates the stated release condition even if the status text reads correctly. The interviewer is looking for a controlled review decision and evidence at the download boundary.
