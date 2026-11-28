import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { textSchema } from './problem-schema';

/**
 * Two crossed axes as a real table. `kind` says what the cells hold, and each cell is the word it
 * shows, so a cell's shading cannot disagree with its word:
 * - `levels`: Low, Medium or High, with an axis name on both sides. `placed` puts an example in the
 *   cell where its row and column meet.
 * - `answers`: Yes, No, or one qualified word (such as Can) that the note defines. It takes the tint of
 *   Yes, so it stands for a limited yes. One row per item, one column per question.
 * The row list is `entries`, because `rows` is a code key the plain-language scan skips.
 */

export const levelWords = ['Low', 'Medium', 'High'];
const answerWords = ['Yes', 'No'];

interface Matrix {
  kind: 'levels' | 'answers';
  note?: string;
  columnAxis?: string;
  rowAxis?: string;
  columns: string[];
  entries: Array<{ head: string; cells: string[] }>;
  placed?: Array<{ label: string; row: string; column: string }>;
}

const repeated = (words: string[]) => [...new Set(words.filter((word, index) => words.indexOf(word) !== index))];

/** What makes a matrix wrong: each message names the part and the fix. */
function problems({ kind, note = '', columnAxis, rowAxis, columns, entries, placed = [] }: Matrix): string[] {
  const found: string[] = [];
  const heads = entries.map(({ head }) => head);
  for (const name of repeated(columns)) found.push(`column "${name}" is listed twice`);
  for (const name of repeated(heads)) found.push(`row "${name}" is listed twice`);
  for (const { head, cells } of entries) {
    if (cells.length !== columns.length) found.push(`row "${head}" has ${cells.length} cells. Write one for each of the ${columns.length} columns`);
  }
  const words = [...new Set(entries.flatMap(({ cells }) => cells))];

  if (kind === 'levels') {
    if (!columnAxis || !rowAxis) found.push('a levels matrix needs columnAxis and rowAxis');
    for (const word of words) if (!levelWords.includes(word)) found.push(`cell "${word}" is not one of ${levelWords.join(', ')}`);
    for (const { label, row, column } of placed) {
      if (!heads.includes(row)) found.push(`"${label}" is placed in row "${row}", which the matrix does not have`);
      if (!columns.includes(column)) found.push(`"${label}" is placed in column "${column}", which the matrix does not have`);
    }
    for (const label of repeated(placed.map((item) => item.label))) found.push(`"${label}" is placed twice`);
    return found;
  }

  if (columnAxis || rowAxis || placed.length) found.push('an answers matrix has no axis names and no placed items');
  const other = words.filter((word) => !answerWords.includes(word));
  const recased = (word: string) => answerWords.find((each) => each.toLowerCase() === word.toLowerCase());
  for (const word of other) if (recased(word)) found.push(`write cell "${word}" as "${recased(word)}"`);
  const qualified = other.filter((word) => !recased(word));
  // The one other word is drawn on the tint of Yes, so a reader takes it for a yes with a limit.
  if (qualified.length > 1) found.push(`the cells use ${qualified.join(', ')} besides Yes and No. Use at most one other word, and only for a limited yes, because it takes the tint of Yes`);
  for (const word of qualified) {
    if (/\s/.test(word)) found.push(`cell "${word}" must be one word`);
    else if (!note.split(/[^\p{L}\p{N}]+/u).includes(word)) found.push(`the note must say what "${word}" means. It takes the tint of Yes, so it must mean a limited yes`);
  }
  return found;
}

export const matrix = z.strictObject({
  ...base,
  type: z.literal('matrix'),
  // The table is the structured version of the picture, so a matrix may leave this out.
  description: description.optional(),
  kind: z.enum(['levels', 'answers']),
  columnAxis: textSchema.optional(),
  rowAxis: textSchema.optional(),
  columns: z.array(textSchema).min(2),
  entries: z.array(z.strictObject({ head: textSchema, cells: z.array(textSchema) })).min(2),
  placed: z.array(z.strictObject({ label: textSchema, row: textSchema, column: textSchema })).min(1).optional(),
}).superRefine((grid, context) => {
  for (const message of problems(grid)) context.addIssue({ code: 'custom', message });
});
