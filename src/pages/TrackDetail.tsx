import { Link, useParams } from 'react-router-dom';
import { StatusIcon } from '../components/Icons';
import { lookup, TRACKS } from '../content';
import { KIND_INFO } from '../content/kinds';
import { useStore } from '../lib/store';
import { NotFound } from './NotFound';
import { TrackBar, trackCounts } from './Tracks';
import './pages.css';

export default function TrackDetail() {
  const { id } = useParams();
  const track = TRACKS.find((entry) => entry.id === id);
  const items = useStore((s) => s.items);
  const cards = useStore((s) => s.cards);
  if (!track) return <NotFound />;

  const state = { items, cards };
  const total = trackCounts(track.sections.flatMap((section) => section.items), state);
  const next = track.sections.flatMap((section) => section.items).find((key) => {
    const counts = trackCounts([key], state);
    return counts.total && !counts.done;
  });
  const href = next && (lookup(next)?.type === 'item' ? `/p/${next}` : `/questions/practice?focus=${encodeURIComponent(next)}`);

  return (
    <div className="page page--narrow">
      <Link className="small pp-text-link" to="/tracks">All study plans</Link>
      <h1 className="h1 pp-track-title">{track.title}</h1>
      <p className="lede">{track.summary}</p>
      <div className="pp-actions">
        <p className="small num">{total.done} of {total.total} complete. Solved problems and cards last rated Solid count.</p>
        <TrackBar counts={total} label="Plan completion" />
        {href && <Link to={href} className="btn btn--primary pp-actions">{total.done ? 'Continue plan' : 'Start plan'}</Link>}
        {!!total.total && !href && <p className="notice">Plan complete. <Link to={`/problems?role=${track.role}`}>Find more problems</Link> for this role.</p>}
        {!total.total && <p className="notice">No rounds are available. <Link to={`/problems?role=${track.role}`}>Browse problems</Link> for this role.</p>}
      </div>
      {track.sections.map((section, i) => {
        const counts = trackCounts(section.items, state);
        if (!counts.total) return null;
        return (
          <section className="section" aria-labelledby={`track-section-${i}`} key={section.title}>
            <div className="section-head pp-section-head">
              <h2 className="h2" id={`track-section-${i}`}>{section.title}</h2>
              <span className="caption num">{counts.done} of {counts.total} complete</span>
            </div>
            {section.note && <p className="small pp-secondary">{section.note}</p>}
            <ul className="pp-link-list pp-track-list">
              {section.items.map((key) => {
                const entry = lookup(key);
                if (!entry) return null;
                const label = entry.type === 'item' ? entry.item.title : entry.question.question;
                const path = entry.type === 'item' ? `/p/${key}` : `/questions?focus=${encodeURIComponent(key)}`;
                const type = entry.type === 'item' ? KIND_INFO[entry.item.kind].label : 'Question';
                const status = entry.type === 'item' ? items[key]?.status : cards[key]?.last === 'solid' ? 'solved' : cards[key] ? 'attempted' : undefined;
                return (
                  <li key={key}>
                    <StatusIcon status={status} />
                    <Link to={path}>{label}</Link>
                    <span className="caption">{type}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

