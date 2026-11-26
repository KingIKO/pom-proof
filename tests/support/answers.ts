import type { Kind } from '../../src/lib/contracts';
import { discoverProblems, kinds, type DiscoveredProblem } from './problems';

type Data<K extends Kind> = Extract<DiscoveredProblem['data'], { kind: K }>;
export type ProblemOf<K extends Kind> = DiscoveredProblem & { kind: K; data: Data<K> };
export type TableRow = { args: Array<unknown>; expected: unknown };

/** The table answer of a test-design problem: its rows reference, or a reference given as rows. */
export function tableRows(data: Data<'test-design'>): TableRow[] | undefined {
  if ('rows' in data.reference) return data.reference.rows;
  return data.rowsReference?.rows;
}

/** A JavaScript solution for a code problem, so a UI solve needs no language switch and no Pyodide load. */
export function jsSolution(data: Data<'code'>): string | undefined {
  return data.solutions?.js ?? (data.reference.language === 'js' ? data.reference.source : undefined);
}

const quote = (text: string) => JSON.stringify(text);

/** The locator reference written as the text a person types into the Locator expression field. */
export function locatorSource(reference: Data<'locator'>['reference']): string {
  switch (reference.by) {
    case 'expression':
      return reference.source.trim();
    case 'css':
      return reference.selector;
    case 'xpath':
      // The field reads a bare XPath only when it starts like one; anything else needs the prefix.
      return /^(?:\(*\s*\/|\.\.?\/|[a-z-]+::)/i.test(reference.selector.trim()) ? reference.selector : `xpath=${reference.selector}`;
    case 'role':
      return `page.getByRole(${quote(reference.role)}, { name: ${quote(reference.name)}, exact: ${reference.exact} })`;
    case 'text':
      return `page.getByText(${quote(reference.text)}, { exact: ${reference.exact} })`;
    case 'label':
      return `page.getByLabel(${quote(reference.text)}, { exact: ${reference.exact} })`;
    case 'test-id':
      return `page.getByTestId(${quote(reference.testId)})`;
  }
}

/** Whether the problem can be answered through its workspace controls in this suite's UI paths. */
function answerableInUi(problem: DiscoveredProblem) {
  if (problem.data.kind === 'test-design') return Boolean(problem.data.params && tableRows(problem.data));
  if (problem.data.kind === 'code') return Boolean(jsSolution(problem.data));
  return true;
}

/**
 * The first problem of each kind that the UI paths can answer: a test-design problem with a table
 * answer, a code problem with a JavaScript solution. Fails loudly when a kind has none.
 */
export function uiProblemPerKind(problems = discoverProblems()): DiscoveredProblem[] {
  return kinds.map((kind) => {
    const problem = problems.find((candidate) => candidate.kind === kind && answerableInUi(candidate));
    if (!problem) throw new Error(`No ${kind} problem under content/problems can be answered through the UI paths`);
    return problem;
  });
}

/** The result line a full-marks answer shows, worked out from the problem's own content. */
export function fullMarksText({ data }: DiscoveredProblem): string {
  switch (data.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report':
      return `Pass: ${data.items.length} of ${data.items.length} checks passed. Score 100%`;
    case 'test-design':
      return `Pass: ${data.mutants.length} of ${data.mutants.length} faulty versions caught`;
    case 'locator':
      return `Pass: ${data.variants.length + 1} of ${data.variants.length + 1} checks passed`;
    case 'sql':
      return 'Pass: 2 of 2 checks passed';
    case 'code':
      return `Pass: ${data.vectors.length} of ${data.vectors.length} checks passed`;
  }
}
