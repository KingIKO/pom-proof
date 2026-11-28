/**
 * Authoring rules for the timeline and blocks kinds (diagram spec, Timeline, Blocks and Rules for
 * writers), checked from the page file and independently of the collection schema.
 */

type Data = Record<string, unknown>;
interface Range { from: number; to: number }

const list = <Item = Data>(value: unknown) => (Array.isArray(value) ? value as Item[] : []);

/** Words in a label. A closing letter or number, as in Test A, only says which one, so it does not count. */
const wordsIn = (text: unknown) => String(text).trim().replace(/\s+(?:\p{L}|\d+)$/u, '').split(/\s+/).filter(Boolean).length;
/** Labels are one to three words (spec, rule 6). Second lines, panel names and captions are not labels. */
const tooLong = (what: string, label: unknown) =>
  (label !== undefined && wordsIn(label) > 3 ? [`${what} "${String(label)}" has ${wordsIn(label)} words; write at most 3`] : []);

/** Every string in the data; `id`, `type` and `target` hold no words. */
function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === 'object') {
    return Object.entries(value).filter(([key]) => !['id', 'type', 'target'].includes(key)).flatMap(([, item]) => texts(item));
  }
  return [];
}

/** A length of time with its unit, such as 500 ms, 2s or 30-second. */
const duration = /\d[\s-]?(?:ms|milliseconds?|s|secs?|seconds?|mins?|minutes?|hours?)\b/i;

function timelineProblems(figure: Data): string[] {
  const ticks = (figure.ticks ?? {}) as Data;
  const labels = list<string>(ticks.labels);
  const end = labels.length || Number(figure.steps);
  const lanes = list(figure.lanes);
  const entries = lanes.flatMap((lane) => list(lane.entries));
  const outside = (what: string, { from, to }: Range) => [
    ...(to > from ? [] : [`${what} runs from ${from} to ${to}; end it after it starts`]),
    ...(from >= 0 && to <= end ? [] : [`${what} runs from ${from} to ${to}, outside 0 to ${end}`]),
  ];
  return [
    ...(end > 1 ? [] : ['a timeline needs steps or ticks']),
    ...(lanes.length && entries.length ? [] : ['a timeline needs a lane with a row']),
    ...tooLong('tick name', ticks.name),
    ...labels.flatMap((label) => tooLong('tick', label)),
    ...list<Data & Range>(figure.groups).flatMap((group) => [...tooLong('group', group.label), ...outside(`group "${String(group.label)}"`, group)]),
    ...lanes.flatMap(({ name, mark }) => {
      const { label, at } = (mark ?? {}) as Data;
      return [
        ...tooLong('lane', name),
        ...tooLong('mark', label),
        ...(mark && !(Number(at) >= 0 && Number(at) <= end) ? [`mark "${String(label)}" is at ${String(at)}, outside 0 to ${end}`] : []),
      ];
    }),
    ...entries.flatMap(({ name, outcome, spans }) => [
      ...tooLong('row', name),
      ...tooLong('outcome', outcome),
      ...(list(spans).length ? [] : [`row "${String(name)}" has no span`]),
      ...list<Range>(spans).flatMap((span) => outside(`a span of "${String(name)}"`, span)),
    ]),
    // Lengths on a time scale are relative. A written duration would read as a measured one.
    ...(figure.steps === undefined ? [] : texts(figure).filter((text) => duration.test(text)).map((text) => `"${text}" gives a duration; a time scale is relative`)),
  ];
}

function blocksProblems(figure: Data): string[] {
  const panels = list(figure.panels);
  const drawings = [figure.tiers, ...panels.map(({ tiers }) => tiers)].filter(Boolean).map((tiers) => list<Data[]>(tiers));
  const boxes = drawings.flat(2);
  return [
    ...(drawings.length === 1 && !panels.length || drawings.length === 2 && panels.length === 2 ? [] : ['blocks need tiers, or two panels']),
    ...panels.flatMap(({ name, result }) => [
      ...(result ? [] : [`panel "${String(name)}" needs a result`]),
      ...tooLong('result', result),
    ]),
    ...boxes.flatMap(({ title, parts, linkTo }) => [
      ...tooLong('box', title),
      ...tooLong('link', (linkTo as Data | undefined)?.label),
      ...list(parts).flatMap(({ name, items }) => [...tooLong('part', name), ...list<string>(items).flatMap((item) => tooLong('item', item))]),
    ]),
    // An arrow reaches the next box in the row, or a box that has the row below to itself.
    ...drawings.flatMap((drawing) => drawing.flatMap((row, tier) => row.flatMap(({ title, linkTo }, column) => {
      const target = (linkTo as Data | undefined)?.target;
      if (target === undefined) return [];
      const places = drawing.flatMap((boxesIn, y) => boxesIn.flatMap(({ id }, x) => (id === target ? [[y, x]] : [])));
      if (places.length !== 1) return [`"${String(title)}" links to "${String(target)}", which ${places.length} boxes have as their id`];
      const [y, x] = places[0];
      const beside = y === tier && x === column + 1;
      const under = y === tier + 1 && drawing[y].length === 1;
      return beside || under ? [] : [`"${String(title)}" links to "${String(target)}", which is not its neighbour`];
    }))),
    // Stacked, a row's arrows down stand under its last box, so they must come from all of it or from that box.
    ...drawings.flatMap((drawing) => drawing.flatMap((row, tier) => {
      const next = drawing[tier + 1]?.[0]?.id;
      const down = row.filter(({ linkTo }) => linkTo && next !== undefined && (linkTo as Data).target === next);
      return !down.length || down.length === row.length || down.length === 1 && row.at(-1) === down[0] ? []
        : [`${down.length} of ${row.length} boxes in a row link down; link from all of them or from the last one`];
    })),
  ];
}

const rules: Record<string, (figure: Data) => string[]> = { timeline: timelineProblems, blocks: blocksProblems };

/** Problems with one timeline's or blocks figure's own data. Other kinds have none here. */
export const timelineBlocksProblems = (figure: Data) => rules[String(figure.type)]?.(figure) ?? [];