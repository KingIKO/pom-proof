import { kindLabel, topicLabel } from '../../lib/labels';
import type { calculateReadiness } from '../../lib/readiness';
import { url } from '../../lib/url';

const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 });
type Readiness = ReturnType<typeof calculateReadiness>;

function topicUrl(topic: string) {
  return url(`/?${new URLSearchParams({ q: topicLabel(topic) })}`);
}

function ReadinessMeter({ share, label, empty }: { share: number | null; label: string; empty: string }) {
  if (share === null) return <span class="muted">{empty}</span>;
  return (
    <div class="progress-meter">
      <progress class="progress-bar" value={share} max={1} aria-label={`${label} readiness`} />
      <span>{percent.format(share)}</span>
    </div>
  );
}

export function RoundReadiness({ rounds, questions, loaded }: Pick<Readiness, 'rounds' | 'questions'> & { loaded: boolean }) {
  return (
    <section class="progress-section progress-table-section" data-card aria-labelledby="readiness-heading">
      <header class="progress-section-heading">
        <h2 id="readiness-heading">Round readiness</h2>
        <p id="readiness-method" class="prose muted">
          Each problem round shows the average of your best scores for its problems.
          If you have not tried a problem, it counts as zero. A full score counts as solved.
          Review boxes set when questions come up again.
          For interview questions, readiness is the percentage of questions at box 2 or higher.
        </p>
      </header>
      <table class="readiness-table" aria-label="Readiness by round" aria-describedby="readiness-method">
        <thead>
          <tr><th scope="col">Round</th><th scope="col">Progress</th><th scope="col">Readiness</th></tr>
        </thead>
        <tbody>
          {rounds.map(({ kind, total, solved, averageBest }) => (
            <tr key={kind}>
              <th scope="row">{kindLabel[kind]}</th>
              <td>{loaded && `${solved} of ${total} solved`}</td>
              <td>{loaded && <ReadinessMeter share={averageBest} label={kindLabel[kind]} empty="No problems" />}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Interview questions</th>
            <td>{loaded && `${questions.atBoxTwo} of ${questions.total} at box 2+`}</td>
            <td>{loaded && <ReadinessMeter share={questions.share} label="Interview questions" empty="No questions" />}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function WeakTopics({ needsPractice, unattempted, hasProblems, loaded }: Pick<Readiness, 'needsPractice' | 'unattempted'> & {
  hasProblems: boolean;
  loaded: boolean;
}) {
  return (
    <section class="progress-section" data-card aria-labelledby="weak-topics-heading">
      <h2 id="weak-topics-heading">Weak topics</h2>
      {loaded && (
        <>
          {needsPractice.length === 0 ? (
            <p class="muted">{hasProblems ? 'No topics need more practice based on the problems you’ve tried.' : 'No topics yet'}</p>
          ) : (
            <>
              <p class="prose muted">Topics with the lowest scores appear first. Each score averages your best scores on problems you’ve tried in that topic.</p>
              <ul class="weak-topics" role="list">
                {needsPractice.map(({ topic, averageBest, attempted, total }) => (
                  <li key={topic}>
                    <a href={topicUrl(topic)}>{topicLabel(topic)}</a>
                    <span class="muted num">{percent.format(averageBest)} average best, {attempted} of {total} tried</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {unattempted.length > 0 && (
            <details class="unattempted-details">
              <summary>
                <span class="chevron" aria-hidden="true" />
                <span>Never attempted <span class="num">({unattempted.length})</span></span>
              </summary>
              <ul class="weak-topics unattempted-topics" role="list">
                {unattempted.map(({ topic }) => (
                  <li key={topic}><a href={topicUrl(topic)}>{topicLabel(topic)}</a></li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
