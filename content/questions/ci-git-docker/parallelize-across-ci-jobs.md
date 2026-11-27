---
title: "How do you safely split a slow test suite across CI jobs?"
topic: ci-git-docker
roles: [automation, sdet, senior]
level: mid
type: tooling
oneLine: "I split one list of tests across jobs and keep their writable data separate. I check that the final result counts every job."
looksFor:
  - "Show what slows the run down before adding machines."
  - "Give each job a different slice of the test list."
  - "Use separate accounts, data, or environments where jobs might interfere."
  - "Collect a report from every group and require every group to pass."
trap: "Creating four identical jobs that each run the entire suite."
followUps:
  - question: "What if results arrive sooner but the runner cost doubles?"
    answer: "I'd compare the wait to start, the time to get results, and the total minutes billed across all machines. I'd try fewer shards or remove the slowest repeated work."
  - question: "Three agents finish at minute six, but the fourth is still running at minute twelve. What would you try first?"
    answer: "I'd use per-test times from the latest comparable run that used one group. I'd move some long tests off the last agent. If uneven durations keep changing which agent finishes last, I'd let idle agents take another test from a shared queue."
sources:
  - label: Playwright sharding
    url: https://playwright.dev/docs/test-sharding
  - label: GitHub Actions job matrices
    url: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
  - label: GitHub Actions setup-node and npm caching
    url: https://github.com/actions/setup-node/tree/v7
  - label: GitHub Actions artifact upload
    url: https://github.com/actions/upload-artifact/tree/v7
  - label: GitHub Actions failure and cancellation conditions
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions
  - label: Playwright CI installation
    url: https://playwright.dev/docs/ci
  - label: Playwright JUnit reporter
    url: https://playwright.dev/docs/test-reporters#junit-reporter
examples:
  - title: Run four shards and keep each shard's report
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Checkout browser suite
          on: [pull_request]
          permissions:
            contents: read
          jobs:
            browser:
              runs-on: ubuntu-latest
              strategy:
                fail-fast: false
                matrix:
                  shard: [1, 2, 3, 4]
              steps:
                - uses: actions/checkout@v7
                - uses: actions/setup-node@v7
                  with:
                    node-version: '24'
                    cache: npm
                - run: npm ci
                - run: npx playwright install --with-deps chromium
                - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=line,junit
                  env:
                    PLAYWRIGHT_JUNIT_OUTPUT_FILE: results/shard.xml
                - uses: actions/upload-artifact@v7
                  if: ${{ !cancelled() }}
                  with:
                    name: checkout-shard-${{ matrix.shard }}
                    path: results/shard.xml
                    if-no-files-found: error
---

In continuous integration (CI), jobs run tests automatically. I measure which steps control how soon we get a result. If the tests take most of that time, I'd split them into shards, or groups. I'd use a job matrix, a list of job settings, to give each runner a different group number and the same total count.

I pass both values to the test runner so it selects only its group. Otherwise each job can run everything.

I use the same build and settings for each group. I label data that can change by run and shard so a job can't delete another job's records. I fail the merge check if any required shard fails or never reports. I compare total time on the clock and total runner minutes with the old setup.

### Example

Suppose my checkout project runs only Chromium and has a lockfile listing exact package versions. I'd send the tests to four jobs and reuse downloaded npm packages when I can. I'd still install from the lockfile every time. I'd expect the combined test list to match an unsharded run, where one job runs the whole list. If shard two fails, I'd expect the other jobs to finish and upload their own reports.
