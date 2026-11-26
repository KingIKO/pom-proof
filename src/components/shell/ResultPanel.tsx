import type { GradeResult } from '../../lib/contracts';
import '../../styles/results.css';

const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 });

function scoreText(result: Extract<GradeResult, { status: 'graded' }>) {
  const { details } = result;
  if ('items' in details) return `${checks(details.items, ({ passed }) => passed)}. Score ${percent.format(result.score)}`;
  if ('fixtures' in details) return checks(details.fixtures, ({ matchedTarget }) => matchedTarget);
  if ('datasets' in details) return checks(details.datasets, ({ passed }) => passed);
  if ('vectors' in details) return checks(details.vectors, ({ passed }) => passed);
  if ('mutants' in details && details.validOnReference) {
    const killed = details.mutants.filter(({ killed }) => killed).length;
    return `${killed} of ${details.mutants.length} faulty versions caught`;
  }
  return `Score: ${percent.format(result.score)}`;
}

function checks<T>(items: T[], passed: (item: T) => boolean) {
  return `${items.filter(passed).length} of ${items.length} checks passed`;
}

export default function ResultPanel(props: { result: GradeResult | null; busy?: boolean; misses?: string[] }) {
  const { result, busy, misses } = props;
  if (result === null) return null;

  const status = result.status === 'graded' ? (result.score === 1 ? 'pass' : 'fail') : 'warn';
  const mark = { pass: 'Pass', fail: 'Fail', warn: 'Not graded' }[status];

  return (
    <section class="result" role="status" aria-busy={busy} data-status={status}>
      <div key={result.status === 'graded' ? `${status}:${result.score}:${misses?.join('\n') ?? ''}` : status} class="result-content">
        <p>
          <strong>{mark}</strong>
          {': '}
          {result.status === 'graded' ? scoreText(result)
            : result.status === 'invalid-answer' ? result.message
              : 'Grading is unavailable'}
        </p>
        {!!misses?.length && <ul>{misses.map((miss, index) => <li key={index}>{miss}</li>)}</ul>}
      </div>
    </section>
  );
}
