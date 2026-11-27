---
title: "An earlier fixture commit needs a fix, but the later invoice test commit is right. Where does the fix go?"
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I put the correction in the commit that first adds the test data. I keep the invoice check separate so it can be reviewed on its own."
looksFor:
  - "Name the earlier commit that should contain the correction."
  - "Keep the later invoice check readable on its own."
  - "Explain how to keep the intermediate versions runnable for someone looking for a bug."
  - "Check the branch is private before rewriting it and rerun the affected tests afterward."
trap: "Keeping unfinished commits that don't run on their own and give misleading results in bisect."
followUps:
  - question: "What if teammates have built work on top of your branch?"
    answer: "I'd keep the published commit history intact unless everyone affected agrees on how to rewrite it together."
sources:
  - label: Git commit message and fixup options
    url: https://git-scm.com/docs/git-commit
  - label: Git rebase and autosquash
    url: https://git-scm.com/docs/git-rebase
  - label: Git add
    url: https://git-scm.com/docs/git-add
  - label: Git log
    url: https://git-scm.com/docs/git-log
examples:
  - title: Correct the earlier fixture commit
    variants:
      - lang: bash
        label: Git CLI (Bash)
        code: |
          git log --oneline origin/main..HEAD
          git add tests/fixtures/invoices.ts
          git commit --fixup=HEAD~1
          git rebase -i --autosquash origin/main
          git log --oneline origin/main..HEAD
---

I'd fix the fixture, the data a test starts with, in the commit that first adds it. A commit records a set of changes in Git. A reviewer could then read that change on its own and review the new invoice rule separately. I'd explain the expected behavior and why it matters in each commit message. That helps someone tracing a bug tell a change in test data from a change in the expected tax.

On a private branch I can make a fixup commit, a small correction marked for an earlier commit. I'd use autosquash to fold it into that commit. I'd review the result and rerun the affected tests. If the commits between my starting and ending points work, bisect is less likely to stop at an unrelated fixture failure. Bisect checks revisions between a known good and a known bad one to find when a bug started.

### Example

Suppose my latest two commits add an invoice fixture and then check exported tax. `HEAD~1` identifies the earlier commit, and my local files fix its currency. I stage just that file and accept the autosquash order. I'd expect the log to show two commits, with the currency fix in the earlier one.
