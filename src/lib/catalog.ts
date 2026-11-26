import { getCollection, type CollectionEntry } from 'astro:content';
import type { Problem } from './contracts';
import { idSchema } from './problem-schema';

type ProblemEntry = CollectionEntry<'problems'>;
export type TrackEntry = CollectionEntry<'tracks'>;
export type CatalogProblem = Pick<Problem, 'id' | 'title' | 'kind' | 'topic' | 'difficulty' | 'minutes' | 'roles'>;

export async function orderedProblems() {
  return (await validatedCatalog()).sort((a, b) =>
    a.data.title.localeCompare(b.data.title, 'en') || a.id.localeCompare(b.id, 'en'));
}

export function catalogProblem({ id, data }: ProblemEntry): CatalogProblem {
  const { title, kind, topic, difficulty, minutes, roles } = data;
  return { id, title, kind, topic, difficulty, minutes, roles };
}

function requireNestedId(id: string, folder: string, collection: string) {
  const [actualFolder, slug, ...extra] = id.split('/');
  if (actualFolder !== folder || !idSchema.safeParse(slug).success || extra.length) {
    throw new Error(`Invalid ${collection} id "${id}"; expected "${folder}/<id>"`);
  }
  return slug;
}

function requireBody(entry: { id: string; body?: string }, collection: string) {
  if (!entry.body?.trim()) throw new Error(`${collection}/${entry.id} needs a Markdown body`);
}

export function resolveTrack(track: TrackEntry, problems: ReadonlyMap<string, ProblemEntry>) {
  const seen = new Set<string>();
  return track.data.problems.map(({ id }) => {
    const problem = problems.get(id);
    if (!problem) throw new Error(`Track "${track.id}" references missing problem "${id}"`);
    if (seen.has(id)) throw new Error(`Track "${track.id}" repeats problem "${id}"`);
    seen.add(id);
    return problem;
  });
}

export async function validatedCatalog() {
  const [problems, editorials, questions, tracks] = await Promise.all([
    getCollection('problems'),
    getCollection('editorials'),
    getCollection('questions'),
    getCollection('tracks'),
  ]);
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const idToSlug = new Map<string, string>();
  const knownSlugs = new Set<string>();

  for (const problem of problems) {
    const slug = requireNestedId(problem.id, problem.data.kind, 'problem');
    if (knownSlugs.has(slug)) throw new Error(`Problem slug "${slug}" is already in use`);
    knownSlugs.add(slug);
    idToSlug.set(problem.id, slug);
    requireBody(problem, 'problems');
  }

  for (const editorial of editorials) {
    const id = editorial.data.problem.id;
    const slug = idToSlug.get(id);
    if (slug === undefined) throw new Error(`Editorial "${editorial.id}" references missing problem "${id}"`);
    if (slug !== editorial.id) throw new Error(`Editorial "${editorial.id}" must match problem slug "${slug}"`);
    requireBody(editorial, 'editorials');
  }

  for (const question of questions) {
    requireNestedId(question.id, question.data.topic, 'question');
    requireBody(question, 'questions');
  }

  for (const track of tracks) {
    if (track.id !== track.data.role) throw new Error(`Track "${track.id}" must match role "${track.data.role}"`);
    resolveTrack(track, problemById);
  }

  return problems;
}
