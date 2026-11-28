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

Optional frontmatter `diagrams` in `src/content.config.ts`; schemas in new `src/lib/diagram-schema.ts`.

```ts
const base = {
  id: idSchema, title: textSchema, note: textSchema.optional(),
  description: z.union([textSchema, z.array(textSchema).min(1)]).optional(),
};
const diagram = z.discriminatedUnion('type', [
  z.strictObject({ ...base, type: z.literal('layer-stack'), shapes: z.array(z.strictObject({
    name: textSchema,
    layers: z.array(z.strictObject({ label: textSchema, width: z.number().int().min(1).max(5),
      widest: z.boolean().optional() })).min(2),
  })).min(1).max(3) }),
  z.strictObject({ ...base, type: z.literal('matrix'), columnAxis: textSchema.optional(),
    rowAxis: textSchema.optional(), columns: z.array(textSchema).min(2),
    entries: z.array(z.strictObject({ head: textSchema, cells: z.array(z.strictObject({
      text: textSchema, level: z.enum(['low', 'medium', 'high']).optional(),
      items: z.array(textSchema).optional() })) })).min(2) }),
  // number-line: min, max, bands[{from,to,label,kind: accept|reject}], twoValue[], threeValue[], segments[{title,from,to}]
  // timeline: ticks[{label}], groups[{label,from,to}]?, lanes[{name, spans[{label,from,to,strong?}], marks[{label,at}]}]
  // blocks: recursive {title, items[]?, children[]?, linkTo?: {label, target}}, rows for stacked layouts
]);
diagrams: z.array(diagram).min(1).max(2).optional()   // plus a unique-id refine
```

- `description` required except for `matrix` (the table is the structured equivalent); it states what position, width or length shows.
- Matrix key is `entries`, not `rows` (`rows` is a code key in `tests/support/prose.ts:9-11`).
- Diagram text gets plain-language rules with no test change. It does not count toward 200-450 words or `minutes`.

## 3. Components

`src/components/study/diagrams/`: `Diagram.astro` shell switching on `type`, one component per type. Styles `src/styles/diagrams.css` from the B2 block with new class names; `--dg-*` tokens in `src/styles/tokens.css` under `figure[data-diagram]`.

Shell: `<figure data-diagram={type} data-card>`, `<figcaption id>` first (title and note spans), then the description as `.visually-hidden` paragraph, then the drawing. `container-type: inline-size`, 34rem switch as a container query. `overflow-wrap: normal` inside the figure.

| Type | HTML | Accessibility |
|---|---|---|
| layer-stack | One block per shape: name, then `ol` of bars top to bottom, width from `width` | Each `ol` `aria-labelledby` its name; widest bar bold with hidden text |
| matrix | Real `table`, `th scope=col/row`, axis names, level word in every cell | `aria-labelledby` the figcaption; never `role="img"`; scrolls in its own box if needed |
| number-line | Two-entry legend `ul`, band row, `ol` of values, boundary lines as borders | Hidden labels such as "9, 2-value check"; narrow layout is a second rendering toggled with `display:none` |
| timeline | One block per lane: name, `ol` of spans on a shared grid, 2px lines for moments | Hidden start/end text per span; stacks below 34rem |
| blocks | Nested `div`/`ul`, 1px edge where extent matters, → or ↓ between neighbours | DOM order follows containment; arrows `aria-hidden` with relation in hidden text |

SVG exception (only if needed): one Astro component per drawing in `diagrams/svg/`, labels from frontmatter, colours only through classes in `diagrams.css` (no `fill`/`stroke`/`style` attributes), `vector-effect: non-scaling-stroke`, `aria-labelledby` the figcaption and description ids; unit test scans `diagrams/svg/*.astro` for hex colours, colour attributes and banned elements.

## 4. Guard and test changes

slop-guard:
- Skip an `svg` only when it matches `figure[data-diagram] > svg[role="img"][aria-labelledby]`, every id resolves to non-empty text in that figure, and it is the figure's only `svg`. Scan inside for gradients, `pattern`, `filter`, `mask`, `clipPath`, `image`, `foreignObject`, `use`, animation, `circle`, `ellipse`, `rx`/`ry`, `text` below 13px. Plants both ways. Lands with the first SVG.
- New `clip-path` rule: report any computed `clip-path` other than `none`, allowing `inset(50%)` on a box ≤1px (visually hidden pattern: `tokens.css:215`, `workspace.css:67`, `Base.astro:138`). Plants: `main { clip-path: inset(0) }` fails; a `.visually-hidden` span allowed.
- Study sample becomes `study/testing-foundations/test-shapes/`; page object keeps its a11y entry.

tokens-contrast: read the `figure[data-diagram]` block. Text pairs 4.5:1: `text` on `dg-part`, `dg-part-strong`, `dg-low`, `dg-medium`, `dg-high`; `text2` on `dg-part` (part items) and the three level fills; `dg-accept-text` on `dg-accept-bg`, `dg-reject-text` on `dg-reject-bg`; white on `dg-mark`. Graphic 3:1: `dg-part-edge`, `dg-edge`, `dg-mark` on `surface`. Plants: `dg-part-edge` mixed at 40%; `dg-medium` set to full `accent`.

study.test.ts `pageProblems`: unique slug ids, ≤2 per page; each id named by exactly one marker, each marker holds one listed id; marker inside one of the four sections, never directly after a heading; title ≤7 words, no full stop, no leading "Figure 1" label, no "Diagram of" or "This shows"; note ≤2 sentences; `description` unless matrix; no backticks in any diagram text. Plants for each; marker adds 0 to `bodyWords`; semicolon in a diagram `description` reported.

study.spec.ts: one `figure[data-diagram]` per entry, each a direct child of `.study-body` that follows body content other than a heading (the same rule as study.test.ts); caption matches frontmatter; no `language-diagram` left.

study-diagrams.spec.ts (scrollbars shown, text enlarged through the browser's default font size): at 1280, 1024, 768, 360 and 320 px no horizontal scroll and no figure part overflows; at those widths, at 360 and 320 px with 150% and 200% text, at 1280 px with 200% text or the SC 1.4.12 overrides, and at 320 px with both, nothing crosses the card edge and bars draw strictly in the order of their widths across the figure; bars with the same width draw equal, within the differences the spec accepts (1.8 px at 1024, 10 px at 1280 with 200% text, 3.3 px at 1280 with the overrides; not checked at 320 px with 200% text and the overrides together). Plants for each check, and a check that the scrollbar is showing.

a11y.spec.ts: test shapes page at desktop and 320 px.

## 5. Batch 1 content

| Page and placement | Figure | Sentences to cut | Writer must source |
|---|---|---|---|
| test-shapes, after What it is ¶1 | layer-stack. Pyramid: UI, Service, **Unit**. Trophy: End-to-end, **Integration**, Unit, Static. Honeycomb: Integrated, **Integration**, Implementation detail. | "The pyramid has a wide unit base and a narrow end-to-end top." and "The original pyramid puts service tests between…" | Layer names from Fowler, Dodds, Spotify. Prose says "end-to-end top", Cohn's label is UI: pick one. Note says widths are not measured. |
| test-levels-and-types, after the five-item list | blocks: Component inside Component integration inside System, arrow to Email provider labelled System integration, Acceptance around it | none | Whether ISTQB supports acceptance containing system; else draw beside |
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
