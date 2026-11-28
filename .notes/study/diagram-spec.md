# Visual spec: Study diagrams (B2, tinted and calm)

Decided on 2026-11-28. Kingsley picked option B (tinted) over the recommended option A, said B felt too busy, and allowed inline SVG inside Study diagrams only. B2 is B with fewer lines, colours and labels, and more space. It is a mockup: nothing is built into the site yet.

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
    <span class="title">Partitions and boundary values</span>
    <span class="note">Each band is the expected result. The rule changes at the lines.</span>
  </figcaption>
  <!-- the diagram as real HTML: a table, lists or labelled blocks -->
</figure>
```

- `data-diagram` names the kind: `layer-stack`, `number-line`, `matrix` (risk levels or yes/no answers), `timeline` and `blocks`, and later kinds as they are specified. (The first B2 mockup used older names, `test-shapes` and `risk-matrix`; these names replace them.) The diagram tokens are scoped to `figure[data-diagram]`.
- A timeline or blocks figure carries a visually hidden description after the figcaption that states in words what position, length or containment shows. A matrix needs none: the table is the structured version.
- The figure is a card (`data-card`: white surface, 1px `borderCard`, 10px radius). It is the only rounded thing in a diagram.
- Narrow layouts switch on the figure's own width (a container query at 34rem, 544px), not the viewport, so a figure in a narrower column behaves the same.
- Everything a sighted reader learns from the picture must be in the figure's text for a screen reader. Filled and hollow boxes are visual only, so each boxed value needs a visually hidden label, such as "9, 2-value check". iko-flow owns that markup.

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
| Reject | #BE123C on #FAECEF | 5.47 |
| Accept | #0F766E on #ECF4F3 | 4.90 |
| 2-value numeral | #FFFFFF on #101A33 | 17.24 |
| 3-value numeral | #101A33 on #FFFFFF | 17.24 |
| Level word, Low / Medium / High | #101A33 on #F5F7FC / #FFEACB / #F7E0E6 | 16.09 / 14.68 / 13.76 |
| Risk item on Low, No answer | #55607A on #F5F7FC | 5.86 |
| Risk item on Medium | #55607A on #FFEACB | 5.35 |
| Risk item on High | #55607A on #F7E0E6 | 5.01 |

Graphics that carry meaning (needs 3:1):

| Part | Colour against white | Ratio |
|---|---|---|
| Bar, timeline bar and box edge (`--dg-part-edge`, 1px) | #6A8BE5 | 3.26 |
| Boundary and moment line (`--dg-edge`, 2px) | #55607A | 6.28 |
| Arrow glyph ↓ between blocks | #55607A | 6.28 |
| 2-value box, legend square | #101A33 | 17.24 |
| 3-value box edge (2px), legend square | #101A33 | 17.24 |

Fills that carry no meaning on their own (no 3:1 needed): band fills (#FAECEF 1.14, #ECF4F3 1.11 against white), matrix cells (Low 1.07, Medium 1.17, High 1.25), bar and part fills (1.14, 1.28), white parts inside a strong box (1.28 against it) and yes/no answer cells (No 1.07, Yes and Can 1.14). Every one of them has a written word or a 3:1 line that says the same thing: the band label and the boundary lines, the level word or answer in every cell, the edge of the bar or box, the part's own label. The W3C's Understanding page for SC 1.4.11 says a graphic is not "required for understanding" when text in or on it conveys the same information. These fills may never be the only carrier of anything.

The measuring script also flags some pairs as failing that are not real failures, and they are left out of the tables above: the empty legend squares (no text, `aria-hidden`), the risk items' "box" (B2 items have no box, so the script compares a fill with itself, 1.00), the empty corner cell of the yes/no matrix, and the fills listed above.

## Parts per diagram

### Layer stack (test shapes)

- Centred bars, top to bottom from broad tests to narrow ones, all three shapes on one width scale (the column, at most 16rem).
- Bar: `--dg-part` fill, 1px `--dg-part-edge`, 0 radius, at least 32px tall, 4px by 8px padding, label centred.
- The widest layer of each shape: `--dg-part-strong` and bold. Width already shows it; the bold is the non-colour signal.
- A bar never gets narrower than its longest word. Keep compound terms whole: write End‑to‑end with non-breaking hyphens (U+2011).
- Widths show emphasis, not measured data. The caption says so.

### Number line

- A legend first, with exactly two entries: filled square for 2-value BVA, hollow square for 3-value BVA adds.
- Row 1: one band per partition, `--dg-accept-*` or `--dg-reject-*`, no border, at least 32px tall, label one word that matches the page's "Expected result" column. 4px gap at each band end.
- Row 2: every value as a number, 13px, `--text2`. Checked values sit in a 26px square in their own place on the row: filled `--dg-mark` with a white bold numeral for 2-value, a 2px `--dg-mark` edge with an ink bold numeral for 3-value adds.
- A 2px `--dg-edge` line where the rule changes, through both rows. The line, not the fills, shows where a partition ends.
- No row labels, no tick marks, no axis line: the numbers in order are the scale.

### Matrix (risk, and any two-axis grid)

- A real table. Axis names in small caps: the column axis above the column heads, the row axis in the corner above the row heads. Highest likelihood at the top.
- Cells: tinted blocks 4px apart (`border-spacing`), no grid lines, 8px padding, at least 84px tall.
- Every cell writes its level in ink, 14px medium; High is bold. Example items go under the level word in 13px `--text2`, with no box.
- Shading runs `--dg-low`, `--dg-medium`, `--dg-high` only. A grid with no levels (such as level by size) keeps every cell `--dg-low`.

### Yes/no matrix (a matrix with a word in every cell)

Sample: the five test doubles against four questions.

- A real table: one row per item, one column per question. Every cell holds a word: Yes, No, or one qualified word (Can) that the caption note defines. Never a tick, a cross or an empty cell.
- Yes: `--dg-part` fill, ink, bold. Can: `--dg-part` fill, ink, regular. No: `--dg-low` fill, `--text2`, regular. Words centred. The fill only helps the eye find the yeses; the word carries the answer.
- Row heads are the items, 14px medium ink, left aligned. Column heads are the questions, 13px medium `--text2`, centred, bottom aligned, wrapping at spaces. The corner cell stays empty and unfilled.
- Cells 4px apart, 8px padding, at least 44px tall. No grid lines.
- Questions use the page's verbs ("Returns prepared answers", "Stores calls"), at most five words each.

### Timeline

Samples: a fixed pause against a condition wait (waiting and synchronisation), and fixture lifetimes per scope (fixtures and setup).

- One time scale per figure, shared by every lane, running left to right at every width. Below 34rem the bars get shorter; the layout does not turn.
- A row has a name in the left column, its bars, and an optional outcome. The name is 13px medium ink, with an optional second line in `--text2` for a tool or a qualifier ("Playwright", "pytest with xdist"). The outcome is one to three words in 13px `--text2`, placed right after the bar it describes ("Wastes time", "Too short").
- Bar: `--dg-part` fill, 1px `--dg-part-edge` (its length carries meaning), 0 radius, at least 32px tall, 2px clear at each end, no text inside. The one recommended or emphasised row gets `--dg-part-strong` and a bold row name.
- A lane groups rows under a 14px medium heading ("Fast run"). Lanes sit 24px apart, rows 8px apart.
- A moment is a 2px `--dg-edge` line through all of its lane's rows, labelled at the top in 13px medium `--text2` ("App ready"). The label sits on the side of the line with more room: after it, or before it when the line is past the middle.
- Optional header rows: group heads over a range of columns ("Worker 1"), tick heads under them (1, 2, 3, 4), and the tick axis name in small caps in the name column ("Test"). Groups that run at the same time are separated by a 16px gap column, so their bars never touch.
- When the scale is time, one axis name "Time →" in small caps sits under the last lane, right aligned. No durations, no tick values in milliseconds, no grid lines.

### Blocks

Samples: browser contexts over a shared database (test independence), and tests with and without a page object (page object model).

- Box: anything whose boundary means something (a test, a database, a page object). White fill, 1px `--dg-part-edge`, 0 radius, 12px padding, title inside at the top in 14px medium ink.
- Part: a thing inside a box. `--dg-part` fill, no border, 8px by 12px padding, name 13px medium ink, then its items in 13px `--text2`, one per line, no bullets.
- Strong: one kind of thing per figure, the one the idea is about. A strong box (the shared database) gets `--dg-part-strong` and a bold title, and its parts turn white. A strong part (the copied locator) gets `--dg-part-strong` and bold text.
- Boxes in a row are equal columns 16px apart. A box below a row spans all of its columns, so sharing shows as width.
- Arrows: ↓ (U+2193) or → (U+2192) in `--text2` at 16px, one per source column, centred, between neighbours only. Arrows are `aria-hidden`; the description states the relation.
- Before and after: two panels side by side, 32px apart, before on the left. Each panel has a 14px medium heading and ends with a result line in 16px bold ink ("3 edits", "1 edit"), aligned across the two panels.
- Nesting stops at a part inside a box. A box inside a box (the test levels figure) is not drawn yet and needs its own mockup.

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
| Matrix cells | 4px apart, 2px under 34rem |
| Yes/no cells | At least 44px tall; 36px under 34rem |
| Timeline name column | 9.5rem; 5.25rem under 34rem |
| Timeline rows and lanes | Rows 8px apart, lanes 24px apart, bars at least 32px tall |
| Blocks | Columns 16px apart (8px under 34rem); box padding 12px (8px); part padding 8px by 12px (4px); arrows in their own 8px-spaced row |
| Before and after panels | 32px apart; 24px when stacked; result line 16px below the drawing |
| Radius | 10px on the figure card, 0 on every part |
| Line weights | 1px (part edges) and 2px (boundaries, connectors, hollow markers). No others. |

## Captions

- The title states the one idea, sentence case, at most seven words, no full stop. No "Figure 1", no "Diagram of", no "This shows".
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
| Layer stack | The three shapes stack, each with its name above and the same 16rem scale. |
| Number line | Two segments of six values, one around each edge (7 to 12 and 18 to 23), headed Lower edge and Upper edge, each with its own two bands and boundary line. The legend stays on top. |
| Matrix | The first column narrows to 3.25rem, cell gaps to 2px, cell padding to 4px, and level words to 13px. Columns size to their longest word. The Likelihood label may extend into the empty space above the first column of cells instead of widening the grid. If text still does not fit, the table scrolls inside its own box rather than spilling. |
| Yes/no matrix | A second rendering, turned: the items become the columns (13px medium ink) and each question heads its own row of answers (13px medium `--text2`, left aligned, a `th scope="rowgroup"`). Columns size to their words; cells 2px apart with 4px by 2px padding. Only one rendering is visible at a time, as with the number line. |
| Timeline | Same layout: the name column narrows to 5.25rem, names and outcomes wrap to two lines, bars get shorter. Time still runs left to right. |
| Blocks | Rows keep their columns side by side (two or three). Gaps, box padding and part padding shrink as in the spacing table. A before and after pair stacks, before first, each panel with its own result line. |

Measured on 2026-11-28: no part overflows its box at 1280, 360 or 320 px, and nothing overflows with the SC 1.4.12 text-spacing overrides on at 1280 and 360 px. The one exception is 320 px with those overrides on, where the risk matrix scrolls 26px inside its box. The timeline, blocks and yes/no matrix figures do not overflow or scroll at any of the three widths, with or without the overrides. No figure ever widens the page.

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

- iko-flow: add the tokens to `src/styles/tokens.css`, build the parts as components, and give boxed values and other visual-only marks their screen-reader text.
- Tests (owner to be assigned): the SVG allowance and its plants, a `clip-path` check, and a contrast unit test for the new token pairs.
- Writer: the matrix placements (a double charge rated medium likelihood and high impact, the receipt layout medium likelihood and low impact) and the 3 by 3 level mapping are placeholders. The Risk-based testing page does not state them.
- Writer: every test-doubles cell is a placeholder until checked against Meszaros and Fowler, in particular Can for a spy and a mock under "Returns prepared answers" and Yes for a mock under "Stores calls". The four questions are the designer's reading of the page's list.
- Writer: the fixtures figure draws a pytest session-scoped fixture once per worker under pytest-xdist, and labels that lane "pytest with xdist". That comes from the plan's note and is not sourced yet. If the sources do not support it, drop the lane or draw one bar across all four tests for a run without xdist.
- iko-flow: the plan's data sketches need these fields to draw what the mockups show. Timeline: rows inside a lane (name, second line, bars, strong, outcome), a moment per lane with its label side, optional group and tick header rows, and a gap between groups that run at the same time. Blocks: box, part, strong, items, a row of arrows, and a before and after pair with a result line per panel. Matrix: a cell kind for yes/no answers, and the turned rendering below 34rem.
- A box inside a box (the test levels figure: component inside component integration inside system, with acceptance around them) has no mockup yet.
- Not yet tested with real learners.
