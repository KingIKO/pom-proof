---
title: A fixture change needs correcting beneath a good invoice test commit. Where would you put the fix?
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Put the corrected fixture in the commit that introduces it so the invoice assertion remains a separate, reviewable change.
looksFor:
  - Identifies the earlier fixture commit as the correction's target.
  - Preserves the later invoice assertion as a change that can be reviewed on its own.
  - Describes how to keep intermediate commits usable during a regression search.
  - Checks the branch is private and reruns the affected suite after rewriting it.
trap: Leaving a chain of half-finished commits that can't be run independently and gives bisect misleading results.
followUps:
  - question: What if teammates have already based work on your branch?
    answer: I'd leave the published history intact unless everyone affected agrees how to coordinate a rewrite.
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

I'd put the correction where the broken fixture first appears. A reviewer can then read the fixture change on its own and see the new invoice rule separately. For both commits I'd explain the expected behavior and why it matters, so a future regression search can distinguish a changed fixture from a changed tax assertion.

On a private branch I can make a fixup for the earlier commit and let autosquash move it there. I'd check the result and rerun the affected tests. When each intermediate commit is usable, bisect is less likely to stop at an unrelated fixture failure.

### Example

Assume the latest two commits add an invoice fixture, then check the exported tax total. The fixture commit is `HEAD~1`, and my working copy corrects its currency. I stage just that file and accept the autosquash order. The final log should still show two commits, with the currency correction in the earlier one.
