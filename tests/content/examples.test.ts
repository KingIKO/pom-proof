import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { parse as parseJava } from 'java-parser';
import initSqlJs from 'sql.js';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseAllDocuments } from 'yaml';
import { root } from '../support/problems';
import { discoverQuestions, questionExamples, type DiscoveredQuestion } from '../support/questions';

/**
 * The phase 5 plan's example validation: a syntax check per language, layout rules for every
 * variant, and the topics and types that must carry an example. Shape rules (1 or 2 examples,
 * 1 to 3 variants, unique and allowed languages, labels) live in questions.test.ts.
 */

/** Unwrapped characters that fit in a question card at 1280px in 13px JetBrains Mono (phase 5 brief). */
const lineCap = 105;

interface Snippet { name: string; lang: string; code: string }

const questions = discoverQuestions();
const snippets: Snippet[] = questions.flatMap((question) => questionExamples(question).flatMap((example, index) =>
  (Array.isArray(example?.variants) ? example.variants : []).map((variant, position) => ({
    name: `${question.file} examples[${index}].variants[${position}] (${variant.lang})`,
    lang: String(variant.lang),
    code: String(variant.code ?? ''),
  }))));

// ----- layout -----

function layoutProblems(code: string): string[] {
  const found: string[] = [];
  code.split('\n').forEach((line, index) => {
    const at = `line ${index + 1}`;
    if (line.includes('\t')) found.push(`${at} has a tab; indent with spaces`);
    if (/[ \t]+$/.test(line)) found.push(`${at} has trailing whitespace`);
    const length = [...line].length;
    if (length > lineCap) found.push(`${at} is ${length} characters; the cap is ${lineCap}`);
  });
  return found;
}

// ----- TypeScript and JavaScript -----

function formatDiagnostic(diagnostic: ts.Diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  if (!diagnostic.file || diagnostic.start === undefined) return message;
  return `line ${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}: ${message}`;
}

/** Syntax errors, including TypeScript-only syntax in a js variant. */
function scriptSyntaxProblems(code: string, lang: 'ts' | 'js'): string[] {
  const { diagnostics = [] } = ts.transpileModule(code, {
    fileName: `snippet.${lang}`,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return diagnostics.map(formatDiagnostic);
}

/** A ts variant gets the full type check when every module it loads is @playwright/test. */
function importsOnlyPlaywright(code: string) {
  const modules = ts.preProcessFile(code, true, true).importedFiles.map(({ fileName }) => fileName);
  return modules.length > 0 && modules.every((name) => name === '@playwright/test');
}

const typeCheckOptions: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Force,
  lib: ['lib.es2023.d.ts', 'lib.dom.d.ts'],
  types: [],
};

/**
 * One program over every snippet, served from memory at paths inside the repository so
 * `@playwright/test` resolves from node_modules. Returns the problems per snippet name and the
 * program-wide diagnostics, which must be empty for the per-file results to mean anything.
 */
function typeCheck(list: Array<{ name: string; code: string }>) {
  const folder = join(root, '.example-type-check').replace(/\\/g, '/');
  const files = new Map(list.map(({ name, code }, index) => [`${folder}/snippet-${index}.ts`, { name, code }]));
  const host = ts.createCompilerHost(typeCheckOptions, true);
  const own = (path: string) => files.get(path.replace(/\\/g, '/'));
  const { fileExists, readFile, getSourceFile } = host;
  host.fileExists = (path) => Boolean(own(path)) || fileExists.call(host, path);
  host.readFile = (path) => own(path)?.code ?? readFile.call(host, path);
  host.getSourceFile = (path, version, ...rest) => {
    const file = own(path);
    return file ? ts.createSourceFile(path, file.code, version, true) : getSourceFile.call(host, path, version, ...rest);
  };
  const program = ts.createProgram([...files.keys()], typeCheckOptions, host);
  const results = new Map<string, string[]>();
  for (const [path, { name }] of files) {
    const source = program.getSourceFile(path);
    if (!source) throw new Error(`the type check did not load ${name}`);
    results.set(name, [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)].map(formatDiagnostic));
  }
  return { results, global: [...program.getOptionsDiagnostics(), ...program.getGlobalDiagnostics()].map(formatDiagnostic) };
}

// ----- Python -----

const pythonScript = `
import ast, json, sys
results = []
for name, code in json.loads(sys.stdin.buffer.read().decode("utf-8")):
    try:
        ast.parse(code, filename=name)
        results.append(None)
    except (SyntaxError, ValueError) as error:
        results.append(f"line {getattr(error, 'lineno', '?')}: {getattr(error, 'msg', error)}")
sys.stdout.write(json.dumps({"version": sys.version.split()[0], "results": results}))
`;

type Interpreter = { command: string; args: string[] };
const interpreters: Interpreter[] = [{ command: 'python3', args: [] }, { command: 'py', args: ['-3'] }];

/**
 * Parses every snippet with `ast.parse` in one Python process, trying each interpreter in turn.
 * Throws when none of them runs, naming what each attempt did.
 */
function pythonProblems(list: Array<{ name: string; code: string }>, candidates = interpreters) {
  const attempts: string[] = [];
  for (const { command, args } of candidates) {
    const run = spawnSync(command, [...args, '-I', '-c', pythonScript], {
      input: JSON.stringify(list.map(({ name, code }) => [name, code])),
      encoding: 'utf8',
      windowsHide: true,
      timeout: 60_000,
    });
    const label = [command, ...args].join(' ');
    if (run.error) {
      attempts.push(`${label}: ${(run.error as NodeJS.ErrnoException).code ?? run.error.message}`);
      continue;
    }
    if (run.status !== 0) {
      attempts.push(`${label}: exit ${run.status} ${(run.stderr || run.stdout).trim().slice(0, 200)}`);
      continue;
    }
    const output = JSON.parse(run.stdout) as { version: string; results: Array<string | null> };
    return {
      interpreter: `${label} (Python ${output.version})`,
      results: new Map(list.map(({ name }, index) => [name, output.results[index] ? [output.results[index]!] : []])),
    };
  }
  throw new Error(`no Python interpreter ran the example syntax check; tried ${attempts.join('; ')}`);
}

// ----- Java -----

/** java-parser's message, first two lines: where it stopped and what it expected. */
const javaError = (error: unknown) => String((error as Error).message ?? error)
  .replace(/^Sad sad panda, /, '').split('\n').slice(0, 2).map((part) => part.replace(/!$/, '').trim()).join(': ');

/**
 * Parses Java as written, then inside a class, then inside a class and a method. Import and
 * package lines move in front of the wrapper on line 1, so reported line numbers stay the same.
 */
function javaProblems(code: string): string[] {
  const lines = code.split('\n');
  const lifted = lines.map((line) => /^\s*(?:import|package)\s[^;]*;\s*$/.test(line));
  const header = lines.filter((_, index) => lifted[index]).join(' ');
  const body = lines.map((line, index) => (lifted[index] ? '' : line)).join('\n');
  const attempts: Array<[string, string]> = [
    ['as written', code],
    ['in a class', `${header} class Snippet { ${body}\n}`],
    ['in a class and method', `${header} class Snippet { void snippet() throws Exception { ${body}\n} }`],
  ];
  const errors: string[] = [];
  for (const [how, text] of attempts) {
    try {
      parseJava(text);
      return [];
    } catch (error) {
      errors.push(`${how}: ${javaError(error)}`);
    }
  }
  return [`does not parse as Java (${errors.join('; ')})`];
}

// ----- SQL -----

type SqlStatement = { step(): boolean };
type SqlIterator = { next(): IteratorResult<SqlStatement>; getRemainingSQL(): string };
type SqlDatabase = { iterateStatements(sql: string): SqlIterator; close(): void };
let sqlite: { Database: new () => unknown } | undefined;

type SqlScan = { end: number; unclosed?: { what: string; at: number } };

/**
 * Where the first statement of `sql` ends: just past its first semicolon outside strings, quoted
 * identifiers and comments, or at the end of input. A string, quoted identifier or block comment
 * left open runs to the end of input and comes back as `unclosed`; a line comment may end the
 * input. Every step moves the index forward, so the scan always stops, and `end` is at least 1
 * for any non-empty input.
 */
function statementEnd(sql: string): SqlScan {
  const quotes: Record<string, [string, string]> = {
    "'": ["'", 'string'], '"': ['"', 'quoted identifier'], '`': ['`', 'quoted identifier'], '[': [']', 'quoted identifier'],
  };
  let index = 0;
  while (index < sql.length) {
    const block = sql.startsWith('/*', index);
    const quote = quotes[sql[index]];
    if (quote || block) {
      const [close, what] = quote ?? ['*/', 'block comment'];
      const found = sql.indexOf(close, index + (block ? 2 : 1));
      if (found < 0) return { end: sql.length, unclosed: { what, at: index } };
      index = found + close.length;
    } else if (sql.startsWith('--', index)) {
      const found = sql.indexOf('\n', index + 2);
      if (found < 0) return { end: sql.length };
      index = found + 1;
    } else if (sql[index] === ';') {
      return { end: index + 1 };
    } else {
      index += 1;
    }
  }
  return { end: sql.length };
}

function lineOf(text: string, index: number) {
  return text.slice(0, index).split('\n').length;
}

/**
 * A string, quoted identifier or block comment that is never closed. SQLite rejects the first two
 * but reads a block comment to the end of input, which would hide the rest of an example.
 */
function unclosedSql(code: string): string[] {
  for (let offset = 0; offset < code.length;) {
    const { end, unclosed } = statementEnd(code.slice(offset));
    if (unclosed) return [`line ${lineOf(code, offset + unclosed.at)}: the ${unclosed.what} is not closed`];
    offset += end;
  }
  return [];
}

/**
 * Prepares and runs each statement in an empty in-memory database, so tables a snippet creates
 * exist for its later statements. "No such table" or "no such column" counts as a pass for that
 * statement (the snippet assumes a schema), and checking continues with the next one. `engine` is
 * passed in so the plants can run this in a worker thread.
 */
function sqliteProblems(code: string, engine: { Database: new () => unknown } | undefined): string[] {
  if (!engine) throw new Error('sql.js is not loaded');
  const db = new engine.Database() as SqlDatabase;
  try {
    let offset = 0;
    while (code.slice(offset).trim()) {
      const iterator = db.iterateStatements(code.slice(offset));
      try {
        for (let next = iterator.next(); !next.done; next = iterator.next()) {
          try {
            while (next.value.step()) { /* run to completion */ }
          } catch {
            // Runtime failures such as a constraint violation are not syntax problems.
          }
        }
        return [];
      } catch (error) {
        const rest = iterator.getRemainingSQL();
        const start = code.length - rest.length + (rest.length - rest.trimStart().length);
        const message = String((error as Error).message ?? error);
        if (!/^no such (?:table|column)\b/i.test(message)) return [`statement at line ${lineOf(code, start)}: ${message}`];
        // `rest` is a suffix of the text just tried and the scan of non-empty text returns at least 1,
        // so the offset moves forward or reaches the end.
        offset = code.length - rest.length + statementEnd(rest).end;
      }
    }
    return [];
  } finally {
    db.close();
  }
}

function sqlProblems(code: string, engine = sqlite): string[] {
  return [...sqliteProblems(code, engine), ...unclosedSql(code)];
}

// ----- YAML and JSON -----

function yamlProblems(code: string): string[] {
  const documents = parseAllDocuments(code);
  return Array.isArray(documents) ? documents.flatMap((document) => document.errors.map(({ message }) => message.split('\n')[0])) : [];
}

function jsonProblems(code: string): string[] {
  try {
    JSON.parse(code);
    return [];
  } catch (error) {
    return [String((error as Error).message)];
  }
}

// ----- Gherkin -----

type Examples = { line: number; columns: string[] | null; rows: number };
type Section = { kind: 'Background' | 'Scenario' | 'Scenario Outline'; line: number; steps: number; placeholders: Array<[string, number]>; examples: Examples[] };

const cellsOf = (row: string) => row.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim());

/**
 * A structural lint for one feature file: one named Feature first, steps only inside a Background
 * or Scenario, no scenario without steps, Background before scenarios, tags before a taggable
 * keyword, tables after a step or Examples with even rows, closed doc strings, outlines with
 * Examples, and every <placeholder> a column of each Examples table. Free text is allowed only as a
 * description straight after a keyword line.
 */
function gherkinProblems(code: string): string[] {
  const found: string[] = [];
  const add = (line: number, message: string) => found.push(`line ${line}: ${message}`);
  const sections: Section[] = [];
  let feature = 0;
  let section: Section | null = null;
  let examples: Examples | null = null;
  let table: { line: number; cells: number } | null = null;
  let docString: { fence: string; line: number } | null = null;
  let tags: number | null = null;
  let description = false;
  let afterStep = false;
  let level = { background: false, scenario: false };

  code.split('\n').forEach((raw, index) => {
    const n = index + 1;
    const line = raw.trim();
    if (docString) {
      if (line === docString.fence) docString = null;
      return;
    }
    if (!line || line.startsWith('#')) return;

    if (line.startsWith('|')) {
      if (line.length < 2 || !line.endsWith('|')) add(n, 'a table row must start and end with |');
      const cells = cellsOf(line).length;
      if (table) {
        if (cells !== table.cells) add(n, `has ${cells} cells; the table on line ${table.line} has ${table.cells}`);
        if (examples) examples.rows += 1;
      } else if (examples && !examples.columns) {
        examples.columns = cellsOf(line);
        table = { line: n, cells };
      } else if (afterStep) {
        table = { line: n, cells };
      } else {
        add(n, 'a table must follow a step or Examples');
      }
      description = false;
      return;
    }
    table = null;

    if (line.startsWith('"""') || line.startsWith('```')) {
      if (!afterStep) add(n, 'a doc string must follow a step');
      docString = { fence: line.slice(0, 3), line: n };
      afterStep = false;
      return;
    }

    if (line.startsWith('@')) {
      if (!line.replace(/\s+#.*$/, '').split(/\s+/).every((tag) => /^@\S+$/.test(tag))) add(n, 'a tag line holds only @tags');
      tags = n;
      return;
    }

    const keyword = /^(Feature|Rule|Background|Scenario Outline|Scenario Template|Scenario|Examples|Scenarios|Example):(.*)$/.exec(line);
    const step = /^(Given|When|Then|And|But|\*)\s+(.*)$/.exec(line);
    if (tags !== null && (step || (keyword && keyword[1] === 'Background'))) add(tags, `tags must precede Feature, Rule, Scenario or Examples, not line ${n}`);
    if (keyword || step) tags = null;

    if (keyword) {
      const [, word, name] = keyword;
      description = true;
      afterStep = false;
      if (word === 'Feature') {
        feature += 1;
        if (feature > 1) add(n, 'a file holds one Feature');
        if (!name.trim()) add(n, 'the Feature needs a name');
        if (section) sections.push(section);
        section = null;
        examples = null;
        level = { background: false, scenario: false };
        return;
      }
      if (!feature) add(n, `${word} comes before any Feature line`);
      if (word === 'Examples' || word === 'Scenarios') {
        if (!section || section.kind === 'Background') add(n, 'Examples belong to a Scenario or Scenario Outline');
        else section.examples.push(examples = { line: n, columns: null, rows: 0 });
        return;
      }
      if (section) sections.push(section);
      section = null;
      examples = null;
      if (word === 'Rule') {
        level = { background: false, scenario: false };
        return;
      }
      if (word === 'Background') {
        if (level.scenario) add(n, 'Background must come before the scenarios');
        if (level.background) add(n, 'only one Background per Feature or Rule');
        level.background = true;
        section = { kind: 'Background', line: n, steps: 0, placeholders: [], examples: [] };
        return;
      }
      level.scenario = true;
      if (!name.trim()) add(n, `the ${word} needs a name`);
      const kind = word === 'Scenario Outline' || word === 'Scenario Template' ? 'Scenario Outline' : 'Scenario';
      section = { kind, line: n, steps: 0, placeholders: [], examples: [] };
      return;
    }

    if (step) {
      description = false;
      afterStep = true;
      if (!section) {
        add(n, 'a step outside a Background or Scenario');
        return;
      }
      if (section.examples.length) add(n, 'a step after Examples');
      if (section.steps === 0 && (step[1] === 'And' || step[1] === 'But')) add(n, `the first step starts with ${step[1]}`);
      section.steps += 1;
      for (const match of step[2].matchAll(/<([^<>]+)>/g)) section.placeholders.push([match[1], n]);
      return;
    }

    if (!description) add(n, `"${line.slice(0, 40)}" is not a keyword, step, table, tag or comment`);
  });

  if (docString) add((docString as { line: number }).line, 'the doc string is not closed');
  if (section) sections.push(section);
  if (!feature) found.unshift('no Feature: line');
  for (const { kind, line, steps, placeholders, examples: tables } of sections) {
    if (!steps) add(line, `the ${kind} has no steps`);
    if (kind === 'Scenario Outline' && !tables.length) add(line, 'the Scenario Outline has no Examples');
    for (const { line: at, columns, rows } of tables) {
      if (!columns) add(at, 'Examples has no table');
      else if (!rows) add(at, 'Examples has a header row but no data rows');
    }
    for (const [name, at] of placeholders) {
      if (!tables.length) add(at, `<${name}> needs an Examples table`);
      for (const table of tables) if (table.columns && !table.columns.includes(name)) add(at, `<${name}> is not a column of the Examples on line ${table.line}`);
    }
  }
  return found;
}

// ----- one variant -----

const reviewerOnly = new Set(['bash', 'groovy', 'dockerfile', 'xml', 'http', 'properties']);

/** Layout problems plus the language check; Python and the type check come from their batch runs. */
function variantProblems(snippet: Snippet, batch: { python: Map<string, string[]>; types: Map<string, string[]> }): string[] {
  const { name, lang, code } = snippet;
  const found = layoutProblems(code);
  if (lang === 'ts' || lang === 'js') {
    const syntax = scriptSyntaxProblems(code, lang);
    found.push(...syntax);
    if (!syntax.length) found.push(...(batch.types.get(name) ?? []));
  } else if (lang === 'python') found.push(...(batch.python.get(name) ?? ['missing from the Python run']));
  else if (lang === 'java') found.push(...javaProblems(code));
  else if (lang === 'sql') found.push(...sqlProblems(code));
  else if (lang === 'yaml') found.push(...yamlProblems(code));
  else if (lang === 'json') found.push(...jsonProblems(code));
  else if (lang === 'gherkin') found.push(...gherkinProblems(code));
  else if (!reviewerOnly.has(lang)) found.push(`no check for language "${lang}"`);
  return found;
}

// ----- questions that must carry an example -----

const exampleTopics = ['java', 'python', 'javascript-typescript', 'sql', 'cypress', 'bdd'];
const pending = 'pre-existing, to be extended in phase 5 content';

/** Questions the rule applies to that may stay without an example, each with its reason. */
const withoutExample: Record<string, string> = {
  'automation-strategy/choose-browser-automation-tool': pending,
  'ci-git-docker/docker-for-repeatable-tests': pending,
  'ci-git-docker/git-merge-or-rebase': pending,
  'ci-git-docker/parallelize-across-ci-jobs': pending,
  'ci-git-docker/reports-and-failure-artifacts': pending,
  'ci-git-docker/required-pull-request-tests': pending,
  'ci-git-docker/secrets-for-test-jobs': pending,
  'locators-waits/frames-and-shadow-roots': pending,
  'locators-waits/playwright-click-actionability': pending,
  'locators-waits/selenium-wait-mixing': pending,
  'playwright/independent-checkout-contexts': pending,
  'playwright/mock-a-failing-request': pending,
  'playwright/read-a-trace': pending,
  'playwright/shard-a-suite': pending,
  'playwright/storage-state-authentication': pending,
  'playwright/web-first-assertions': pending,
  'selenium/grid-4-when-and-why': pending,
  'selenium/manage-browser-drivers': pending,
  'selenium/when-bidi-is-useful': pending,
};

const needsExample = (question: DiscoveredQuestion) => exampleTopics.includes(question.folder) || question.frontmatter.type === 'tooling';

/** Questions that need an example and lack one, plus allowlist entries that no longer fit. */
function requirementProblems(list: DiscoveredQuestion[], allowlist: Record<string, string>): string[] {
  const found: string[] = [];
  const byId = new Map(list.map((question) => [question.id, question]));
  for (const question of list) {
    if (!needsExample(question) || questionExamples(question).length || question.id in allowlist) continue;
    const why = exampleTopics.includes(question.folder) ? `in the ${question.folder} topic` : 'a tooling question';
    found.push(`${question.file} is ${why} and has no example; add one or allowlist it with a reason`);
  }
  for (const [id, reason] of Object.entries(allowlist)) {
    const question = byId.get(id);
    if (!reason.trim()) found.push(`allowlisted ${id} has no reason`);
    if (!question) found.push(`allowlisted ${id} is not a question; remove it`);
    else if (!needsExample(question)) found.push(`allowlisted ${id} does not need an example; remove it`);
    else if (questionExamples(question).length) found.push(`allowlisted ${id} now has an example; remove it from the allowlist`);
  }
  return found;
}

// ----- plants -----

/**
 * Evaluates `expression` in a worker thread that declares the given functions, with `workerData`
 * set to `data`. Rejects after `ms` and stops the worker, so code that loops forever fails its
 * test instead of blocking the run. The functions must use only globals and each other.
 */
function inWorker<T>(functions: Array<string | ((...args: never[]) => unknown)>, expression: string, data: unknown, ms = 4_000): Promise<T> {
  const source = [
    "const { parentPort, workerData } = require('node:worker_threads');",
    ...functions.map(String),
    `(async () => (${expression}))().then((value) => parentPort.postMessage({ value }), (error) => parentPort.postMessage({ error: String(error) }));`,
  ].join('\n');
  return new Promise<T>((resolve, reject) => {
    const worker = new Worker(source, { eval: true, workerData: data });
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(new Error(`did not finish within ${ms} ms`));
    }, ms);
    worker.once('message', (message: { value?: T; error?: string }) => {
      clearTimeout(timer);
      void worker.terminate();
      if (message.error !== undefined) reject(new Error(message.error));
      else resolve(message.value as T);
    });
    worker.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

const planted = {
  ts: `import { expect, test } from '@playwright/test';\n\ntest('refund', async ({ page }) => {\n  await page.goto('/refunds');\n  await expect(page.getByRole('heading')).toBeVisible();\n});\n`,
  tsTypeError: `import { test } from '@playwright/test';\n\ntest('refund', async ({ page }) => {\n  await page.goto(42);\n});\n`,
  tsUnknownMember: `import { test } from '@playwright/test';\n\ntest('refund', async ({ page }) => {\n  await page.clickTheButton();\n});\n`,
  tsOtherModule: `import { readFileSync } from 'node:fs';\n\nconst size: number = readFileSync('x', 'utf8');\n`,
};

/** Results of the batch runs over content and plants together: one Python process and one program. */
let batch: { python: Map<string, string[]>; types: Map<string, string[]>; global: string[]; interpreter: string };

beforeAll(async () => {
  sqlite = await initSqlJs({ locateFile: (file) => join(root, 'node_modules', 'sql.js', 'dist', file) });
  const pythonPlants = [
    { name: 'plant:python valid', code: 'import pytest\n\n\n@pytest.mark.parametrize("size", [3, 4])\ndef test_size(size):\n    assert size > 0\n' },
    { name: 'plant:python broken', code: 'def test_size(:\n    pass\n' },
    { name: 'plant:python bad indent', code: 'def test_size():\nassert True\n' },
  ];
  const python = pythonProblems([...snippets.filter(({ lang }) => lang === 'python'), ...pythonPlants]);
  const typePlants = Object.entries(planted).map(([key, code]) => ({ name: `plant:${key}`, code }))
    .filter(({ code }) => importsOnlyPlaywright(code));
  const checked = typeCheck([...snippets.filter(({ lang, code }) => lang === 'ts' && importsOnlyPlaywright(code)), ...typePlants]);
  batch = { python: python.results, types: checked.results, global: checked.global, interpreter: python.interpreter };
}, 30_000); // Measured 2026-11-27: the whole file runs in about 1.2 s, most of it loading the Playwright and DOM types.

describe('question examples', () => {
  it('exist, and report their languages and checks', () => {
    expect(snippets.length, 'no example variants in content/questions').toBeGreaterThan(0);
    const byLang = new Map<string, number>();
    for (const { lang } of snippets) byLang.set(lang, (byLang.get(lang) ?? 0) + 1);
    const typed = snippets.filter(({ name }) => batch.types.has(name)).length;
    const tsCount = byLang.get('ts') ?? 0;
    console.log([
      `Example variants: ${snippets.length} in ${questions.filter((question) => questionExamples(question).length).length} questions`,
      ...[...byLang].sort().map(([lang, count]) => `  ${lang.padEnd(11)} ${count}${reviewerOnly.has(lang) ? ' (layout only, reviewer reads)' : ''}`),
      `  type checked: ${typed} of ${tsCount} ts variants (the rest import other modules or none, and get syntax only)`,
      `  Python: ${batch.interpreter}`,
    ].join('\n'));
    expect(batch.global, 'the type check program reports no configuration problems').toEqual([]);
  });

  it.each(snippets.map((snippet) => [snippet.name, snippet] as const))('%s passes its checks', (_name, snippet) => {
    expect(variantProblems(snippet, batch)).toEqual([]);
  });

  it('appear on every question that must have one, and the allowlist holds only current exceptions', () => {
    expect(requirementProblems(questions, withoutExample)).toEqual([]);
  });
});

describe('the example checks catch planted mistakes', () => {
  const problemsFor = (lang: string, code: string, name = `plant:${lang}`) => variantProblems({ name, lang, code }, batch);

  describe('layout', () => {
    it('accepts a line of exactly the cap', () => {
      expect(layoutProblems(`${'x'.repeat(lineCap)}\n`)).toEqual([]);
    });

    it.each([
      ['a tab', 'if (ok) {\n\treturn;\n}\n', 'line 2 has a tab'],
      ['trailing spaces', 'const a = 1;  \n', 'line 1 has trailing whitespace'],
      ['a line one past the cap', `// ${'x'.repeat(lineCap - 2)}\n`, `line 1 is ${lineCap + 1} characters; the cap is ${lineCap}`],
    ])('reports %s in any language', (_name, code, message) => {
      for (const lang of ['ts', 'bash', 'sql']) expect(problemsFor(lang, code).join('\n'), lang).toContain(message);
    });
  });

  describe('TypeScript and JavaScript', () => {
    it('accept a valid Playwright test, which also passes the type check', () => {
      expect(batch.types.has('plant:ts'), 'the plant joined the type check').toBe(true);
      expect(problemsFor('ts', planted.ts, 'plant:ts')).toEqual([]);
    });

    it.each([
      ['a ts syntax error', 'ts', 'const total = ;\n', 'line 1: Expression expected'],
      ['an unclosed ts block', 'ts', 'test("x", async () => {\n  await go();\n', "'}' expected"],
      ['a js syntax error', 'js', 'const total = ;\n', 'line 1: Expression expected'],
      ['a type annotation in js', 'js', 'const total: number = 1;\n', 'Type annotations can only be used in TypeScript files'],
    ])('report %s', (_name, lang, code, message) => {
      expect(problemsFor(lang, code).join('\n')).toContain(message);
    });

    it('reports a type error in a Playwright-only ts variant', () => {
      expect(problemsFor('ts', planted.tsTypeError, 'plant:tsTypeError').join('\n'))
        .toMatch(/line 4: Argument of type 'number' is not assignable to parameter of type 'string'/);
    });

    it('reports an unknown Page method, so the Playwright types resolved', () => {
      expect(problemsFor('ts', planted.tsUnknownMember, 'plant:tsUnknownMember').join('\n'))
        .toContain("line 4: Property 'clickTheButton' does not exist on type 'Page'");
    });

    it('gives a variant that imports other modules a syntax check only', () => {
      expect(importsOnlyPlaywright(planted.tsOtherModule)).toBe(false);
      expect(importsOnlyPlaywright(planted.ts)).toBe(true);
      expect(importsOnlyPlaywright('const a: number = 1;\n'), 'no imports').toBe(false);
      expect(importsOnlyPlaywright(`${planted.ts}const fs = require('node:fs');\n`), 'a require beside the import').toBe(false);
      expect(problemsFor('ts', planted.tsOtherModule, 'plant:tsOtherModule')).toEqual([]);
    });
  });

  describe('Python', () => {
    it('accepts valid pytest code', () => {
      expect(batch.python.get('plant:python valid')).toEqual([]);
    });

    it.each([
      ['a syntax error', 'plant:python broken', 'line 1: '],
      ['a missing indent', 'plant:python bad indent', "line 2: expected an indented block after function definition on line 1"],
    ])('reports %s', (_name, key, message) => {
      expect(problemsFor('python', '', key).join('\n')).toContain(message);
    });

    it('fails loudly when no interpreter runs', () => {
      expect(() => pythonProblems([{ name: 'x', code: 'x = 1' }], [{ command: 'pom-proof-no-such-python', args: [] }]))
        .toThrow(/no Python interpreter ran the example syntax check; tried pom-proof-no-such-python: ENOENT/);
    });
  });

  describe('Java', () => {
    it.each([
      ['a complete JUnit class', 'import org.junit.jupiter.api.Test;\n\nclass RefundTest {\n  @Test\n  void refunds() {}\n}\n'],
      ['a record', 'record Refund(String id, int cents) {\n  Refund {\n    if (cents < 0) throw new IllegalArgumentException();\n  }\n}\n'],
      ['a text block', 'class Body {\n  String json = """\n      {"size": 4}\n      """;\n}\n'],
      ['var in a method body', 'var driver = new ChromeDriver();\nvar title = driver.getTitle();\n'],
      ['statements with imports lifted', 'import org.openqa.selenium.By;\n\ndriver.findElement(By.id("refund")).click();\n'],
      ['a method without a class', '@Test\nvoid refunds() {\n  assertEquals(4, size);\n}\n'],
      ['a switch expression and a pattern', 'int f(Object o) {\n  if (o instanceof String s && !s.isEmpty()) return 1;\n  return switch (o.hashCode()) { case 1 -> 2; default -> 3; };\n}\n'],
    ])('accepts %s', (_name, code) => {
      expect(problemsFor('java', code)).toEqual([]);
    });

    it.each([
      ['a missing semicolon', 'class A {\n  void f() {\n    int x = 1\n  }\n}\n', 'line: 4'],
      ['an unbalanced brace', 'class A {\n  void f() {\n    if (true) {\n  }\n}\n', 'does not parse as Java'],
      ['a misspelt keyword', 'class A {\n  int f() {\n    retrun 1;\n  }\n}\n', 'line: 3'],
      ['an unclosed string', 'class A {\n  String s = "abc;\n}\n', 'lexing errors detected in line: 2'],
      // A class followed by statements is a valid method body (a local class), so the plant uses a method.
      ['a method beside loose statements', 'void refund() {}\nrefund();\n', 'in a class and method:'],
    ])('reports %s', (_name, code, message) => {
      const found = problemsFor('java', code).join('\n');
      expect(found).toContain('does not parse as Java');
      expect(found).toContain(message);
    });

    it('keeps line numbers after lifting imports', () => {
      const found = problemsFor('java', 'import a.B;\nimport c.D;\n\nB b = new B()\nb.go();\n').join('\n');
      expect(found).toContain('in a class and method: parsing errors detected in line: 5');
    });
  });

  describe('SQL', () => {
    it.each([
      ['a query on tables it assumes', 'SELECT id, COUNT(*) FROM refunds GROUP BY id HAVING COUNT(*) > 1;\n'],
      ['an unknown column in a values list', 'WITH t(id) AS (VALUES (1)) SELECT missing FROM t;\n'],
      ['a schema it creates and then queries', 'CREATE TABLE refunds (id INTEGER PRIMARY KEY, cents INTEGER);\nINSERT INTO refunds VALUES (1, 500), (1, 600);\nSELECT * FROM refunds;\n'],
      ['a semicolon inside a string', "SELECT 'a;b' AS text FROM notes;\nSELECT 2;\n"],
    ])('accepts %s', (_name, code) => {
      expect(problemsFor('sql', code)).toEqual([]);
    });

    it.each([
      ['a misspelt keyword', 'SELEC id FROM refunds;\n', 'statement at line 1: near "SELEC": syntax error'],
      ['a missing FROM target', 'SELECT id FROM;\n', 'syntax error'],
      ['an unknown function', 'SELECT DATE_TRUNC(\'day\', 1);\n', 'no such function: DATE_TRUNC'],
      ['a syntax error after a statement on a missing table', 'SELECT id FROM refunds;\n\nSELECT FROM WHERE;\n', 'statement at line 3: near "FROM": syntax error'],
    ])('reports %s', (_name, code, message) => {
      expect(problemsFor('sql', code).join('\n')).toContain(message);
    });

    describe('text left open', () => {
      // Every case runs in its own worker with a time limit, all started together, so a scan that
      // never stops fails its own test instead of blocking the run.
      // [case, text, what is left open (null for none), where it opens]
      const scans: Array<[string, string, string | null, number]> = [
        ['a block comment', 'SELECT 1 /* note', 'block comment', 9],
        ['a block comment that only opens', '/*', 'block comment', 0],
        ['a line comment', 'SELECT 1 -- note', null, 0],
        ['a string', "SELECT 'open", 'string', 7],
        ['a string after a doubled quote', "SELECT 'it''s", 'string', 11],
        ['a double-quoted identifier', 'SELECT "open', 'quoted identifier', 7],
        ['a backtick identifier', 'SELECT `open', 'quoted identifier', 7],
        ['a bracketed identifier', 'SELECT [open', 'quoted identifier', 7],
      ];
      const closed: Array<[string, string, number]> = [
        ['a comment marker inside a string', "SELECT '/*'; SELECT 2", 12],
        ['a semicolon inside a block comment', 'SELECT 1 /* ; */; SELECT 2', 17],
        ['a doubled quote inside a string', "SELECT 'it''s'; SELECT 2", 15],
        ['a semicolon after a line comment', 'SELECT 1 -- a; b\n; SELECT 2', 18],
      ];
      const checks: Array<[string, string, string | null]> = [
        ['a block comment after a missing table, the reported hang', 'SELECT id FROM refunds /* unclosed', 'line 1: the block comment is not closed'],
        ['a block comment that hides later statements', 'SELECT 1;\n/* note\nSELECT 2;\n', 'line 2: the block comment is not closed'],
        ['a string', "SELECT id FROM refunds WHERE note = 'open", 'line 1: the string is not closed'],
        ['a string after a statement on a missing table', "SELECT id FROM refunds;\nSELECT 'open", 'line 2: the string is not closed'],
        ['a double-quoted identifier', 'SELECT "id FROM refunds', 'line 1: the quoted identifier is not closed'],
        ['a backtick identifier', 'SELECT `id FROM refunds', 'line 1: the quoted identifier is not closed'],
        ['a bracketed identifier', 'SELECT [id FROM refunds', 'line 1: the quoted identifier is not closed'],
        ['a line comment that ends the input, which is valid', 'SELECT id FROM refunds -- refunds this week', null],
      ];
      const sqlFunctions = [statementEnd, lineOf, unclosedSql, sqliteProblems, sqlProblems];
      const sqlCall = "sqlProblems(workerData.code, await require(workerData.sqljs)({ locateFile: (file) => require('node:path').join(workerData.dist, file) }))";
      const sqlPaths = { sqljs: join(root, 'node_modules', 'sql.js'), dist: join(root, 'node_modules', 'sql.js', 'dist') };
      const runs = new Map<string, Promise<unknown>>();
      const run = <T>(key: string) => runs.get(key) as Promise<T>;

      beforeAll(() => {
        const start = (key: string, promise: Promise<unknown>) => {
          promise.catch(() => {}); // Awaited by its test; this only keeps an early rejection from being unhandled.
          runs.set(key, promise);
        };
        for (const [name, sql] of [...scans, ...closed]) start(`scan:${name}`, inWorker([statementEnd], 'statementEnd(workerData)', sql));
        for (const [name, code] of checks) start(`check:${name}`, inWorker(sqlFunctions, sqlCall, { code, ...sqlPaths }));
      });

      it.each(scans)('the scanner stops at the end of input for an unclosed %s', async (name, sql, what, at) => {
        expect(await run<SqlScan>(`scan:${name}`)).toEqual({ end: sql.length, ...(what ? { unclosed: { what, at } } : {}) });
      });

      it.each(closed)('the scanner still ends a statement after %s', async (name, _sql, end) => {
        expect(await run<SqlScan>(`scan:${name}`)).toEqual({ end });
      });

      it.each(checks)('the SQL check finishes on %s', async (name, _code, message) => {
        const found = await run<string[]>(`check:${name}`);
        if (message) expect(found.join('\n')).toContain(message);
        else expect(found).toEqual([]);
      });

      it('the time limit turns a scan that never stops into a failure', async () => {
        await expect(inWorker(['function statementEnd() { for (;;) {} }'], 'statementEnd()', null, 300))
          .rejects.toThrow('did not finish within 300 ms');
      });
    });
  });

  describe('YAML and JSON', () => {
    it('accept a two-document Kubernetes manifest and a JSON body', () => {
      expect(problemsFor('yaml', 'apiVersion: v1\nkind: Namespace\nmetadata:\n  name: qa\n---\napiVersion: v1\nkind: ConfigMap\n')).toEqual([]);
      expect(problemsFor('json', '{ "size": 4, "tags": ["a"] }\n')).toEqual([]);
    });

    it.each([
      ['a YAML indentation error', 'yaml', 'jobs:\n  test:\n    steps:\n      - run: npm test\n     - run: npm run lint\n', 'line 5'],
      ['an unclosed YAML flow list', 'yaml', 'branches: [main\n', 'end with a ]'],
      ['a duplicate YAML key', 'yaml', 'on: push\non: pull_request\n', 'Map keys must be unique'],
      ['a JSON trailing comma', 'json', '{ "size": 4, }\n', 'JSON'],
      ['JSON with a comment', 'json', '{ "size": 4 } // four\n', 'JSON'],
    ])('report %s', (_name, lang, code, message) => {
      const found = problemsFor(lang, code);
      expect(found.length, `${lang} plant was not reported`).toBeGreaterThan(0);
      expect(found.join('\n')).toContain(message);
    });
  });

  describe('Gherkin', () => {
    const valid = [
      '@refunds',
      'Feature: Refunds',
      '  Shoppers return items within 30 days.',
      '',
      '  Background:',
      '    Given a shopper with order 1001',
      '',
      '  Rule: Refunds go back to the original card',
      '',
      '    @smoke',
      '    Scenario: Full refund',
      '      When the shopper returns every item',
      '      Then the card is credited:',
      '        | amount | currency |',
      '        | 40.00  | USD      |',
      '      And the email says:',
      '        """',
      '        Your refund is on its way',
      '        """',
      '',
      '    Scenario Outline: Late returns',
      '      When the shopper returns an item after <days> days',
      '      Then the refund is <result>',
      '',
      '      Examples:',
      '        | days | result   |',
      '        | 30   | accepted |',
      '        | 31   | refused  |',
    ].join('\n');

    it('accepts a feature with a background, rule, tags, data table, doc string and outline', () => {
      expect(problemsFor('gherkin', valid)).toEqual([]);
    });

    it.each([
      ['no Feature line', 'Scenario: Refund\n  Given an order\n', 'no Feature: line'],
      ['a step before any scenario', 'Feature: Refunds\n  Given an order\n', 'line 2: a step outside a Background or Scenario'],
      ['a scenario without steps', 'Feature: Refunds\n  Scenario: Refund\n  Scenario: Other\n    Given an order\n', 'line 2: the Scenario has no steps'],
      ['a misspelt step keyword', 'Feature: Refunds\n  Scenario: Refund\n    Given an order\n    Wen the shopper returns it\n', 'line 4: "Wen the shopper returns it" is not a keyword'],
      ['an outline without Examples', 'Feature: Refunds\n  Scenario Outline: Late\n    Given <days> days\n', 'line 2: the Scenario Outline has no Examples'],
      ['uneven table rows', 'Feature: Refunds\n  Scenario: Refund\n    Given these items:\n      | sku | qty |\n      | A1  |\n', 'line 5: has 1 cells; the table on line 4 has 2'],
      ['a placeholder that is not a column', 'Feature: Refunds\n  Scenario Outline: Late\n    Given <day> days\n    Examples:\n      | days |\n      | 31   |\n', 'line 3: <day> is not a column of the Examples on line 4'],
      ['an unclosed doc string', 'Feature: Refunds\n  Scenario: Refund\n    Given the email:\n      """\n      Hello\n', 'line 4: the doc string is not closed'],
      ['a Background after a scenario', 'Feature: Refunds\n  Scenario: Refund\n    Given an order\n  Background:\n    Given a shopper\n', 'line 4: Background must come before the scenarios'],
      ['Examples with a header only', 'Feature: Refunds\n  Scenario Outline: Late\n    Given <days> days\n    Examples:\n      | days |\n', 'line 4: Examples has a header row but no data rows'],
      ['a scenario that starts with And', 'Feature: Refunds\n  Scenario: Refund\n    And an order\n', 'line 3: the first step starts with And'],
      ['a table with no step', 'Feature: Refunds\n  Scenario: Refund\n    | sku |\n    Given an order\n', 'line 3: a table must follow a step or Examples'],
      ['two features', 'Feature: Refunds\n  Scenario: A\n    Given x\nFeature: Returns\n  Scenario: B\n    Given y\n', 'line 4: a file holds one Feature'],
    ])('reports %s', (_name, code, message) => {
      expect(problemsFor('gherkin', code).join('\n')).toContain(message);
    });
  });

  describe('languages without an automatic check', () => {
    it('get the layout rules only, and an unknown language is reported', () => {
      expect(problemsFor('bash', 'npx playwright test --shard=1/4\n')).toEqual([]);
      expect(problemsFor('dockerfile', 'FROM mcr.microsoft.com/playwright:v1.65.1-noble\n')).toEqual([]);
      expect(problemsFor('cobol', 'DISPLAY "HI".\n')).toEqual(['no check for language "cobol"']);
    });
  });

  describe('questions that must carry an example', () => {
    const base = questions[0];
    const plant = (id: string, frontmatter: Record<string, unknown>) => {
      const [folder, slug] = id.split('/');
      return { ...base, id, folder, slug, file: `content/questions/${id}.md`, frontmatter: { ...base?.frontmatter, ...frontmatter } } as DiscoveredQuestion;
    };
    const withExample = { examples: [{ variants: [{ lang: 'sql', label: 'SQLite (SQL)', code: 'SELECT 1;' }] }] };

    it('accept a tooling question with an example and a concept question without one', () => {
      expect(base, 'a question file to copy').toBeDefined();
      expect(requirementProblems([
        plant('playwright/with-example', { type: 'tooling', ...withExample }),
        plant('fundamentals/no-code', { type: 'concept', examples: undefined }),
      ], {})).toEqual([]);
    });

    it.each(exampleTopics)('reports a %s question without an example', (topic) => {
      expect(base, 'a question file to copy').toBeDefined();
      expect(requirementProblems([plant(`${topic}/planted`, { type: 'concept', examples: undefined })], {}).join('\n'))
        .toContain(`content/questions/${topic}/planted.md is in the ${topic} topic and has no example`);
    });

    it('reports a tooling question without an example', () => {
      expect(base, 'a question file to copy').toBeDefined();
      expect(requirementProblems([plant('playwright/planted', { type: 'tooling', examples: undefined })], {}).join('\n'))
        .toContain('content/questions/playwright/planted.md is a tooling question and has no example');
    });

    it('accepts an allowlisted question and reports stale or empty allowlist entries', () => {
      expect(base, 'a question file to copy').toBeDefined();
      const missing = plant('sql/planted', { type: 'concept', examples: undefined });
      expect(requirementProblems([missing], { 'sql/planted': 'needs a schema diagram' })).toEqual([]);
      expect(requirementProblems([missing], { 'sql/planted': ' ' })).toEqual(['allowlisted sql/planted has no reason']);
      expect(requirementProblems([plant('sql/planted', withExample)], { 'sql/planted': pending }))
        .toEqual(['allowlisted sql/planted now has an example; remove it from the allowlist']);
      expect(requirementProblems([], { 'sql/gone': pending })).toEqual(['allowlisted sql/gone is not a question; remove it']);
      expect(requirementProblems([plant('agile/planted', { type: 'concept', examples: undefined })], { 'agile/planted': pending }))
        .toEqual(['allowlisted agile/planted does not need an example; remove it']);
    });
  });
});
