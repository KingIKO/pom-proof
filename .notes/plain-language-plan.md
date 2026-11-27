# Plain-language pass plan (plan agent, 2026-11-27)

Gate: start only when origin/main holds PR #10 (merged 017668e) and content-g1 to g5 (294 question files), suite green. Work in a fresh worktree from origin/main. Lazy-question-bank lands before U1 touches question components.

## House rules (.notes/plain-language-rules.md)
Tested: 1) sentence <= 25 words (inline code span or URL = one word); 2) no semicolons in prose; 3) paragraph <= 5 sentences and <= 150 words (a list item is its own paragraph).
Reviewer: 4) one idea per sentence, condition before instruction; 5) subject does the action, verbs not nominalisations ("tell apart", "show", "name" over "distinguish", "establish", "identify"); 6) keep the correct technical term, explain it in plain words at first use on each page (a problem and its editorial are separate pages), then use only that term; 7) code identifiers in backticks, exact spelling, say what it is at first use ("the `baseURL` setting"), concrete values with "for example"; 8) Why format: step line is one verb-led instruction; Why paragraph gives one cause and effect per sentence using the problem's own values; editorial-format structure unchanged; 9) keep every number and every hedge that carries a fact; question answers stay first person; 10) no idioms, few negatives.

Before/after:
- Editorial Why (reports-wrong-base-url): "A required input prevents a missing preview URL from quietly falling back to local or demo settings. The final check can also catch a redirect to another origin or a stale build served on the right host." -> "If CI must supply the preview URL, a missing URL stops the run. Without that rule, the test falls back to `http://localhost:3000` or an old demo address, and nobody notices. The final check catches two more faults. One is a redirect to another origin. The other is an old build on the right host."
- Question answer (api/http-methods-idempotency.md:24): "POST has no general promise like that; two identical create requests may make two records." -> "POST makes no such promise. Two identical create requests may make two records."
- Choice text (diagnosis/reports-wrong-base-url fix -> url): "Set baseURL from the required preview URL and fail setup if the final origin or build marker differs from that job's deployment." -> "Require the preview URL and use it as `baseURL`. Stop in setup if the final origin or build marker belongs to another deployment."

## Checks
New tests/content/plain-language.test.ts; move code-range helpers (markdownCode, yamlCode, inlineCode, codeKeys, astroStrings, tsxStrings) from prose.test.ts into tests/support/prose.ts. Prose units: Markdown paragraphs and list items outside fences plus every frontmatter string not under codeKeys (prompt, text, teaches, note, summary, oneLine, looksFor, trap, follow-ups, titles, labels); headings and tables skipped. Normalise: inline code, links, bare URLs -> one placeholder word; strip list markers and **Why:**. Split on . ? ! + whitespace + capital/digit/placeholder; not after e.g., i.e., etc., vs. Rules: semicolon outside code, sentence > 25 words, paragraph > 5 sentences or > 150 words. UI strings: astroStrings and tsxStrings, plus src/**/*.ts (gap: grade.ts strings unchecked), after stripping entities. Average sentence length printed per type, not asserted. Planted cases. `enforced` list of path prefixes starts empty; each content PR adds its prefix; final PR removes the list.

## Word limits (confirmed by step 0 pilot)
Question body 80-220 -> 80-300; editorial 250-500 -> 250-650; oneLine, trap, prompt: 2 sentences; looksFor item: 1 sentence; follow-up answer: 4 sentences; choice text: 2 sentences.

## Split
Step 0 (one iko-bedrock, PR 1): rules doc, shared helpers, new test with empty enforced list, limit changes; pilot 10 files per type and record word growth.
Step 1 (nine iko-bedrock, own worktrees): P1 problems/{code,sql,locator} 84; P2 problems/{bug-report,diagnosis,scenario,test-design} 60; E1 editorials for code/sql/locator 84; E2 editorials for the other four kinds 60; Q1-Q4 questions split alphabetically by topic (~294); U1 tracks (4) and src strings (~35). No changes to ids, reference, decoy, code fields, fences, slugs, file names; grep tests/ before changing choice or label literals. Rewrite all choices of an item together, similar lengths (no answer giveaway).
Mechanical guard per PR: code fences and code-key fields byte-identical; inline code spans, numbers and URLs may grow but not shrink.
Review (iko-proof): diff + rules, not builder summary; read every changed prompt, choice text and editorial answer step; random 25% of the rest per agent; a changed fact means read the whole batch; per sampled file list each fact, condition and hedge and confirm it survived.
Landing: one PR per content type (problems, editorials, questions, tracks and UI) adding its enforced prefix; final PR removes the list.

## Risks
Meaning drift (guard + review; when unsure keep the clause and split it), lost hedges (rule 9), answer giveaway (rewrite choices together), longer pages (bounded), lazy-question-bank overlap (U1 after it merges), UI false positives (limit semicolon rule to JSX text and aria-label/title/placeholder/alt if needed).
