import type { Json, ProblemData, Role } from './problem-schema';

export type { Json, Role };
export type Kind = ProblemData['kind'];
export type StructuredKind = 'scenario' | 'diagnosis' | 'bug-report';
export type Problem<K extends Kind = Kind> = {
  [P in K]: Extract<ProblemData, { kind: P }> & { id: string };
}[K];

type AnswerByKind = {
  [P in Kind]: { kind: P; value: Problem<P>['reference'] };
}[Kind];
export type Answer<K extends Kind = Kind> = AnswerByKind & { kind: K };

type StructuredDetails = { items: Array<{ id: string; passed: boolean; note?: string }> };
type Details = {
  scenario: StructuredDetails;
  diagnosis: StructuredDetails;
  'bug-report': StructuredDetails;
  'test-design': {
    validOnReference: boolean;
    failedRows: Array<{ row: number; message: string }>;
    referenceFailure?: string;
    mutants: Array<{ name: string; killed: boolean; teaches?: string }>;
  };
  locator: { fixtures: Array<{ name: string; matches: number; matchedTarget: boolean }>; warnings: string[] };
  sql: { datasets: Array<{ name: 'seed' | 'altered-seed'; passed: boolean }> };
  code: { vectors: Array<{ name: string; passed: boolean }> };
};

type ResultByKind = {
  [P in Kind]: { kind: P } & (
    | { status: 'graded'; score: number; details: Details[P] }
    | { status: 'invalid-answer'; message: string }
    | { status: 'not-built' }
  );
}[Kind];
export type GradeResult<K extends Kind = Kind> = ResultByKind & { kind: K };

export type Grader<K extends Kind> = (problem: Problem<K>, answer: Answer<K>) =>
  GradeResult<K> | Promise<GradeResult<K>>;

export interface ProgressAttempt {
  problemId: string;
  completedAt: string;
  score: number;
}

export interface ProgressSnapshot {
  version: 1;
  attempts: ProgressAttempt[];
}

export const progressStorageKey = 'pom-proof:progress';

export interface ProgressStore {
  read(): ProgressSnapshot;
  record(attempt: ProgressAttempt): void;
  exportJson(): string;
  importJson(json: string): { ok: true; snapshot: ProgressSnapshot } | { ok: false; message: string };
}

export type CreateProgressStore = (storage: Pick<Storage, 'getItem' | 'setItem'>) => ProgressStore;

declare global {
  interface Window {
    __pomproof?: { grade(answer: Answer): Promise<GradeResult> };
  }
}
