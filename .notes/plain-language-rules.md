# Plain-language rules

Make the lesson easier to read without changing what it teaches.

1. Keep each sentence to 25 words. Count an inline code span, a link, or a URL as one word.
2. Use a period or a conjunction instead of a semicolon in prose.
3. Keep each paragraph to 5 sentences and 150 words. Check each list item on its own.
4. Give each sentence one idea. When an instruction depends on a condition, put the condition first.
5. Name who or what does the work. Use plain verbs like “tell apart,” “show,” and “name.”
6. Keep the correct technical term. Explain it in plain words the first time it appears on each page, then use that same term. A problem and its editorial are separate pages.
7. Put code identifiers in backticks and keep their spelling. Say what the identifier is on first use, as in “the `baseURL` setting.” Introduce concrete values with “for example” when they are examples.
8. Give each editorial step one instruction led by an action verb. In its **Why:** paragraph, explain one cause and effect per sentence. Use the problem's own values and keep the editorial format.
9. Keep every number and any qualifier that carries a fact, such as “may,” “only,” or “usually.” Keep question answers in first person.
10. Avoid idioms. Use negatives only where they help state the rule accurately.

Rewrite all choices for an item together. Keep their lengths similar so the correct answer does not stand out. Keep IDs, reference answers, decoys, slugs, and file names unchanged.

Keep code fences and fields listed in `codeKeys` in `tests/support/prose.ts` byte-identical. Keep numbered samples under `items.lines` unchanged too. You can add inline code spans, numbers, and URLs. Keep all the original ones.

## Length by field

- Question body: 80 to 300 words. Keep `### Example` last.
- Editorial: 250 to 650 words outside code blocks.
- `oneLine`, `trap`, problem prompts, and choice text: at most 2 sentences each.
- Each `looksFor` item: 1 sentence. Each follow-up answer: at most 4.

Use `npm run test:unit -- tests/content/plain-language.test.ts` to report findings.

## Before and after

### Editorial Why: report test opens the wrong deployment

Before: A required input prevents a missing preview URL from quietly falling back to local or demo settings. The final check can also catch a redirect to another origin or a stale build served on the right host.

After: If CI must supply the preview URL, a missing URL stops the run. Without that rule, the test falls back to `http://localhost:3000` or an old demo address, and nobody notices. The final check catches two more faults. One is a redirect to another origin. The other is an old build on the right host.

### Question: HTTP method idempotency

Before: POST has no general promise like that; two identical create requests may make two records.

After: POST makes no such promise. Two identical create requests may make two records.

### Choice: fix the report test URL

Before: Set baseURL from the required preview URL and fail setup if the final origin or build marker differs from that job's deployment.

After: Require the preview URL and use it as `baseURL`. Stop in setup if the final origin or build marker belongs to another deployment.
