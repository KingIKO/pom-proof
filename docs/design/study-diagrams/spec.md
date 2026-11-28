# Visual spec: Study diagrams (B2, tinted and calm)

Decided on 2026-11-28. Kingsley picked option B (tinted) over the recommended option A, said B felt too busy, and allowed inline SVG inside Study diagrams only. B2 is B with fewer lines, colours and labels, and more space. Built: the layer stack is live on the test shapes page. The number line, matrix, timeline and blocks are built (branch `study-diagrams-c`). Approved and not built: the test levels growing pictures (A), the timeline with states (A) and the risk matrix axis names (B).

Reference files in this folder: `option-b2.html` (the three figures in real page context), `compare-b-vs-b2.html`, `diagrams.css` (the `[data-style="b2"]` block and the `.dg2-*` rules are B2), and the PNGs `option-b2-desktop.png`, `option-b2-360.png` and `compare-b-vs-b2.png`. The class names in `diagrams.css` are for the mockup only; iko-flow names its own, but uses the token and the values below.

Added later on 2026-11-28, after Kingsley approved B2: the timeline, blocks and yes/no matrix kinds. Their files are `b2-timeline.html`, `b2-blocks.html` and `b2-yes-no-matrix.html` (real page text around each figure), `compare-timeline.html`, `compare-blocks.html` and `compare-yes-no-matrix.html`, their PNGs, and the `.tl-*`, `.bk-*` and `.yn*` rules at the end of `diagrams.css`.

## What changed from B, and why

| Part | B | B2 | Reason |
|---|---|---|---|
| Test shape bars | Light blue fill, 1px primary outline, blue text, widest layer solid cobalt | Light blue fill, 1px lighter blue edge (3.26:1), ink text at regular weight, widest layer one tint stronger and bold | B's bars copied the pressed-toggle button (badgeBg fill, primary border, badgeText). Solid cobalt is kept for the page's one filled button. |
| Number line | Four rows with row labels, boxed bands with fail and pass borders, a separate row for each marker set | Two rows: tinted bands, then the values with the checked ones boxed in place. A two-item legend replaces the row labels. | Fewer lines and labels. The values appear once instead of twice. |
| Reject band | Red outline, 3px red top rule, bold red label | Pale rose fill, no border, medium-weight label; the caption says each band is the expected result | A red box with a heavy rule reads as an error banner. Rejecting 9 is the correct behaviour. |
| Risk matrix | Grid lines, beige Medium, coloured level words, outlined risk items | No grid lines; cells are tinted blocks 4px apart; clean amber Medium, rose High, grey Low; every level word in ink; risk items as plain text | B's beige came from mixing the brown warn colour into white. Fewer colours at once: hue lives in the fills only. |
| Captions | Two or three long sentences of reading instructions | Two very short sentences | Less text to read before the picture. |
| Spacing | 16 to 24px inside, 24px around | 24px inside, 32px around, 8px between bars | More space. |

## Figure contract

```html
<figure data-diagram="number-line" data-card>
  <figcaption id="dg-boundaries">
    <span class="title">Partitions and the values BVA checks</span>
    <span class="note">Each band shows the expected result. Both Reject partitions continue past the values shown.</span>
  </figcaption>
  <!-- the diagram as real HTML: a table, lists or labelled blocks -->
</figure>
```

- `data-diagram` names the kind: `layer-stack`, `number-line`, `matrix` (risk levels or yes/no answers), `timeline` and `blocks`, and later kinds as they are specified. (The first B2 mockup used older names, `test-shapes` and `risk-matrix`; these names replace them.) The diagram tokens are scoped to `figure[data-diagram]`.
- Every kind except the matrix carries a visually hidden description after the figcaption. It says only what the drawing's own words leave to the eye, such as position, length, width or what lines up, and does not repeat the title, the note or a label. A matrix needs none: the table is the structured version.
- The figure is a card (`data-card`: white surface, 1px `borderCard`, 10px radius). It is the only rounded thing in a diagram.
- Narrow layouts switch on the figure's own width (a container query at 34rem, 544px), not the viewport, so a figure in a narrower column behaves the same. Further switches at 40.75rem (paired blocks), 14.5rem (timeline, blocks), 12rem (layer stack), 10rem (number line) and 8.5rem (timeline group heads).
- Everything a sighted reader learns from the picture must be in the figure's text for a screen reader. Filled and hollow boxes are visual only, so each boxed value has a visually hidden label: "9, 2-value BVA" and "8, added by 3-value BVA". iko-flow owns that markup.

## Tokens

Component tokens, derived from `src/styles/tokens.css`. iko-flow adds them to that file (one token file, never two), scoped to `figure[data-diagram]`. Resolved values are what Chromium computed on 2026-11-28.

| Token | Value | Resolves to | Used for |
|---|---|---|---|
| `--dg-part` | `var(--badgeBg)` | #EAF0FF | Neutral parts (bars, layers, blocks) |
| `--dg-part-strong` | `color-mix(in srgb, var(--primary) 16%, var(--surface))` | #DBE3F9 | The one emphasised neutral part |
| `--dg-part-edge` | `color-mix(in srgb, var(--primary) 66%, var(--surface))` | #6A8BE5 | 1px edge of a neutral part whose size or extent carries meaning |
| `--dg-accept-bg`, `--dg-accept-text` | `var(--passTint)`, `var(--pass)` | #ECF4F3, #0F766E | Values the product should accept |
| `--dg-reject-bg`, `--dg-reject-text` | `var(--failTint)`, `var(--fail)` | #FAECEF, #BE123C | Values the product should reject |
| `--dg-low` | `var(--canvas)` | #F5F7FC | Low level cells |
| `--dg-medium` | `color-mix(in srgb, var(--accent) 28%, var(--surface))` | #FFEACB | Medium level cells (replaces the beige warnTint) |
| `--dg-high` | `color-mix(in srgb, var(--fail) 13%, var(--surface))` | #F7E0E6 | High level cells |
| `--dg-edge` | `var(--text2)` | #55607A | 2px boundary and connector lines |
| `--dg-mark` | `var(--text)` | #101A33 | Filled and hollow markers |

Text uses the site's existing `--text`, `--text2` and `--text3`. No other colours appear in a diagram.

## Contrast

Measured in Chromium from computed colours on `option-b2.html`, `b2-timeline.html`, `b2-blocks.html` and `b2-yes-no-matrix.html`, at 1280, 360 and 320 px wide, with the WCAG 2.2 formula. Ratios are truncated to two decimals and the raw value was compared against the threshold. The 5.35 row comes from the same in-browser formula applied to the resolved token pair, because no item sits in a Medium cell in the mockup.

Text (needs 4.5:1):

| Part | Text on background | Ratio |
|---|---|---|
| Caption title, shape names, level words on white, lane and panel names, row names, box titles, results, yes/no row heads and narrow column heads | #101A33 on #FFFFFF | 17.24 |
| Caption note, legend, axis values, matrix heads, yes/no question heads, outcomes, moment labels, group and tick heads, second line of a row name | #55607A on #FFFFFF | 6.28 |
| Axis names (small caps) | #5E6884 on #FFFFFF | 5.54 |
| Bar label, part label, Yes and Can answers | #101A33 on #EAF0FF | 15.11 |
| Widest bar label, strong part label, strong box title | #101A33 on #DBE3F9 | 13.44 |
| Part items | #55607A on #EAF0FF | 5.51 |
| Items in a strong part | #55607A on #DBE3F9 | 4.89 |
| Reject | #BE123C on #FAECEF | 5.47 |
| Accept | #0F766E on #ECF4F3 | 4.90 |
| 2-value numeral | #FFFFFF on #101A33 | 17.24 |
| 3-value numeral | #101A33 on #FFFFFF | 17.24 |
| Level word, Low / Medium / High | #101A33 on #F5F7FC / #FFEACB / #F7E0E6 | 16.09 / 14.68 / 13.76 |
| State name in the state strip | #101A33 on #F5F7FC | 16.09 |
| Words in the long bar (Timeline with states) | #101A33 on #DBE3F9 | 13.44 |
| Risk item on Low, No answer | #55607A on #F5F7FC | 5.86 |
| Risk item on Medium | #55607A on #FFEACB | 5.35 |
| Risk item on High | #55607A on #F7E0E6 | 5.01 |

Graphics that carry meaning (needs 3:1):

| Part | Colour against white | Ratio |
|---|---|---|
| Bar, timeline bar and box edge (`--dg-part-edge`, 1px) | #6A8BE5 | 3.26 |
| Boundary, moment and state line (`--dg-edge`, 2px) | #55607A | 6.28; across a bar 5.51, or 4.89 on a strong bar; across the state strip 5.86 |
| Arrow glyph ↓ between blocks | #55607A | 6.28 |
| 2-value box, legend square | #101A33 | 17.24 |
| 3-value box edge (2px), legend square | #101A33 | 17.24 |

Fills that carry no meaning on their own (no 3:1 needed): band fills (#FAECEF 1.14, #ECF4F3 1.11 against white), matrix cells (Low 1.07, Medium 1.17, High 1.25), bar and part fills (1.14, 1.28), white parts inside a strong box (1.28 against it) and yes/no answer cells (No 1.07, Yes and Can 1.14). Every one of them has a written word or a 3:1 line that says the same thing: the band label and the boundary lines, the level word or answer in every cell, the edge of the bar or box, the part's own label. The W3C's Understanding page for SC 1.4.11 says a graphic is not "required for understanding" when text in or on it conveys the same information. These fills may never be the only carrier of anything.

The measuring script also flags some pairs as failing that are not real failures, and they are left out of the tables above: the empty legend squares (no text, `aria-hidden`), the risk items' "box" (B2 items have no box, so the script compares a fill with itself, 1.00), the empty corner cell of the yes/no matrix, and the fills listed above.

## Parts per diagram

### Layer stack (test shapes)

- Centred bars, top to bottom from broad tests to narrow ones, all three shapes on one width scale (the column, at most 16rem).
- Bar: `--dg-part` fill, 1px `--dg-part-edge`, 0 radius, at least 32px tall, 4px padding, label centred.
- The widest layer of each shape: `--dg-part-strong` and bold. Width already shows it; the bold is the non-colour signal.
- Width steps, padding and the large-text layout follow "Layer stack width limits" below (approved 2026-11-28). A bar may still grow to its longest word where the steps cannot hold it; the limits section lists where. Compound terms stay whole: the component keeps a hyphenated word such as End-to-end on one line, so the content writes plain hyphens.
- Widths show relative testing effort and are not measured. The caption says so.
- Each layer's width comes from what the page's sources say about that layer, never from the mockup's symmetry. Layers the sources do not rank against each other get the same width.

### Number line

- A legend first, with exactly two entries: filled square for 2-value BVA, hollow square for 3-value BVA adds.
- Row 1: one band per partition, `--dg-accept-*` or `--dg-reject-*`, no border, at least 32px tall, label one word that matches the page's "Expected result" column. 4px gap at each band end.
- Row 2: every value as a number, 13px, `--text2`. Checked values sit in a square of 26px, or the column width less 4px where that is smaller, in their own place on the row: filled `--dg-mark` with a white bold numeral for 2-value, a 2px `--dg-mark` edge with an ink bold numeral for 3-value adds.
- A 2px `--dg-edge` line where the rule changes, through both rows. The line, not the fills, shows where a partition ends.
- No row labels, no tick marks, no axis line: the numbers in order are the scale.

### Matrix (risk, and any two-axis grid)

- A real table. Axis names in small caps: the column axis above the column heads, the row axis up the side of the row heads, reading bottom to top ("Risk matrix axis names" below). Highest likelihood at the top.
- Cells: tinted blocks 4px apart (`border-spacing`), no grid lines, 8px padding, at least 84px tall.
- Every cell writes its level in ink, 14px medium; High is bold. Example items go under the level word in 13px `--text2`, with no box.
- Shading runs `--dg-low`, `--dg-medium`, `--dg-high` only. A grid with no levels (such as level by size) is not supported yet: the schema takes Low, Medium or High only. Once it is, every cell keeps `--dg-low`.

### Yes/no matrix (a matrix with a word in every cell)

Sample: the five test doubles against four questions.

- A real table: one row per item, one column per question. Every cell holds a word: Yes or No, and at most one other single word per matrix (such as Can), defined by the note. It means a limited yes, because it shares Yes's fill, and is short enough not to scroll the turned table at 320 px. Never a tick, a cross or an empty cell.
- Yes: `--dg-part` fill, ink, bold. Can: `--dg-part` fill, ink, regular. No: `--dg-low` fill, `--text2`, regular. Words centred. The fill only helps the eye find the yeses; the word carries the answer.
- Row heads are the items, 14px medium ink, left aligned. Column heads are the questions, 13px medium `--text2`, centred, bottom aligned, wrapping at spaces. The corner cell stays empty and unfilled.
- Cells 4px apart, 8px padding, at least 44px tall. No grid lines.
- Questions use the page's verbs ("Returns prepared answers", "Stores calls for the test"), at most five words each.

### Timeline

Samples: a fixed pause against a condition wait (waiting and synchronisation), and fixture lifetimes per scope (fixtures and setup).

- One time scale per figure, shared by every lane, running left to right at every width. Below 34rem the bars get shorter; the layout does not turn.
- A row has a name in the left column, its bars, and an optional outcome. The name is 13px medium ink, with an optional second line in `--text2` for a tool or a qualifier ("Playwright", "pytest with xdist"). The outcome is one to three words in 13px `--text2`, placed right after the bar it describes ("Wastes time", "Too short"). It starts 10px after the bar (8px and the bar's own 2px clear) and keeps 4px clear at its own end. The words wrap first, and only then does the gap shrink to 6px.
- Bar: `--dg-part` fill, 1px `--dg-part-edge` (its length carries meaning), 0 radius, at least 32px tall, 2px clear at each end, no text inside (the one exception is the long bar in "Timeline with states"). The one recommended or emphasised row gets `--dg-part-strong` and a bold row name.
- A lane groups rows under a 14px medium heading ("Fast run"). Lanes sit 24px apart, rows 8px apart.
- A moment is a 2px `--dg-edge` line through all of its lane's rows, labelled at the top in 13px medium `--text2` ("App ready"). The label sits on the side of the line with more room: after it, or before it when the line is past the middle.
- Optional header rows: group heads over a range of columns ("Worker 1"), tick heads under them (1, 2, 3, 4), and the tick axis name in small caps in the name column ("Test"). Groups that run at the same time are separated by a 16px gap column, so their bars never touch. Group heads that follow one another in time have no approved drawing, because states that change over time are drawn as "Timeline with states" below. The schema accepts them until the state strip is built, and no page uses them.
- When the scale is time, one axis name "Time →" in small caps sits under the last lane, right aligned. No durations, no tick values in milliseconds, no grid lines.

### Blocks

Samples: browser contexts over a shared database (test independence), and tests with and without a page object (page object model).

- Box: anything whose boundary means something (a test, a database, a page object). White fill, 1px `--dg-part-edge`, 0 radius, 12px padding, title inside at the top in 14px medium ink.
- Part: a thing inside a box. `--dg-part` fill, no border, 8px by 12px padding, name 13px medium ink, then its items in 13px `--text2`, one per line, no bullets.
- Strong: one kind of thing per figure, the one the idea is about. A strong box (the shared database) gets `--dg-part-strong` and a bold title, and its parts turn white. A strong part (the copied locator) gets `--dg-part-strong` and bold text.
- Boxes in a row are equal columns 16px apart. A box below a row spans all of its columns, so sharing shows as width. A → between two boxes has a 16px column with 8px on each side (4px under 34rem).
- Arrows: ↓ (U+2193) or → (U+2192) in `--text2` at 16px, one per source column, centred, between neighbours only. When boxes stack, each → becomes a ↓ between its two boxes, and the ↓ arrows to the row below stand together under the last box. Arrows are `aria-hidden`; hidden text after the box's title gives the relation ("Test 1, calls Sign-in page object").
- Before and after: two panels side by side, 32px apart, before on the left. Each panel has a 14px medium heading and ends with a result line in 16px bold ink ("3 edits", "1 edit"), aligned across the two panels.
- Nesting stops at a part inside a box. A box inside a box has no approved drawing.

### Layer stack width limits (approved 2026-11-28)

Kingsley approved this on 2026-11-28 ("Yes, use the fix"). The change is CSS only and sits in `layer-stack-limits.css`, written against `src/styles/diagrams.css` at cc302d3. The markup, the data and the tokens stay the same. It replaces the old width steps (.3, .4, .6, .8, 1) and the 8px side padding.

1. Width steps become .4, .5, .6, .8 and 1 (were .3, .4, .6, .8 and 1). The order is the same. Only widths 1 and 2 change.
2. Bars have 4px side padding (was 8px), so a tight label does not push its bar past its width.
3. `.dg-layers` gets `grid-template-columns: minmax(0, 1fr)`, so one long word no longer widens the whole stack.
4. When the figure's content is narrower than 12rem, which needs large text on a phone, each label sits above its own bar. The bar is 12px tall, has the same fill and 1px edge, and keeps its true width. The widest layer keeps `--dg-part-strong` and its bold label. Labels are 4px above their bars and layers are 12px apart. At the default text size a 320 px screen has 239 px of content, so this layout does not show there.

Measured on 2026-11-28 on the live test shapes page with and without the CSS. "200%" means the browser's default font size set to 32 px.

| Screen | Built now | Proposed |
|---|---|---|
| 1280 | UI 62.4 and Integrated 79.0 for the same width | UI and Integrated both 83.3 |
| 1024 | UI 51.9, Integrated 79.0; Implementation detail 109.9 against 103.8 for Service | UI 69.2, Integrated 71.0; all width 3 bars 103.8 |
| 768, 360, 320 | UI and Integrated differ by 19.9, 2.2 and 7.3 px | Equal |
| 1280 at 200% | UI 97.5, Integrated 156.0; Implementation detail 217.8 against 195.0 | UI 130.0, Integrated 140.0; Implementation detail 201.8 against 195.0 |
| 360 at 200% | Integration and Implementation detail both 217.8; End-to-end (width 2) 169.6, wider than Unit and Static (width 3) at 129.0 | Every bar at its true width |
| 320 at 150% | End-to-end 127.7, wider than Unit and Static at 124.2 | Every bar at its true width |
| 320 at 200% | Integration and Implementation detail both 217.8, past the card edge by 9.8 px; End-to-end 169.6 against 105.0 for Unit and Static | Every bar at its true width; the word "Implementation" runs 4.4 px into the 32 px card padding and stays inside the card |

Limits that stay, accepted: between UI and Integrated 7.0 px at 641 px, 6.1 at 992, 4.0 at 1008 and 1.8 at 1024; between Implementation detail and the other width 3 bars 5.9 px at 641 px, 4.5 at 992 and 1.3 at 1008; 10 px at 1280 with 200% text, and 3.3 px at 1280 with the text-spacing overrides. The order within a shape held in every state measured. With 200% text and the overrides together at 320 px, labels run up to 31.1 px into the card padding and stay inside the card.

Contrast: label on white 17.24, thin bar edge on white 3.26. Guard: 0 violations at 1280, 360 and 320 px.

### Timeline with states (approved 2026-11-28, version A, not built)

Kingsley picked A, "bars over time", with no changes. B, "what each read sees", was the designer's pick, was shown beside it and is not used.

For the Assertions that retry page, after the second paragraph of How it works ("If you read the text first"). It replaces the built test drawing, where nothing marked where each state begins and ends, the names sat too close to the first lane name, and a stacked outcome was not under its bar. Files: `retry-timeline.css` (the `.rt-a` and shared rules; `.rt-b` is B), `retry-timeline-bars.html` (A) and `retry-timeline-reads.html` (B) in the real page, their `retry-timeline-{bars,reads}-*.png` files, and `compare-retry-timeline.png`. The mockups sit on the built page and CSS at 4c1092b. The class names are for the mockup only. Nothing else in the Timeline rules above changes, so the waiting and fixtures figures stay as they are.

Caption: title "Reading again sees the change", note "Both check for Order saved. The top row is what the page shows."

Parts:

- Rows, top to bottom: Status text, One-time assertion, Retrying assertion, then "Time →" right aligned in the axis name style. No group heads, no moment label, no lane heading.
- State strip (the Status text row): one band, `--dg-low` fill, 1px `--dg-part-edge` outline, at least 32px tall, holding Draft, Saving and Order saved. 13px medium ink, centred in their columns, 4px padding. No edge of its own between two states.
- State lines: two 2px `--dg-edge` lines, centred on the two column edges, from the top of the strip to the bottom of the last row. They run over the strip and the bars, so each state has a visible start and end. No text ever crosses one.
- Short bar (One-time assertion): `--dg-part`, 1px `--dg-part-edge`, no visible words. It starts 6% into the Saving column and is 22% of it wide.
- Long bar (Retrying assertion, the strong row: `--dg-part-strong`, bold row name): 1px `--dg-part-edge`. It starts where the short bar starts, crosses the second line and ends 24% into the Order saved column. It holds "Reads again and again" in 13px medium ink, start aligned, 8px from the bar's start, balanced over its lines, and ending before the second line (within 94% of the Saving column).
- Words inside a bar are allowed in this drawing only, and only in the long bar. Every other timeline keeps "no text inside". "Reads again and again" is also the one label here that runs past three words.
- Both bars at least 40px tall, 0 radius, centred words.
- Outcomes: "No match, **fails**" and "Match, **passes**", 13px ink, the result word bold and on its own line. Each starts 8px after its bar's end. The first keeps 4px clear before the second line.
- Widths are not measured, and no duration is written: no 150 ms, no 5 s, no retry interval and no marks for single reads.

Layout and gaps:

| | From 34rem | Below 34rem | Below 14.5rem (large text on a phone) |
|---|---|---|---|
| Row names | 9.5rem column on the left, 12px before the track | Above their rows, 4px apart, on a white patch as wide as the name plus 4px, over the lines | The same, with no lines to cover |
| Columns: Draft, Saving, Order saved | 5.5rem, then two equal shares | 3.5rem, then two equal shares | One column |
| Between rows, and strip to first row | 16px | 12px | 12px |
| State strip | One band | One band | Draft, Saving and Order saved as three boxes in that order, start aligned, 8px side padding, 1px edge each, 2px apart |
| Bars | On the time scale | On the time scale | Full width, 4px by 8px padding. The short bar shows "Reads once, during Saving" |
| Outcomes | After their bars | After their bars | Under their bars, 4px padding above, on one line where it fits |
| State lines, "Time →" | Shown | Shown | Hidden |

From 14.5rem up the drawing never turns: time runs left to right.

Hidden text, so a screen reader gets what the picture shows:

- After the figcaption: "The status text is Draft, then Saving, then Order saved. The one-time assertion reads once, during Saving, and fails. The retrying assertion reads from Saving on, and passes when it reads Order saved."
- Inside the short bar: "Reads once, during Saving." It is visually hidden from 14.5rem up. Below that the visible words replace it, so it is never read twice.
- The state lines and "Time →" are `aria-hidden`. The two assertion rows are an ordered list (`role="list"`). The state names, bar words and outcomes are real text.

Measured on 2026-11-28 (figure border box, default text):

| Screen | Built test drawing | A | B (not used) |
|---|---|---|---|
| 1280 | 323 px | 299 px | 315 px |
| 360 | 299 px | 349 px | 379 px |
| 320 | not measured | 357 px | 412 px |

The built drawing is shorter because it has no note and no words for its outcomes. Contrast, A: state 16.09, bar words 13.44, outcome 17.24, time axis 5.54; state line 6.28 on white, 5.86 on the strip, 4.89 on the strong bar; bar and strip edges 3.26. Guard: 0 violations at 1280, 360 and 320 px. Reflow: no state, bar word or outcome leaves its part, crosses a state line or passes the card, at 1280, 1024, 768, 641, 480, 360 and 320 px, with or without the text-spacing overrides, with 200% text at 1280, 768, 360 and 320 px, with 150% at 360 and 320 px, and with 200% text and the overrides together at 320 px. In the built page the figure adds no sideways scroll (that page already scrolls 34 px at 320 px with 200% text and 50 px at 600 px with the overrides).

B, for the record: one box per state read, in that state's column, with what it read and the result in bold ("Reads Saving", Keeps reading, then "Reads Order saved", Passes).

### Risk matrix axis names (approved 2026-11-28, version B, not built)

Kingsley picked B, "likelihood up the side", with no changes. A, "both on the top line" ("Likelihood ↓" and "Impact →" above the column names), was the designer's pick, was shown beside it and is not used.

On the built matrix one line reads "LIKELIHOOD Low Medium High", so likelihood looks like the name of the columns, most of all on a phone. Only the row axis name and the note change. Files: `risk-axis.css` (the `.rx-b` rules; `.rx-a` is A), `risk-axis-arrows.html` (A) and `risk-axis-side.html` (B) in the real page, their `risk-axis-{arrows,side}-*.png` files, and `compare-risk-axis.png` (the picture Kingsley chose from, with B's side name as it was before the fix below).

Note: "Example ratings and mapping. Each team sets its own." No source gives a 3 by 3 mapping, so the cells are an example. The old "Test the high cells first" goes, because the paragraph above the figure already says to run the highest risks first.

Parts and markup:

- The table gains one column at its start for the row axis name: 1.75rem wide, 1.125rem below 34rem. The row heads keep their column (5.5rem, 3.25rem below 34rem).
- Row axis name: "Likelihood" in the axis name style (small caps, 13px bold, `--text3`), turned to read bottom to top, on one line, centred on the three rows and on its column. No arrow, no line, no fill.
- Column axis name: "Impact", where it is now, above the three column names. The line of column names holds Low, Medium and High only.
- The corner above the row heads is empty in both head rows.
- Markup: the name is `th scope="rowgroup" rowspan="3"`, the first cell of the first body row. Impact stays `th scope="colgroup" colspan="3"`. The empty corner cells are `td colspan="2"`. The name is written as Likelihood and turned with CSS (`writing-mode: vertical-rl` and `rotate(180deg)`).
- No hidden text: the table and its headers are the structured version, as for every matrix.
- Colours, cells, gaps, level words and items are the approved ones.

Narrow and large text:

- Put the name out of the table's flow (absolute, centred in its cell with physical `top` and `left`, because logical offsets follow the name's own writing mode), so its line height never widens the column. The cell's own side padding is .375rem. The column then shrinks from 1.125rem to .75rem when the table would otherwise scroll, and at no other time.
- Below 16rem of content (a 320 px phone) the level cells take 2px side padding, so the extra column costs no scroll at default text.
- With enlarged text the table scrolls inside its own box, as built. The name scrolls with it.

The out-of-flow name came after Kingsley's pick, to shrink the overflow. At default text the only pixels that differ from the figures he approved are inside the name itself, which sits up to 2px lower because it is now exactly centred. Nothing else moved at 1280, 360 or 320 px.

Measured on 2026-11-28: 449 px tall at 1280, 410 px at 360 and 320 px, the same as built. Scroll inside the table's own box:

| State | Before the fix | Now | Built matrix |
|---|---|---|---|
| Default text, 1280 to 320 px | 0 | 0 | 0 |
| Text-spacing overrides, 360 px | 7 px | 0 | 0 |
| Text-spacing overrides, 320 px | 35 px | 28 px | 26 px |
| 150% text, 360 px | 91 px | 83 px | not measured |
| 150% text, 320 px | 131 px | 123 px | not measured |
| 200% text, 360 px | 226 px | 216 px | not measured |
| 200% text, 320 px | 266 px | 256 px | not measured |
| 200% text and overrides, 320 px | 346 px | 331 px | not measured |

Accepted: the 28 px at 320 px with the overrides and the scroll with enlarged text, all inside the table's own box. A .5rem column was tried: it saves 4 px more at 320 px with the overrides, and the name then crowds the row heads with enlarged text. Nothing scrolls with the overrides at 1280, 1024, 768, 641, 600, 480 or 360 px, or with 200% text at 1280 and 768 px. The figure adds no sideways scroll to its page. Contrast: axis names 5.54, heads 6.28, level words 13.76 to 16.09, items 5.01 (High), 5.35 (Medium) and 5.86 (Low). Guard: 0 violations at 1280, 360 and 320 px.

### Test levels, growing pictures (approved 2026-11-28, version A)

Kingsley picked A, "says what it tests", with no changes. B was shown beside it and is not used. The three earlier drawings he rejected stay recorded below with his words. iko-flow builds A once the current branch lands.

The third drawing, after Kingsley's answer on the rows version below: "Still not clear", because "Too abstract overall: It doesn't feel like a picture of anything". He asked for "Boxes growing in size: One part, then joined parts, then the whole app, then the app plus another system, with Acceptance separate". Files: `test-levels-growing.css`, `test-levels-growing-words.html` (variant A) and `test-levels-growing-questions.html` (variant B), their `test-levels-growing-{words,questions}-*.png` files, and `compare-test-levels-growing.png`.

The idea: one booking form, "Book a visit", drawn at the same scale at each step, so a bigger drawing has more under test. Plain HTML, no SVG and no new tokens.

- Steps: Component is the price field. Component integration is the date field joined to the price field. System is the whole form, with those two fields and the Book button in it. System integration is the form joined to an email message ("Visit booked"). Acceptance sits under a line, as Reception staff and their question, "Can I manage a full day's schedule?"
- The connection: a solid `--dg-part-edge` block (3.26:1 on white) with ↓ or → in ink (5.28:1). It appears only at the two integration steps. The email box has the `--dg-low` title, so it reads as another system.
- Form parts: fields on `--surface`, window title and Book button on `--dg-part-strong`, all with a 1px `--dg-part-edge` edge and radius 0. The Book button is drawn pale because solid `--primary` is reserved for the one real button on a page. Text 13px, level name 14px medium, words 13px `--text2`.
- Placement: drawings stand on one line at the foot of their row. Each label sits right above its own drawing, so the labels rise with the drawings.
- Caption note: "Size shows how much is under test." The sentence before the figure adds that no level contains another. The form contains the price field; System testing does not contain Component testing.
- Four across from 35rem of content (larger fields from 42.5rem). Two by two between 17rem and 35rem, which covers a 360 px phone. Below 17rem (320 px) System and System integration take a row each. Below 14rem (large text on a phone) every step takes the full width and the email sits under the form with ↓.
- Screen readers: the drawings are `aria-hidden`. Each step has its name and words, then one hidden sentence for the drawing. The reception staff question is real text.

The two variants share the drawing. They differ in the words under each name and in the list after the figure:

| Level | A, what it tests | B, the question it asks |
|---|---|---|
| Component | one part on its own | Is the price right? |
| Component integration | how two parts connect | Do date and price agree? |
| System | the whole app | Can you book? |
| System integration | how two systems connect | Can it send an email request? |
| Acceptance | whether it meets user needs | Does it meet user needs? |

A is the approved one. Its words define the level, so the name, the words and the drawing say the same thing. B's questions give an example, so a newcomer has to work the definition out, and "Do date and price agree?" is the weakest line in either.

The example changes from the cutoff calculation to the price, because a newcomer knows what a price is. Page text that goes with it:

- Intro, both: "…describes five levels, and none contains another. A booking app gives each level a different target."
- List A, "One check at each level:" Component, also called unit: the price comes out right. / Component integration: inside the same system, the price changes with the date. / System: a customer can make a booking and see it in their account. / System integration: the booking app can send a request to its email provider. / Acceptance: the product meets the needs that decide if it's ready to use.
- List B, "What each level covers:" Component testing, also called unit testing, checks one part on its own. / Component integration testing checks how parts of the same system work together. / System testing checks the whole app, for example whether a customer can see a booking in their account. / System integration testing checks a connection to another system, here the email provider. / Acceptance testing checks whether the product meets the needs that decide if it's ready to use.
- Later on the page: "how the booking and cutoff code work together" becomes "how the date and price code work together".
- "Ask reception staff to manage a full day's schedule" moves into the figure. The cutoff examples are replaced by the price. Every other fact stays, in the list or the figure.

Measured on 2026-11-28 (figure border box, default text, variant A; B is the same except 582 px at 320 px):

| Screen | Peers | Rows | Growing pictures |
|---|---|---|---|
| 1280 | 343 px | 435 px | 364 px |
| 360 | 720 px | 377 px | 421 px |
| 320 | 752 px | 396 px | 601 px |

Contrast: level name 17.24, words 6.28, field text 17.24, field label 6.28, window title and button text 13.44, email title 5.86, reception staff 17.24, question 15.11, arrow 5.28, every edge and the link block 3.26. Guard: 0 violations at 1280, 360 and 320 px. Reflow: no text leaves its box, no two steps overlap and nothing passes the card at 1280, 1024, 768, 600, 480, 412, 360 or 320 px, with or without the text-spacing overrides, or with 200% text at 1280, 768, 360 or 320 px. With the overrides at 360 px the email box runs 5.2 px into the card padding. With 200% text and the overrides together at 320 px, the question runs 7.6 px out of its tint and stays inside the card. Injected into the live page, the figure adds no sideways scroll at 1280, 600, 360 or 320 px, with the overrides or with 200% text.

For iko-flow: this is a new kind, `levels`. It does not fit `blocks`. The form, its fields and the email are drawn parts of this one figure and not inputs, so they carry no control roles and take no focus.

### Test levels, rows over one picture (not approved)

Kingsley said "Still not clear", and the reason he picked was "Too abstract overall: It doesn't feel like a picture of anything". The growing pictures above replace it. Kept as the record.

The redraw after Kingsley's answer on the peers version below: "too long on a phone. and its not clear enough to me". The peers version showed five separate examples with no shared picture, repeated the list above it and ran 720 px tall at 360 px. Files: `test-levels-rows.css`, `test-levels-rows.html` (the page with the trimmed list), the `test-levels-rows-*.png` files and `compare-test-levels-rows.png`.

The idea: the booking app is drawn once, and each level is a row on the same columns. A solid block in the row marks that level's target, under the part or the arrow it targets. Component integration's block sits under the arrow inside the app; system integration's sits under the arrow that leaves it. The levels stay peers in the list's order, and none sits inside another.

- Picture, at the top: the Booking app as a box (1px `--dg-part-edge`, title 14px medium ink) holding three parts in `--dg-part` (Booking creation → Cutoff calculation, Rest of app), then a → and the Email provider as a second box, another system. Part names 13px medium ink, arrows 16px `--text2`.
- Rows: the level name in 14px medium ink, then a few words in 13px `--text2`: one part on its own, between parts, whole app, between systems, whole app, for user needs. The words give the difference; colour never carries it alone. System and Acceptance draw the same block, and only "for user needs" separates them.
- Track: pale `--dg-part` blocks for what is not the target, one solid `--dg-part-edge` block for the target (3.26:1 against white). Links sit in the arrow columns with a 2px white gap at each end, so every edge of a target meets white. On desktop a link holds the → in ink (5.28:1). Pale only means not the target; the note never says the pale parts do not run.
- Caption: "What each test level targets", note "The solid block is the target."
- Desktop: names in a 10.5rem column on the left, tracks 24px tall, rows 12px apart; columns are shared by subgrid. Columns: name, 8px app edge, Booking creation, 32px link, Cutoff calculation, 2px, Rest of app, 8px app edge, 48px link, Email provider.
- Below 34rem: each name sits above its track, with its words wrapping as one piece. Tracks are 12px tall with no glyph in the links, and Rest of app drops out (the app box still covers it in the whole-app rows). If the columns still cannot fit, which happens only at 320 px with the text-spacing overrides, the figure scrolls 31px inside its own box, as the risk matrix does.
- Below 14rem (large text on a phone): the picture and tracks hide, and each row names its target in words in a pale block ("Booking creation to cutoff calculation", "Booking app to email provider"). Screen readers always get these words; the picture and tracks are `aria-hidden`, and a hidden sentence describes the app.

The list after it keeps only what the figure does not show. The intro sentence ends with a full stop instead of a colon, the figure follows, and then "One check at each level:" with five short items: also called unit, booking creation uses the cutoff result, the customer booking and account, the request to the email provider, and the whole acceptance item. "One part on its own", "how parts of the same system work together", "the whole app" and "a connection to another system" move into the figure as its row words and picture. Every fact on the page stays, in the list or the figure.

Measured on 2026-11-28 (figure border box, default text):

| Screen | Peers version | Rows version |
|---|---|---|
| 1280 | 343 px | 435 px |
| 360 | 720 px | 377 px (52%) |
| 320 | 752 px | 396 px (53%) |

Contrast: level name 17.24, words 6.28, part names 15.11, target block and box edges 3.26, arrow on a target 5.28, target words in the large-text layout 15.11. Pale blocks (1.14) are fills that carry no meaning on their own: the picture names each column. Guard: 0 violations at 1280, 360 and 320 px. Reflow: nothing spills at 1280, 1024, 768, 600, 360 or 320 px. With the text-spacing overrides, nothing spills, except the 31px scroll inside the figure at 320 px. With 200% text, 320 and 360 px show the words layout, and 768 and 1280 px show the picture, with nothing spilling. On the live page, with the figure and the trimmed list injected, the page gains no sideways scroll at 320 px (plain, with the overrides, with 200% text), at 360 px (with the overrides, with 200% text) or at 1280 px. It already scrolls 3px at 320 px with 200% text, without the figure.

### Test levels, first drawings (not approved)

Kingsley picked version 1 and then said "too long on a phone. and its not clear enough to me". The rows version replaced both, and it was not approved either. Kept as the record.

Two versions of the figure for Test levels, types and sizes. Both sit right after the five-item list and use blocks parts and existing tokens. The earlier idea of boxes holding levels, with Acceptance around System, is dropped. The plan's sourcing found that ISTQB CTFL 4.0.1 section 2.2.1 lists five peer levels and never says that one contains another.

Version 1, peers (picked, then not approved):

- An ordered list of five boxes in the list's order: Component, Component integration, System, System integration, Acceptance. Equal columns, 8px apart, no arrows between them and no numerals, so nothing reads as a sequence or as containment.
- Box: 8px padding, title 14px medium ink, then a note in 13px `--text2` saying what the level tests ("Interfaces between components"), then the booking app parts.
- Parts: 4px by 8px padding, name 13px medium ink, optional item in 13px `--text2` ("Full day's schedule"). The arrow ↓ between two parts is the interface under test, and it appears only in the two integration boxes.
- Titles, notes and parts line up across the five boxes (subgrid rows). No strong part.
- Below 36rem of figure width the boxes stack in one column in the same order.
- Description for screen readers: "Booking creation uses the cutoff calculation. The booking app uses the email provider." The list itself says the rest.

Version 2, test objects:

- Boxes are the things under test, not the levels: One component inside Components together inside Whole system. Each title is the object, and the second line in 13px `--text2` names the level.
- An arrow labelled System integration testing points from the whole system to External service (Email provider). Business needs, for acceptance testing, is a separate box.
- The note must say that the levels are peers: "Boxes show what is under test. The levels themselves are peers."
- Below 34rem the arrow turns down and everything stacks. Below 12rem each nested box keeps only its leading edge.

Why version 1: each level is its own box, as in the source, and the two interfaces are drawn as the target. The same booking app sits in System and Acceptance with a different aim, and nothing has to be explained away. Version 2 draws containment and then asks the note to cancel it. Its Acceptance box is also not a test object. Both versions repeat facts from the list above the figure, so the writer should check the list against rule 8 before publishing either.

Measured on 2026-11-28: contrast passes in both (lowest text: part item, 5.51; lowest line: box edge, 3.26; box note 6.28; arrow 6.28). Nothing spills at 1280, 1024, 768, 600, 360 or 320 px, with or without the text-spacing overrides. At 320 px with 200% text, version 1 fits and one title in version 2 runs 6.9 px into the card padding. With 200% text and the overrides together at 320 px, version 1 stays inside the card and version 2 passes its edge. Guard: 0 violations at 1280, 360 and 320 px.

## Typography

Figtree only; no JetBrains Mono in a diagram (numerals use `tabular-nums` instead). Sizes come from the site scale.

| Role | Size and weight | Colour | Line height |
|---|---|---|---|
| Caption title | 16px bold | `--text` | 1.3 |
| Caption note | 14px regular, at most 60ch | `--text2` | 1.45 |
| Shape names | 14px medium | `--text` | 1.3 |
| Segment names (narrow number line) | 13px medium | `--text2` | 1.3 |
| Bar labels | 13px regular, widest bold | `--text` | 1.2 |
| Band labels | 13px medium | accept or reject text token | 1.2 |
| Values on the number line | 13px regular, tabular; boxed values bold | `--text2`; boxed ink or white | 1 |
| Legend | 13px regular | `--text2` | 1.3 |
| Matrix heads | 13px medium | `--text2` | 1.3 |
| Matrix level words | 14px medium, High bold (13px below 34rem) | `--text` | 1.3 |
| Matrix items | 13px regular | `--text2` | 1.25 |
| Axis names | 13px bold, all small caps, 0.06em tracking (the site's `.section-label` values) | `--text3` | 1.3 |
| Lane and panel names | 14px medium | `--text` | 1.3 |
| Timeline row names | 13px medium, bold when strong; second line regular | `--text`; second line `--text2` | 1.3 |
| Outcomes | 13px regular | `--text2` | 1.25 |
| State names, words in the long bar (Timeline with states) | 13px medium | `--text` | 1.2, 1.25 |
| Outcomes (Timeline with states) | 13px regular, the result word bold | `--text` | 1.25 |
| Moment labels, group and tick heads | 13px medium | `--text2` | 1.2 |
| Box titles | 14px medium, bold on a strong box | `--text` | 1.3 |
| Part labels | 13px medium, bold when strong, regular inside a strong box | `--text` | 1.25 |
| Part items | 13px regular | `--text2` | 1.25 |
| Arrows between blocks | 16px | `--text2` | 1 |
| Results ("3 edits") | 16px bold | `--text` | 1.3 |
| Yes/no answers | 14px (13px below 34rem): Yes bold, Can and No regular | Yes and Can `--text`; No `--text2` | 1.3 |
| Yes/no row heads | 14px medium (13px below 34rem, as column heads) | `--text` | 1.3 |

Inside a figure, words wrap at spaces only. The prose column's `overflow-wrap: anywhere` must not reach labels.

## Spacing and shape

| Item | Value |
|---|---|
| Space above and below a figure | 32px |
| Figure padding | 24px; 16px when the viewport is under 36rem |
| Caption to diagram | 24px; 16px under 36rem |
| Caption title to note | 4px |
| Columns of shapes | 32px apart, side by side or stacked |
| Between bars | 8px |
| Legend to diagram | 16px; legend items 24px apart |
| Number line rows | 8px apart |
| Matrix cells | 4px apart, 2px under 34rem; levels cells 84px tall, 72px under 34rem |
| Yes/no cells | At least 44px tall; 36px under 34rem |
| Timeline name column | 9.5rem; 5.25rem under 34rem |
| Timeline with states | Its own gaps, in "Timeline with states" |
| Row axis name (levels matrix) | 1.75rem column; 1.125rem under 34rem, down to .75rem before the table scrolls |
| Timeline rows and lanes | Rows 8px apart, lanes 24px apart, bars at least 32px tall; below 14.5rem the name above and the outcome below are 4px from their bars, and rows are 12px apart |
| Blocks | Columns 16px apart (8px under 34rem); box padding 12px (8px); part padding 8px by 12px (4px); panels take the 8px and 4px paddings below 40.75rem; arrows in their own 8px-spaced row |
| Before and after panels | 32px apart; 24px when stacked; result line 16px below the drawing |
| Radius | 10px on the figure card, 0 on every part |
| Line weights | 1px (part edges) and 2px (boundaries, connectors, hollow markers). No others. |

## Captions

- The title states the one idea, sentence case, at most seven words, no full stop. It names nothing as "Figure", with or without a number, and has no "Diagram of" and no "This shows".
- The note has at most two short sentences. It says how to read the figure (what width, a line or a box means) or that the data is an example. It never repeats the paragraph above.
- The caption sits above the diagram, so the reader knows what to look for first.

## Markers and emphasis without colour

- Two marker shapes only: a filled square and a hollow square with a 2px edge, both 0 radius. Never round (round markers also fail the site's radius rule), never a glyph such as ■ or ●.
- Emphasis comes from weight (bold), from shape (filled against hollow), from position (a boundary line, a row) and from words (Accept, Reject, Low, Medium, High). A tint may add to these and never replaces them.
- At most one emphasised part per group: the widest layer of each shape, the high cells of a matrix, the recommended row of a timeline lane, the one kind of block the figure is about. A yes/no matrix bolds every Yes, because the word, not the emphasis, is the answer.
- No 2px primary outlines: that is the site's focus ring.

## From 320 to 360 px

| Diagram | Below 34rem of figure width |
|---|---|
| Layer stack | The three shapes stack, each with its name above and the same 16rem scale. Below 12rem each label sits above a thin bar ("Layer stack width limits"). |
| Number line | Two segments of six values, one around each edge (7 to 12 and 18 to 23), headed Lower edge and Upper edge, each with its own two bands and boundary line. The legend stays on top. Below 10rem each segment turns upright: values down the side, bands beside them, boundary lines across. The reading order stays bands first, then values, although the values then stand to the left of the bands. Each segment is a group named by its heading. |
| Matrix | The first column narrows to 3.25rem, cell gaps to 2px, cell padding to 4px, and level words to 13px. Columns size to their longest word. Likelihood runs up the side in its own 1.125rem column, which shrinks to .75rem before the table scrolls. Below 16rem the level cells take 2px side padding. If text still does not fit, the table scrolls inside its own box rather than spilling, as it does with enlarged text. |
| Yes/no matrix | A second rendering, turned: the items become the columns (13px medium ink) and each question heads its own row of answers (13px medium `--text2`, left aligned, a `th scope="rowgroup"`). Columns size to their words; cells 2px apart with 4px by 2px padding. Only one rendering is visible at a time, as with the number line. With enlarged text the table scrolls inside its own box, and each question stays in view at the start of the box while its answers scroll. |
| Timeline | Same layout: the name column narrows to 5.25rem, names and outcomes wrap to two lines, bars get shorter. Time still runs left to right. Below 14.5rem the name sits above its bars and the outcome below, 4px apart, with rows 12px apart; the moment line passes behind the words; group heads share a line down to 8.5rem. The timeline with states puts each name above its row instead, and stacks below 14.5rem (its own section). |
| Blocks | Rows keep their columns side by side (two or three). Gaps, box padding and part padding shrink as in the spacing table. A before and after pair stacks, before first, each panel with its own result line. Its panels already take the 8px and 4px paddings below 40.75rem. Below 14.5rem boxes and parts stack, and each → becomes ↓. |

Measured on 2026-11-28: no part overflows its box at 1280, 360 or 320 px, and nothing overflows with the SC 1.4.12 text-spacing overrides on at 1280 and 360 px. The one exception is 320 px with those overrides on, where the risk matrix scrolls inside its box (26px as first built, 28px with its approved axis names). The timeline, blocks and yes/no matrix figures do not overflow or scroll at any of the three widths, with or without the overrides, at default text only. With enlarged text both matrices scroll in their own box. No figure ever widens the page.

## Inline SVG

Allowed only as `figure[data-diagram] > svg[role="img"][aria-labelledby]`, and only for what HTML and CSS cannot draw: lines that cross between parts (connectors, arrows between parts that are not neighbours) and literal outlines. Bars, grids, number lines, lanes and lists stay HTML.

- `aria-labelledby` names the figcaption and a visually hidden description that states, in words, everything the drawing shows.
- At most one SVG per figure. It sizes from its `viewBox` to the figure width.
- Colours come only from the tokens above and the site's text tokens, applied through CSS classes. No hex values or other colours in the markup.
- Lines are 1px (`--dg-part-edge`, part edges) or 2px (`--dg-edge` or `--text`, boundaries and connectors), with `vector-effect: non-scaling-stroke` so they stay that weight at any size. Ends are square.
- Arrowheads are small filled triangles, 8px long, in their line's colour.
- Shapes are rectangles, polygons, lines and paths, with no corner rounding and no circles.
- Text is `<text>` in Figtree, inherited from the page, never converted to paths, at least 13px as rendered at 320 px. If that cannot hold at 320 px, the figure switches to an HTML layout below 34rem.
- Banned inside the SVG: gradients, patterns, filters (blur, drop shadow), masks, `clipPath`, `<image>`, `<foreignObject>`, external references, animation, opacity below 1 on a part that carries meaning, and `<title>` tooltips as the only labels.
- Contrast thresholds are the same as for HTML parts.

The page object before and after does not need SVG. Its idea is a count: three copies of the locator against one. In the blocks version the reader sees three strong locator parts against one, and three ↓ arrows running into one shared box, with "3 edits" and "1 edit" under them. Lines converging on the page object would add nothing the arrows and the shared box do not already show, and the blocks version holds at 320 px. No figure drawn so far needs SVG.

The slop guard still bans every other `svg`. Before the first SVG ships, `tests/ui/slop-guard.spec.ts` needs an update to allow exactly this selector and to scan inside allowed SVGs for the banned elements above. The update adds plants that must fail: an `svg` outside a diagram figure, one without `role="img"` or `aria-labelledby`, and one inside a diagram figure that holds a `linearGradient`.

## Banned

- Gradients, shadows, blur, hatching (CSS hatching needs gradients), background or mask images, and `clip-path` (option C used it; the guard does not check it today and needs a check added).
- Icons, emoji, illustrations, decorative shapes, and colour added only for variety.
- Arrows other than ← → ↑ ↓ (U+2190 to U+2193). ↔ (U+2194) and ▶ (U+25B6) fail the site's emoji rule.
- Round markers, pills, and any radius on a part.
- Solid `--primary` fills (reserved for the one filled button per view) and 2px primary outlines (the focus ring).
- Amber as text or as a line: `--accent` is 1.76:1 on white. It appears only as the `--dg-medium` fill behind ink text.
- `--borderCard` (1.24:1) as a line that means something.
- Pass and fail colours for anything other than accept and reject. Rose and amber for anything other than risk level.
- Colour as the only carrier of any fact (WCAG 1.4.1).
- Text set in mono, text below 13px, and labels that need a key to decode (numbered callouts).
- Motion.

## Rules for writers

These rules follow the approach the request named from the Kubernetes documentation's diagram guide (one idea per figure, placed next to its text, labels inside, cut what the figure replaces). That guide was not re-read for this spec, and the rest is craft opinion.

1. Draw a diagram only when the idea is a position, a containment, a sequence in time, or two crossed axes. Definitions, lists and single facts stay as text.
2. One idea per figure. If the caption title needs "and" to join two ideas, split the figure or cut one idea.
3. Place it directly after the paragraph that introduces the idea, inside the same section. Not before the text that names its parts, and never inside What changed, Experts disagree or Sources.
4. Use the page's own example and the page's own words. Labels match the prose exactly (the bands say Reject and Accept because the table says Reject and Accept).
5. Put labels inside the figure, on or next to the part they name. A legend is allowed only for marker shapes, with at most two entries.
6. Keep labels to one to three words. Write numbers as digits.
7. Write the caption as set out in Captions above.
8. Cut the sentences the figure replaces: a sentence that only describes what the figure shows goes, but only if the figure's own text tells a screen reader the same thing. Keep sentences that explain why. For example, the risk page's "a grid with likelihood on one side and impact on the other" can go; "Run checks for the highest risks first" stays.
9. Say when data is an example ("example ratings"). Never invent precise numbers the sources do not give; widths and levels that are illustrative say so.
10. Prefer one figure per section.
11. Before publishing, check the page at 360 px. If a label wraps past two lines, shorten it.

## Open items

- Built, nothing open: the three fixes from the 2026-11-28 review. Paired blocks switch paddings at 40.75rem, stacked timeline rows sit 12px apart with names and outcomes 4px from their bars, and group heads share a line down to 8.5rem.
- Tests (owner to be assigned): the SVG allowance and its plants.
- Sourced (plan section 2): ISTQB publishes no 3 by 3 mapping, so the mapping and the two placements (a double charge rated medium likelihood and high impact, the receipt layout medium likelihood and low impact) are examples, and the note says so. The Risk-based testing page does not state them.
- Sourced (plan section 2): the test-doubles cells follow Meszaros. A spy and a mock are Can under "Returns prepared answers", and a mock is No under "Stores calls for the test". Fowler differs on the spy, which the note says. The two also differ on whether a dummy is a test double: the page does not say so yet, and the writer adds it with the figure.
- Sourced (plan section 2): under pytest-xdist a session-scoped fixture runs once per worker, so the "pytest with xdist" lane stays. The worker bars hold only while no test fails, and the note says none fails.
- iko-flow: build "Timeline with states" (A) as a timeline with a state strip in place of the group heads, and "Risk matrix axis names" (B) on the levels matrix. Both sections hold the parts, gaps, narrow layouts and hidden text.
- Writer: confirm the test levels price example, the words under each level, the intro and the trimmed list against the page's source. iko-flow builds the growing pictures (A) as a new kind once the current branch lands.
- Writer: the words in "Timeline with states", hidden text included, come from the Assertions that retry page and its example code. Confirm them against that page.
- Writer: the Why we test page also uses booking cutoffs. The price example changes only the Test levels page, so decide whether the two pages should share one example.
- Not yet tested with real learners.
