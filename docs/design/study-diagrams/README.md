# Study diagram options

Three styles for concept diagrams on the Study pages, each applied to the same three figures: the test shapes, the equivalence and boundaries number line, and the risk matrix. Every value comes from `src/styles/tokens.css`. The layer stack (test shapes), the timeline (waiting and synchronisation) and the blocks (page object model) are built in `src/components/study/diagrams/`.

Chosen on 2026-11-28: B, refined into B2 (tinted and calm) after Kingsley said B felt too busy. `spec.md` is the visual spec for B2; A, B and C are kept as the record of what was compared.

| Option | Look | Built with |
|---|---|---|
| A, outline | Pale grey parts with grey lines, one cobalt emphasis per figure | HTML and CSS boxes |
| B, tinted | Blue tints for neutral parts, the result colours (pass, fail, warn) for accept, reject and risk level | HTML and CSS boxes |
| C, drawn | Literal pyramid, trophy and honeycomb, a real axis line with brackets, a one-hue matrix with axis arrows, solid cobalt | HTML and CSS, shapes cut with `clip-path` (no SVG) |

## Files

- `option-a.html`, `option-b.html`, `option-c.html`: each option on a copy of the live Study page shell, with the real paragraph above and below each figure.
- `compare.html`: the three options side by side, one row per figure.
- `diagrams.css`: the figure styles for all three options. `specimen.css` only labels the excerpts.
- `site/` (not in the repo): the HTML links a snapshot of the live site's built CSS from 2026-11-28 in a `site/` folder, so the mockups matched the real page. It is mockup scaffolding and was left out when the folder was committed, so the HTML now shows the page shell unstyled. The PNGs are the record.
- PNGs: `option-{a-outline,b-tinted,c-drawn}-desktop.png` (1280 px wide), `option-…-360.png` (360 px wide), `compare-desktop.png` (1920 px wide).
- B2: `option-b2.html`, `compare-b-vs-b2.html`, `option-b2-desktop.png` (1280 px), `option-b2-360.png` (360 px), `compare-b-vs-b2.png` (1440 px). Its styles are the `[data-style="b2"]` and `.dg2-*` rules at the end of `diagrams.css`.
- More B2 kinds, drawn after Kingsley approved B2: `b2-timeline.html`, `b2-blocks.html` and `b2-yes-no-matrix.html` (real page text around each figure), with PNGs `b2-<kind>-desktop.png` (1280 px), `b2-<kind>-360.png` and `b2-<kind>-320.png`. `compare-timeline.html`, `compare-blocks.html` and `compare-yes-no-matrix.html` show each figure at the 738 px desktop column and at the 313 px and 273 px figure widths of 360 and 320 px phones, as `compare-<kind>.png` (1500 px). Their styles are the `.tl-*`, `.bk-*` and `.yn*` rules at the end of `diagrams.css`.
- `spec.md`: the B2 visual spec (tokens, measured contrast, type, spacing, narrow layouts, the SVG rule, banned items, rules for writers), now covering all five kinds.

To view the HTML, serve the folder over HTTP (`python -m http.server --directory docs/design 8765`) and open `http://localhost:8765/study-diagrams/compare.html`.

## Checks run on 2026-11-28

- The site's slop guard (`installGuard` from `tests/ui/slop-guard.spec.ts` at origin/main 975f06d) found 0 violations on all six specimen pages and on `compare.html`. The guard does not inspect `clip-path`, which option C uses on 10 parts.
- Contrast, measured from computed colours: every text pair is at least 4.5:1 and every meaningful line or fill edge at least 3:1 in all three options. The lowest graphic pairs are the risk item outline on a tinted cell, 3.08:1 in A and 3.06:1 in B.
- No figure spills out of its box at 1280, 360 or 320 px. With the WCAG 1.4.12 text-spacing overrides, A and B keep every label inside its part; the matrix scrolls inside its own box only at 320 px with the overrides on. Option C clips "Implementation detail" at 1280 px with the overrides on, and its matrix scrolls by 12 px at a plain 320 px.

B2, checked the same day on `option-b2.html` and `compare-b-vs-b2.html`:

- Slop guard: 0 violations on `option-b2.html` at 1280, 360 and 320 px, and on `compare-b-vs-b2.html` at 1440 px.
- Contrast: every text pair at least 4.5:1 (lowest: Accept, 4.90:1) and every meaningful line or marker at least 3:1 (lowest: the 1px bar edge, 3.26:1). Fills that only add to a written word or a line are below 3:1 by design; `spec.md` lists them and why.
- Reflow: nothing spills at 1280, 360 or 320 px, and nothing scrolls with the text-spacing overrides at 1280 and 360 px. At 320 px with the overrides on, the matrix scrolls 26 px inside its own box. The page never scrolls sideways.

Timeline, blocks and yes/no matrix, checked the same day on the three `b2-<kind>.html` pages and the three compare pages:

- Slop guard: 0 violations on each `b2-<kind>.html` at 1280, 360 and 320 px, and on each `compare-<kind>.html` at 1500 px.
- Contrast: every text pair at least 4.5:1 (lowest: part items, 5.51:1) and every meaningful line, edge or arrow at least 3:1 (lowest: the 1px bar and box edge, 3.26:1).
- Reflow: nothing spills or scrolls at 1280, 360 or 320 px, with or without the text-spacing overrides.
- The page object figure works as HTML blocks; it does not need SVG.

The test-doubles answers, the pytest-xdist session lane in the fixtures figure, the four test-doubles questions and the three tests in the page object figure are placeholders or examples for the writer to source or confirm.

The risk ratings in the matrix (a double charge rated medium likelihood and high impact, the receipt layout medium likelihood and low impact) and the 3 by 3 level mapping are examples. The page writer has to confirm them. The widths of the test shape layers show relative testing effort, as the page's sources describe it, and are not measured.
