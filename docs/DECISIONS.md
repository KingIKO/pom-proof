# Decisions

## Locator resolution

Status: implemented

Locator exercises resolve against the original fixture and layout variants. The grade compares sets of elements within each sandboxed iframe document.

Use the installed ivya 1.8.2 package for Playwright-style chains. `Ivya.create({ browser: 'chromium', testIdAttribute: 'data-testid' })` and `queryLocatorSelectorAll(selector, iframe.contentDocument)` resolved the correct named refund button in Chromium. The same test matched an associated label, test ID and placeholder; found the inner `SPAN` for exact text; supported `css=button >> internal:has-text="Refund"i >> nth=1`; and resolved an XPath in the same document. Use `queryLocatorSelectorAll` because grading needs all matches, including ambiguous answers. Native DOM CSS and XPath handle raw selectors.

Grading frames are transparent and noninteractive but have a layout. A frame with `display: none` returned no role matches for visible buttons in Chromium.

An expression is parsed as a literal chain, never run as JavaScript. Supported methods are `locator`, `getByRole`, `getByText`, `getByLabel`, `getByTestId`, `getByPlaceholder`, `filter({ hasText })`, and `nth`. The expression subset uses string literals for matchers. Regexes, variables, other locator methods and Playwright action behavior such as auto-waiting are outside this exercise.

Alternatives considered: a local DOM resolver would duplicate ivya's accessible-name and deepest-text matching. Evaluating arbitrary Playwright-style JavaScript would accept unrelated browser code to perform a read-only query.

## Mutation answer formats

Status: implemented

Test-design problems may provide `params`, which enables the table as the default entry mode. A grader accepts `{ source }` or `{ rows: [{ args, expected }] }`. Existing code samples keep their `reference: { source }`. `rowsReference: { rows }` holds the alternate table reference when a problem supplies both, and is passed unchanged as the grade answer's `value`. A table-only `reference: { rows }` is valid when there is no alternate reference.

The worker checks the real implementation before grading faulty versions. It loads fresh Blob modules for each run so module-local test state does not affect the next version. The worker timeout and shadowed network globals limit ordinary mistakes in self-authored exercises; they do not provide a security boundary for running third-party code.

Alternatives considered: a reference envelope containing both formats would change the established `reference` and grade-hook contract. Raw string table inputs would blur values like `false` and `"false"`; typed inputs and JSON expected values keep them distinct.
