import { transform } from 'sucrase';
import type { Problem } from '../lib/contracts';

type Json = Problem<'code'>['vectors'][number]['expected'];
export type CodeLanguage = 'js' | 'ts';

export interface CodeRequest {
  language: CodeLanguage;
  source: string;
  exportName: string;
  vectors: Array<{ args: Json[]; expected: Json; visible: boolean }>;
}

export type CodeCheck = { passed: boolean } & (
  | { visible: true; logs: string[]; actual?: Json; error?: string }
  | { visible: false }
);

export type CodeReply = { checks: CodeCheck[] } | { error: string };
export type CodeRunner = (request: CodeRequest) => Promise<CodeReply>;

function readJson(value: unknown, parents = new Set<object>()): Json {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || !value || parents.has(value)) {
    throw new Error('The function did not return a JSON value.');
  }
  parents.add(value);
  let result: Json;
  if (Array.isArray(value)) {
    result = Array.from(value, (item: unknown) => readJson(item, parents));
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype) {
      throw new Error('The function did not return a JSON value.');
    }
    result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, readJson(item, parents)]));
  }
  parents.delete(value);
  return result;
}

function equalJson(actual: Json, expected: Json): boolean {
  if (actual === expected) return true;
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return actual.length === expected.length && actual.every((item, i) => equalJson(item, expected[i]));
  }
  if (
    actual === null || expected === null || typeof actual !== 'object' || typeof expected !== 'object'
    || Array.isArray(actual) || Array.isArray(expected)
  ) return false;
  const keys = Object.keys(actual);
  return keys.length === Object.keys(expected).length
    && keys.every((key) => Object.hasOwn(expected, key) && equalJson(actual[key], expected[key]));
}

function describeLog(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const evaluateCode: CodeRunner = async ({ language, source, exportName, vectors }) => {
  const checks: CodeCheck[] = [];
  let logs: string[] | undefined;
  let solution: (...args: Json[]) => unknown;
  const exports: Record<string, unknown> = Object.create(null);
  try {
    const { code } = transform(source, {
      transforms: language === 'ts' ? ['typescript', 'imports'] : ['imports'],
      disableESTransforms: true,
    });
    const log = (...values: unknown[]) => logs?.push(values.map(describeLog).join(' '));
    const noImport = () => { throw new Error('Imports are unavailable in the editor.'); };
    new Function('exports', 'console', 'require', code)(
      exports, { log, info: log, warn: log, error: log, debug: log }, noImport,
    );
    const candidate = exports[exportName];
    if (typeof candidate !== 'function') return { error: `Export a function named ${exportName}.` };
    solution = candidate as typeof solution;
  } catch (error) {
    return { error: errorMessage(error) };
  }

  for (const vector of vectors) {
    logs = vector.visible ? [] : undefined;
    try {
      const actual = readJson(await solution(...vector.args));
      const passed = equalJson(actual, vector.expected);
      checks.push(logs ? { visible: true, passed, actual, logs } : { visible: false, passed });
    } catch (error) {
      checks.push(logs
        ? { visible: true, passed: false, error: errorMessage(error), logs }
        : { visible: false, passed: false });
    }
  }
  return { checks };
};
