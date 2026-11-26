import { Link } from 'react-router-dom';
import { lookup, TRACKS } from '../content';
import type { Track } from '../content/types';
import { useStore, type State } from '../lib/store';
import './pages.css';

export function trackCounts(ids: string[], state: Pick<State, 'items' | 'cards'>) {
  let total = 0;
  let done = 0;
  for (const id of ids) {
    const entry = lookup(id);
    if (!entry) continue;
    total++;
    if (entry.type === 'item' ? state.items[id]?.status === 'solved' : state.cards[id]?.last === 'solid') done++;
  }
  return { done, total };
}

export function TrackBar({ counts, label }: { counts: { done: number; total: number }; label: string }) {
  return (
    <div className="bar pp-track-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={counts.total || 1} aria-valuenow={counts.done} aria-valuetext={`${counts.done} of ${counts.total} complete`}>
      <span style={{ width: `${counts.total ? counts.done / counts.total * 100 : 0}%` }} />
    </div>
  );
}

function TrackCard({ track, state }: { track: Track; state: Pick<State, 'items' | 'cards'> }) {
  const counts = trackCounts(track.sections.flatMap((section) => section.items), state);
  return (
    <Link className="lab-link pp-track-card" to={`/tracks/${track.id}`}>
      <h2 className="h2">{track.title}</h2>
      <p>{track.summary}</p>
      <div className="pp-row caption num"><span>{track.sections.length} weeks</span><span>{counts.done} of {counts.total} complete</span></div>
      <TrackBar counts={counts} label={track.title} />
    </Link>
  );
}

export default function Tracks() {
  const items = useStore((s) => s.items);
  const cards = useStore((s) => s.cards);
  return (
    <div className="page">
      <h1 className="h1">Study plans</h1>
      <p className="lede">Pick a role and work through its questions and problems week by week.</p>
      {TRACKS.length ? (
        <div className="grid-2 pp-actions">
          {TRACKS.map((track) => <TrackCard track={track} state={{ items, cards }} key={track.id} />)}
        </div>
      ) : (
        <p className="notice pp-actions">No study plans yet. <Link to="/problems">Browse problems</Link> to get started.</p>
      )}
    </div>
  );
}

