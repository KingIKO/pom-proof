---
title: How would you test a form that lets customers upload a PDF?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: Check that a supported file is saved to the right record and that rejected or interrupted uploads leave a clear way to recover.
looksFor:
  - Confirms the accepted file type and exact limit in bytes.
  - Checks an uploaded file after reopening the record.
  - Covers an unsupported file and the size boundary with controlled fixtures.
  - Checks the outcome of an interrupted upload and a retry.
trap: Passing the upload because the file picker shows a name or the progress bar reaches the end.
followUps:
  - question: How would you select a test file in Playwright?
    answer: I'd call `setInputFiles()` on the file input with a local fixture, submit if the form requires it, then check the saved attachment. Selecting the file is just setup.
  - question: How would you isolate a size failure?
    answer: I'd use known-good PDFs just below, exactly at, and just above the documented byte limit so a different file type or a damaged PDF can't explain the result.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: OWASP file upload guidance
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
  - label: Playwright file input actions
    url: https://playwright.dev/docs/input#upload-files
---

I'd ask what type and size the server accepts, whether an upload replaces an existing attachment, and when the file is ready to open. I'd upload a valid PDF, reopen the record, and open the saved attachment to make sure it belongs there and has the expected contents.

Next I'd try an unsupported type and PDFs at the size cutoff. I'd check that rejections explain how to proceed and leave no attachment to open. I'd interrupt a transfer in a test environment and verify that it doesn't appear complete, and that following the offered recovery path can save a valid attachment.

### Example

A warranty claim accepts one PDF of at most 2,000,000 bytes. I'd try a valid PDF of exactly that size and one of 2,000,001 bytes on separate test claims. Only the first should leave an attachment I can open from a reopened claim.
