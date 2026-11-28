/**
 * Authoring rules per diagram kind (diagram spec, Parts per diagram and Rules for writers), checked from
 * the page file and independently of the collection schema. The schema checks that the data holds
 * together; these check the words against the spec and the page.
 */

type Data = Record<string, unknown>;
type Rule = (diagram: Data, body: string) => string[];

const list = <Item>(value: unknown) => (Array.isArray(value) ? value as Item[] : []);
/** Words in a label. A closing letter or number, as in Order for Test A, only says which one, so it does not count. */
const wordsIn = (text: unknown) => String(text).trim().replace(/\s+(?:\p{L}|\d+)$/u, '').split(/\s+/).filter(Boolean).length;
/** Words and numbers of the page body, as the reader sees them. */
const bodyTokens = (body: string) => new Set(body.match(/[\p{L}\p{N}]+/gu) ?? []);

/** Labels are one to three words (spec, rule 6), unless the kind says otherwise. A label the figure leaves out is fine. */
const tooLong = (label: unknown, what: string, limit = 3) =>
  (label !== undefined && wordsIn(label) > limit ? [`${what} "${String(label)}" has ${wordsIn(label)} words; write at most ${limit}`] : []);

/** Band labels and checked values come from the page: each must appear in its body. */
const numberLine: Rule = ({ bands, twoValue, threeValue, segments }, body) => {
  const said = bodyTokens(body);
  const labels = new Set(list<Data>(bands).map(({ label }) => String(label)));
  return [
    ...[...labels].flatMap((label) => [
      ...tooLong(label, 'band label', 1),
      ...(said.has(label) ? [] : [`band label "${label}" is not a word in the body`]),
    ]),
    ...[...list<number>(twoValue), ...list<number>(threeValue)].flatMap((mark) =>
      (said.has(String(mark)) ? [] : [`checked value ${String(mark)} is not in the body`])),
    ...list<Data>(segments).flatMap(({ title }) => tooLong(title, 'segment title')),
  ];
};

/** A question may take five words (spec, Yes/no matrix); every other label takes three. */
const matrix: Rule = ({ kind, columns, entries, columnAxis, rowAxis, placed }) => [
  ...list<string>(columns).flatMap((column) => (kind === 'answers' ? tooLong(column, 'question', 5) : tooLong(column, 'column'))),
  ...list<Data>(entries).flatMap(({ head }) => tooLong(head, 'row')),
  ...[columnAxis, rowAxis].flatMap((axis) => tooLong(axis, 'axis name')),
  ...list<Data>(placed).flatMap(({ label }) => tooLong(label, 'placed item')),
];

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

/** A time scale is relative, so a written duration would read as a measured one. A row's `detail` line is not a label. */
const timeline: Rule = (figure) => {
  const ticks = (figure.ticks ?? {}) as Data;
  return [
    ...tooLong(ticks.name, 'tick name'),
    ...list<string>(ticks.labels).flatMap((label) => tooLong(label, 'tick')),
    ...list<Data>(figure.groups).flatMap(({ label }) => tooLong(label, 'group')),
    ...list<Data>(figure.lanes).flatMap(({ name, mark, entries }) => [
      ...tooLong(name, 'lane'),
      ...tooLong((mark as Data | undefined)?.label, 'mark'),
      ...list<Data>(entries).flatMap((entry) => [...tooLong(entry.name, 'row'), ...tooLong(entry.outcome, 'outcome')]),
    ]),
    ...(figure.steps === undefined ? [] : texts(figure).filter((text) => duration.test(text)).map((text) => `"${text}" gives a duration; a time scale is relative`)),
  ];
};

/** A panel's name is a heading, so it may be longer than a label. */
const blocks: Rule = ({ tiers, panels }) => [
  ...list<Data>(panels).flatMap(({ result }) => tooLong(result, 'result')),
  ...[tiers, ...list<Data>(panels).map((panel) => panel.tiers)].flatMap((drawing) => list<Data[]>(drawing)).flat().flatMap(({ title, parts, linkTo }) => [
    ...tooLong(title, 'box'),
    ...tooLong((linkTo as Data | undefined)?.label, 'link'),
    ...list<Data>(parts).flatMap(({ name, items }) => [...tooLong(name, 'part'), ...list<string>(items).flatMap((item) => tooLong(item, 'item'))]),
  ]),
];

const rules: Record<string, Rule> = { 'number-line': numberLine, matrix, timeline, blocks };

/** Problems with one diagram's own words. `body` is the page body without its code fences. */
export const kindProblems = (diagram: Data, body: string) => rules[String(diagram.type)]?.(diagram, body) ?? [];
