---
problem: diagnosis/review-sleep-before-upload-status
---

## What is going on

The fixture, the reusable test setup, provides the browser and a valid PDF. The status element already reads `Ready` when the page loads. The app changes it to `Uploaded` only after the upload completes and the filename appears.

## The answer

1. Mark the 1.5-second wait on line 8 and the one-time status check on line 10.

   Leave the method signature, the line declaring the test method, unmarked as instructed. Once you remove the wait, the unused `throws` clause can go too.

   **Why:** Line 8 guesses when the upload will finish. Fast uploads have to wait, and slow uploads may still be running when the wait ends. Line 10 can find the status element while it still says `Ready`. The check may fail even though the upload finishes later.

2. The test guesses when the background upload will finish. Find `upload-state` again on each wait check and look for the exact text `Uploaded`.

   Use a Selenium explicit wait, which checks a condition repeatedly until it passes or time runs out. Use the test's normal timeout. Keep the filename check after the wait.

   **Why:** The status text shows when the upload is complete. At that point, the filename should already be visible. The test can check what customers see without another fixed delay.

## Why the tempting answer fails

The decoy correctly names the timing issue but marks only the fixed wait. If you remove the wait, the test still reads the status once, right away. Waiting for the element to exist can also return `Ready` because the element is there as soon as the page loads. A longer fixed wait still relies on a guess about which finishes first.

## What the interviewer listens for

Name the visible status that proves the upload finished. Check that the test passes if the status changes late and fails if it never changes.

## Sources

- [Selenium: waiting strategies](https://www.selenium.dev/documentation/webdriver/waits/)
