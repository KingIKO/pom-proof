---
problem: diagnosis/review-sleep-before-upload-status
---

Mark lines 8 and 10. The fixed delay in line 8 assumes the upload will be done after 1.5 seconds. Line 10 then reads the status once. On a slow run, the status element already exists with the text `Ready`, so the element lookup succeeds and the assertion fails.

Use a Selenium explicit wait on the expected status. Poll a fresh lookup of `upload-state` for exact text `Uploaded` within the test's normal timeout. Once that condition holds, check the uploaded filename. This app promises the filename is already visible at that point, so the filename read does not need its own delay.

The usual decoy is to remove only the sleep, or replace it with a wait for the status node to be present. Both leave the test free to read the initial `Ready` value. A longer sleep postpones the same race.

In an interview, identify the smallest observable condition that says the upload finished. Confirm the test passes when that state appears late and fails when the app never reaches it.

[Selenium: waiting strategies](https://www.selenium.dev/documentation/webdriver/waits/)
