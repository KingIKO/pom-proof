import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentUnits, enforcedFindings, normalizeProse, rules, scanProse, sentencesOf } from '../support/plain-language';
import { root } from '../support/problems';
import { listFiles } from '../support/prose';

const enforced: string[] = ['content/problems/', 'content/editorials/', 'content/questions/'];
const contentTypes = [
  ['problems', 'content/problems', /\.md$/],
  ['editorials', 'content/editorials', /\.md$/],
  ['questions', 'content/questions', /\.md$/],
  ['tracks', 'content/tracks', /\.ya?ml$/],
  ['UI', 'src', /\.(astro|tsx|ts)$/],
] as const;

const format = ({ file, line, rule, detail }: ReturnType<typeof scanProse>['findings'][number]) =>
  `${file}:${line} ${rule}: ${detail}`;

describe('plain-language rules', () => {
  it.each(contentTypes)('checks %s', (type, folder, pattern) => {
    const files = listFiles(folder, pattern);
    expect(files.length, `no files in ${folder}`).toBeGreaterThan(0);
    const results = files.map((file) => scanProse(file, readFileSync(join(root, file), 'utf8')));
    const findings = results.flatMap((result) => result.findings);
    const words = results.reduce((sum, result) => sum + result.words, 0);
    const sentences = results.reduce((sum, result) => sum + result.sentences, 0);
    expect(sentences, `no prose extracted from ${folder}`).toBeGreaterThan(0);
    const counts = rules.map((rule) => `${rule}=${findings.filter((finding) => finding.rule === rule).length}`).join(', ');
    const examples = findings.slice(0, 5).map(format);
    const average = sentences ? (words / sentences).toFixed(1) : 'n/a';
    console.log([
      `${type} (${files.length} files): ${counts}. Average: ${average} words per sentence.`,
      ...examples,
    ].join('\n'));
    expect(enforcedFindings(findings, enforced).map(format)).toEqual([]);
  });
});

describe('the plain-language scanner catches planted mistakes', () => {
  const words = (count: number) => Array(count).fill('word').join(' ');
  const body = (text: string) => scanProse('content/planted.md', text);
  const hits = (text: string) => body(text).findings.map(({ rule, line }) => `${rule}@${line}`);

  it('reports prose semicolons but skips those in code and URLs', () => {
    expect(hits('Check `x; y` and https://x.test/a;b. Report it; this one counts.')).toEqual(['semicolon@1']);
    expect(hits('See [the docs](https://x.test/a;b); then try the test.')).toEqual(['semicolon@1']);
  });

  it('counts code spans and links as one word at the sentence boundary', () => {
    expect(hits(`${words(23)} \`long code; with spaces\` [Read the docs](https://x.test/a(b)).`)).toEqual([]);
    expect(hits(`${words(24)} \`long code; with spaces\` [Read the docs](https://x.test/a(b)).`)).toEqual(['long sentence@1']);
    expect(hits(`${words(25)}.`)).toEqual([]);
  });

  it('reports more than five sentences or 150 words per paragraph', () => {
    const five = 'Check again. '.repeat(5).trim();
    expect(hits(five)).toEqual([]);
    expect(hits(`${five} Stop.`)).toEqual(['long paragraph@1']);
    expect(hits(`${words(150)}.`)).toEqual(['long sentence@1']);
    expect(hits(`${words(151)}.`)).toEqual(['long sentence@1', 'long paragraph@1']);
  });

  it('uses prose and source lines from Markdown and YAML without reading code, headings, or tables', () => {
    const source = [
      '---',
      'prompt: Read; then act.',
      'examples: [{ title: "An example; with a label", variants: [{ code: "Skip; me" }] }]',
      '---',
      '# Heading; ignored',
      '',
      'Another heading;',
      '----------------',
      '',
      'Header; one | Header; two',
      '--- | ---',
      'Body; one | Body; two',
      '',
      '10. Read the first line',
      '    and finish it.',
      '',
      '    ~~~ts',
      '    a(); b();',
      '    ~~~',
      '',
      '    **Why:** This still counts; it is prose.',
      '',
      '- Another step; check.',
    ].join('\r\n');
    const units = contentUnits('content/planted.md', source);
    expect(units.map(({ line }) => line)).toEqual([2, 3, 14, 21, 23]);
    expect(normalizeProse(units[3].text)).toBe('This still counts; it is prose.');
    expect(hits(source)).toEqual(['semicolon@2', 'semicolon@3', 'semicolon@21', 'semicolon@23']);
    expect(scanProse('content/tracks/plant.yaml', 'summary: "Ready; keep going."\nrows: ["Skip; me"]')
      .findings.map(format)).toEqual(['content/tracks/plant.yaml:1 semicolon: Ready; keep going.']);
    expect(hits('---\r\n---\r\nDone; check.')).toEqual(['semicolon@3']);
  });

  it('treats each list item as a prose unit', () => {
    const item = 'Read it. Try it. Check it.';
    expect(hits(`9. ${item}\n10. ${item}`)).toEqual([]);
    expect(hits(`9. ${item} ${item}\n10. ${item}`)).toEqual(['long paragraph@1']);
  });

  it('keeps line-marking source out and measures a wrapped YAML answer at its field line', () => {
    const source = [
      '---',
      'items: [{ lines: [{ id: l1, text: "a(); b();" }], choices: [{ text: "Check; repeat." }] }]',
      'followUps:',
      '  - answer: >-',
      `      ${words(15)}`,
      `      ${words(11)}.`,
      '---',
    ].join('\n');
    expect(hits(source)).toEqual(['semicolon@2', 'long sentence@4']);
  });

  it('strips ordered and bullet markers and the editorial Why label', () => {
    expect(normalizeProse('  10. **Why:** Check it.')).toBe('Check it.');
    expect(normalizeProse('- **Why:** Check it.')).toBe('Check it.');
  });

  it.each([
    ['Use e.g. POST here. Check again.', ['Use e.g. POST here.', 'Check again.']],
    ['Use i.e. That value, etc. Then compare X vs. Y. Stop.', ['Use i.e. That value, etc. Then compare X vs. Y.', 'Stop.']],
    ['Try 1.25 or v2.10.3. Compare with 3.4. Fix it.', ['Try 1.25 or v2.10.3.', 'Compare with 3.4.', 'Fix it.']],
    ['Try https://one.test/path?x=1. Then open https://two.test. Stop.', ['Try TOKEN.', 'Then open TOKEN.', 'Stop.']],
    ['Is it ready?\r\n`Check. No; skip.` says yes! Then run it.', ['Is it ready?', 'TOKEN says yes!', 'Then run it.']],
    ['Read “Is it ready?” Then check again.', ['Read “Is it ready?”', 'Then check again.']],
  ])('splits %s without breaking protected tokens', (text, expected) => {
    expect(sentencesOf(normalizeProse(text))).toEqual(expected);
  });

  it('checks the configured fields by YAML path', () => {
    const source = [
      '---',
      'oneLine: Read it. Read it. Read it.',
      'trap: Read it. Read it. Read it.',
      'looksFor: [Read it. Read it.]',
      'followUps: [{ question: Read it. Read it. Read it., answer: Read it. Read it. Read it. Read it. Read it. }]',
      'items: [{ prompt: Read it. Read it. Read it., choices: [{ text: Read it. Read it. Read it. }] }]',
      '---',
    ].join('\n');
    expect(body(source).findings.map(({ rule, detail }) => [rule, detail])).toEqual([
      ['field sentence limit', 'oneLine: 3 sentences, maximum 2'],
      ['field sentence limit', 'trap: 3 sentences, maximum 2'],
      ['field sentence limit', 'looksFor: 2 sentences, maximum 1'],
      ['field sentence limit', 'followUps.answer: 5 sentences, maximum 4'],
      ['field sentence limit', 'items.prompt: 3 sentences, maximum 2'],
      ['field sentence limit', 'items.choices.text: 3 sentences, maximum 2'],
    ]);
  });

  it.each([
    ['src/planted.astro', '<p class="button; hover" title="Run; check">Pass &amp; repeat.</p>'],
    ['src/planted.tsx', '<p style="color: red; padding: 0" aria-label="Run; check">Pass &amp; repeat.</p>'],
    ['src/engines/planted/grade.ts', 'export const result = { message: "Run; check" };'],
  ])('checks copy in %s', (file, text) => {
    expect(scanProse(file, text).findings.map(({ rule, line }) => [rule, line])).toEqual([['semicolon', 1]]);
  });

  it('counts a TypeScript template as one message, excluding embedded Python or HTML source', () => {
    const source = [
      'const python = String.raw`raise Error("Skip; this")`;',
      'const html = `<!doctype html><style>p { color: red; }</style>`;',
      `export const message = \`${words(24)} \${value} again.\`;`,
    ].join('\n');
    expect(scanProse('src/planted.ts', source).findings.map(({ rule, line }) => [rule, line])).toEqual([['long sentence', 3]]);
  });

  it('checks the actual SQL grader message with the TypeScript extractor', () => {
    const file = 'src/engines/sql/grade.ts';
    const text = readFileSync(join(root, file), 'utf8');
    const planted = text.replace("export const hiddenDatasetMiss = '", "export const hiddenDatasetMiss = 'Check; ");
    expect(scanProse(file, planted).findings).toContainEqual(expect.objectContaining({ rule: 'semicolon', line: 4 }));
  });

  it('fails only for findings under the chosen prefixes', () => {
    const a = scanProse('content/a/planted.md', 'Check; repeat.').findings;
    const b = scanProse('content/b/planted.md', 'Check; repeat.').findings;
    expect(enforcedFindings([...a, ...b], [])).toEqual([]);
    expect(enforcedFindings([...a, ...b], ['content/a/'])).toEqual(a);
  });
});
