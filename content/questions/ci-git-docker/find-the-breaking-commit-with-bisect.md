---
title: Catalog search can no longer be built at some revisions. Can you still trust a bisect result?
topic: ci-git-docker
roles: [sdet]
level: senior
type: tooling
oneLine: Trust the reported boundary only if you can distinguish the ranking regression from failures that prevent measuring it.
looksFor:
  - States what a skipped commit can conceal.
  - Distinguishes an entry point that won't load from a wrong ranking result.
  - Establishes known-good and known-bad revisions with the same fixture and runtime.
  - Confirms the boundary on both sides instead of blaming the first candidate.
trap: Sending a flaky browser test through bisect and treating an unrelated setup failure as the search regression.
followUps:
  - question: What if losing the ability to import the module is itself the bug?
    answer: I'd write a probe for that symptom and classify the relevant import failure as bad. A probe for rank order alone cannot classify a revision that never returns a ranking.
sources:
  - label: Git bisect run and exit codes
    url: https://git-scm.com/docs/git-bisect
  - label: Node.js module input on the command line
    url: https://nodejs.org/api/cli.html#--input-typetype
  - label: Node.js exit status
    url: https://nodejs.org/api/process.html#processexitcode
examples:
  - title: Classify a fixed search fixture at each revision
    variants:
      - lang: bash
        label: Git CLI (Bash)
        code: |
          git bisect start HEAD search-v1
          git bisect run node --input-type=module -e '
            const module = await import("./src/search.mjs").catch(() => null);
            if (typeof module?.rank !== "function") process.exit(125);
            const items = ["tea towel", "green tea"];
            process.exitCode = module.rank("green tea", items)[0] === "green tea" ? 0 : 1;
          '
          git bisect reset
---

I'd first decide what counts as bad. For the ranking bug, zero means the first result is correct and one means the order is wrong. This probe returns 125 when the module fails to load or its ranking function is unavailable. If the commit that introduced the regression is skipped, Git may only be able to report several possible first bad commits.

I'd run the same fixture and runtime at the known good and bad revisions before starting the binary search. If skips leave the answer unclear, I'd restore a compatible setup where possible. I'd rerun the reported boundary and its parent before blaming a change.

### Example

The `search-v1` tag is known good and `HEAD` ranks a tea towel ahead of green tea. In a clean checkout the probe calls the pure search module with two products. A revision without the entry point is skipped, and `git bisect reset` returns me to the starting branch.
