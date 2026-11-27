---
title: How would you test a form that lets customers upload a PDF?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: I'd open a valid upload from the right record. If an upload fails or stops, I'd check that the user can recover.
looksFor:
  - Confirm which file type the server accepts and the exact size limit in bytes.
  - Reopen the record and check the saved attachment.
  - Use known test files to check an unsupported type and the sizes around the limit.
  - Check what happens when an upload stops and the user tries again.
trap: Assuming the upload worked because the file picker shows a filename or the progress bar reached the end.
followUps:
  - question: How would you pick a local test file in Playwright?
    answer: I'd use `setInputFiles()` to give the file input a known local file. If the form requires a separate submit, I'd submit it. I'd check the saved attachment because choosing a file only sets up the upload.
  - question: How would you make sure a file fails because of its size?
    answer: I'd use valid PDFs just below, at, and just above the documented byte limit. That rules out the wrong file type or a damaged PDF.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: OWASP file upload guidance
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
  - label: Playwright file input actions
    url: https://playwright.dev/docs/input#upload-files
---

I'd ask which file type and size the server accepts. I'd ask whether an upload replaces an existing file and when the new file is ready to open. After uploading a valid PDF, I'd reopen the record. I'd open the saved file to check that it belongs to this record and contains what I uploaded.

I'd try an unsupported file type and PDFs near the size limit. If the upload fails, I'd expect a message explaining what to do and no attachment to open. I'd interrupt a transfer in a test environment. I'd make sure the page doesn't show it as complete. I'd follow the steps it offers to save a valid file.

### Example

Suppose a warranty claim accepts one PDF of up to 2,000,000 bytes. I'd upload a valid PDF of exactly that size to one test claim. I'd try a valid PDF of 2,000,001 bytes on another. I'd reopen both claims and expect an attachment only on the first.
