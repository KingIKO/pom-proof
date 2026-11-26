---
title: How would you run automated tests on every pull request?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: Trigger a small repeatable suite on pull requests and make its result a required check before merging.
looksFor:
  - Test execution on pull request changes
  - An environment and dependencies the job can recreate
  - A required check distinct from a workflow trigger
  - A failure that contributors can diagnose
trap: Assuming a workflow that runs automatically also blocks merges when it fails.
followUps:
  - question: How would you prove it blocks a bad merge?
    answer: I'd open a test pull request with an intentional failing assertion, confirm the check blocks merging, and restore the assertion.
sources:
  - label: GitHub Actions pull request event
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request
  - label: GitHub protected branches
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
---

On GitHub I'd set a workflow to run on `pull_request`, install the locked dependencies, and run the same test command a contributor can run locally. I'd start with fast checks for important paths and make sure an assertion failure gives the job a failed result. The output should tell the author which test failed and how to reproduce it.

Then I'd configure the target branch to require that check. Running a workflow and requiring its result are separate decisions. I'd try it with a small change that fails a check, and verify that a passing revision can proceed.

### Example

A checkout change runs unit tests and an order smoke check on every pull request update. The merge gate stays closed if the order confirmation assertion fails.
