import { describe, expect, it } from 'vitest';
import { diagramSchema, diagramsSchema } from '../../src/lib/diagram-schema';
import { doubles, matrices, risk } from '../fixtures/diagrams/matrices';

// A matrix whose data does not hold together fails the build: the collection schema rejects it.

const problems = (figure: Record<string, unknown>) => {
  const result = diagramSchema.safeParse(figure);
  return result.success ? '' : result.error.issues.map(({ path, message }) => `${path.join('.')} ${message}`.trim()).join('\n');
};
/** The entries with one row's cells replaced. */
const cells = (figure: typeof risk | typeof doubles, head: string, words: string[]) =>
  ({ entries: figure.entries.map((entry) => (entry.head === head ? { head, cells: words } : entry)) });

describe('the matrix schema', () => {
  it('accepts both fixture figures, and a matrix with a description', () => {
    expect(diagramsSchema.safeParse(matrices).success).toBe(true);
    expect(problems({ ...risk, description: 'High likelihood and high impact give a high level.' })).toBe('');
  });

  it('accepts a levels matrix with nothing placed, and an answers matrix of Yes and No with no note', () => {
    expect(problems({ ...risk, placed: undefined })).toBe('');
    expect(problems({ ...doubles, note: undefined, entries: doubles.entries.map(({ head }) => ({ head, cells: ['Yes', 'No', 'No', 'Yes'] })) })).toBe('');
  });

  it.each([
    ['a row with a cell missing', cells(risk, 'Medium', ['Low', 'Medium']), 'row "Medium" has 2 cells. Write one for each of the 3 columns'],
    ['a row with a cell too many', cells(risk, 'Low', ['Low', 'Low', 'Medium', 'High']), 'row "Low" has 4 cells. Write one for each of the 3 columns'],
    ['an empty cell', cells(risk, 'Low', ['Low', '', 'Medium']), 'entries.2.cells.1'],
    ['a word that is not a level', cells(risk, 'High', ['Medium', 'High', 'Critical']), 'cell "Critical" is not one of Low, Medium, High'],
    ['a level in lower case', cells(risk, 'High', ['medium', 'High', 'High']), 'cell "medium" is not one of Low, Medium, High'],
    ['no column axis', { columnAxis: undefined }, 'a levels matrix needs columnAxis and rowAxis'],
    ['no row axis', { rowAxis: undefined }, 'a levels matrix needs columnAxis and rowAxis'],
    ['an item placed in no row', { placed: [{ label: 'Double charge', row: 'Severe', column: 'High' }] }, '"Double charge" is placed in row "Severe", which the matrix does not have'],
    ['an item placed in no column', { placed: [{ label: 'Double charge', row: 'High', column: 'Severe' }] }, '"Double charge" is placed in column "Severe", which the matrix does not have'],
    ['an item placed twice', { placed: [risk.placed[0], { ...risk.placed[0], column: 'High' }] }, '"Receipt layout" is placed twice'],
    ['a repeated column', { columns: ['Low', 'Low', 'High'] }, 'column "Low" is listed twice'],
    ['a repeated row', { entries: [risk.entries[0], risk.entries[0], risk.entries[2]] }, 'row "High" is listed twice'],
    ['one column', { columns: ['Low'] }, 'columns'],
    ['one row', { entries: [risk.entries[0]] }, 'entries'],
    ['no kind', { kind: undefined }, 'kind'],
    ['rows in place of entries', { entries: undefined, rows: risk.entries }, 'entries'],
  ])('rejects a levels matrix with %s', (_name, changes, message) => {
    expect(problems(risk)).toBe('');
    expect(problems({ ...risk, ...changes })).toContain(message);
  });

  it('reports an answer in lower case alone, and not as another word', () => {
    expect(problems({ ...doubles, ...cells(doubles, 'Spy', ['Can', 'yes', 'No', 'No']) })).toBe('write cell "yes" as "Yes"');
  });

  it.each([
    ['a row with a cell missing', cells(doubles, 'Spy', ['Can', 'Yes', 'No']), 'row "Spy" has 3 cells. Write one for each of the 4 columns'],
    ['an empty cell', cells(doubles, 'Spy', ['Can', 'Yes', '', 'No']), 'entries.2.cells.2'],
    ['two qualified words', cells(doubles, 'Spy', ['May', 'Yes', 'No', 'No']), 'the cells use May, Can besides Yes and No. Use at most one other word, and only for a limited yes, because it takes the tint of Yes'],
    ['a yes in lower case', cells(doubles, 'Spy', ['Can', 'yes', 'No', 'No']), 'write cell "yes" as "Yes"'],
    ['a no in capitals', cells(doubles, 'Spy', ['Can', 'Yes', 'NO', 'No']), 'write cell "NO" as "No"'],
    ['a qualified word the note leaves out', { note: 'Some of these overlap.' }, 'the note must say what "Can" means. It takes the tint of Yes, so it must mean a limited yes'],
    ['a qualified word with no note', { note: undefined }, 'the note must say what "Can" means'],
    ['a qualified answer of two words', { note: 'Can be means it may do this.', entries: doubles.entries.map(({ head, cells: words }) => ({ head, cells: words.map((word) => (word === 'Can' ? 'Can be' : word)) })) }, 'cell "Can be" must be one word'],
    ['an axis name', { columnAxis: 'Question' }, 'an answers matrix has no axis names and no placed items'],
    ['a placed item', { placed: [{ label: 'Rate store', row: 'Fake', column: 'Stores calls for the test' }] }, 'an answers matrix has no axis names and no placed items'],
  ])('rejects an answers matrix with %s', (_name, changes, message) => {
    expect(problems(doubles)).toBe('');
    expect(problems({ ...doubles, ...changes })).toContain(message);
  });
});
