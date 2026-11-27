import { getCollection, type CollectionEntry } from 'astro:content';
import type { Problem } from './contracts';
import { idSchema } from './problem-schema';

type ProblemEntry = CollectionEntry<'problems'>;
type QuestionEntry = CollectionEntry<'questions'>;
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
    throw new Error(`Invalid ${collection} id "${id}". Expected "${folder}/<id>".`);
  }
  return slug;
}

function requireBody(entry: { id: string; body?: string }, collection: string) {
  if (!entry.body?.trim()) throw new Error(`${collection}/${entry.id} needs a Markdown body`);
}

export function resolveTrack(
  track: TrackEntry,
  problems: ReadonlyMap<string, ProblemEntry>,
  questions: ReadonlyMap<string, QuestionEntry>,
) {
  if (track.id !== track.data.role) throw new Error(`Track "${track.id}" must match role "${track.data.role}"`);
  const seenProblems = new Set<string>();
  const seenQuestions = new Set<string>();

  function resolve<T>(entries: ReadonlyMap<string, T>, seen: Set<string>, kind: string, id: string, section: string) {
    const entry = entries.get(id);
    const location = `Track "${track.id}", section "${section}"`;
    if (!entry) throw new Error(`${location} references missing ${kind} "${id}"`);
    if (seen.has(id)) throw new Error(`${location} repeats ${kind} "${id}"`);
    seen.add(id);
    return entry;
  }

  return track.data.sections.map((section) => ({
    title: section.title,
    note: section.note,
    problems: section.problems.map(({ id }) => resolve(problems, seenProblems, 'problem', id, section.title)),
    questions: section.questions.map(({ id }) => resolve(questions, seenQuestions, 'question', id, section.title)),
  }));
}

export async function orderedTracks() {
  const [problems, questions, tracks] = await Promise.all([
    getCollection('problems'), getCollection('questions'), getCollection('tracks'),
  ]);
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const order = ['manual-qa', 'automation', 'sdet', 'senior'];

  return tracks.sort((a, b) => order.indexOf(a.data.role) - order.indexOf(b.data.role)).map((track) => ({
    id: track.id,
    title: track.data.title,
    role: track.data.role,
    summary: track.data.summary,
    sections: resolveTrack(track, problemById, questionById).map((section) => ({
      ...section,
      problems: section.problems.map(({ id, data }) => ({ id, title: data.title })),
      questions: section.questions.map(({ id, data }) => ({ id, title: data.title })),
    })),
  }));
}

export async function validatedCatalog() {
  const [problems, editorials, questions, tracks] = await Promise.all([
    getCollection('problems'),
    getCollection('editorials'),
    getCollection('questions'),
    getCollection('tracks'),
  ]);
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const questionById = new Map(questions.map((question) => [question.id, question]));
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
    resolveTrack(track, problemById, questionById);
  }

  return problems;
}
