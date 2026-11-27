---
title: The refund dropped from $12 to $10 and the test did not change. What would you bring to triage?
topic: ci-git-docker
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Bring the passing and failing builds, the unchanged assertion, and the shipping-credit change for comparison.
looksFor:
  - Records both the test revision and the build under test.
  - Checks the shipping-credit rule before deciding which revision is wrong.
  - Uses its local history even if the remote is down.
  - Keeps any trial fix separate from the branch the team shares.
trap: Updating the expected result to match the current build before finding out which behavior is correct.
followUps:
  - question: The Git server goes down after you have the two refund revisions. Can you still prepare a patch for review?
    answer: Yes. In a normal clone I can inspect local history and commit locally. I'd need a connection to send that commit to the team's remote.
sources:
  - label: Pro Git, distributed version control
    url: https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control
  - label: Git log
    url: https://git-scm.com/docs/git-log
---

I'd record the test commit and the application build from the last pass and the first failure. The history gives me a way to compare what changed, whether the assertion moved or the refund calculation did. I can make a branch to try a fix and ask someone to review it alongside the requirement.

Git is distributed. My normal clone has its own copy of the repository history, so I can inspect commits, create a branch, or commit offline. The team still uses a shared remote to exchange work and review changes.

### Example

A refund test expects a credit of $12, but the new build shows $10. The test lives at the same commit in both runs, while the application history shows a change to shipping credits. I'd ask whether shipping is refundable for that order before I update either the app or the test.
