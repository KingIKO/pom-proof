import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { kinds, root } from '../support/problems';

/**
 * The editorial format from .notes/editorial-why-rules.md: five `##` sections in order, numbered
 * steps under the answer each followed by its own indented **Why:** paragraph, an https link list
 * under Sources, and 250 to 500 words outside code blocks. The model is
 * content/editorials/renewal-crosses-midnight.md.
 */
const fixKinds = new Set(['code', 'sql', 'locator']);
const answerHeading = (kind: string | null) => (kind && fixKinds.has(kind) ? 'The fix' : 'The answer');
const headingsFor = (kind: string | null) => [
  'What is going on', answerHeading(kind), 'Why the tempting answer fails', 'What the interviewer listens for', 'Sources',
];
const minWords = 250;
const maxWords = 500;

interface Line { text: string; number: number; code: boolean }
interface Section { name: string; lines: Line[] }
interface EditorialCheck { kind: string | null; words: number; problems: string[] }

/** Body lines with their file line numbers, each marked when it belongs to a fenced code block. */
function bodyLines(body: string, firstLine: number): Line[] {
  let fence: { marker: string } | null = null;
  return body.split('\n').map((text, index) => {
    const number = firstLine + index;
    const marker = /^\s*(`{3,}|~{3,})(.*)$/.exec(text);
    if (fence) {
      if (marker && marker[1][0] === fence.marker[0] && marker[1].length >= fence.marker.length && !marker[2].trim()) fence = null;
      return { text, number, code: true };
    }
    if (marker) {
      fence = { marker: marker[1] };
      return { text, number, code: true };
    }
    return { text, number, code: false };
  });
}

/** Words a reader would count outside code blocks: link text without its URL, no list markers. */
function countWords(lines: Line[]) {
  return lines
    .filter(({ code }) => !code)
    .map(({ text }) => text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^\s*(?:\d+\.|[-*+])[ \t]+/, ''))
    .join('\n')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

const quoted = (names: string[]) => names.map((name) => `"${name}"`).join(', ');

/** Every way one editorial breaks the format, each message naming the line or section. */
function checkEditorial(source: string): EditorialCheck {
  const text = source.replace(/\r\n?/g, '\n');
  const problems: string[] = [];
  const frontmatter = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  let kind: string | null = null;
  if (frontmatter) {
    const problem = (parseYaml(frontmatter[1]) as { problem?: unknown } | null)?.problem;
    const candidate = typeof problem === 'string' ? problem.split('/')[0] : '';
    if ((kinds as string[]).includes(candidate) && /^[a-z-]+\/[a-z0-9-]+$/.test(String(problem))) kind = candidate;
  }
  if (kind === null) problems.push('frontmatter needs "problem: <kind>/<id>" with a known kind');

  const firstLine = frontmatter ? frontmatter[0].split('\n').length - (frontmatter[0].endsWith('\n') ? 1 : 0) + 1 : 1;
  const lines = bodyLines(frontmatter ? text.slice(frontmatter[0].length) : text, firstLine);

  // Sections by `##` heading outside code; text before the first heading has no section.
  const sections: Section[] = [];
  const preamble: Line[] = [];
  for (const line of lines) {
    const heading = line.code ? null : /^##[ \t]+(.+?)[ \t#]*$/.exec(line.text);
    if (heading) sections.push({ name: heading[1], lines: [] });
    else (sections.at(-1)?.lines ?? preamble).push(line);
  }
  const expected = headingsFor(kind);
  const found = sections.map(({ name }) => name);
  if (found.length === 0) problems.push('no ## headings');
  else if (found.join('\n') !== expected.join('\n')) problems.push(`## headings are ${quoted(found)}; expected ${quoted(expected)} in that order`);
  const strayLine = preamble.find(({ text: line }) => line.trim());
  if (strayLine) problems.push(`line ${strayLine.number}: text before "## ${expected[0]}"`);
  for (const section of sections) {
    if (expected.includes(section.name) && !section.lines.some(({ text: line }) => line.trim())) problems.push(`"## ${section.name}" is empty`);
  }

  // Numbered steps under the answer, each followed by exactly one **Why:** paragraph before the next step.
  const answer = sections.find(({ name }) => name === expected[1]);
  if (answer) {
    const steps = answer.lines
      .map((line, index) => ({ line, index, marker: line.code ? null : /^(\d+\.[ \t]+)\S/.exec(line.text) }))
      .filter((step): step is typeof step & { marker: RegExpExecArray } => step.marker !== null);
    if (steps.length === 0) problems.push(`no numbered step under "## ${expected[1]}"`);
    steps.forEach((step, position) => {
      const label = `step ${position + 1} (line ${step.line.number})`;
      if (/\*\*Why:\*\*/.test(step.line.text)) problems.push(`${label}: put **Why:** in its own paragraph under the step, not on the step line`);
      const end = steps[position + 1]?.index ?? answer.lines.length;
      const whys = answer.lines.slice(step.index + 1, end)
        .map((line, offset) => ({ line, before: answer.lines[step.index + offset] }))
        .filter(({ line }) => !line.code && /^\s*\*\*Why:\*\*/.test(line.text));
      if (whys.length === 0) {
        problems.push(`${label}: no **Why:** paragraph before ${steps[position + 1] ? 'the next step' : 'the end of the section'}`);
        return;
      }
      if (whys.length > 1) problems.push(`${label}: ${whys.length} **Why:** paragraphs; write one per step`);
      const [{ line, before }] = whys;
      const indent = step.marker[1].length;
      if (line.text.length - line.text.trimStart().length !== indent || before.text.trim() !== '') {
        problems.push(`line ${line.number}: the **Why:** for ${label} must be its own paragraph indented ${indent} spaces under the step`);
      }
      if (!/^\s*\*\*Why:\*\*[ \t]+\S/.test(line.text)) problems.push(`line ${line.number}: the **Why:** for ${label} has no reason after it`);
    });
  }

  // Sources: a list of `- [title](https://...)` items and nothing else.
  const sources = sections.find(({ name }) => name === 'Sources');
  if (sources) {
    const items = sources.lines.filter(({ text: line }) => line.trim());
    if (items.length > 0) {
      for (const item of items) {
        if (item.code || !/^- \[[^\]\n]+\]\(https:\/\/[^\s)]+\)$/.test(item.text.trimEnd())) {
          problems.push(`line ${item.number}: "${item.text.trim().slice(0, 80)}" is not a "- [title](https://...)" source item`);
        }
      }
    }
  }

  const words = countWords(lines);
  if (words < minWords || words > maxWords) problems.push(`${words} words outside code; write ${minWords} to ${maxWords}`);
  return { kind, words, problems };
}

const folder = join(root, 'content', 'editorials');
const files = readdirSync(folder).filter((file) => file.endsWith('.md')).sort();
const results = files.map((file) => ({ id: file.slice(0, -3), ...checkEditorial(readFileSync(join(folder, file), 'utf8')) }));

describe('editorial format', () => {
  it('finds the editorials and the model passes', () => {
    expect(files.length, 'no editorials under content/editorials').toBeGreaterThan(0);
    const model = results.find(({ id }) => id === 'renewal-crosses-midnight');
    expect(model, 'the model editorial renewal-crosses-midnight.md').toBeDefined();
    expect(model!.problems, 'the model editorial').toEqual([]);
  });

  it('every editorial names a problem of a known kind', () => {
    expect(results.filter(({ kind }) => kind === null).map(({ id }) => id)).toEqual([]);
  });

  // One test per kind, so each author can track their own kinds. Each failure lists every
  // non-conforming file with all of its problems.
  it.each(kinds)('%s editorials follow the format', (kind) => {
    const ofKind = results.filter((result) => result.kind === kind);
    expect(ofKind.length, `no ${kind} editorials`).toBeGreaterThan(0);
    const failing = ofKind.filter(({ problems }) => problems.length > 0);
    expect(
      failing.map(({ id, problems }) => `${id}: ${problems.join('; ')}`),
      `${ofKind.length - failing.length} of ${ofKind.length} ${kind} editorials conform`,
    ).toEqual([]);
  });
});

describe('the editorial format check catches planted mistakes', () => {
  const filler = (count: number) => Array.from({ length: count }, () => 'word').join(' ');
  type Parts = { kind?: string; going?: string; answer?: string; tempting?: string; listens?: string; sources?: string; headings?: string[] };
  const steps = [
    '1. Name the first cause in words.',
    '',
    '   **Why:** the first reason is a consequence.',
    '',
    '2. Name the second cause in words.',
    '',
    '   **Why:** the second reason is a cause.',
  ].join('\n');

  /** A conforming editorial with `words` words outside code, with any part replaced. */
  function editorial(parts: Parts = {}, words = 300) {
    const kind = parts.kind ?? 'diagnosis';
    const headings = parts.headings ?? headingsFor(kind);
    const bodies = [
      parts.going ?? 'The context paragraph.',
      parts.answer ?? steps,
      parts.tempting ?? 'The decoy fails for a reason.',
      parts.listens ?? 'A controlled experiment.',
      parts.sources ?? '- [Playwright: browser time zone](https://playwright.dev/docs/api/class-testoptions)',
    ];
    const build = (pad: string) => [
      `---\nproblem: ${kind}/planted\n---\n`,
      ...headings.map((heading, index) => `## ${heading}\n\n${index === 0 && pad ? `${pad}\n\n` : ''}${bodies[index] ?? 'Text.'}\n`),
    ].join('\n');
    const base = checkEditorial(build('')).words;
    return build(filler(Math.max(0, words - base)));
  }
  const problemsOf = (text: string) => checkEditorial(text).problems;

  it('accepts a conforming editorial for every kind, with the right answer heading', () => {
    for (const kind of kinds) expect(problemsOf(editorial({ kind })), kind).toEqual([]);
  });

  it('accepts the 250 and 500 word bounds, CRLF line endings, and code inside a step', () => {
    expect(checkEditorial(editorial({}, 250))).toMatchObject({ words: 250, problems: [] });
    expect(checkEditorial(editorial({}, 500))).toMatchObject({ words: 500, problems: [] });
    expect(problemsOf(editorial().replace(/\n/g, '\r\n'))).toEqual([]);
    const code = [
      '```ts',
      'export const f = () => 1;',
      '```',
      '',
      '1. Return the count.',
      '',
      '   ```ts',
      '   ## not a heading',
      '   2. not a step',
      '   ```',
      '',
      '   **Why:** a consequence.',
      '',
      '10. A tenth step.',
      '',
      '    **Why:** its paragraph sits under a four-character marker.',
    ].join('\n');
    expect(problemsOf(editorial({ kind: 'code', answer: code }))).toEqual([]);
  });

  it('reads the real model as conforming', () => {
    const model = checkEditorial(readFileSync(join(folder, 'renewal-crosses-midnight.md'), 'utf8'));
    expect(model.kind).toBe('diagnosis');
    expect(model.problems).toEqual([]);
  });

  it.each([
    ['a missing heading', { headings: headingsFor('diagnosis').filter((name) => name !== 'Why the tempting answer fails') }, /## headings are .*; expected .* in that order/],
    ['headings out of order', { headings: ['What is going on', 'The answer', 'What the interviewer listens for', 'Why the tempting answer fails', 'Sources'] }, /in that order/],
    ['an extra heading', { headings: [...headingsFor('diagnosis'), 'Notes'] }, /"Notes"; expected/],
    ['The fix in a diagnosis editorial', { headings: headingsFor('code') }, /"The fix", .*expected "What is going on", "The answer"/],
    ['The answer in a code editorial', { kind: 'code', headings: headingsFor('diagnosis') }, /expected "What is going on", "The fix"/],
    ['a misspelt heading', { headings: ['What is going on', 'The answer', 'Why the tempting answer fails', 'What the interviewer looks for', 'Sources'] }, /in that order/],
    ['an empty section', { listens: '' }, /"## What the interviewer listens for" is empty/],
    ['no numbered step', { answer: 'Name the cause in words.\n\n**Why:** a reason.' }, /no numbered step under "## The answer"/],
    ['a bulleted step', { answer: '- Name the cause.\n\n   **Why:** a reason.' }, /no numbered step/],
    ['a step inside a code block only', { kind: 'sql', answer: '```sql\n1. SELECT 1;\n```' }, /no numbered step under "## The fix"/],
    ['a step with no Why', { answer: steps.replace('   **Why:** the first reason is a consequence.', '   The first reason.') }, /step 1 \(line \d+\): no \*\*Why:\*\* paragraph before the next step/],
    ['a last step with no Why', { answer: steps.replace('   **Why:** the second reason is a cause.', '') }, /step 2 \(line \d+\): no \*\*Why:\*\* paragraph before the end of the section/],
    ['a plain Why without bold', { answer: steps.replace('**Why:** the first', 'Why: the first') }, /step 1 .*no \*\*Why:\*\* paragraph/],
    ['two Whys for one step', { answer: steps.replace('consequence.', 'consequence.\n\n   **Why:** another one.') }, /step 1 .*2 \*\*Why:\*\* paragraphs; write one per step/],
    ['a Why on the step line', { answer: '1. Name the cause. **Why:** a reason.\n\n   **Why:** a reason.' }, /not on the step line/],
    ['a Why with no blank line before it', { answer: steps.replace('in words.\n\n   **Why:** the first', 'in words.\n   **Why:** the first') }, /must be its own paragraph indented 3 spaces/],
    ['a Why that is not indented', { answer: steps.replace('   **Why:** the second', '**Why:** the second') }, /step 2 .*must be its own paragraph indented 3 spaces/],
    ['a Why with no reason', { answer: steps.replace('**Why:** the second reason is a cause.', '**Why:**') }, /step 2 .*has no reason after it/],
    ['a Why only inside a code block', { kind: 'code', answer: '1. Return the count.\n\n   ```ts\n   **Why:** in code\n   ```' }, /step 1 .*no \*\*Why:\*\* paragraph/],
    ['empty Sources', { sources: '' }, /"## Sources" is empty/],
    ['an http source', { sources: '- [Old page](http://example.com/docs)' }, /is not a "- \[title\]\(https:\/\/\.\.\.\)" source item/],
    ['a bare URL source', { sources: '- https://playwright.dev/docs/locators' }, /source item/],
    ['a sentence with a link instead of a list', { sources: 'See [Playwright locators](https://playwright.dev/docs/locators).' }, /source item/],
    ['two links in one item', { sources: '- [A](https://a.example/) and [B](https://b.example/)' }, /source item/],
    ['a source with trailing text', { sources: '- [A](https://a.example/), section 2' }, /source item/],
    ['a source inside a code block', { sources: '```\n- [A](https://a.example/)\n```' }, /source item/],
  ])('reports %s', (_name, parts, expected) => {
    const found = problemsOf(editorial(parts as Parts));
    expect(found.join('\n')).toMatch(expected);
  });

  it('reports text before the first heading', () => {
    const text = editorial().replace('## What is going on', 'An old summary line.\n\n## What is going on');
    expect(problemsOf(text).join('\n')).toMatch(/line 5: text before "## What is going on"/);
  });

  it('reports a missing or unknown problem kind', () => {
    expect(problemsOf(editorial().replace(/^---\nproblem: .*\n---\n/, '')).join('\n')).toMatch(/frontmatter needs "problem: <kind>\/<id>"/);
    expect(problemsOf(editorial().replace('problem: diagnosis/', 'problem: essay/')).join('\n')).toMatch(/with a known kind/);
  });

  it('reports 249 and 501 words, and does not count code, URLs or list markers', () => {
    expect(problemsOf(editorial({}, 249))).toEqual(['249 words outside code; write 250 to 500']);
    expect(problemsOf(editorial({}, 501))).toEqual(['501 words outside code; write 250 to 500']);
    // 249 prose words plus 300 words in a fence still fail.
    const fenced = editorial({ going: `The context paragraph.\n\n\`\`\`text\n${filler(300)}\n\`\`\`` }, 249);
    expect(problemsOf(fenced)).toEqual(['249 words outside code; write 250 to 500']);
    const longUrl = editorial({ sources: '- [A](https://a.example/one-two-three-four-five)' }, 300);
    expect(checkEditorial(longUrl).words).toBe(300);
  });

  it('names the file line of a misplaced Why', () => {
    const text = editorial({ answer: steps.replace('   **Why:** the second', '**Why:** the second') });
    const line = text.split('\n').findIndex((row) => row.startsWith('**Why:** the second')) + 1;
    expect(problemsOf(text)).toContain(`line ${line}: the **Why:** for step 2 (line ${line - 2}) must be its own paragraph indented 3 spaces under the step`);
  });
});
