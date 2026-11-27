---
title: What changes when you split a Playwright suite into shards?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd split one set of tests across separate automated jobs. Before trusting the result, I'd check that each job ran its part.
looksFor:
  - Explain how dividing work across jobs differs from running several workers in one job.
  - Say when Playwright splits by file and when it can split by test.
  - Give every shard the same settings and separate data for tests that make changes.
  - Check the reports for parts that failed or never ran.
trap: Starting several jobs that each run the entire suite and assuming the job list split the tests.
followUps:
  - question: Why might one part of the suite take much longer?
    answer: I'd check whether that job got larger files or slower tests. I'd look at the times for each shard and work on the slow cases before adding machines.
sources:
  - label: Playwright sharding
    url: https://playwright.dev/docs/test-sharding
  - label: GitHub Actions matrix jobs
    url: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations
  - label: GitHub Actions passing data between jobs
    url: https://docs.github.com/en/actions/tutorials/store-and-share-data
examples:
  - title: Run four shards and merge their reports
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Browser checks
          on: [pull_request]
          jobs:
            browser-tests:
              runs-on: ubuntu-latest
              strategy:
                fail-fast: false
                matrix:
                  shard: [1, 2, 3, 4]
              steps:
                - uses: actions/checkout@v6
                - uses: actions/setup-node@v6
                  with:
                    node-version: '24'
                - run: npm ci
                - run: npx playwright install --with-deps
                - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
                - uses: actions/upload-artifact@v5
                  if: ${{ !cancelled() }}
                  with:
                    name: blob-report-${{ matrix.shard }}
                    path: blob-report/
                    if-no-files-found: error
            merged-report:
              runs-on: ubuntu-latest
              needs: browser-tests
              if: ${{ !cancelled() }}
              steps:
                - uses: actions/checkout@v6
                - uses: actions/setup-node@v6
                  with:
                    node-version: '24'
                - run: npm ci
                - uses: actions/download-artifact@v5
                  with:
                    pattern: blob-report-*
                    path: all-blob-reports
                    merge-multiple: true
                - run: npx playwright merge-reports --reporter html ./all-blob-reports
                - uses: actions/upload-artifact@v5
                  with:
                    name: browser-report
                    path: playwright-report/
---

I'd use workers, separate processes that run tests at the same time within one Playwright job. Shards divide the selected tests across separate runs, often in CI jobs on different machines. CI is the automated system that runs the tests. For example, the `--shard=2/4` flag picks one part of a four-way split. If I use the `fullyParallel` setting, Playwright can split the tests individually.

Without that setting, Playwright splits by file. A few big files can leave some jobs with more work.

I'd measure how long CI takes before making changes. I'd include the time a job waits for a machine. I'd give each shard the same code version and test settings, plus its own data for tests that make changes. I'd combine the reports and check that the workflow requires every shard to pass.

### Example

If one of four jobs takes 18 minutes and the other three finish in 5, I'd find the slow files or tests. I'd measure the split again after dealing with them.

If the repository has Playwright and a test target set up, I'd use a job matrix, a list of jobs to run each shard. Each job saves a blob report, a file Playwright can combine with reports from other shards. I'd use the combined HTML report to investigate failures. I'd still check every shard's result.
