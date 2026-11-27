---
problem: diagnosis/review-sleep-before-upload-status
---

## What is going on

The fixture provides the browser and a valid PDF. The status element is already present at page load with text `Ready`. The app changes it to `Uploaded` only when the upload is complete and the filename already appears.

## The answer

1. Mark line 8, the 1.5-second sleep, and line 10, the one-time status assertion. Leave the method signature unmarked as instructed; its unused `throws` clause can go when the sleep is removed.

   **Why:** Line 8 assumes completion at a fixed time, stalling fast uploads and still reading too early on slow runs. At line 10 the element lookup succeeds even while the text says `Ready`, so the test can fail despite the upload eventually completing.

2. Choose the guessed completion time as the synchronization flaw. Use a Selenium explicit wait that polls a fresh lookup of `upload-state` for exact text `Uploaded` within the test's normal timeout. Keep the filename assertion after the wait.

   **Why:** The text transition signals that the filename should already be visible. Waiting for that state keeps the eventual check on customer-visible behavior and avoids a second arbitrary delay.

## Why the tempting answer fails

The decoy names the timing issue but marks only the sleep. Removing it without changing the status read leaves an immediate snapshot. Waiting for element presence also lets the read see `Ready`, since the element exists from load. A longer sleep postpones the same race.

## What the interviewer listens for

Name the observable state that proves completion. Check that the test passes when the upload reaches that state late and fails when it never reaches it.

## Sources

- [Selenium: waiting strategies](https://www.selenium.dev/documentation/webdriver/waits/)
