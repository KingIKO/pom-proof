import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseAstro } from '@astrojs/compiler-rs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { isMap, isPair, isScalar, isSeq, parseDocument, type Node as YamlNode } from 'yaml';
import { root } from '../support/problems';

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

/** Frontmatter keys whose values are code or test data rather than prose. */
const codeKeys = new Set([
  'implementation', 'fixture', 'schema', 'seed', 'alteredSeed', 'source', 'query', 'selector',
  'starters', 'solutions', 'args', 'expected', 'rows',
]);

/** Ranges [start, end) of a text that hold code. */
type Ranges = Array<[number, number]>;
const inside = (ranges: Ranges, index: number) => ranges.some(([start, end]) => index >= start && index < end);

function lineAt(text: string, index: number) {
  let line = 1;
  for (let at = text.indexOf('\n'); at !== -1 && at < index; at = text.indexOf('\n', at + 1)) line += 1;
  return line;
}

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

/** Inline code spans (`code`, ``co`de``) in a stretch of Markdown or YAML text. */
function inlineCode(text: string, offset = 0): Ranges {
  return [...text.matchAll(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g)].map((match) => [offset + match.index, offset + match.index + match[0].length]);
}

/** Fenced code blocks and inline code in a Markdown body starting at `offset`. */
function markdownCode(body: string, offset: number): Ranges {
  const ranges: Ranges = [];
  let fence: { marker: string; start: number } | null = null;
  let position = 0;
  for (const line of body.split('\n')) {
    const start = position;
    position += line.length + 1;
    const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (opening && opening[1][0] === fence.marker[0] && opening[1].length >= fence.marker.length && !line.trim().slice(opening[1].length).trim()) {
        ranges.push([offset + fence.start, offset + position]);
        fence = null;
      }
    } else if (opening) {
      fence = { marker: opening[1], start };
    } else {
      ranges.push(...inlineCode(line, offset + start));
    }
  }
  if (fence) ranges.push([offset + fence.start, offset + body.length]);
  return ranges;
}

/** Code ranges inside YAML text starting at `offset`: values under code keys, plus inline code in prose values. */
function yamlCode(yaml: string, offset: number, file: string): Ranges {
  const document = parseDocument(yaml, { keepSourceTokens: false });
  if (document.errors.length) throw new Error(`${file} has invalid YAML: ${document.errors[0].message}`);
  const ranges: Ranges = [];
  const visit = (node: YamlNode | null | undefined, code: boolean) => {
    if (!node) return;
    if (isScalar(node)) {
      if (!node.range) return;
      if (code) ranges.push([offset + node.range[0], offset + node.range[1]]);
      else if (typeof node.value === 'string') ranges.push(...inlineCode(yaml.slice(node.range[0], node.range[1]), offset + node.range[0]));
      return;
    }
    if (isMap(node)) {
      for (const pair of node.items) {
        if (!isPair(pair)) continue;
        const key = isScalar(pair.key) ? String(pair.key.value) : '';
        visit(pair.value as YamlNode, code || codeKeys.has(key));
      }
      return;
    }
    if (isSeq(node)) for (const item of node.items) visit(item as YamlNode, code);
  };
  visit(document.contents as YamlNode, false);
  return ranges;
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

interface UiString { text: string; start: number }

/** Strings a visitor could see in an Astro file: template text, attribute values, and string literals. */
function astroStrings(source: string): UiString[] {
  const { ast } = parseAstro(source) as { ast: unknown };
  const strings: UiString[] = [];
  const visit = (node: unknown, skip: boolean) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child, skip);
      return;
    }
    const value = node as Record<string, unknown> & { type?: string; start?: number };
    // Import paths and type-level strings are never shown.
    if (value.type === 'ImportDeclaration' || value.type === 'ExportAllDeclaration' || value.type === 'TSLiteralType') return;
    const element = value.type === 'JSXElement'
      ? ((value.openingElement as { name?: { name?: string } } | undefined)?.name?.name ?? '')
      : '';
    // CSS in <style> is not UI text, and its `!important` is not an exclamation.
    const inStyle = skip || element === 'style';
    if (!inStyle && typeof value.start === 'number') {
      if (value.type === 'JSXText' && typeof value.value === 'string') strings.push({ text: value.value, start: value.start });
      if (value.type === 'Literal' && typeof value.value === 'string') strings.push({ text: value.value, start: value.start });
      if (value.type === 'TemplateElement') {
        const cooked = (value.value as { cooked?: string } | undefined)?.cooked;
        if (cooked) strings.push({ text: cooked, start: value.start });
      }
    }
    for (const child of Object.values(value)) if (child && typeof child === 'object') visit(child, inStyle);
  };
  visit(ast, false);
  return strings;
}

/** Strings a visitor could see in a TSX file: JSX text and string or template literals. */
function tsxStrings(file: string, source: string): UiString[] {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const strings: UiString[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isLiteralTypeNode(node) || ts.isExternalModuleReference(node)) return;
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      strings.push({ text: node.text, start: node.getStart(sourceFile) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return strings;
}

/** Scans the UI strings of one source file, reporting the line each string starts on. */
function scanSource(file: string, source: string): Finding[] {
  const strings = file.endsWith('.astro') ? astroStrings(source) : tsxStrings(file, source);
  return strings.flatMap(({ text, start }) =>
    findIn(file, text, [], (index) => lineAt(source, start) + lineAt(text, index) - 1));
}

function listFiles(folder: string, pattern: RegExp) {
  return readdirSync(join(root, folder), { recursive: true, encoding: 'utf8' })
    .filter((file) => pattern.test(file))
    .sort()
    .map((file) => relative(root, join(root, folder, file)).split(sep).join('/'));
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
