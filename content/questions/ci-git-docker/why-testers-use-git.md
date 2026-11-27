---
title: "A refund fell from $12 to $10, but the test didn't change. What would you bring to the bug review?"
topic: ci-git-docker
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: "I bring both builds and show that the expected result didn't change. I point out the shipping-credit change for comparison."
looksFor:
  - "Record the version of the tests and which build they ran against."
  - "Check the rule for shipping refunds before saying which version is wrong."
  - "Read local history even if you can't reach the server."
  - "Try any fix on a separate branch instead of changing the one everyone shares."
trap: "Changing the expected result to fit the new build before checking which amount is right."
followUps:
  - question: "If the server goes down after you get both revisions, can you still prepare a change for review?"
    answer: "Yes. In a normal clone, I can read history and save a commit locally. I need a connection to send the commit to the team's server."
sources:
  - label: Pro Git, distributed version control
    url: https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control
  - label: Git log
    url: https://git-scm.com/docs/git-log
---

I'd record the test commit, a saved version of the test code, and the app build from the last pass and first failure. I'd use the history to see whether the check changed or the refund calculation changed. I'd try any fix on its own branch, an independent line of changes. I'd ask someone to review it alongside the requirement.

Git is distributed, so a normal local clone has its own copy of the history. I can read commits, make a branch, or commit offline. The team still uses a shared remote, a copy on a server, to exchange and review work.

### Example

I expect a $12 credit in the refund test, but I see $10 on the new build. I find the test uses the same commit in both runs. The app history shows a shipping-credit change. Before changing the app or the test, I'd ask whether shipping is refundable on that order.
