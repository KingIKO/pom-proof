import { markdownToMdast } from 'satteri';
import { astroStrings, inlineCode, lineAt, tsxStrings, yamlScalars } from './prose';

interface Unit {
  text: string;
  line: number;
  keys?: string[];
}

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  position?: { start: { line: number } };
};

const placeholder = 'TOKEN';
const markup = { features: { gfm: true } } as const;

function markdownText(node: MdNode): string {
  if (['inlineCode', 'link', 'linkReference', 'image', 'imageReference'].includes(node.type)) return placeholder;
  if (node.type === 'text') return node.value ?? '';
  if (node.type === 'break') return '\n';
  return node.children?.map(markdownText).join('') ?? '';
}

function markdownUnits(body: string, firstLine: number): Unit[] {
  const units: Unit[] = [];
  const visit = (node: MdNode) => {
    if (node.type === 'paragraph') {
      units.push({ text: markdownText(node), line: firstLine + (node.position?.start.line ?? 1) - 1 });
    } else if (['root', 'list', 'listItem', 'blockquote'].includes(node.type)) {
      node.children?.forEach(visit);
    }
  };
  visit(markdownToMdast(body, markup));
  return units;
}

const frontmatter = /^(---\r?\n)(?:([\s\S]*?)\r?\n)?---(?:\r?\n|$)/;
const numberedSource = (keys: string[]) => keys.join('.') === 'items.lines.text';

export function contentUnits(file: string, source: string): Unit[] {
  const yamlOnly = /\.ya?ml$/.test(file);
  const header = yamlOnly ? null : frontmatter.exec(source);
  const yaml = yamlOnly ? source : header?.[2] ?? '';
  const yamlStart = header?.[1].length ?? 0;
  const fields = yamlScalars(yaml, file)
    .flatMap(({ value, start, keys, code }) => !code && !numberedSource(keys) && typeof value === 'string'
      ? [{ text: value, line: lineAt(source, yamlStart + start), keys }]
      : []);
  if (yamlOnly) return fields;
  const bodyStart = header?.[0].length ?? 0;
  return [...fields, ...markdownUnits(source.slice(bodyStart), lineAt(source, bodyStart))];
}

export function uiUnits(file: string, source: string): Unit[] {
  return (file.endsWith('.astro') ? astroStrings(source, true) : tsxStrings(file, source, true))
    .filter(({ text }) => /[\p{L}\p{N}]/u.test(text) && !/^\s*<!doctype html\b/i.test(text))
    .map(({ text, start }) => ({
      text: text.replace(/&(?:#(?:x[\da-f]+|\d+)|[a-z][a-z\d]+);/gi, ' '),
      line: lineAt(source, start),
    }));
}

export function normalizeProse(raw: string) {
  let text = raw.replace(/^\s*(?:(?:\d+[.)]|[-*+])\s+)?(?:(?:\*\*Why:\*\*|Why:)\s*)?/i, '');
  for (const [start, end] of inlineCode(text).reverse()) {
    text = text.slice(0, start) + placeholder + text.slice(end);
  }
  return text
    .replace(/!?\[[^\]\n]+\]\((?:[^()\n]|\([^()\n]*\))*\)/g, placeholder)
    .replace(/<?\b(?:https?:\/\/|www\.)[^\s<>"“”]+>?/gi, (url) =>
      placeholder + (url.endsWith('>') ? '' : url.match(/[.,!?;:)\]}]+$/)?.[0] ?? ''))
    .replace(/\s+/g, ' ')
    .trim();
}

export function sentencesOf(prose: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  for (const match of prose.matchAll(/[.!?]+["'’”)\]]*(?=\s+["'‘“(*_]*[\p{Lu}\p{N}])/gu)) {
    const end = match.index + match[0].length;
    if (/\b(?:e\.g|i\.e|etc|vs)\.$/i.test(prose.slice(start, end))) continue;
    sentences.push(prose.slice(start, end).trim());
    start = end;
  }
  if (prose.slice(start).trim()) sentences.push(prose.slice(start).trim());
  return sentences;
}

const countWords = (text: string) => text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

const fieldLimits: Record<string, number> = {
  oneLine: 2,
  trap: 2,
  'items.prompt': 2,
  looksFor: 1,
  'followUps.answer': 4,
  'items.choices.text': 2,
};

export const rules = ['semicolon', 'long sentence', 'long paragraph', 'field sentence limit'] as const;
type Rule = typeof rules[number];
export interface Finding { file: string; line: number; rule: Rule; detail: string }

export function scanProse(file: string, source: string) {
  const units = file.startsWith('src/') ? uiUnits(file, source) : contentUnits(file, source);
  let words = 0;
  let sentences = 0;
  const findings: Finding[] = [];
  for (const { text, line, keys } of units) {
    const prose = normalizeProse(text);
    const wordCount = countWords(prose);
    const split = sentencesOf(prose).filter((sentence) => countWords(sentence) > 0);
    words += wordCount;
    sentences += split.length;
    const add = (rule: Rule, detail: string) => findings.push({ file, line, rule, detail });
    for (const _ of prose.matchAll(/;/g)) add('semicolon', prose.slice(0, 100));
    for (const sentence of split) {
      const size = countWords(sentence);
      if (size > 25) add('long sentence', `${size} words: ${sentence.slice(0, 100)}`);
    }
    if (split.length > 5 || wordCount > 150) add('long paragraph', `${split.length} sentences, ${wordCount} words`);
    const field = keys?.join('.') ?? '';
    const limit = fieldLimits[field];
    if (limit !== undefined && split.length > limit) add('field sentence limit', `${field}: ${split.length} sentences, maximum ${limit}`);
  }
  return { words, sentences, findings };
}

export function enforcedFindings(findings: Finding[], prefixes: readonly string[]) {
  return findings.filter(({ file }) => prefixes.some((prefix) => file.startsWith(prefix)));
}
