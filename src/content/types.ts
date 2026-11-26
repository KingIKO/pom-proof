export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Role = 'manual' | 'automation' | 'sdet' | 'lead';
export type Kind =
  | 'coding'
  | 'mutation'
  | 'locator'
  | 'sql'
  | 'bughunt'
  | 'testdesign'
  | 'uilab'
  | 'scenario'
  | 'diagnose'
  | 'review';

/** Review categories offered in code review items. */
export const REVIEW_CATEGORIES = [
  'Brittle locator',
  'Hard-coded wait',
  'Missing or weak assertion',
  'Shared state between tests',
  'Test data coupling',
  'Wrong test layer',
  'Swallowed error',
  'Duplicated setup',
  'Unclear name or intent',
  'Security or secrets',
] as const;
export type Lang = 'javascript' | 'typescript' | 'python';

export interface Source {
  label: string;
  url: string;
}

/** Fields every practice item shares. Prompts and notes are Markdown. */
export interface BaseItem {
  id: string;
  title: string;
  kind: Kind;
  difficulty: Difficulty;
  topics: string[];
  roles: Role[];
  /** One line shown in lists. */
  summary: string;
  /** The task, in Markdown. */
  prompt: string;
  hints?: string[];
  /** Shown after a solve, or when the user asks for it. */
  solutionNotes?: string;
  /** What an interviewer listens for when this comes up live. */
  interviewNotes?: string;
  sources?: Source[];
}

export interface CodingCase {
  args: unknown[];
  expected: unknown;
  /** Hidden cases run on Submit only. */
  hidden?: boolean;
}

export interface CodingItem extends BaseItem {
  kind: 'coding';
  fn: string;
  params: { name: string; type: string }[];
  returns: string;
  /** exact: deep equal. unordered: arrays compared as multisets (top level). */
  compare?: 'exact' | 'unordered';
  cases: CodingCase[];
  starter?: Partial<Record<Lang, string>>;
  reference: { javascript: string; python?: string };
}

export interface Mutant {
  id: string;
  /** Revealed once the user's tests catch it. */
  label: string;
  code: string;
}

/**
 * Write tests that pass against the real implementation and fail against
 * every planted bug. subject 'function' exposes a named function; subject
 * 'api' exposes createServer() and the tests receive a { request } fixture.
 */
export interface MutationItem extends BaseItem {
  kind: 'mutation';
  subject: 'function' | 'api';
  /** Public contract shown to the user (Markdown). */
  contract: string;
  implementation: string;
  mutants: Mutant[];
  starter: string;
  referenceTests: string;
}

export interface LocatorItem extends BaseItem {
  kind: 'locator';
  html: string;
  /** CSS selector for the answer key. The user never sees it. */
  target: string;
  /** Which locator syntaxes the user may use. */
  allow: ('css' | 'xpath' | 'playwright')[];
  /** A sample good answer per syntax, shown after a solve. */
  examples: Partial<Record<'css' | 'xpath' | 'playwright', string>>;
}

export interface SqlItem extends BaseItem {
  kind: 'sql';
  dataset: string;
  answer: string;
  orderMatters: boolean;
}

export interface BugDef {
  id: string;
  title: string;
  area: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Trivial';
  hint: string;
}

export interface BugHuntItem extends BaseItem {
  kind: 'bughunt';
  app: string;
  spec: string;
  areas: string[];
  bugs: BugDef[];
}

export type FieldDef =
  | { name: string; label: string; type: 'number' | 'text' }
  | { name: string; label: string; type: 'select'; options: string[] }
  | { name: string; label: string; type: 'boolean' };

export type DesignRow = Record<string, string | number | boolean>;

export interface Partition {
  id: string;
  label: string;
  kind: 'valid' | 'invalid' | 'boundary';
  matches: (row: DesignRow) => boolean;
}

export interface TestDesignItem extends BaseItem {
  kind: 'testdesign';
  technique: 'Equivalence partitioning' | 'Boundary value analysis' | 'Decision table' | 'Pairwise';
  fields: FieldDef[];
  outcomes: string[];
  /** The correct behavior. Grades the expected outcome on each row. */
  oracle: (row: DesignRow) => string;
  /** Classes or rules a complete design covers. Unused for pairwise. */
  partitions: Partition[];
  /**
   * Buggy versions of the oracle. A row catches one when the bug changes the
   * outcome for that row and the row's expected outcome is right.
   */
  mutants: { id: string; label: string; fn: (row: DesignRow) => string }[];
  /** Pairwise only: target number of rows. */
  targetRows?: number;
}

export interface UiMutant {
  id: string;
  label: string;
  /** Replaces the app's script source for this variant. */
  script: string;
}

export interface UiLabItem extends BaseItem {
  kind: 'uilab';
  /** Page markup (body content). */
  html: string;
  css?: string;
  /** App behavior, plain JS run inside the page. */
  script: string;
  mutants: UiMutant[];
  starter: string;
  referenceTests: string;
}

export interface ChecklistEntry {
  id: string;
  area: string;
  idea: string;
  /** Lowercase stems; any match marks the entry as likely covered. */
  keywords: string[];
  /** 3 = an interviewer expects it, 1 = nice extra. */
  weight: 1 | 2 | 3;
}

/** "How would you test X": brainstorm, compare to a published key, then prioritise under a budget. */
export interface ScenarioItem extends BaseItem {
  kind: 'scenario';
  minutes: number;
  checklist: ChecklistEntry[];
  prioritize?: {
    budget: number;
    question: string;
    candidates: { id: string; text: string; value: 'high' | 'medium' | 'low'; why: string }[];
  };
}

export interface ChoiceQuestion {
  prompt: string;
  options: { text: string; correct?: boolean; why: string }[];
}

/** A failing or flaky test with its log: find the root cause and the right fix. */
export interface DiagnoseItem extends BaseItem {
  kind: 'diagnose';
  lang: 'typescript' | 'javascript' | 'python' | 'java';
  code: string;
  log: string;
  questions: ChoiceQuestion[];
}

export interface ReviewIssue {
  id: string;
  lines: [number, number];
  category: string;
  title: string;
  explanation: string;
}

/** Review a pull request of test code: flag lines and name the problem. */
export interface ReviewItem extends BaseItem {
  kind: 'review';
  lang: 'typescript' | 'javascript' | 'python' | 'java';
  code: string;
  issues: ReviewIssue[];
}

export type PracticeItem =
  | CodingItem
  | MutationItem
  | LocatorItem
  | SqlItem
  | BugHuntItem
  | TestDesignItem
  | UiLabItem
  | ScenarioItem
  | DiagnoseItem
  | ReviewItem;

export interface Question {
  id: string;
  topic: string;
  roles: Role[];
  level: 'Junior' | 'Mid' | 'Senior';
  type: 'Concept' | 'Scenario' | 'Behavioral' | 'Tooling';
  question: string;
  /** Model answer, Markdown. Keep it speakable: what a strong candidate says. */
  answer: string;
  lookFor: string[];
  mistakes?: string[];
  followUps?: string[];
  sources?: Source[];
}

export interface TrackSection {
  title: string;
  note?: string;
  items: string[];
}

export interface Track {
  id: string;
  role: Role;
  title: string;
  summary: string;
  sections: TrackSection[];
}
