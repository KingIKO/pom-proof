import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseAstro } from '@astrojs/compiler-rs';
import ts from 'typescript';
import { isMap, isPair, isScalar, isSeq, parseDocument, type Node as YamlNode } from 'yaml';
import { root } from './problems';

/** Frontmatter keys whose values are code or test data rather than prose; `code` holds question example variants. */
export const codeKeys = new Set([
  'implementation', 'fixture', 'schema', 'seed', 'alteredSeed', 'source', 'query', 'selector',
  'starters', 'solutions', 'args', 'expected', 'rows', 'code',
]);

/** Ranges [start, end) of a text that hold code. */
export type Ranges = Array<[number, number]>;
export const inside = (ranges: Ranges, index: number) => ranges.some(([start, end]) => index >= start && index < end);

export function lineAt(text: string, index: number) {
  let line = 1;
  for (let at = text.indexOf('\n'); at !== -1 && at < index; at = text.indexOf('\n', at + 1)) line += 1;
  return line;
}

/** Inline code spans (`code`, ``co`de``) in a stretch of Markdown or YAML text. */
export function inlineCode(text: string, offset = 0): Ranges {
  return [...text.matchAll(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g)].map((match) => [offset + match.index, offset + match.index + match[0].length]);
}

/** Fenced code blocks and inline code in a Markdown body starting at `offset`. */
export function markdownCode(body: string, offset: number): Ranges {
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

export function yamlScalars(yaml: string, file: string) {
  const document = parseDocument(yaml, { keepSourceTokens: false });
  if (document.errors.length) throw new Error(`${file} has invalid YAML: ${document.errors[0].message}`);
  const scalars: Array<{ value: unknown; start: number; end: number; keys: string[]; code: boolean }> = [];
  const visit = (node: YamlNode | null | undefined, keys: string[], code: boolean) => {
    if (!node) return;
    if (isScalar(node)) {
      if (node.range) scalars.push({ value: node.value, start: node.range[0], end: node.range[1], keys, code });
      return;
    }
    if (isMap(node)) {
      for (const pair of node.items) {
        if (!isPair(pair)) continue;
        const key = isScalar(pair.key) ? String(pair.key.value) : '';
        visit(pair.value as YamlNode, [...keys, key], code || codeKeys.has(key));
      }
      return;
    }
    if (isSeq(node)) for (const item of node.items) visit(item as YamlNode, keys, code);
  };
  visit(document.contents as YamlNode, [], false);
  return scalars;
}

/** Code ranges inside YAML text starting at `offset`: values under code keys, plus inline code in prose values. */
export function yamlCode(yaml: string, offset: number, file: string): Ranges {
  const ranges: Ranges = [];
  for (const { start, end, value, code } of yamlScalars(yaml, file)) {
    if (code) ranges.push([offset + start, offset + end]);
    else if (typeof value === 'string') ranges.push(...inlineCode(yaml.slice(start, end), offset + start));
  }
  return ranges;
}

export interface UiString { text: string; start: number }
const proseAttributes = new Set(['aria-label', 'title', 'placeholder', 'alt']);

/** Strings a visitor could see in an Astro file: template text, attribute values, and string literals. */
export function astroStrings(source: string, proseOnly = false): UiString[] {
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
    if (proseOnly && value.type === 'JSXAttribute'
      && !proseAttributes.has((value.name as { name?: string })?.name ?? '')) return;
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

/** Strings a visitor could see in a TSX or TS file: JSX text and string or template literals. */
export function tsxStrings(file: string, source: string, proseOnly = false): UiString[] {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const strings: UiString[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isLiteralTypeNode(node) || ts.isExternalModuleReference(node)) return;
    if (proseOnly && ts.isJsxAttribute(node) && !proseAttributes.has(node.name.getText(sourceFile))) return;
    if (proseOnly && ts.isTaggedTemplateExpression(node) && node.tag.getText(sourceFile) === 'String.raw') return;
    if (proseOnly && ts.isTemplateExpression(node)) {
      strings.push({
        text: node.head.text + node.templateSpans.map((span) => `TOKEN${span.literal.text}`).join(''),
        start: node.getStart(sourceFile),
      });
      node.templateSpans.forEach(({ expression }) => visit(expression));
      return;
    }
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      strings.push({ text: node.text, start: node.getStart(sourceFile) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return strings;
}

export function listFiles(folder: string, pattern: RegExp) {
  return readdirSync(join(root, folder), { recursive: true, encoding: 'utf8' })
    .filter((file) => pattern.test(file))
    .sort()
    .map((file) => relative(root, join(root, folder, file)).split(sep).join('/'));
}
