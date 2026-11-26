import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { QUESTION_TOPICS, QUESTIONS } from '../content';
import { ROLE_INFO } from '../content/kinds';
import type { Question, Role } from '../content/types';
import { useStore, type CardState } from '../lib/store';
import './pages.css';

const levels = ['Junior', 'Mid', 'Senior'] as const;
const types = ['Concept', 'Scenario', 'Behavioral', 'Tooling'] as const;
const roles = Object.keys(ROLE_INFO) as Role[];

export function matchQuestions(questions: Question[], params: URLSearchParams) {
  const q = params.get('q')?.trim().toLowerCase();
  const topic = params.get('topic');
  const role = params.get('role');
  const level = params.get('level');
  const type = params.get('type');
  const focus = params.get('focus');
  return questions.filter((card) =>
    (!topic || card.topic === topic) &&
    (!role || card.roles.some((r) => r === role)) &&
    (!level || card.level === level) &&
    (!type || card.type === type) &&
    (!focus || card.id === focus) &&
    (!q || `${card.question} ${card.topic}`.toLowerCase().includes(q))
  );
}

function AnswerList({ title, entries }: { title: string; entries?: string[] }) {
  if (!entries?.length) return null;
  return (
    <div>
      <h3 className="h3">{title}</h3>
      <ul className="look-for">{entries.map((entry) => <li key={entry}>{entry}</li>)}</ul>
    </div>
  );
}

export function QuestionAnswer({ question }: { question: Question }) {
  return (
    <div className="pp-answer">
      <div>
        <h3 className="h3">Model answer</h3>
        <Markdown text={question.answer} />
      </div>
      <AnswerList title="What they listen for" entries={question.lookFor} />
      <AnswerList title="Common mistakes" entries={question.mistakes} />
      <AnswerList title="Follow-up questions" entries={question.followUps} />
      {!!question.sources?.length && (
        <div>
          <h3 className="h3">Sources</h3>
          <ul className="look-for">{question.sources.map((source) => (
            <li key={`${source.label}:${source.url}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, name, options, params, set }: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  params: URLSearchParams;
  set: (key: string, value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" aria-label={label} value={params.get(name) ?? ''} onChange={(e) => set(name, e.target.value)}>
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

const asOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));
const filterOptions = [
  { label: 'Topic', name: 'topic', options: asOptions(QUESTION_TOPICS) },
  { label: 'Role', name: 'role', options: roles.map((value) => ({ value, label: ROLE_INFO[value].label })) },
  { label: 'Level', name: 'level', options: asOptions(levels) },
  { label: 'Type', name: 'type', options: asOptions(types) },
];

function QuestionRow({ question, card, focused }: { question: Question; card?: CardState; focused: boolean }) {
  const [open, setOpen] = useState(focused);
  return (
    <details className="pp-question" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className="pp-question-prompt">{question.question}</span>
        <span className="pp-question-meta small">
          <span>{question.topic}</span>
          <span>{question.level} / {question.type}</span>
          {card && <span className="num">Box {card.box}, {card.last}</span>}
        </span>
      </summary>
      {open && <QuestionAnswer question={question} />}
    </details>
  );
}

export default function Questions() {
  const [routeParams, setParams] = useSearchParams();
  const [pending, setPending] = useState<URLSearchParams | null>(null);
  const params = pending ?? routeParams;
  const cards = useStore((s) => s.cards);
  const focus = params.get('focus');
  const questions = useMemo(() => matchQuestions(QUESTIONS, params), [params]);
  const activeFilters = [...params.keys()].some((key) => ['q', 'topic', 'role', 'level', 'type', 'focus'].includes(key));

  useEffect(() => {
    if (routeParams.toString() === new URLSearchParams(window.location.search).toString()) setPending(null);
  }, [routeParams]);

  function change(next: URLSearchParams) {
    setPending(next);
    setParams(next, { replace: true });
  }

  function set(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    next.delete('focus');
    if (value) next.set(key, value);
    else next.delete(key);
    change(next);
  }

  return (
    <div className="page pp-questions">
      <h1 className="h1">Questions</h1>
      <p className="lede">Browse interview prompts and compare your answers with examples.</p>
      <div className="pp-filters">
        <label className="field pp-search">
          <span>Search questions</span>
          <input className="input" type="search" placeholder="Try HTTP status" value={params.get('q') ?? ''} onChange={(e) => set('q', e.target.value)} />
        </label>
        {filterOptions.map((option) => <FilterSelect key={option.name} {...option} params={params} set={set} />)}
      </div>
      <div className="pp-bank-tools pp-row">
        <span className="small num" role="status">{questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>
        <div className="btn-row">
          {activeFilters && <button className="btn btn--ghost" onClick={() => change(new URLSearchParams())}>{focus ? 'Show all' : 'Clear filters'}</button>}
          {questions.length > 0 && <Link className="btn btn--primary" to={{ pathname: '/questions/practice', search: params.toString() }}>Practise flashcards</Link>}
        </div>
      </div>
      {questions.length === 0 ? (
        <p className="notice">No matching questions. Clear a filter or try a different search.</p>
      ) : (
        <div className="pp-bank">
          {questions.map((question) => (
            <QuestionRow key={`${focus ?? ''}:${question.id}`} question={question} card={cards[question.id]} focused={focus === question.id} />
          ))}
        </div>
      )}
    </div>
  );
}

