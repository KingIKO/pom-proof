---
title: How would you undo a shared change that disabled the renewal smoke test?
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Revert the shared commit; choose reset for private branch history and restore for specific files.
looksFor:
  - Reverses a shared change by adding a commit.
  - Explains what the index and working tree retain in each reset mode.
  - Uses restore for paths rather than branch history.
  - Uses the local reflog to find a lost commit when it is still recorded.
trap: Resetting and force-pushing a shared branch because that seems faster than making a revert commit.
followUps:
  - question: How would you recover a commit lost after a local reset?
    answer: I'd find the old tip with git reflog and create a recovery branch at that commit before making any other branch changes.
sources:
  - label: Git revert
    url: https://git-scm.com/docs/git-revert
  - label: Git reset modes
    url: https://git-scm.com/docs/git-reset
  - label: Git restore
    url: https://git-scm.com/docs/git-restore
  - label: Git reflog
    url: https://git-scm.com/docs/git-reflog
  - label: Git show
    url: https://git-scm.com/docs/git-show
examples:
  - title: Revert a known commit without rewriting history
    variants:
      - lang: bash
        label: Git CLI (Bash)
        code: |
          git show "$BAD_COMMIT"
          git revert --no-edit "$BAD_COMMIT"
          git show HEAD
---

I'd revert the bad commit on a clean worktree. That makes a new commit that reverses the change and keeps the shared history intact. I'd inspect the new diff and run the renewal smoke test before sending it for review.

If I'd only made the mistake on my own branch, reset could move the branch back. Soft reset keeps the index and working files. Mixed reset resets the index and keeps working files; hard reset resets both and can discard work. For a file I can use restore without moving the branch. The local reflog can help find a previously referenced commit after a mistaken reset.

### Example

Suppose `BAD_COMMIT` names an ordinary shared commit that removed the renewal assertion. I inspect it, revert it on a clean branch for review, and check that the reversal restores the assertion without changing an unrelated test.
