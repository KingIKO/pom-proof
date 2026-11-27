# POM Proof phase 4 brief

Work on `phase-4` in `C:\Users\Owner\Desktop\_Projects\pom-proof`. Follow [the redesign plan](redesign-plan.md) and match `practice-A.html`, `questions-A.html`, `styles.css` and the palette A PNGs in `C:\Users\Owner\AppData\Local\Temp\opencode\pom-proof-mockups`.

## Parallel work

Edit only your part's files. The shell, shared CSS, and dependencies are step 0 files; report any needed changes to them. Do not commit or push from a part.

| Part | Owner | Files | Port | Done check |
|---|---|---|---|---|
| A practice list | iko-bedrock | `src/components/shell/PracticeList.tsx`, `src/styles/catalog.css`, `src/pages/index.astro` | 4441 | `?kind=sql&difficulty=easy` filters on load; checking a box rewrites the URL; screenshots at 1440 and 390 match the mockup |
| B question bank | iko-bedrock | `src/components/questions/**`, `src/pages/questions/**`, new `src/styles/questions.css` | 4442 | With JavaScript off a card and a follow-up expand; `?topic=api` shows 20 items; a review session still walks the permalink pages |
| C workspace | iko-bedrock | `src/pages/practice/[kind]/[id].astro`, `src/styles/{workspace,results}.css`, `src/components/shell/{ProblemStatement.astro,ResultPanel.tsx}`, `src/engines/*/{index.tsx,*.css}` (classes only), `src/components/editor/**` | 4443 | `tests/ui/keyboard-solve.spec.ts` and `tests/content/solvable.spec.ts` pass unchanged; one filled button per state |
| D other pages | iko-bedrock | `src/components/tracks/**`, `src/pages/tracks/**`, `src/components/shell/ProgressDashboard.tsx`, `src/components/progress/**`, `src/styles/progress.css`, `src/pages/progress/**`, `src/pages/404.astro`, `src/pages/editorials/**` | 4444 | `tests/e2e/{tracks,progress}.spec.ts` pass unchanged |
| E tests | iko-proof | `tests/ui/**`, new `tests/unit/tokens-contrast.test.ts`, `tests/e2e/{flows,questions,foundation,smoke,links}.spec.ts`, `tests/support/{review,questions}.ts`, `README.md` | 4405 | Each new positive check has a plant that fails it |

Build only into `.tmp/<part>-dist`, using lowercase `a` through `e`. Never write parallel builds to `dist/`.

```powershell
npx astro build --outDir .tmp/<part>-dist
npx astro preview --outDir .tmp/<part>-dist --port <port> --ignore-lock
```

For Playwright, point `BASE_URL` at your preview, including `/pom-proof/`, so the default server does not rebuild `dist/` or claim 4405. End your preview when finished.

## Tokens

| Role | CSS custom properties |
|---|---|
| Header and surfaces | `--ink`, `--onInkMuted`, `--accent`, `--canvas`, `--surface`, `--surfaceHover`, `--codeBg` |
| Borders and text | `--borderCard`, `--borderControl`, `--divider`, `--text`, `--text2`, `--text3` |
| Actions and markers | `--primary`, `--primaryHover`, `--link`, `--focus`, `--easy`, `--medium`, `--hard`, `--badgeBg`, `--badgeText`, `--disabled` |
| Result colors | `--pass`, `--fail`, `--warn`, `--passTint`, `--failTint`, `--warnTint` |
| Type | `--font-body`, `--font-code`, `--type-{13,14,16,20,24,32}`, `--weight-{regular,medium,bold}` |
| Geometry | `--space-{4,8,12,16,24,32,48}`, `--radius-control`, `--radius-panel`, `--radius-pill`, `--page-width`, `--read-width`, `--rail-width`, `--gutter`, `--header-height`, `--control-height` |
| Focus and elevation | `--focus-width` and `--focus-offset` (2px each), `--shadow-raised` (dialog and stuck filter bar only) |

Use `--link` for text links, `--focus` for the focus ring, and reserve the amber `--accent` for the ink header. The old `--paper`, `--muted`, `--line`, `--control-line`, `--on-accent`, `--regular`, `--strong`, `--radius` and `--rule` remain available for existing styles. The legacy answer disclosure, progress disclosure, CodeMirror and mutation mode controls keep their local cobalt `--accent` alias until their callers use the new tokens.

Figtree Variable is the UI face. Use `.num` or `.count` for tabular figures. Use `.code-font` or `--font-code` with `font-variant-ligatures: none` for code only. The shell preloads regular Latin Figtree; italic Figtree and JetBrains Mono load on demand. Vite's `?url` import already includes the base in the built font path.

## Shared classes

| Component | Markup and classes |
|---|---|
| Shell and title | `<Base wide>` for 75rem, default 58rem. Put `<TitleBand slot="title-band" title="…">` inside `Base`. Pass `meta` or a `meta` slot; use `actions` and `tabs` slots when needed. `breadcrumbs` takes `{ label, href? }` entries with base-free paths; the default is POM Proof / title. Pass `narrow` to align the band with 58rem content. `.container` uses 75rem unless given `--container-width`. |
| Buttons | `.button` with `.primary`, `.outline`, `.quiet` or `.danger`. At most one visible filled primary per page state. Use `.outline` for Run and `.primary` for Submit. |
| Inputs | `.input` on fields; give search a text label and no icon. Native checkbox and radio styling. `.select-field` with a decorative `.chevron` for a custom select arrow. |
| Chips and difficulty | `.chip[data-chip]` for neutral pills. `.status-chip` stays text, with `.solved`, `.due`, `.pass`, `.fail` or `.warn` when applicable. `.difficulty` with `.easy`, `.medium` or `.hard` stays text. |
| Cards and rows | `[data-card]` is the flat panel style and guard hook. Add `.row-card` for a 96px minimum row and `.stretched-link` to its only link. Do not put controls under a stretched link. |
| Filter sidebar and bar | `.filter-sidebar`, `.filter-disclosure` on native `details` (open on desktop), `.filter-body`, `.filter-group` on `fieldset`, `.check-row`, `.count`, `.section-label`. `.filter-bar` is sticky from 48rem; add `data-stuck` only while stuck. |
| Topic rail | `.topic-rail` and `.topic-links`; use `aria-current` for the current link, `.count` for totals, and `data-chip` on links that become pills below 60rem. |
| Tabs and disclosure | `.tabs` on a group of direct links or buttons; use the appropriate state (`aria-current`, `aria-selected` or `aria-pressed`). Use `.chevron` (`.right` for side-facing) and `.plus-minus[data-chip]` as decorative spans with `aria-hidden="true"`. |
| Result | Keep `section.result[role="status"][data-status]`; `pass`, `fail` and `warn` select the 4px stripe and tint. Add `data-card` when migrating panel markup. |
| Progress | `.progress-meter` around a labeled `<progress class="progress-bar">` and adjacent visible value. |
| Empty state and callouts | `.empty-state[data-card]` with one `.button.outline` Clear filters button. `.callout[data-card]`, with `.trap` for amber and the default green for examples or notes. |

## Selector and visual contracts

- Preserve `nav` named `Main` with exactly four links: Practice, Questions, Tracks, Progress. Skip to content stays the first link and targets `#main`.
- Keep table `Practice problems`, search region `Practice filters`, the live count and `replaceState`. Preserve URL keys `q`, `kind`, `difficulty`, `role`, `status`; add `topic`; comma-join multiple values without breaking old single-value links.
- Keep region `Workspace`, buttons Submit, Try again and Run, and `section.result[role=status][data-status]`. Preserve the Show editorial and Editorial gates and the Reading pane group.
- Keep the `Questions` ordered list, per-question permalink and Show answer gate, Space/1/2/3 shortcuts and review-session flow. Deep links open their matching list card.
- Keep table `Readiness by round` and region `Review queue`.
- Use `url()` for site links and asset paths. Leave Vite-generated asset URLs intact. Keep grading and `src/lib/**` logic unchanged. Practice list, questions, tracks, progress and 404 load no CodeMirror, sql.js or Pyodide.
- Light only. At 1440×900 the first problem row and first question card are in view on their respective pages. Workspace panes stack below 64rem; sidebars fold or become a rail below 60rem. Header and filter bar are sticky only from 48rem.
- Radii by role: 0, 6px control, 10px card, or pill. Mark cards with `data-card` and pills with `data-chip`, except the native progress track. No shadows outside dialog and `[data-stuck]` filter bar; keep 2px visible focus with at least 3:1 contrast against its background.
- No gradients, `backdrop-filter`, blur, `text-shadow`, SVG, images or background images. Chevrons and plus/minus use CSS.
- Use sentence case. No em dashes, emoji or exclamation marks in UI or content.
