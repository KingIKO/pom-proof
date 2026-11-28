# Study writers: brief for every writer

Worktree C:\Users\Owner\Desktop\_Projects\pom-proof-study-ab, branch `study-stage-ab`. Five writers work here at once, each only in its own files. Never touch other worktrees. Do not commit.

Owner's request: "a study section that contains proper information on all things QA: best practices, framework designs, data handling, how to set up a test, page object models, fixtures... no formal guide for how things are done in 2026... digestible chunks I can actually use for studying... explain what it is, how to implement it, why it's good, why it's not... I don't want to be overwhelmed." He is preparing for QA/SDET interviews.

## Read first
1. `.notes/practice-study-plan.md` section 4 (page format, word limits, recap rule, validation).
2. `.notes/plain-language-rules.md` (enforced by test: 25 words or fewer per sentence, no semicolons, short paragraphs, terms explained at first use).
3. The two finished pilot pages, which are the model: `content/study/framework-design/page-object-model.md` and `content/study/framework-design/parameterised-tests.md`. Match their shape, tone and depth.
4. Your concepts in `.notes/study/topic-map.json` (definition, practice, tradeoffs, prerequisites, sources, slug) and `.notes/study/research-brief.md` (what changed recently, where experts disagree, risks).

## Rules
- File name = the concept's `slug`, in `content/study/<module slug>/`. `prerequisites` must match the map exactly. `order` follows the map's concept order.
- Cite only URLs from that concept's `sources` in the map, with the map's type. Fetch each source you rely on and check every factual claim against it. Do not trust the map's summary alone; where the map says something you cannot find in the source, leave it out.
- Original wording. Never copy sentences from sources. Never open sdetrole.com or qaladder.org.
- Where experts disagree (research brief), use `expertsDisagree` with both sides and the condition under which each holds. Pick no winner where the evidence picks none. Date-stamped facts go in `whatChanged` with `checked: 2026-11-27`.
- Code examples: Playwright TypeScript first; Python (pytest/Playwright or Selenium) and Java (Selenium 4 + JUnit 5, or REST Assured) where they help. Code must be correct and runnable with obvious imports added. Prefer one example per page. Tool-neutral concepts may use a short example or none.
- `practiceTopics`: only topics that exist on problems and actually fit the page (omit if none). `questionTopics`: matching question topics.
- Explain for an interview: what it is, how it works, why it helps, when not to use it, the trade-off an interviewer will probe.

## Check before you report
- `npx vitest run tests/content` passes (study, examples, plain-language).
- `npx astro build --outDir .tmp/<your id>-dist` builds. Do not run `npm run verify` (shared port).
- Report: pages written, word counts, each source you fetched, every claim you could not verify (and what you did with it), any map entry that looked wrong.
