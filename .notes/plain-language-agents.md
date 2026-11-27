# Plain-language rewrite: rules for every agent

Worktree C:\Users\Owner\Desktop\_Projects\pom-proof-plain, branch `plain-language-content`. Nine agents work here at once, each in its own files. Never touch C:\Users\Owner\Desktop\_Projects\pom-proof or other worktrees. Do not commit.

Owner's words: "I need sentence structure throughout POM Proof to be clearer and simpler to understand. We're trying to understand the core concepts... I don't want sentences to be hard to decipher because that adds another layer we don't need to learning."

1. Read `.notes/plain-language-rules.md` (the ten rules, examples, the guard) and `.notes/plain-language-pilot.md`. The pilot files are already done: look at three of them for the target style, and skip them.
2. Rewrite every prose sentence in your files so it passes the rules: 25 words or fewer, no semicolons, paragraphs of 5 sentences or fewer and 150 words or fewer, one idea per sentence, condition before instruction, verbs instead of nouns made from verbs, every technical term explained in plain words at its first use on the page, everyday words. Also fix dense sentences that pass the counts but are hard to read (unnamed references like "the final one", stacked clauses).
3. Never change meaning. Keep every fact, number, condition and qualifier ("typically", "may", "usually"). Keep code spans, code fields, fences, ids, slugs, file names, `reference`, `decoy` and editorial headings exactly. When unsure, keep the clause and split it rather than reword it.
4. Answer choices: rewrite all the choices of an item together and keep their lengths similar, so the correct one does not stand out. Before changing a choice or label literal, grep `tests/` for it.
5. Question answers stay in first person. Editorials keep the five-section format and one **Why:** per step.
6. Check as you go: `npx vitest run tests/content` (the plain-language test reports findings per content type; your files must reach zero findings) and the guard: for each changed file, code fences and code-key fields byte-identical to `git show HEAD:<file>`, and the sets of inline code spans, numbers and URLs may grow but not shrink. Write a small script for the guard if you need one and run it over your files.
7. Report: files rewritten, findings before and after for your files, any meaning you were unsure about, and the guard result.
