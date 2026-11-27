---
title: What changes when you shard a Playwright suite?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Divide one test selection across CI jobs and confirm all shards ran before trusting the result.
looksFor:
  - Difference between sharding and workers
  - File-level versus test-level distribution
  - Independent data and consistent configuration on every shard
  - Reports that show missing or failing shards
trap: Running the entire suite on every job and assuming the matrix split it.
followUps:
  - question: Why might one shard take much longer?
    answer: File size and test duration can skew the split. I'd inspect per-shard timings and address costly cases before throwing more runners at it.
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

Workers run tests concurrently within one Playwright job. Shards divide the selected tests across separate invocations, often in CI jobs on different machines. Playwright's `--shard=2/4` picks one part of a four-way split. With `fullyParallel` it can distribute at test level; otherwise the split is at file level, so a few big files can make the jobs uneven.

I start with a CI timing baseline and take runner queue time into account. Each shard needs the same revision and test configuration, plus independent mutable test data. I'd merge the shard reports and check that the workflow requires success from all of them.

### Example

If one of four jobs runs for 18 minutes and the other three finish in 5, I'd find which files or tests dominate that job and measure the split again after addressing them.

In a repository with Playwright installed and a configured test target, the matrix runs each shard and saves its blob report. The merged HTML report is for diagnosis. I still check the result of every shard.
