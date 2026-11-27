import type { orderedTracks } from '../../lib/catalog';
import { problemStatus, statusLabel } from '../../lib/labels';
import { bestScores } from '../../lib/progress';
import { isAtReviewTarget } from '../../lib/readiness';
import type { CardState } from '../../lib/review';
import { problemUrl, url } from '../../lib/url';
import { useStudySnapshot } from '../progress/useStudySnapshot';
import './tracks.css';

type Track = Awaited<ReturnType<typeof orderedTracks>>[number];
type TrackSummary = Pick<Track, 'id' | 'title' | 'summary'> & { problemIds: string[]; questionIds: string[] };
const percent = new Intl.NumberFormat('en', { style: 'percent' });

export function TracksList({ tracks }: { tracks: TrackSummary[] }) {
  const snapshot = useStudySnapshot();
  const scores = bestScores(snapshot?.attempts ?? []);

  return (
    <ul class="track-list" role="list">
      {tracks.map(({ id, title, summary, problemIds, questionIds }) => {
        const solved = problemIds.filter((problemId) => scores.get(problemId) === 1).length;
        const reviewed = questionIds.filter((questionId) => isAtReviewTarget(snapshot?.cards[questionId])).length;
        const total = problemIds.length + questionIds.length;
        return (
          <li key={id} class="track-card row-card" data-card>
            <h2>
              <a class="stretched-link" href={url(`/tracks/${id}/`)}>{title}</a>
              <span class="chevron right" aria-hidden="true" />
            </h2>
            <p class="prose muted">{summary}</p>
            {snapshot && (
              <div class="track-card-progress">
                <p class="muted track-counts num">
                  {problemIds.length > 0 && <span>{solved} of {problemIds.length} problems solved</span>}
                  {questionIds.length > 0 && <span>{reviewed} of {questionIds.length} questions at box 2+</span>}
                </p>
                {total > 0 && (
                  <div class="progress-meter">
                    <progress class="progress-bar" aria-label={`${title} progress`} value={solved + reviewed} max={total} />
                    <span>{percent.format((solved + reviewed) / total)}</span>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function reviewStatus(card: CardState | undefined, now: number) {
  if (!card) return { label: 'New', due: false };
  const due = Date.parse(card.due) <= now;
  return { label: `Box ${card.box}${due ? ', due' : ''}`, due };
}

export function TrackSections({ sections }: Pick<Track, 'sections'>) {
  const snapshot = useStudySnapshot();
  const scores = bestScores(snapshot?.attempts ?? []);
  const now = Date.now();

  return (
    <div class="track-sections">
      {sections.map(({ title, note, problems, questions }, index) => (
        <section class="track-section" data-card key={title} aria-labelledby={`track-section-${index + 1}`}>
          <header class="track-section-heading">
            <h2 id={`track-section-${index + 1}`}>{title}</h2>
            {note && <p class="prose muted">{note}</p>}
          </header>
          {problems.length > 0 && (
            <>
              <h3 class="section-label">Problems</h3>
              <ul class="track-items" role="list">
                {problems.map(({ id, title: name }) => {
                  const status = problemStatus(scores.get(id));
                  return (
                    <li key={id}>
                      <a class="track-item-link" href={problemUrl(id)}>{name}</a>
                      {snapshot && <span class={`track-status status-chip ${status}`}>{statusLabel[status]}</span>}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {questions.length > 0 && (
            <>
              <h3 class="section-label">Interview questions</h3>
              <ul class="track-items" role="list">
                {questions.map(({ id, title: name }) => {
                  const { label, due } = reviewStatus(snapshot?.cards[id], now);
                  return (
                    <li key={id}>
                      <a class="track-item-link" href={url(`/questions/${id}/`)}>{name}</a>
                      {snapshot && <span class={`track-status status-chip${due ? ' due' : ''}`}>{label}</span>}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
