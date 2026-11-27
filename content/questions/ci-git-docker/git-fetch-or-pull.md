---
title: Would you fetch or pull before investigating a sign-in failure on main?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: Fetch to inspect the remote changes first, then pull with an explicit integration choice when ready to update the branch.
looksFor:
  - Says what happens to the remote-tracking branch.
  - Distinguishes downloading from integrating changes.
  - Explains the effect of a fast-forward-only pull.
  - Checks the current branch and working tree before updating.
trap: Pulling onto a branch with unrelated local work before checking what will be integrated.
followUps:
  - question: What if a fast-forward-only pull refuses to proceed?
    answer: I'd compare the local and incoming commits to see where they diverged, then choose merge or rebase according to how the branch is shared.
sources:
  - label: Git fetch and remote-tracking branches
    url: https://git-scm.com/docs/git-fetch
  - label: Git pull integration options
    url: https://git-scm.com/docs/git-pull
  - label: Git status
    url: https://git-scm.com/docs/git-status
  - label: Git log revision ranges
    url: https://git-scm.com/docs/git-log
examples:
  - title: Inspect incoming sign-in changes before updating
    variants:
      - lang: bash
        label: Git CLI (Bash)
        code: |
          git status --short --branch
          git fetch origin
          git log --oneline HEAD..origin/main
          git pull --ff-only origin main
---

I'd fetch first if I want to see what changed or if I'm unsure about the state of my working tree. Fetch normally updates remote-tracking references such as `origin/main`. It doesn't integrate those commits into my checked-out branch. Pull fetches and then integrates, for example with a merge or a rebase.

If I'm on a clean local `main` and only want to catch up, I'd choose fast-forward only. Git can move `main` forward if the histories haven't diverged. If they have, I'd rather see the refusal and decide how to handle my local commits.

### Example

The team just changed sign-in and my clean local `main` is behind. I fetch and look at the incoming commits first. If `main` can fast-forward, the last command catches it up; otherwise it leaves me to choose the integration.
