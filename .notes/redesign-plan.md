# POM Proof redesign plan (phase 4)

Written by the plan agent on 2026-11-27 from two research passes (qaladder question bank teardown, HackerRank visual language). Research evidence: `C:\Users\Owner\AppData\Local\Temp\opencode\scout-qaladder\` and `scout-hackerrank\`. Approved mockups: `C:\Users\Owner\AppData\Local\Temp\opencode\pom-proof-mockups\` (`practice-A.html`, `questions-A.html`, `styles.css`, and the PNGs). The mockups are the visual reference: match them.

## Owner decisions (2026-11-27)

- Palette A, cobalt and amber.
- Question bank: expanding a card shows the answer (qaladder style); flashcard recall stays on each question's own page.
- Light theme only for now; dark theme is a later pass.
- Practice list rows: comfortable, about 96px.
- Changes land through a pull request to `main` reviewed by the automatic Codex (Astra) review on GitHub, then merge and a live check.

## 1. Design direction

### Layout
- Header: ink background, 56px, brand left and four nav links (Practice, Questions, Tracks, Progress). Active link is white with a 3px accent underline; others use `onInkMuted`.
- Title band: white surface with a bottom divider holding breadcrumb, `h1`, one meta line and optional tabs, in a new `src/components/shell/TitleBand.astro` used by every page.
- Canvas: tinted page background. List pages use a 75rem container with a main column plus a 17.5rem right sidebar and a 2rem gap. Reading pages keep 58rem.
- Breakpoints: below 60rem the sidebar folds into a "Filters" `<details>` above the list. Workspace panes stack below 64rem. Header and filter bar are sticky only at 48rem and wider.

### Type
- UI: `@fontsource-variable/figtree@5.3.0`, family `'Figtree Variable'`, latin woff2 (about 20 KB), weights 400/500/700, real italics, `tnum`.
- Code: `@fontsource-variable/jetbrains-mono@5.3.0`, `font-variant-ligatures: none`.
- Preload only the sans. Use mono only for code, never for chips, so list pages do not fetch it.
- Scale: 13, 14, 16, 20, 24, 32px. Weights 400, 500, 700. Counts use `tabular-nums`.

### Palette A tokens
ink #101A33, onInkMuted #AEB8D4, accent #FFB547, canvas #F5F7FC, surface #FFFFFF, surfaceHover #E9EDF8, borderCard #E3E7F2, borderControl #7F88A6, divider #E1E5EF, text #101A33, text2 #55607A, text3 #5E6884, primary #1E4FD8, primaryHover #173FB0, link #1E4FD8, focus #1E4FD8 (accent on the ink header), easy #0F766E, medium #A04808, hard #BE123C, badgeBg #EAF0FF, badgeText #173FB0, disabled #C2C8DA. Pass, fail and warn result colours keep AA on white.

### Radius, spacing, elevation
| Role | Radius |
|---|---|
| Native checkbox and radio | browser default |
| Buttons, inputs, selects | 6px |
| Cards, panels, callouts, dialog | 10px |
| Chips, progress track | pill |

- Spacing: 4, 8, 12, 16, 24, 32, 48px.
- Flat surfaces with a 1px `borderCard`; hover is a `surfaceHover` tint.
- One shadow token, only on `dialog` and on the filter bar while stuck.
- Focus: 2px solid `focus`, 2px offset; on the ink header the ring uses `accent`.

### Components (new `src/styles/components.css`)
| Component | Rule |
|---|---|
| Buttons | Filled primary, outline, quiet text, danger outline (Reset). 36px, weight 500. At most one filled primary per view. |
| Inputs | 36px, `borderControl`. Search has a text label and no icon. |
| Chips | Pill, 13px, neutral (`badgeBg`/`badgeText`) for kind, topic, role, level. Status chips are text only. |
| Difficulty | Coloured text (easy, medium, hard), weight 500, no pill. |
| Rows and cards | White, 10px radius, 1px border, one link per row stretched over the card. |
| Filter sidebar | Small-caps 13px group label, native checkboxes with `accent-color`, a count per option, dividers between groups. |
| Topic rail | Vertical link list with counts; current item has a 3px primary left bar. |
| Tabs | Underline tabs in the title band, 3px primary underline. |
| Result panel | 4px left border and tint by `data-status`; markup unchanged. |
| Progress bar | 8px pill track in `divider`, primary fill, value as text beside it. |
| Empty state | Centred text in a dashed-border card with one outline "Clear filters" button. |
| Callouts | 4px left border and tint: trap (medium hue), example or note (easy hue). |

Icons: none. SVG and image ban stays. Chevrons and plus/minus are CSS-drawn.
Exception (owner, 2026-11-28): inline SVG is allowed only inside Study diagrams, as `figure[data-diagram] > svg[role="img"][aria-labelledby]`, for what HTML and CSS cannot draw (`.notes/study/diagram-spec.md`, Inline SVG); the slop guard bans every other `svg` and gains this allowance only with the first SVG figure.

## 2. Screens

### Practice list (`/`, `src/components/shell/PracticeList.tsx`)
- Title band: "Practice", "144 problems", the Continue link, and a solved progress bar as in the mockup.
- Keep `<table aria-label="Practice problems">` and its roles, styled as row cards with a visually hidden `thead`.
- Row: title 20px, meta line (difficulty colour, kind, topic, minutes), right slot with a status chip or a decorative outline "Solve" label under the stretched link.
- Sidebar: search, then checkbox groups Status, Difficulty, Kind, Role, Topic (first 8 shown, the rest in a `<details>`), with counts.
- URL keys stay `q, kind, difficulty, role, status`, plus `topic`. Multiple values are comma-joined so old single-value links (`kind=sql`) still work.
- Keep `role="search"` "Practice filters", the live count and `replaceState`.

### Workspace (`src/pages/practice/[kind]/[id].astro`)
- Title band: breadcrumb "Practice / kind", title, meta line and status.
- Two panes at 64rem and wider. Left reading pane has Problem and Editorial as underline tabs (still buttons in the "Reading pane" group). Right pane is the "Workspace" region.
- Action bar: outline Run, filled Submit. Result panel below; previous and next links at the foot.
- Per engine, restyle only:
  - Structured: each item a card with the prompt as legend; options 44px rows with hover tint; order rows with small outline Move buttons; numbered code lines mono on `codeBg`.
  - Code: editor card with a toolbar row (Language, Reset); checks as rows with Pass or Fail text.
  - SQL: same editor card; result grid a bordered table with a sticky header.
  - Locator: mono expression input in a card; fixture iframe framed with a caption; variants in a two-column grid.
  - Test design: "Test rows" table in a card with an outline Add row; mutant results as text chips.

### Question bank (`/questions/`)
- Title band: "Interview questions", count, role tabs (All 121, Manual QA, Automation, SDET, Senior).
- Left topic rail with counts at 60rem and wider; horizontal chip row on mobile.
- Sticky filter bar: search ("Search 121 questions", over title, oneLine, looksFor, trap, followUps and body), level, type, visible count, "Review due questions". State in the URL.
- One `<ol aria-label="Questions">`; each item a `<details>` card. Summary: number badge, title as `h2`, topic and level chips, New / Due / Box n status, CSS plus/minus.
- Expanded: `oneLine` lead, body, "What they look for" (`looksFor`), "They'll ask next" (`followUps` as nested `<details>`, working without JavaScript), "The trap" callout, sources, then "Rate your answer" (Missed, Shaky, Solid), "Open page", "Copy link". Deep links (`#id`) open the card.
- Per-question pages `/questions/<topic>/<id>/` stay as the permalink and review-session target with the "Show answer" gate and Space/1/2/3 keys.

### Other pages
- Tracks: four cards in a 2 by 2 grid (title link, summary, counts, progress bar). Track page: section cards with item rows and status chips.
- Progress: number tiles (solved of 144, due, attempts); "Readiness by round" table gains progress bars; "Review queue" becomes a callout; recent attempts stays a table; Export and Import outline, Reset danger outline.
- 404: title band plus the four section links.
- No separate home: `/` stays the practice list.

### Must not regress
- Grading: no edits to `grade.ts` or `src/lib/**` logic.
- Selector contract: region "Workspace"; buttons Submit, Try again, Run; `section.result[role=status][data-status]`; "Show editorial" and "Editorial" gating; nav "Main" with four links; skip link first; table "Readiness by round" and region "Review queue".
- `url()` for every href and asset.
- Page weight: list, questions, tracks, progress and 404 load no CodeMirror, sql.js or Pyodide.

## 4. Revised slop guard
- Bans stay: gradients, backdrop-filter, blur, text-shadow, emoji, em dashes, any `svg`, `img` or background image. At 1440x900 the first problem row on `/` and the first question card on `/questions/` are in the viewport.
- Positive checks: radius by role (0, 6px, 10px or pill; buttons and inputs 6px, `[data-card]` 10px, pill only on `[data-chip]` and progress tracks); shadows only the ring or the one token on `dialog` and `[data-stuck]`; at most one visible filled primary per page state; focus ring 2px with 3:1 against its background; `tests/unit/tokens-contrast.test.ts` for palette A pairs plus pass, fail and warn on white; font loaded (`document.fonts.check('500 16px "Figtree Variable"')`, body family starts with it, font requests same-origin under `/pom-proof/`).
- Light only: the light and dark loops become light only.

## 5. Build plan

Step 0 (serial, iko-bedrock): `package.json` and lockfile (two font packages at 5.3.0), `src/styles/tokens.css`, new `src/styles/components.css`, `src/layouts/Base.astro`, new `src/components/shell/TitleBand.astro`, `.notes/phase-4-brief.md` (tokens, selector contract, file ownership). Done when `astro build` passes, the built HTML preloads a woff2 under `/pom-proof/_astro/`, and `npx playwright test tests/e2e` passes unchanged.

Parallel parts after step 0 (no shared files):
| Part | Owner | Files | Done check |
|---|---|---|---|
| A practice list | iko-bedrock | `src/components/shell/PracticeList.tsx`, `src/styles/catalog.css`, `src/pages/index.astro` | `?kind=sql&difficulty=easy` filters on load; checking a box rewrites the URL; screenshots at 1440 and 390 match the mockup |
| B question bank | iko-bedrock | `src/components/questions/**`, `src/pages/questions/**`, new `src/styles/questions.css` | With JavaScript off a card and a follow-up expand; `?topic=api` shows 20 items; a review session still walks the permalink pages |
| C workspace | iko-bedrock | `src/pages/practice/[kind]/[id].astro`, `src/styles/{workspace,results}.css`, `src/components/shell/{ProblemStatement.astro,ResultPanel.tsx}`, `src/engines/*/{index.tsx,*.css}` (classes only), `src/components/editor/**` | `tests/ui/keyboard-solve.spec.ts` and `tests/content/solvable.spec.ts` pass unchanged; one filled button per state |
| D other pages | iko-bedrock | `src/components/tracks/**`, `src/pages/tracks/**`, `src/components/shell/ProgressDashboard.tsx`, `src/components/progress/**`, `src/styles/progress.css`, `src/pages/progress/**`, `src/pages/404.astro`, `src/pages/editorials/**` | `tests/e2e/{tracks,progress}.spec.ts` pass unchanged |
| E tests | iko-proof | `tests/ui/**`, new `tests/unit/tokens-contrast.test.ts`, `tests/e2e/{flows,questions,foundation,smoke,links}.spec.ts`, `tests/support/{review,questions}.ts`, `README.md` | Each new positive check has a plant that fails it |

Reconcile and land: `npm run verify` on the merged tree (failures back to the owning part); before and after transfer sizes for `/` and `/questions/`; PR to main as KingIKO; Codex (Astra) review; fix findings; merge; live smoke (font loads from `/pom-proof/`, a filter URL works, one problem per engine grades, a question card expands, a review session runs).

## 6. Risks and defaults
| Item | Default |
|---|---|
| 121 answers inline in one page | Ship and report the measured size; if too heavy, the body moves behind "Open page" |
| Multi-select filter URLs | Comma-joined; old single-value links must still filter |
| `?url` font import and the base path | Checked in step 0 on the built HTML |
| Run and Submit both filled today | Submit filled, Run outline |
| CodeMirror colours on the new `codeBg` | Token-driven; axe on code and SQL workspaces |
| Sticky bars at 390px | Sticky only at 48rem and wider |
