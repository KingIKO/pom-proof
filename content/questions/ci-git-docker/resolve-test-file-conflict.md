---
title: How do you resolve a Git conflict when both branches changed the same test?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: Read the reason for each change, preserve both intended behaviors, and rerun the affected case.
looksFor:
  - The expectation behind each side of the conflict
  - A check of the current requirement if expectations disagree
  - A reviewed resolution and focused test run
  - Care not to discard valid coverage to get a pass
trap: Accepting the entire incoming or current version without checking what assertion disappears.
followUps:
  - question: What if the expected results contradict each other?
    answer: I'd check the accepted behavior with the change author or product owner before deciding which expectation survives.
sources:
  - label: Git merge conflict resolution
    url: https://git-scm.com/docs/git-merge#_how_conflicts_are_presented
  - label: Git rebase conflict resolution
    url: https://git-scm.com/docs/git-rebase
---

I read both sides and look at the changes they came with. A conflict marker tells me the edits overlapped; it can't tell me which product behavior is right. I preserve both useful expectations if they still apply. If the changes disagree about what a customer should see, I ask which requirement applies before resolving the file.

I review the resolved diff, stage the file, and continue the merge or rebase. Then I run the affected test and its neighbors. I check the assertion against the accepted behavior instead of just accepting whichever wording makes the build green.

### Example

If one branch renames the Refund action and the other adds an assertion about the refunded total, I'd use the new name and keep the total check. I still run the actual refund spec.
