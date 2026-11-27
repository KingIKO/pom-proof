---
title: "A shared change turned off the quick renewal test. How would you undo it?"
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I revert a shared commit by adding a new commit. I use reset to move a private branch or restore to change specific files."
looksFor:
  - "Show how a new commit can undo a shared change."
  - "Explain what each reset mode keeps in the index and your files."
  - "Use restore when you only need to change specific files."
  - "Find a lost commit in the local reflog if Git still records it there."
trap: "Resetting a shared branch and force-pushing it to avoid making a revert commit."
followUps:
  - question: "How could you get back a commit you lost after a local reset?"
    answer: "I'd use `git reflog` to find the commit the branch pointed to before the reset. I'd create a recovery branch at that commit before changing any other branches."
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

I'd start with a clean worktree, with no unfinished changes in my files. Revert creates a new commit that reverses the bad change and leaves shared history in place. I'd check what the new commit changes. I'd run the smoke test, a quick check of renewal, before sending the change for review.

If I only made the mistake on my own branch, I could use reset to move the branch back. Soft reset keeps my files and the index, where Git tracks what I've staged. Mixed reset resets the index and keeps my files. Hard reset resets both and can discard work. Restore changes files without moving my branch.

After a mistaken reset, I'd check the local reflog, Git's record of where local branches used to point. It can help me find the old commit.

### Example

Suppose `BAD_COMMIT` identifies an ordinary shared commit that removed the check for the expected renewal result. I'd read the commit and revert it on a clean branch for review. I'd check that the revert restores the renewal check and leaves the unrelated test alone.
