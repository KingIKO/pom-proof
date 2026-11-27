---
title: What is the difference between merging and rebasing a test branch?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: Merging combines histories; rebasing replays commits onto a new base and changes the replayed commit IDs.
looksFor:
  - How a merge can preserve existing commits
  - What rebase does to replayed commit IDs
  - Care around a shared branch
  - Why the affected tests need to run afterward
trap: Rebasing a branch others are working from without checking the team's policy.
followUps:
  - question: Do all merges create a merge commit?
    answer: No. A fast-forward merge can move the branch pointer when the history hasn't diverged.
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

If I merge the target branch into my feature branch, the original commits stay in its history. If the branches diverged, a normal merge can create a new commit that joins them. Rebasing my branch onto the target replays my changes from that new base, so the replayed commits have different IDs.

On my own branch I'd rebase if that's the team's convention. On a shared branch, I'd avoid rewriting commits other people may already be using unless we agree how to coordinate. Either way a clean update can still change what the code does together, so I run the affected tests after integrating it.

### Example

Say the clean local `settings-tests` branch adds a test for a renamed preference and has diverged from `origin/main`. I use two new branches so both start from the same tip. If both integrations proceed without conflicts, the graph shows a merge with both histories and a rebase with the test commit replayed. I'd run the preference spec on the branch I plan to submit.
