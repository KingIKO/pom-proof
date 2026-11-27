---
title: How do you split a slow test suite across CI jobs safely?
topic: ci-git-docker
roles: [automation, sdet, senior]
level: mid
type: tooling
oneLine: Split one test selection across jobs, isolate mutable resources, and verify the final check covers every job.
looksFor:
  - An observed bottleneck before adding runners
  - A distinct shard selection per job
  - Job-scoped identities or environments
  - Reports and a gate that account for every shard
trap: Creating four identical jobs and unintentionally running the same suite four times.
followUps:
  - question: What if CI gets faster but runner cost doubles?
    answer: I'd compare queue time, feedback time, and total runner minutes, then try fewer shards or remove the slowest redundant work.
  - question: Three agents finish at minute six and the fourth is still running at minute twelve. What would you change first?
    answer: I'd take per-test timings from the most recent comparable unsharded run and move some long work off the last agent. If the slow agent keeps changing because durations vary, I'd try a queue that lets idle agents claim another case.
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

I measure the current critical path first. If executing the tests dominates it, I'd use a job matrix to supply each runner a different shard index and the same shard count. I pass those values to the test runner so it selects that slice. Without that step, each job can run the whole suite.

I use the same build and test configuration throughout, and namespace mutable state by run and shard so jobs can't delete another job's records. I'd make the merge check fail if any required shard fails or never reports. Then I compare both wall time and total runner minutes with the baseline.

### Example

Assume the checkout repo has a lockfile and runs only Chromium. I send its suite to four jobs, cache npm downloads, and still install from the lockfile each time. The combined test list should match an unsharded run. If shard two fails, the other jobs should finish and upload their own reports.
