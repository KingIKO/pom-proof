# Plain-language pilot

Baseline: `b468be2`. The same scanner measured the original and rewritten text.

## Findings across the repository

| Content | Files | Semicolons | Long sentences | Long paragraphs | Field limits | Baseline words per sentence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Problems | 144 | 115 → 105 | 32 → 31 | 27 → 25 | 0 → 0 | 4.3 |
| Editorials | 144 | 78 → 71 | 52 → 47 | 1 → 1 | 0 → 0 | 11.6 |
| Questions | 294 | 47 → 42 | 128 → 123 | 10 → 9 | 0 → 0 | 8.8 |
| Tracks | 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 2.7 |
| UI source | 65 | 21 → 21 | 0 → 0 | 0 → 0 | 0 → 0 | 1.9 |

Run `npm run test:unit -- tests/content/plain-language.test.ts` for current counts and example locations. The enforced prefix list starts empty. The UI scan includes TypeScript messages and can also pick up developer-facing strings. Its average includes labels and short fragments, so compare it with later UI scans rather than with editorial paragraphs.

## Pilot files

Paths are relative to `content/`. Problem counts cover body prose, titles, prompts, choices, and mutant teaching text. The editorial and question counts use the same body counting rules as their format tests.

| Path | Words before → after | Findings before → after |
| --- | ---: | ---: |
| `problems/bug-report/benefits-form-focus-trap.md` | 382 → 496 | 12 → 0 |
| `problems/code/balanced-log-brackets.md` | 68 → 81 | 0 → 0 |
| `problems/code/capped-retry-delays.md` | 93 → 150 | 1 → 0 |
| `problems/diagnosis/reports-wrong-base-url.md` | 207 → 271 | 0 → 0 |
| `problems/locator/approve-timesheet-test-id.md` | 51 → 58 | 0 → 0 |
| `problems/locator/billing-email-field.md` | 51 → 61 | 0 → 0 |
| `problems/scenario/accessible-form-deadline.md` | 347 → 422 | 0 → 0 |
| `problems/sql/average-defect-close-time.md` | 73 → 85 | 0 → 0 |
| `problems/sql/departments-without-employees.md` | 54 → 56 | 0 → 0 |
| `problems/test-design/booking-ticket-limits.md` | 157 → 187 | 0 → 0 |
| `editorials/accessible-form-deadline.md` | 353 → 443 | 1 → 0 |
| `editorials/approve-timesheet-test-id.md` | 290 → 295 | 1 → 0 |
| `editorials/average-defect-close-time.md` | 359 → 422 | 1 → 0 |
| `editorials/balanced-log-brackets.md` | 281 → 322 | 1 → 0 |
| `editorials/benefits-form-focus-trap.md` | 390 → 440 | 1 → 0 |
| `editorials/billing-email-field.md` | 291 → 282 | 2 → 0 |
| `editorials/booking-ticket-limits.md` | 307 → 356 | 3 → 0 |
| `editorials/capped-retry-delays.md` | 294 → 313 | 1 → 0 |
| `editorials/departments-without-employees.md` | 303 → 350 | 1 → 0 |
| `editorials/reports-wrong-base-url.md` | 295 → 335 | 0 → 0 |
| `questions/agile/qa-throughout-the-sprint.md` | 212 → 240 | 1 → 0 |
| `questions/api/http-methods-idempotency.md` | 152 → 152 | 3 → 0 |
| `questions/automation-strategy/choose-first-automation.md` | 217 → 226 | 0 → 0 |
| `questions/bug-reports/severity-vs-priority.md` | 126 → 126 | 1 → 0 |
| `questions/ci-git-docker/reports-and-failure-artifacts.md` | 198 → 248 | 1 → 0 |
| `questions/containers/checkout-cutoff-vm-reproduction.md` | 182 → 210 | 1 → 0 |
| `questions/javascript-typescript/loose-or-strict-equality.md` | 123 → 153 | 0 → 0 |
| `questions/playwright/web-first-assertions.md` | 155 → 183 | 1 → 0 |
| `questions/sql/find-duplicate-rows.md` | 127 → 161 | 0 → 0 |
| `questions/test-design/pairwise-alert-settings.md` | 190 → 197 | 3 → 0 |

## Length decisions

Problems grew 1,483 → 1,867 words (+25.9%), editorials 3,163 → 3,558 (+12.5%), and question bodies 1,682 → 1,896 (+12.7%). The pilot cleared 36 findings, including 13 in problems, 12 in editorials, and 11 in questions.

- Questions stay at a minimum of 80 words. Three pilot answers exceeded the old 220-word maximum after rewriting. The longest reached 248 and the biggest increase was 50 words. A 300-word ceiling lets an answer near the old cap grow by that amount and still leaves room for definitions.
- Editorials stay at a minimum of 250 words. The longest pilot rewrite reached 443 words and the biggest increase was 90. The old 500-word maximum held for this sample. A 650-word ceiling gives editorials near the old cap room for growth comparable to the largest pilot increase.
- All pilot fields fit the caps of 2 sentences for `oneLine`, `trap`, prompts, and choices, 1 per `looksFor` item, and 4 per follow-up answer. These caps keep short answers and choices compact. The body has room for explanation.
- A single hard gate would fail on untouched content. Reporting first makes the baseline visible and lets each rewritten section turn on enforcement. Markdown units come from Astro's installed Markdown parser because it already understands nested lists, fences, and tables.

The pilot covers all seven problem kinds. Its growth figures are planning evidence, not a forecast for every page. Preserve intentional decoys such as over-detailed titles. Make the correct choice easy to read without making it stand out by length.
