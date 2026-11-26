import type { SqlItem } from '../../types';

const answer = `SELECT ROUND(AVG(julianday(closed_on) - julianday(created_on)), 2)
         AS avg_days_to_close
FROM defects
WHERE status = 'fixed' AND created_on IS NOT NULL AND closed_on IS NOT NULL;`;

const item: SqlItem = {
  id: 'average-fixed-defect-close-time',
  kind: 'sql',
  title: 'Average time to close fixed defects',
  difficulty: 'Medium',
  topics: ['SQL', 'Dates', 'Defect metrics'],
  roles: ['manual', 'automation', 'sdet', 'lead'],
  summary: 'Measure elapsed calendar days for fixes with a known start and close date.',
  prompt: 'Calculate the mean number of elapsed calendar days from `created_on` to `closed_on` for defects marked `fixed`. Exclude rows with a missing date. Round to two decimal places and return NULL when no fixed defect has both dates.\n\nReturn one row with one column: `avg_days_to_close`.',
  dataset: 'testops',
  answer,
  orderMatters: false,
  hints: ['SQLite’s `julianday()` turns each date into a number you can subtract.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nThe fixed defects took 2, 6, and 1 days, for an average of 3.00. Subtracting the date strings directly in SQLite coerces them to their leading year numbers and produces zero here. The status filter keeps the \`wont_fix\` closure out of the metric.`,
  interviewNotes: 'SQLite uses `julianday` here. For PostgreSQL date columns, `closed_on - created_on` returns an integer day count; MySQL offers `DATEDIFF(closed_on, created_on)`. If the fields are timestamps, clarify whether the metric is elapsed time or calendar-day difference.',
};

export default item;
