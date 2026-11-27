---
title: "What changes when you merge a test branch or rebase it?"
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "When I merge, I join the branch histories. When I rebase, I replay commits on a new starting point, which gives them new IDs."
looksFor:
  - "Explain how a merge keeps the original commits."
  - "Explain why commits that rebase replays get new IDs."
  - "Say what you'd check before rebasing a branch other people use."
  - "Explain why you rerun the tests after either update."
trap: "Rebasing a shared branch before checking what the team has agreed to do."
followUps:
  - question: "Does every merge add a merge commit?"
    answer: "No. If the histories haven't split, I can do a fast-forward merge. That just moves my branch to the newer commit."
sources:
  - label: Git merging
    url: https://git-scm.com/docs/git-merge
  - label: Git rebasing
    url: https://git-scm.com/docs/git-rebase
  - label: Git switch and create branch
    url: https://git-scm.com/docs/git-switch
  - label: Git fetch
    url: https://git-scm.com/docs/git-fetch
  - label: Git log graph and options
    url: https://git-scm.com/docs/git-log
examples:
  - title: Compare merge and rebase on two local copies
    variants:
      - lang: bash
        label: Git CLI (Bash)
        code: |
          git fetch origin
          git switch -c settings-merge settings-tests
          git merge origin/main
          git switch -c settings-rebase settings-tests
          git rebase origin/main
          git log --graph --oneline settings-merge settings-rebase origin/main
---

When I merge a target branch into my feature branch, I keep the original commits in the history. If the histories have split, a normal merge can add a commit that joins them. When I rebase, Git plays my changes back on top of the target branch. The commits it replays get new IDs.

On my own branch, I'd rebase if that's what the team does. If others use the branch, I'd avoid rewriting commits they may already have unless we agree on how to do it together. Even if the update has no conflicts, the changes may behave differently together. I run the affected tests afterward.

### Example

Suppose my clean local `settings-tests` branch adds a test for a renamed preference. It has split from `origin/main`, my local record of the remote branch. I start both attempts from the same commit using two new branches. If there are no conflicts, the merge shows both histories and the rebase shows a replayed test commit. I run the preference test on the branch I'll submit.
