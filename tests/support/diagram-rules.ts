/**
 * Authoring rules per diagram kind (diagram spec, Parts per diagram and Rules for writers), checked from
 * the page file and independently of the collection schema. The schema checks that the data holds
 * together; these check the words against the spec and the page.
 */

type Data = Record<string, unknown>;
type Rule = (diagram: Data, body: string) => string[];

const list = <Item>(value: unknown) => (Array.isArray(value) ? value as Item[] : []);
const wordsIn = (text: unknown) => String(text).split(/\s+/).filter(Boolean).length;
/** Words and numbers of the page body, as the reader sees them. */
const bodyTokens = (body: string) => new Set(body.match(/[\p{L}\p{N}]+/gu) ?? []);

/** Labels are one to three words (spec, rule 6), unless the kind says otherwise. */
const tooLong = (label: unknown, what: string, limit = 3) =>
  (wordsIn(label) > limit ? [`${what} "${String(label)}" has ${wordsIn(label)} words; write at most ${limit}`] : []);

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
  ...[columnAxis, rowAxis].flatMap((axis) => (axis === undefined ? [] : tooLong(axis, 'axis name'))),
  ...list<Data>(placed).flatMap(({ label }) => tooLong(label, 'placed item')),
];

const rules: Record<string, Rule> = { 'number-line': numberLine, matrix };

/** Problems with one diagram's own words. `body` is the page body without its code fences. */
export const kindProblems = (diagram: Data, body: string) => rules[String(diagram.type)]?.(diagram, body) ?? [];
