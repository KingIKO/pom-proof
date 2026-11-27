---
title: "Both branches changed the same test. How do you resolve the conflict in Git?"
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: "I read why each side changed the test. I keep both expectations if they still apply and rerun the affected case."
looksFor:
  - "Explain which behavior each side expects."
  - "Check the current requirement if the expectations disagree."
  - "Review the combined change and run the tests it affects."
  - "Show that you kept useful checks instead of dropping them to get a pass."
trap: "Taking a whole version of the file without checking which expectation it drops."
followUps:
  - question: "What if the two versions expect different results?"
    answer: "I'd ask the change author or product owner which behavior the team agreed to. I'd use that answer to decide which expectation to keep."
sources:
  - label: Git merge conflict resolution
    url: https://git-scm.com/docs/git-merge#_how_conflicts_are_presented
  - label: Git rebase conflict resolution
    url: https://git-scm.com/docs/git-rebase
---

I read both sides and review the changes that came with them. Git's conflict markers show where edits overlap. I still need to find out which behavior is right. If both expectations still apply, I keep them. If they disagree about what the customer should see, I ask which rule applies before editing the file.

I review the diff, the list of changes, and stage the file so Git records my resolution. I continue the merge or rebase, the operation bringing the changes together. Then I run the affected test and nearby tests. I compare the assertion, the check for the expected result, with the agreed behavior.

### Example

Suppose I see one branch rename Refund and the other add a check for the refunded total. I'd keep the new name and the total check. I'd run the refund test rather than assume the combined file works.
