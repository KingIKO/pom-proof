# Plan: concept diagrams in Study pages (plan agent, 2026-11-28)

Owner's request: "the study section is off to a great start but needs improvements. Visualizations need to be mixed into the text-heavy portions. For example, a visual diagram of the test pyramid paired with its text."

Owner decisions: visual style B2 "Tinted, calmer" (`docs/design/study-diagrams/spec.md`, `diagrams.css` B2 block, `option-b2.html`, PNGs). Inline SVG allowed only inside Study diagrams as `figure[data-diagram] > svg[role="img"][aria-labelledby]`; banned elsewhere. Figures do not add to `minutes`. Page object ships as HTML `blocks` unless the iko-palette mockup shows it needs converging lines.

Research: `docs/design/study-diagrams/research-pages.json` (19 visuals on 16 of 19 pages; exploratory-testing, what-to-automate, flaky-tests get none). Diagrams help only when they carry structure the prose implies; place right after the paragraph that names their parts; labels inside; cut sentences a figure replaces. `figure` + `figcaption`; matrix = real `table` with `caption`/`th`; `role="img"` only on SVG; colour never the only carrier; 3:1 graphics, 4.5:1 text; reflow at 320 px.

## 1. Placement mechanism

Fenced marker in Markdown, split the rendered HTML in the page. No MDX, no plugin, no new dependency.

````
```diagram
test-shapes
```
````

- Astro's glob loader stores each `.md` entry's HTML in `entry.rendered.html`; `render()` outputs that string (`node_modules/astro/dist/content/runtime.js:400`).
- Sätteri 0.11.7 turns the fence into `<pre><code class="language-diagram">test-shapes\n</code></pre>`.
- `astro.config.mjs`: `syntaxHighlight` to `{ type: 'shiki', excludeLangs: ['diagram'] }` (`satteri-processor.js:156`).
- New `studyBodyParts(entry)` in `src/components/study/study.ts` splits the HTML on that block. `[page].astro` replaces `<Content />` with the parts inside the same `.study-body.prose` div: HTML through `set:html`, figures through `<Diagram />`.
- Throws at build on an unknown id, a diagram never or twice referenced, or a leftover `language-diagram`.

MDX rejected (needs `.mdx`, changes loader, test support and plain-language parser, JSX parsing of `{` `<`). Sätteri hast plugin cannot render an Astro component. `:::` directives change parsing site-wide.

Proof first:
1. Build `main`, keep `dist/study`.
2. Switch to `studyBodyParts` with no markers, rebuild: all 19 pages byte-identical.
3. Add the marker and data to `test-shapes.md` only: figure between the first paragraph and "How it works", other 18 pages unchanged.
4. `astro dev` shows the same.
If step 2 fails, stop and report; MDX is the fallback.

Existing tests: headings/word counts unaffected (`withoutFences` strips the marker); plain-language body scan unaffected (code node); add `diagrams` to `allowed` (`study.test.ts:22`); `examples.test.ts` and e2e h2 order unaffected.

## 2. Data model

Built on 2026-11-28 for all five kinds. A page lists its figures in the frontmatter field `diagrams` and places each one with a ```diagram fence that holds its id (section 1). The schemas are in `src/lib/`: `diagram-schema.ts` (the layer stack and the list of kinds), `diagram-number-line.ts`, `diagram-matrix.ts`, `diagram-timeline.ts` and `diagram-blocks.ts`, with the fields every kind shares in `diagram-base.ts`. Each example below is a whole `diagrams` field from a built page or a test fixture, so it passes the schema as written. Where an example comes from a test fixture, this section names the sources it follows, and a writer still cites them on the page that uses it.

Fields of every kind:

- `id`: lowercase words joined by hyphens, once per page. The fence names it.
- `type`: `layer-stack`, `number-line`, `matrix`, `timeline` or `blocks`.
- `title`: at most 7 words, no full stop, no "Figure 1", "Diagram of" or "This shows". It also names the figure's table or unnamed list, without the note.
- `note`: optional, at most 2 sentences.
- `description`: one text or a list of texts that a screen reader hears before the drawing. It says only what the drawing's own words leave to the eye, such as position, width, length or what lines up, and does not repeat the title, the note or a label. Every kind needs it except `matrix`, whose table is its own text.
- A page has 1 or 2 figures. A figure adds no words to the body and nothing to `minutes`.

What gets checked:

- Data that would draw a wrong picture stops the build (`npm run build` fails and names the field and the fix). An unknown field does too, so a typo cannot be skipped.
- The words are checked by `npm run verify` (`tests/support/diagram-rules.ts`, one rule per kind, and `tests/content/study.test.ts`). A label is 1 to 3 words, and a closing letter or number, as in "Test A", does not count. Every text follows the plain-language rules, and none uses backticks.
- A list of rows is called `entries`, never `rows`, because the plain-language scan skips a key called `rows`.

### Layer stack

From the test shapes page.

```yaml
diagrams:
  - id: test-shapes
    type: layer-stack
    title: Where each shape puts the effort
    note: Wider bars mean more testing effort. The widths are not measured.
    description:
      - Each list runs from the top of the drawing to the bottom.
      - In the pyramid, Service is narrower than Unit, and UI is narrowest.
      - In the trophy, Unit and Static are narrower than Integration, and End-to-end is narrowest.
      - In the honeycomb, Implementation detail is narrower than Integration, and Integrated is narrowest.
    shapes:
      - name: Pyramid
        layers:
          - { label: UI, width: 1 }
          - { label: Service, width: 3 }
          - { label: Unit, width: 5, widest: true }
      - name: Trophy
        layers:
          - { label: End-to-end, width: 2 }
          - { label: Integration, width: 5, widest: true }
          - { label: Unit, width: 3 }
          - { label: Static, width: 3 }
      - name: Honeycomb
        layers:
          - { label: Integrated, width: 1 }
          - { label: Integration, width: 5, widest: true }
          - { label: Implementation detail, width: 3 }
```

- 1 to 3 `shapes`, each with a `name` and at least 2 `layers`, listed top to bottom.
- `width` is a whole number from 1 to 5 for relative effort. Which layer is wider than which comes from the page's sources. The steps between them are illustrative, and the note says the widths are not measured.
- Exactly one layer per shape has `widest: true`, and it is the only one at the largest width. A screen reader hears ", widest" after it, so the description does not say it again.

### Number line

From the equivalence and boundaries page.

```yaml
diagrams:
  - id: boundary-values
    type: number-line
    title: Partitions and the values BVA checks
    note: Each band shows the expected result. Both Reject partitions continue past the values shown.
    description: The expected result is Reject for 9 or less, Accept for 10 through 20 and Reject for 21 or more.
    bands:
      - { from: 5, to: 9, label: Reject, kind: reject }
      - { from: 10, to: 20, label: Accept, kind: accept }
      - { from: 21, to: 25, label: Reject, kind: reject }
    threeValue: true
    segments:
      - { title: Lower edge, from: 7, to: 12 }
      - { title: Upper edge, from: 18, to: 23 }
```

- Whole numbers only. At least 2 `bands`, in order, with no gap and no overlap. The first band's `from` and the last band's `to` are where the drawing starts and ends, at most 21 values.
- A line is drawn wherever the band changes, so two bands next to each other never share a label, and a label is always the same `kind` (`accept` or `reject`).
- The boxes follow from the bands. 2-value BVA boxes both values beside every line, and `threeValue: true` also boxes their other neighbours. Only a line between two bands gets boxes, so a closed outer end, such as 0 where nothing lies below it, gets no box for being an end, although BVA checks it. A 3-value neighbour outside the drawn values is not shown. Where a partition goes on past the drawing, draw at least two of its values beside the line, and say in the note that it continues.
- `segments` are what a narrow screen draws: one around each line, in order, at most 6 values each, and together they hold every boxed value.
- A band label is one word, and it and every boxed value appear in the page body. A band reads out only its label, so the description gives each partition's range in the words of the page.
- A segment title is at most 3 words.

### Matrix

Two uses, told apart by `kind`, from the test fixture. The test double answers follow Meszaros's own table (xunitpatterns.com, "Mocks, Fakes, Stubs and Dummies") and Fowler ("TestDouble"), and the note says where they differ on a cell. They also differ on whether a dummy is a test double, so the page says that. ISTQB publishes no mapping of likelihood and impact to a risk level, so the levels and the two placed risks are examples, and the note says so.

```yaml
diagrams:
  - id: risk
    type: matrix
    kind: levels
    title: Likelihood and impact set the risk level
    note: An example mapping and example ratings. Each team sets its own.
    columnAxis: Impact
    rowAxis: Likelihood
    columns: [Low, Medium, High]
    entries:
      - { head: High, cells: [Medium, High, High] }
      - { head: Medium, cells: [Low, Medium, High] }
      - { head: Low, cells: [Low, Low, Medium] }
    placed:
      - { label: Receipt layout, row: Medium, column: Low }
      - { label: Double charge, row: Medium, column: High }
  - id: doubles
    type: matrix
    kind: answers
    title: What each test double does
    note: Can means it may do this, which Meszaros calls optional. For Fowler a spy is a kind of stub, so a spy's answer under Returns prepared answers would be Yes.
    columns: [Returns prepared answers, Stores calls for the test, Checks expected calls, Has a simpler working version]
    entries:
      - { head: Dummy, cells: [No, No, No, No] }
      - { head: Stub, cells: [Yes, No, No, No] }
      - { head: Spy, cells: [Can, Yes, No, No] }
      - { head: Mock, cells: [Can, No, Yes, No] }
      - { head: Fake, cells: [No, No, No, Yes] }
```

- At least 2 `columns` and 2 `entries`. Each entry has one cell per column, and no column or row head repeats.
- `levels`: every cell is Low, Medium or High. `columnAxis` and `rowAxis` are required. `placed` is optional, and each item names a row and a column the matrix has, once.
- `answers`: cells are Yes, No and at most one other single word, which the note defines (Can above). That word is drawn on the tint of Yes, so use it only for a limited yes. Yes and No start with a capital, and the build says so when they do not. No axis names and no placed items. A question may be 5 words.
- `description` is optional, because the table is the text.

### Timeline

From the waiting and synchronisation page.

```yaml
diagrams:
  - id: pause-and-condition
    type: timeline
    title: A fixed pause and a condition wait
    note: The condition wait ends when its condition is met, here before its timeout. Lengths are not measured.
    description: Both runs share one time scale, and the fixed pause is the same length in both. The app is ready later in the slow run.
    steps: 10
    lanes:
      - name: Fast run
        mark: { label: App ready, at: 3 }
        entries:
          - { name: Fixed pause, spans: [{ from: 0, to: 5 }], outcome: Wastes time }
          - { name: Condition wait, spans: [{ from: 0, to: 3 }], strong: true }
      - name: Slow run
        mark: { label: App ready, at: 8 }
        entries:
          - { name: Fixed pause, spans: [{ from: 0, to: 5 }], outcome: Too short }
          - { name: Condition wait, spans: [{ from: 0, to: 8 }], strong: true }
```

A labelled scale with workers running at the same time, from the test fixture. It follows the Playwright fixture, parallelism and retry docs and the pytest and pytest-xdist fixture docs. The worker bars hold only while no test fails, because Playwright ends a worker when one of its tests fails and sets its worker fixtures up again in a new one, so the note says none fails.

```yaml
diagrams:
  - id: scope
    type: timeline
    title: Scope sets how long a fixture lives
    note: Each bar is one copy, from setup to teardown. Four tests run on two workers and none fails.
    description: The two workers run at the same time.
    ticks: { name: Test, labels: ['1', '2', '3', '4'] }
    groups:
      - { label: Worker 1, from: 0, to: 2 }
      - { label: Worker 2, from: 2, to: 4 }
    parallel: true
    lanes:
      - entries:
          - { name: Test, detail: or function in pytest, spans: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }] }
          - { name: Worker, detail: Playwright, spans: [{ from: 0, to: 2 }, { from: 2, to: 4 }] }
          - { name: Session, detail: pytest with xdist, spans: [{ from: 0, to: 2 }, { from: 2, to: 4 }] }
```

- The scale is `steps` (equal columns of time, drawn without labels) or `ticks` (labelled columns, with the `name` that heads the row names), never both. A position counts column edges: 0 is the start and the number of columns is the end, so a span from 0 to 2 covers the first two columns.
- `groups` is optional: at least 2, in order, covering the whole scale. `parallel: true` says they run at the same time and draws a gap between them.
- Every lane has at least one row in `entries`, and a `name` when there is more than one lane. A lane with no ticks, groups or `mark` cannot say where a bar starts, so it fails.
- A row has a `name`, an optional second line `detail`, at least one span, an optional `outcome` of 1 to 3 words after its last bar, and `strong: true` on at most one row per lane. Spans run in order without overlap, each ends after it starts, and none passes the end of the scale. An outcome needs room after the last bar.
- A row with an `outcome` ends its last bar by half way, so the words have room beside the bar on a phone.
- `mark` is one moment per lane, at a position on the scale. Its label sits on the side of the line with more room. Each bar says where it starts and ends against it, as in "from the start, ends before App ready".
- On a time scale no text gives a duration (500 ms, 2 s, 30-second). Lengths are relative, and positions such as App ready at 3 and 8 are illustrative.

### Blocks

From the page object page, a before and after pair.

```yaml
diagrams:
  - id: locator-change
    type: blocks
    title: Edits after a button label change
    note: In this example of three tests, the locator no longer matches the new button label. Every copy of it needs an edit.
    description: With a page object, the three tests use one sign-in page object class, and none of them changes.
    panels:
      - name: Each test holds the locator
        tiers:
          - - { title: Test 1, parts: [{ name: Button locator, strong: true }] }
            - { title: Test 2, parts: [{ name: Button locator, strong: true }] }
            - { title: Test 3, parts: [{ name: Button locator, strong: true }] }
        result: 3 edits
      - name: Tests call one page object
        tiers:
          - - { title: Test 1, linkTo: { label: calls, target: sign-in } }
            - { title: Test 2, linkTo: { label: calls, target: sign-in } }
            - { title: Test 3, linkTo: { label: calls, target: sign-in } }
          - - { id: sign-in, title: Sign-in page object, parts: [{ name: Button locator, strong: true }] }
        result: 1 edit
```

One drawing, from the test fixture. Its data is made up.

```yaml
diagrams:
  - id: database
    type: blocks
    title: Separate contexts, one shared database
    note: Each test gets its own browser context. Both tests reach the same database.
    description: The two tests stand side by side, above the one database they share.
    tiers:
      - - { title: Test A, parts: [{ name: Browser context, items: [Cookies, Storage] }], linkTo: { label: saves to, target: database } }
        - { title: Test B, parts: [{ name: Browser context, items: [Cookies, Storage] }], linkTo: { label: saves to, target: database } }
      - - { id: database, title: Server database, strong: true, parts: [{ name: Order for Test A }, { name: Order for Test B }] }
```

- `tiers` (one drawing) or `panels` (exactly 2, before then after, each with a `name`, its `tiers` and a `result` such as "3 edits"), never both.
- A tier is one row of 1 to 3 boxes, top to bottom. A box has a `title`, optional `parts` (each a `name`, optional `items` and optional `strong`), optional `strong`, and an `id` only when another box links to it.
- `linkTo` draws an arrow and is read out as "Test 1, calls Sign-in page object". It points to the next box in the same row (→, which becomes ↓ when the row stacks) or to the only box of the row below (↓). Arrows down come from every box of a row or from its last box only, because on a phone with large text the row stacks and the arrows stand under its last box. Ids are unique within a drawing.
- One kind of thing per figure is strong: boxes or parts, not both.
- Parts sit inside boxes. A box inside a box has no approved drawing and fails the build.

## 3. Components

`src/components/study/diagrams/`: `Diagram.astro` shell switching on `type`, one component per type (`Blocks.astro` draws its rows with `BlockTiers.astro`, `NumberLine.astro` with `NumberLineRow.astro`). Shell and layer stack styles in `src/styles/diagrams.css`, each other kind in its own `src/styles/diagram-<kind>.css`; `--dg-*` tokens in `src/styles/tokens.css` under `figure[data-diagram]`.

Shell: `<figure data-diagram={type} data-card>`, `<figcaption id>` first (title and note spans), then the description as one `.visually-hidden` paragraph per text, then the drawing. `container-type: inline-size`, 34rem switch as a container query. `overflow-wrap: normal` inside the figure.

| Type | HTML | Accessibility |
|---|---|---|
| layer-stack | One block per shape: name, then `ol` of bars top to bottom, width from `width` | Each `ol` `aria-labelledby` its name; widest bar bold with hidden text |
| matrix | Real `table`, `th scope=col/row`, axis names, level word in every cell | `aria-labelledby` the title, without the note; never `role="img"`; scrolls in its own box if needed, and a question of the turned table stays in view while its answers scroll |
| number-line | Two-entry legend `ul`, band row, `ol` of values, boundary lines as borders | Hidden labels such as "9, 2-value BVA"; a band reads only its label, and the description gives the ranges; narrow layout is a second rendering toggled with `display:none` |
| timeline | One block per lane: its name, then an `ol` with one `li` per row (name and second line, bars, outcome). Every row repeats the same columns, a name column and equal steps, so all bars share one scale. Tick and group heads above the lanes, the moment's label and 2px line per lane, "Time →" under a scale without ticks | Each bar says its start and end in hidden text ("from the start, ends at App ready", "Worker 1, from Test 1 to Test 2"). The `ol` is labelled by its lane name, or by the figure's title when the lane has none. Heads, the moment's line and "Time →" are `aria-hidden`; the moment's label is read |
| blocks | One `ul` per row of boxes, each box an `li` with its title and a `ul` of its parts; 1px edge on a box, none on a part. A → has its own column between two boxes, and the ↓ arrows have their own row under the boxes. A pair is two panels (name, drawing, result line) side by side, 32px apart | Reading order follows containment. Arrows are `aria-hidden`, and the box says the link after its title ("Test 1, calls Sign-in page object"). Each panel is a `group` labelled by its name |

Where the timeline and blocks change with the figure's width (its content box, in the reader's text size):

- Below 40.75rem: panels of boxes side by side take the narrow paddings (box 8px, part 4px), because a word such as locator no longer keeps its part's 12px padding (iko-palette measured 11 widths; at 1024px it came within 0.8px of the edge). The drawing check holds every word inside its part's own padding, except with the text-spacing overrides.
- Below 34rem: the timeline's name column narrows to 5.25rem, and names and outcomes wrap. Blocks keep their boxes side by side with the narrow gaps and paddings, and two panels stack, before first.
- Below 14.5rem, which needs enlarged text on a phone: a timeline row's name and outcome take their own lines and its bars keep the whole width. A row's lines stand 4px apart and two rows 12px. Each group head starts where its group does, on one line, and each takes a line of its own only below 8.5rem. Boxes and parts stack, a ↓ is drawn in place of each →, and the ↓ arrows stand together under the last box.

SVG exception (only if needed): one Astro component per drawing in `diagrams/svg/`, labels from frontmatter, colours only through classes in `diagrams.css` (no `fill`/`stroke`/`style` attributes), `vector-effect: non-scaling-stroke`, `aria-labelledby` the figcaption and description ids; unit test scans `diagrams/svg/*.astro` for hex colours, colour attributes and banned elements.

## 4. Guard and test changes

slop-guard:
- Skip an `svg` only when it matches `figure[data-diagram] > svg[role="img"][aria-labelledby]`, every id resolves to non-empty text in that figure, and it is the figure's only `svg`. Scan inside for gradients, `pattern`, `filter`, `mask`, `clipPath`, `image`, `foreignObject`, `use`, animation, `circle`, `ellipse`, `rx`/`ry`, `text` below 13px. Plants both ways. Lands with the first SVG.
- New `clip-path` rule: report any computed `clip-path` other than `none`, allowing `inset(50%)` on a box ≤1px (visually hidden pattern: `tokens.css:215`, `workspace.css:67`, `Base.astro:138`). Plants: `main { clip-path: inset(0) }` fails; a `.visually-hidden` span allowed.
- Study sample becomes `study/testing-foundations/test-shapes/`; page object keeps its a11y entry.

tokens-contrast: read the `figure[data-diagram]` block. Text pairs 4.5:1: `text` on `dg-part`, `dg-part-strong`, `dg-low`, `dg-medium`, `dg-high`; `text2` on `dg-part` and `dg-part-strong` (part items) and the three level fills; `dg-accept-text` on `dg-accept-bg`, `dg-reject-text` on `dg-reject-bg`; white on `dg-mark`. Graphic 3:1: `dg-part-edge`, `dg-edge`, `dg-mark` on `surface`. Plants: `dg-part-edge` mixed at 40%; `dg-medium` set to full `accent`.

study.test.ts `pageProblems`: unique slug ids, ≤2 per page; each id named by exactly one marker, each marker holds one listed id; marker inside one of the four sections, never directly after a heading; title ≤7 words, no full stop, no leading "Figure 1" label, no "Diagram of" or "This shows"; note ≤2 sentences; `description` unless matrix; no backticks in any diagram text. Plants for each; marker adds 0 to `bodyWords`; semicolon in a diagram `description` reported.

study.spec.ts: one `figure[data-diagram]` per entry, each a direct child of `.study-body` that follows body content other than a heading (the same rule as study.test.ts); caption matches frontmatter; no `language-diagram` left.

study-diagrams.spec.ts (scrollbars shown, text enlarged through the browser's default font size): at 1280, 1024, 768, 360 and 320 px no horizontal scroll and no figure part overflows; at those widths and 641 px (the tightest wide layout), at 360 and 320 px with 150% and 200% text or the SC 1.4.12 overrides, at 1280 px with 200% text or the overrides, and at 320 px with both, nothing crosses the card edge and bars draw strictly in the order of their widths across the figure; bars with the same width draw equal, within the differences the spec accepts (1.8 px at 1024, 10 px at 1280 with 200% text, 3.3 px at 1280 with the overrides; not checked at 641 px, or at 320 px with 200% text and the overrides together). Plants for each check, and a check that the scrollbar is showing. Not fit states, so recorded only: width 1 bars differ by 3.9 px at 1008 px and 6.1 px at 992 px (2026-11-28). The same page load per state runs the drawing check of every timeline, blocks and number line figure (`tests/support/diagram-drawing.ts`), and at 320 px with 100% and 200% text an axe scan of every figure. A fit failure names only the innermost part that overflows. The states, the scrollbar setup and the fit checks are in `tests/support/diagrams.ts`. The specs of each kind check what a screen reader gets and that every drawing check reports a planted fault. The fixture sites for the matrix and for timeline and blocks figures no page has yet are built by `tests/support/fixture-site.ts`, once per worker into a folder of its own, and run the fit and drawing checks in the same states.

a11y.spec.ts: test shapes page at desktop and 320 px, and the number line page at 320 px.

## 5. Batch 1 content

| Page and placement | Figure | Sentences to cut | Writer must source |
|---|---|---|---|
| test-shapes, after What it is ¶1 | layer-stack. Pyramid: UI, Service, **Unit**. Trophy: End-to-end, **Integration**, Unit, Static. Honeycomb: Integrated, **Integration**, Implementation detail. | "The pyramid has a wide unit base and a narrow end-to-end top." and "The original pyramid puts service tests between…" | Layer names from Fowler, Dodds, Spotify. Prose says "end-to-end top", Cohn's label is UI: pick one. Note says widths are not measured. |
| test-levels-and-types, after the five-item list | owner approved variant A, growing boxes (see spec) | none | Settled: ISTQB CTFL 4.0.1 section 2.2 describes five peer levels and supports no containment |
| risk-based-testing, after "Combine the ratings…" | matrix 3×3, Likelihood rows High on top, Impact columns, level word per cell, two risks placed | "a grid with likelihood on one side and impact on the other" | The two ratings and nine-cell mapping; label "example ratings" |
| equivalence-and-boundaries, after the BVA paragraph | number-line 5 to 25, bands Reject/Accept/Reject, lines at 9\|10 and 20\|21, filled 9,10,20,21, hollow 8,11,19,22 | none | nothing |
| test-independence, after "A fresh context clears…" | blocks: Test A and Test B contexts (cookies, storage) over one Server database holding both orders | none | nothing |
| waiting-and-synchronisation, after Why it helps ¶1 | timeline Fast run / Slow run; same fixed pause on both; condition wait ends at the state | the "since they can be too short…" clause | no ms values |
| assertions-that-retry, after How it works ¶2 | timeline: Draft, Saving, Order saved; one-time read fails on Saving; repeated reads continue to match | none | 150 ms must match code; 5 s limit in page; no retry interval drawn |
| test-doubles, after the five-item list | matrix: five doubles × four questions, cells as words | none | every cell against Meszaros/Fowler; spy and mock under "returns prepared answers" may need "Can" |
| page-object-model, after How it works ¶1 | blocks before/after, "3 edits" vs "1 edit" | "Every test that uses it keeps working." | three tests is an example |
| fixtures-and-setup, after the scope paragraphs | timeline: four tests in two workers, lanes per scope | none | Playwright has no session scope; pytest session scope under xdist is per worker; name lanes by tool, check both docs |

## 6. Build order

1. iko-palette (parallel with 2, no repo files): mockups for timeline, blocks, yes/no matrix and page object figure at 1280, 360, 320 px; contrast against spec; SVG question; owner approval.
2. iko-flow PR A: marker split, schema, shell, layer-stack, tokens, `diagrams.css`, test-shapes data and cuts, all section 4 tests except the SVG allowance. Commit the design folder with `spec.md` (`.notes/study/diagram-spec.md` is only a pointer to it, so there is one spec), note the SVG exception in `.notes/redesign-plan.md`. Done: four proof steps, `npm run verify`, figure checked at 320 px.
3. Fresh iko-flow review + iko-palette check on PR A.
4. iko-flow PR B (matrix, number-line) and PR C (timeline, blocks; after step 1), parallel.
5. iko-bedrock per module after its components are on main; iko-proof reviews each against sources. Done: sourcing flags settled with URLs, body 200-450 words, `minutes` recomputed, page checked at 360 px.
6. Conditional PR D, iko-flow: SVG allowance and first SVG.
7. Batch 2 the same way.

Landing: `npm run verify`, Codex/Astra review on GitHub, fixes, merge, live check.

## 7. Risks

- `entry.rendered.html` vs `<Content />`: proof step 2 catches it.
- Cuts can push a body under 200 words or change `minutes`: the study test reports both.
- A wrong diagram teaches a wrong idea faster than prose: accuracy review required for levels nesting, doubles cells, fixture scopes, risk ratings.
- Matrix scrolls 26 px at 320 px with text-spacing overrides: accepted by the spec.
- Test time: the browser suite is near its 3 minute budget. Each new timeline or blocks page adds 15 fit states (one page load each, with its drawing check) and its screen reader tests. If the budget runs out, cut the 150% text states first: 100% and 200% bracket them, and no layout switch has been found between them.
