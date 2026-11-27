---
title: "Before checking a sign-in bug on `main`, would you fetch or pull?"
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "I fetch to see what changed on the remote. If I'm ready to update my branch, I pull and choose how to bring those changes in."
looksFor:
  - "Explain which local record Git updates when you fetch from the remote."
  - "Explain the difference between downloading commits and bringing them into your branch."
  - "Say when fast-forward-only pull moves the branch and when it refuses."
  - "Check your active branch and local files before updating."
trap: "Pulling onto a branch with unrelated local work before checking what Git would bring in."
followUps:
  - question: "What if a fast-forward-only pull refuses to update the branch?"
    answer: "I'd compare my commits with the incoming ones to find where the histories split. I'd choose a merge or rebase based on who already uses the branch."
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

If I want to inspect incoming commits or I'm unsure about my local files, I'd fetch first. Fetch normally updates remote-tracking references such as `origin/main`. That's my local record of where the remote branch points. Fetch leaves my active branch in place.

Pull fetches and then brings those commits into the active branch. It can merge, which joins histories, or rebase, which replays my changes on a new starting commit. If my local `main` has no uncommitted changes and I only want to catch up, I'd use fast-forward only. That moves `main` forward if the histories haven't split. If they have, I'd let it refuse and decide what to do with my commits.

### Example

After the team changes sign-in, my clean local `main` is behind. I fetch and inspect the incoming commits. If `main` can move forward without changing either history, I pull with fast-forward only. If Git refuses, I decide how to combine the changes.
