import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { root } from '../support/problems';
import { astroStrings, inside, lineAt, listFiles, markdownCode, tsxStrings, yamlCode, type Ranges } from '../support/prose';

/**
 * The brief's prose rules: no em dashes, emoji, exclamation marks, or banned words in content
 * or UI text. Exclamation marks are allowed in code: Markdown code spans and fences, and the
 * frontmatter fields that hold source code, fixtures, SQL, or test data.
 */
type Rule = 'em dash' | 'emoji' | 'exclamation mark' | 'banned word';
interface Finding { file: string; line: number; rule: Rule; text: string }

const emDash = /\u2014/g;
// Same character classes as the rendered-page guard in tests/ui/slop-guard.spec.ts.
const emoji = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\u{FE0F}\u{20E3}]/gu;
// Each banned word with its inflections ("leveraging", "unlocked", "streamlined"), whole words only.
const banned = new RegExp(`\\b(?:${[
  'delv(?:e|es|ed|ing)', 'leverag(?:e|es|ed|ing)', 'unlock(?:s|ed|ing)?', 'tapestr(?:y|ies)', 'realms?',
  'seamless(?:ly)?', 'robust(?:ly|ness)?', 'pivotal(?:ly)?', 'harness(?:es|ed|ing)?',
  'empower(?:s|ed|ing|ment)?', 'streamlin(?:e|es|ed|ing)', 'game[- ]?changers?',
].join('|')})\\b`, 'gi');

function excerpt(text: string, index: number) {
  const start = text.lastIndexOf('\n', index) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? undefined : end).trim().slice(0, 120);
}

/** Runs every rule over `text`; `codeRanges` only exempts exclamation marks. */
function findIn(file: string, text: string, codeRanges: Ranges = [], lineOf = (index: number) => lineAt(text, index)): Finding[] {
  const found: Finding[] = [];
  const add = (rule: Rule, index: number) => found.push({ file, line: lineOf(index), rule, text: excerpt(text, index) });
  for (const match of text.matchAll(emDash)) add('em dash', match.index);
  for (const match of text.matchAll(emoji)) add('emoji', match.index);
  for (const match of text.matchAll(banned)) add('banned word', match.index);
  for (let index = text.indexOf('!'); index !== -1; index = text.indexOf('!', index + 1)) {
    if (!inside(codeRanges, index)) add('exclamation mark', index);
  }
  return found;
}

/** Scans one content file: YAML, or Markdown with optional YAML frontmatter. */
function scanContent(file: string, text: string): Finding[] {
  if (file.endsWith('.yaml') || file.endsWith('.yml')) return findIn(file, text, yamlCode(text, 0, file));
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  const ranges: Ranges = [];
  let bodyStart = 0;
  if (frontmatter) {
    const yamlStart = frontmatter[0].indexOf(frontmatter[1]);
    ranges.push(...yamlCode(frontmatter[1], yamlStart, file));
    bodyStart = frontmatter[0].length;
  }
  ranges.push(...markdownCode(text.slice(bodyStart), bodyStart));
  return findIn(file, text, ranges);
}

/** Scans the UI strings of one source file, reporting the line each string starts on. */
function scanSource(file: string, source: string): Finding[] {
  const strings = file.endsWith('.astro') ? astroStrings(source) : tsxStrings(file, source);
  return strings.flatMap(({ text, start }) =>
    findIn(file, text, [], (index) => lineAt(source, start) + lineAt(text, index) - 1));
}

const format = (findings: Finding[]) => findings.map(({ file, line, rule, text }) => `${file}:${line} ${rule}: ${text}`);

describe('prose rules', () => {
  const contentFiles = listFiles('content', /\.(md|ya?ml)$/);
  const sourceFiles = listFiles('src', /\.(astro|tsx)$/);

  it('content has no em dashes, emoji, exclamation marks, or banned words', () => {
    expect(contentFiles.length, 'no files under content/').toBeGreaterThan(0);
    const findings = contentFiles.flatMap((file) => scanContent(file, readFileSync(join(root, file), 'utf8')));
    expect(format(findings), `${findings.length} findings in ${contentFiles.length} content files`).toEqual([]);
  });

  it('UI strings in src have no em dashes, emoji, exclamation marks, or banned words', () => {
    expect(sourceFiles.filter((file) => file.endsWith('.astro')).length, 'no .astro files under src/').toBeGreaterThan(0);
    expect(sourceFiles.filter((file) => file.endsWith('.tsx')).length, 'no .tsx files under src/').toBeGreaterThan(0);
    const findings = sourceFiles.flatMap((file) => scanSource(file, readFileSync(join(root, file), 'utf8')));
    expect(format(findings), `${findings.length} findings in ${sourceFiles.length} source files`).toEqual([]);
  });
});

describe('the prose scanner catches planted mistakes', () => {
  const rules = (findings: Finding[]) => findings.map(({ rule, line }) => `${rule}@${line}`);

  it.each([
    ['an em dash in a body', '---\ntitle: Fine\n---\n\nFast \u2014 and free.\n', ['em dash@5']],
    ['an emoji in a title', '---\ntitle: Saved \u{1F389}\n---\n\nText.\n', ['emoji@2']],
    ['a check mark emoji', 'Status \u2714\uFE0F done.\n', ['emoji@1', 'emoji@1']],
    ['an exclamation mark in prose', 'Great work!\n', ['exclamation mark@1']],
    ['an exclamation mark in a prose field', '---\ntrap: Never do this!\n---\n\nText.\n', ['exclamation mark@2']],
    ['a banned word in any case', 'We Leverage retries.\n', ['banned word@1']],
    ['an inflected banned word', 'This streamlines checkout and unlocked accounts.\n', ['banned word@1', 'banned word@1']],
    ['a hyphenated banned word', 'A game-changer for tests.\n', ['banned word@1']],
  ])('reports %s', (_name, text, expected) => {
    expect(rules(scanContent('planted.md', text))).toEqual(expected);
  });

  it.each([
    ['inline code', 'Use `a !== b` here.\n'],
    ['double-backtick inline code', 'Use ``a !== `b` `` here.\n'],
    ['a fenced block', 'Text.\n\n```ts\nif (!user) return;\n```\n\nMore text.\n'],
    ['a tilde fence', '~~~\nwhile (!done) {}\n~~~\n'],
    ['a code field in frontmatter', '---\nimplementation: |\n  export const f = (a) => a !== 1;\nreference:\n  source: "x !== y"\n---\n\nText.\n'],
    ['inline code in a frontmatter prose field', '---\ntrap: Using `!important` everywhere.\n---\n\nText.\n'],
    ['code in vectors', '---\nvectors:\n  - { name: bang, args: ["!"], expected: "!" }\n---\n\nText.\n'],
    ['a word that only contains a banned word', 'The unrobustified harnessmaker realmy.\n'],
  ])('allows %s', (_name, text) => {
    expect(rules(scanContent('planted.md', text))).toEqual([]);
  });

  const example = (field: string) => `---\ntitle: Fine\nexamples:\n  - title: Refunds\n    variants:\n      - lang: ts\n${field}\n---\n\nText.\n`;

  it('allows an exclamation mark in example code', () => {
    const text = example('        label: Playwright Test (TypeScript)\n        code: |\n          if (!response.ok()) throw new Error("bad");\n          expect(a !== b).toBe(true);');
    expect(rules(scanContent('planted.md', text))).toEqual([]);
  });

  it.each([
    ['a banned word in example code', '        label: Playwright Test (TypeScript)\n        code: |\n          // leverage the fixture\n          if (!ok) return;', ['banned word@9']],
    ['an em dash in example code', '        label: pytest (Python)\n        code: |\n          # a — b', ['em dash@9']],
    ['an exclamation mark in an example label', '        label: Playwright Test!\n        code: |\n          x();', ['exclamation mark@7']],
  ])('reports %s', (_name, field, expected) => {
    expect(rules(scanContent('planted.md', example(field)))).toEqual(expected);
  });

  it('reports an exclamation mark in an example title', () => {
    const text = '---\nexamples:\n  - title: Refunds work!\n    variants:\n      - lang: sql\n        label: SQLite (SQL)\n        code: SELECT 1;\n---\n\nText.\n';
    expect(rules(scanContent('planted.md', text))).toEqual(['exclamation mark@3']);
  });

  it('still reports an exclamation mark after a closed fence', () => {
    expect(rules(scanContent('planted.md', '```\n!x\n```\nDone!\n'))).toEqual(['exclamation mark@4']);
  });

  it('reports UI text in Astro templates, attributes and scripts, but not code or styles', () => {
    const source = [
      '---',
      "const label = 'Saved!';",
      'const ok = !label;',
      '---',
      '<p title="Fast \u2014 free">Hello there!</p>',
      '{ok && <span>Run it now!</span>}',
      '<style>.x { color: red !important; }</style>',
      '<script>const message = `Done ${1}!`; if (!message) {}</script>',
    ].join('\n');
    expect(rules(scanSource('planted.astro', source)).sort()).toEqual([
      'em dash@5', 'exclamation mark@2', 'exclamation mark@5', 'exclamation mark@6', 'exclamation mark@8',
    ]);
  });

  it('reports UI text in TSX but not operators, comments or imports', () => {
    const source = [
      "import x from './banned-realm!';",
      '// Great comment!',
      'export function A({ busy }: { busy: boolean }) {',
      "  const note = busy ? 'Leverage this' : `Ready ${busy}!`;",
      '  return <p aria-label="Status \u{1F389}">{!busy && note} All done!</p>;',
      '}',
    ].join('\n');
    expect(rules(scanSource('planted.tsx', source)).sort()).toEqual([
      'banned word@4', 'emoji@5', 'exclamation mark@4', 'exclamation mark@5',
    ]);
  });
});
