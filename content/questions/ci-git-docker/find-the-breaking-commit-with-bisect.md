---
title: "Some catalog revisions won't build. How would you check whether Git bisect found the ranking bug?"
topic: ci-git-docker
roles: [sdet]
level: senior
type: tooling
oneLine: "I trust the reported boundary only if my check can tell a wrong ranking from a revision it can't test."
looksFor:
  - "Explain what Git could miss if it skips a commit."
  - "Separate a module that won't load from a search that ranks results incorrectly."
  - "Prove a known good and bad revision with the same test data and software."
  - "Check the reported change and the revision just before it."
trap: "Using a test that passes and fails inconsistently, or counting an unrelated setup issue as the ranking bug."
followUps:
  - question: "What if the bug is that the module won't load?"
    answer: "I'd write a check for that failure and mark the relevant import failure as bad. A check for rank order can't judge a revision that gives no ranking."
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

I'd decide what counts as a bad result. For this bug, my probe, a small check that runs the search, returns zero for a correct top result. It returns one for a wrong order. It returns 125 if the module won't load or its ranking function isn't available. That tells Git to skip the revision.

Git bisect looks for the first bad commit by testing revisions between a known good and a known bad one. Before starting, I'd test both known revisions with the same data and runtime. If Git skips the revision that caused the bug, it may list several candidates. If skips leave the answer unclear, I'd restore a compatible setup where possible. I'd rerun the first bad candidate and its parent, the revision just before it, before blaming the change.

### Example

I know the `search-v1` tag ranks the results correctly. On `HEAD`, my current revision, a tea towel comes ahead of green tea. I run the search module directly with two products in a clean checkout. If an older revision lacks the function I call, I skip it. I run `git bisect reset` to return to my starting branch.
