import type { CatalogProblem } from './catalog';
import type { Kind, ProgressAttempt } from './contracts';
import { kindLabel } from './labels';
import { bestScores } from './progress';
import type { CardState } from './review';

export interface ReadinessCatalog {
  problems: readonly Pick<CatalogProblem, 'id' | 'kind' | 'topic'>[];
  questionIds: readonly string[];
}

interface TopicReadiness {
  topic: string;
  attempted: number;
  total: number;
  averageBest: number | null;
}

const readinessKinds = Object.keys(kindLabel) as Kind[];

export function calculateReadiness(
  attempts: readonly ProgressAttempt[],
  review: Readonly<Record<string, CardState>>,
  { problems, questionIds }: ReadinessCatalog,
) {
  const scores = bestScores(attempts);
  const rounds = readinessKinds.map((kind) => {
    const items = problems.filter((problem) => problem.kind === kind);
    const best = items.map(({ id }) => scores.get(id) ?? 0);
    return {
      kind,
      total: items.length,
      solved: best.filter((score) => score === 1).length,
      averageBest: items.length > 0 ? best.reduce((sum, score) => sum + score, 0) / items.length : null,
    };
  });

  const topics = new Map<string, { attempted: number; total: number; sum: number }>();
  for (const { id, topic } of problems) {
    const stats = topics.get(topic) ?? { attempted: 0, total: 0, sum: 0 };
    stats.total += 1;
    const score = scores.get(id);
    if (score !== undefined) {
      stats.attempted += 1;
      stats.sum += score;
    }
    topics.set(topic, stats);
  }

  const weakness = [...topics].map(([topic, { attempted, total, sum }]): TopicReadiness => ({
    topic, attempted, total, averageBest: attempted > 0 ? sum / attempted : null,
  }));
  const needsPractice = weakness
    .filter((row): row is TopicReadiness & { averageBest: number } => row.averageBest !== null && row.averageBest < 1)
    .sort((a, b) => a.averageBest - b.averageBest || a.topic.localeCompare(b.topic, 'en'));
  const unattempted = weakness.filter(({ attempted }) => attempted === 0)
    .sort((a, b) => a.topic.localeCompare(b.topic, 'en'));

  const questionsTotal = questionIds.length;
  const atBoxTwo = questionIds.filter((id) => isAtReviewTarget(review[id])).length;
  return {
    rounds,
    questions: {
      total: questionsTotal,
      atBoxTwo,
      share: questionsTotal > 0 ? atBoxTwo / questionsTotal : null,
    },
    needsPractice,
    unattempted,
  };
}

export function isAtReviewTarget(card: CardState | undefined) {
  return card !== undefined && card.box >= 2;
}
