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
---

Workers run tests concurrently within one Playwright job. Shards divide the selected tests across separate invocations, often in CI jobs on different machines. Playwright's `--shard=2/4` picks one part of a four-way split. With `fullyParallel` it can distribute at test level; otherwise the split is at file level, so a few big files can make the jobs uneven.

I start with a CI timing baseline and take runner queue time into account. Each shard needs the same revision and test configuration, plus independent mutable test data. I'd merge the shard reports and check that the workflow requires success from all of them.

### Example

If one of four jobs runs for 18 minutes and the other three finish in 5, I'd find which files or tests dominate that job and measure the split again after addressing them.
