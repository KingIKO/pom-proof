import { kindLabel, topicLabel } from '../../lib/labels';
import { calculateReadiness, type ReadinessCatalog } from '../../lib/readiness';
import { dueIds } from '../../lib/review';
import { url } from '../../lib/url';
import { useStudySnapshot } from './useStudySnapshot';

const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 });

function topicUrl(topic: string) {
  return url(`/?${new URLSearchParams({ q: topicLabel(topic) })}`);
}

export default function ReadinessOverview(catalog: ReadinessCatalog) {
  const snapshot = useStudySnapshot();
  const { questionIds } = catalog;
  const { rounds, questions, needsPractice, unattempted } =
    calculateReadiness(snapshot?.attempts ?? [], snapshot?.cards ?? {}, catalog);
  const queue = snapshot ? dueIds([...questionIds]) : [];
  const due = snapshot ? queue.filter((id) => Object.hasOwn(snapshot.cards, id)).length : 0;
  const unseen = queue.length - due;

  return (
    <>
      <section class="progress-section review-overview" aria-labelledby="review-heading">
        <h2 id="review-heading">Review queue</h2>
        {snapshot && <p class="muted">{due} due for review, {unseen} new</p>}
        <a href={url('/questions/#review')}>Start review</a>
      </section>
      <section class="progress-section" aria-labelledby="readiness-heading">
        <h2 id="readiness-heading">Round readiness</h2>
        <p id="readiness-method" class="prose muted">
          Problem rounds average the best score for each problem, counting unattempted problems as zero.
          A full score counts as solved. For interview questions, readiness is the share of cards at box 2 or higher.
        </p>
        <table class="readiness-table" aria-label="Readiness by round" aria-describedby="readiness-method">
          <thead>
            <tr><th scope="col">Round</th><th scope="col">Progress</th><th scope="col">Readiness</th></tr>
          </thead>
          <tbody>
            {rounds.map(({ kind, total, solved, averageBest }) => (
              <tr key={kind}>
                <th scope="row">{kindLabel[kind]}</th>
                <td>{snapshot && `${solved} of ${total} solved`}</td>
                <td>{snapshot && (averageBest === null ? 'No problems' : percent.format(averageBest))}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Interview questions</th>
              <td>{snapshot && `${questions.atBoxTwo} of ${questions.total} at box 2+`}</td>
              <td>{snapshot && (questions.share === null ? 'No questions' : percent.format(questions.share))}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="progress-section" aria-labelledby="weak-topics-heading">
        <h2 id="weak-topics-heading">Weak topics</h2>
        {snapshot && (
          <>
            {needsPractice.length > 0 && (
              <>
                <p class="prose muted">Lowest average best scores first, using only attempted problems.</p>
                <ul class="weak-topics" role="list">
                  {needsPractice.map(({ topic, averageBest, attempted, total }) => (
                    <li key={topic}>
                      <a href={topicUrl(topic)}>{topicLabel(topic)}</a>
                      <span class="muted">{percent.format(averageBest)} average best, {attempted} of {total} tried</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {unattempted.length > 0 && (
              <details class="unattempted-details">
                <summary>Never attempted ({unattempted.length})</summary>
                <ul class="weak-topics unattempted-topics" role="list">
                  {unattempted.map(({ topic }) => (
                    <li key={topic}><a href={topicUrl(topic)}>{topicLabel(topic)}</a></li>
                  ))}
                </ul>
              </details>
            )}
            {needsPractice.length === 0 && unattempted.length === 0 && (
              <p class="muted">{catalog.problems.length === 0 ? 'No topics yet' : 'All attempted problems have full scores.'}</p>
            )}
          </>
        )}
      </section>
    </>
  );
}
