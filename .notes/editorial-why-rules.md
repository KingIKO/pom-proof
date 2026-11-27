# Editorial rewrite rules (editorials that teach the why)

Worktree: C:\Users\Owner\Desktop\_Projects\pom-proof-editorials, branch `editorials-why` (from main). Never work in C:\Users\Owner\Desktop\_Projects\pom-proof (another project branch is in progress there).

Owner's request: the editorial tells you what to do but not why. Break it into sections and, after each step, add a "Why:" line that explains the reason. It is meant to teach.

## Format (every editorial)

```md
---
problem: <kind>/<id>
---

## What is going on
Short context: what the problem is really about, in 1 to 3 short paragraphs.

## The answer        <- use "## The fix" for code, sql and locator problems
1. One instruction or one chosen answer, stated in words.

   **Why:** the cause or consequence that makes it right.

2. Next step ...

   **Why:** ...

## Why the tempting answer fails
The decoy (from the problem's `decoy`), every decoy item, and why each fails.

## What the interviewer listens for
1 to 3 sentences.

## Sources
- [Title](https://...)
```

The model is `content/editorials/renewal-crosses-midnight.md`. Match its tone and depth.

## Rules

- `##` headings exactly as above, in that order. Bold `**Why:**` in its own paragraph indented under its step (three spaces), one per step.
- A Why gives a cause or a consequence. Never restate the step in other words. Ask "why would a strong tester do this?" and answer that.
- Accurate to the problem's `reference` and `decoy`: read the problem file (`content/problems/<kind>/<id>.md`) beside the editorial.
- Keep every existing fact and link from the current editorial; add reasons. Seven files have no source link and each must gain one primary source (classify-test-retries, delivery-fee-mutants, last-pickup-slot, late-shipping-route, latest-executed-run, refund-duplicate-receipts, refund-order-action).
- Every factual claim about a tool or standard is sourced in `## Sources` with an official page (fetch it; do not recall).
- 250 to 500 words outside code blocks.
- Kind variants:
  - scenario, diagnosis, bug-report: one step per graded item, in the problem's item order, stating the reference choice in words (for multi-select and budgeted picks, name each chosen option; for ordering, give the order; for line marking, name the marked lines).
  - code: steps build the reference solution; add a short code block only where the step changes code.
  - sql: same as code, with the full reference query shown once.
  - locator: the reference locator in a code block first, then one step per locator part; each Why names the layout variant that part survives.
  - test-design: one step per kind of row or assertion in the reference (boundary pair, partition, state, rule), each Why naming the mutant (by what it breaks) that the row catches.
- Prose: no em dashes, emoji, exclamation marks, or the banned words (delve, leverage, unlock, tapestry, realm, seamless, robust, pivotal, harness, empower, streamline, game-changer); sentence case; plain, speakable.
- Edit only `content/editorials/<id>.md` files for your kinds. Do not edit problems, tests, src or notes.

## Checking

- `npx vitest run tests/content` (the format check `tests/content/editorial-format.test.ts` is being added by iko-proof; run it once it exists).
- Build your own copy: `npx astro build --outDir .tmp/<agent>-dist`, preview on your port (A 4461, B 4462, C 4463, D 4464, E 4465), open two of your editorials in the workspace Editorial tab at 1440 and 390, stop the preview.
- Report the files rewritten, sources added, and anything you could not verify.
