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

export function TracksList({ tracks }: { tracks: TrackSummary[] }) {
  const snapshot = useStudySnapshot();
  const scores = bestScores(snapshot?.attempts ?? []);

  return (
    <ul class="track-list" role="list">
      {tracks.map(({ id, title, summary, problemIds, questionIds }) => {
        const solved = problemIds.filter((problemId) => scores.get(problemId) === 1).length;
        const reviewed = questionIds.filter((questionId) => isAtReviewTarget(snapshot?.cards[questionId])).length;
        return (
          <li key={id}>
            <h2><a href={url(`/tracks/${id}/`)}>{title}</a></h2>
            <p class="prose">{summary}</p>
            {snapshot && (
              <p class="muted track-counts">
                {problemIds.length > 0 && <span>{solved} of {problemIds.length} problems solved</span>}
                {questionIds.length > 0 && <span>{reviewed} of {questionIds.length} questions at box 2+</span>}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function reviewStatus(card: CardState | undefined, now: number) {
  if (!card) return 'New';
  return `Box ${card.box}${Date.parse(card.due) <= now ? ', due' : ''}`;
}

export function TrackSections({ sections }: Pick<Track, 'sections'>) {
  const snapshot = useStudySnapshot();
  const scores = bestScores(snapshot?.attempts ?? []);
  const now = Date.now();

  return sections.map(({ title, note, problems, questions }, index) => (
    <section class="track-section" key={title} aria-labelledby={`track-section-${index + 1}`}>
      <h2 id={`track-section-${index + 1}`}>{title}</h2>
      {note && <p class="muted prose">{note}</p>}
      {problems.length > 0 && (
        <>
          <h3>Problems</h3>
          <ul class="track-items" role="list">
            {problems.map(({ id, title: name }) => (
              <li key={id}>
                <a href={problemUrl(id)}>{name}</a>
                {snapshot && <span class="muted track-status">{statusLabel[problemStatus(scores.get(id))]}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {questions.length > 0 && (
        <>
          <h3>Interview questions</h3>
          <ul class="track-items" role="list">
            {questions.map(({ id, title: name }) => (
              <li key={id}>
                <a href={url(`/questions/${id}/`)}>{name}</a>
                {snapshot && <span class="muted track-status">{reviewStatus(snapshot.cards[id], now)}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  ));
}
