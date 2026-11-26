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
sources:
  - label: Playwright sharding
    url: https://playwright.dev/docs/test-sharding
  - label: GitHub Actions job matrices
    url: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations
---

I measure the current critical path first. If executing the tests dominates it, I'd use a job matrix to supply each runner a different shard index and the same shard count. I pass those values to the test runner so it selects that slice. Without that step, each job can run the whole suite.

I use the same build and test configuration throughout, and namespace mutable state by run and shard so jobs can't delete another job's records. I'd make the merge check fail if any required shard fails or never reports. Then I compare both wall time and total runner minutes with the baseline.

### Example

I'd send a 20-minute browser suite to four jobs. I compare the combined list of tests against a single run and check each job contributes to the gate.
