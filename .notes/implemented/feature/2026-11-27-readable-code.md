# Decision note: Readable code boxes

Status: implemented locally. Code samples, numbered lines and editors stay in their panes without horizontal scrolling.

## Problem

At 1280px and 1440px, the first sample in the receipt diagnosis needs 619px but has 435px of visible space. The content includes statement lines up to 82 columns, numbered lines up to 91, and an editorial XPath expression of 175 columns.

## Decision

Give the active reading pane more width when it contains a code block. Give the workspace more width when it contains numbered lines. Keep the default layout otherwise, and keep the stacked layout below 64rem. Read-only code wraps with a hanging indent when the available width is too small. CodeMirror uses its line-wrapping extension.

Shiki applies Light+ at build time to Markdown and numbered lines; CodeMirror uses the matching token colors for editable code. Numbers and types use darker shades for AA contrast on the canvas and selection tint. Plain text logs stay plain. The build includes a small XPath grammar for the editorial expressions because the bundled Shiki languages do not include XPath.

## Alternatives considered

A fixed wider reading pane would reduce space for editors and review code even when the reading pane contains only prose. Stacking at desktop widths would put the exercise below the workspace context. Shrinking text would not make the longest editorial expression fit at a readable size.

## Consequences

Switching to an editorial with code can resize the workspace without losing an answer. Wrapped visual lines preserve the source text and line numbers used for grading.

Run `npx playwright test tests/ui/code-display.spec.ts` for the focused regression checks. The full suite runs them through `npm run verify`.
