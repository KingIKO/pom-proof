---
title: What test results and artifacts should CI save when browser tests fail?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: mid
type: tooling
oneLine: Save a result people can scan, then attach the smallest evidence needed to understand the named failing attempt.
looksFor:
  - Test and attempt identifiers in a structured result
  - A useful trace, screenshot, or narrow log
  - Evidence uploaded on failure and separated by job
  - Sensitive data handling and retention
trap: Uploading a large pile of files with no link to the failure, or losing the files because the upload only runs on success.
followUps:
  - question: What value does a trace add to a screenshot?
    answer: A screenshot shows one moment. A trace can show the preceding actions, snapshots, and network activity that explain it.
sources:
  - label: Playwright reporters
    url: https://playwright.dev/docs/test-reporters
  - label: Playwright Trace Viewer
    url: https://playwright.dev/docs/trace-viewer
  - label: GitHub Actions workflow artifacts
    url: https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts
---

I save a structured test result with the test name, browser, commit, and attempt. For Playwright I might use a JUnit result for the CI summary and attach a failure trace with a screenshot when visual state matters. I make sure the upload runs after a normal test failure, and label files with the shard so a later job can't be mistaken for the one that failed.

I'd inspect the output from a deliberately failing test. Someone should be able to find the right attempt without downloading every file. I keep sensitive data out of tests and artifacts, restrict access, and set a retention period suited to how the team investigates.

### Example

A failed export in shard two links to its result and trace. A teammate can see the Generate action and service response without rerunning the entire matrix.
