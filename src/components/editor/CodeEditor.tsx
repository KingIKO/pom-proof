import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql, SQLite } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Annotation, Compartment, EditorState, Prec, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { basicSetup } from 'codemirror';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { codeNumber, codeType } from './light-plus.mjs';
import './editor.css';

interface Props {
  value: string;
  onChange(value: string): void;
  language: 'js' | 'ts' | 'python' | 'sql';
  label: string;
  onRun?(): void;
  minLines?: number;
  toolbar?: ComponentChildren;
  resetTo?: string;
  busy?: boolean;
}

const languageSupport = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  python,
  sql: () => sql({ dialect: SQLite }),
};

const setValue = Annotation.define<boolean>();

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--codeBg)', color: 'var(--text)', fontSize: 'var(--type-14)' },
  '&.cm-focused': { outline: 'var(--focus-width) solid var(--focus)', outlineOffset: '-2px' },
  '.cm-scroller': {
    fontFamily: 'var(--font-code)',
    lineHeight: '1.5',
    minHeight: 'calc(var(--editor-lines) * 1.5em + 2 * var(--space-8))',
    maxHeight: '28rem',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--codeBg)',
    color: 'var(--text2)',
    borderRight: '1px solid var(--divider)',
  },
  '.cm-content': { caretColor: 'var(--text)', paddingBlock: 'var(--space-8)' },
  '.cm-line': { paddingInline: 'var(--space-8)' },
  '.cm-lineWrapping .cm-line': {
    paddingInlineStart: 'calc(var(--space-8) + 2ch)',
    textIndent: '-2ch',
  },
  '.cm-activeLine, .cm-activeLineGutter, .cm-tooltip, .cm-panels': {
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
  },
  '.cm-button, .cm-button:active, .cm-textfield, .cm-foldPlaceholder': {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--borderControl)',
    borderRadius: 'var(--radius-control)',
  },
  '.cm-selectionMatch, .cm-searchMatch, &.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--codeSelection)',
  },
  '.cm-searchMatch-selected': { outline: 'var(--focus-width) solid var(--focus)' },
  '&.cm-focused .cm-nonmatchingBracket': { backgroundColor: 'transparent', textDecoration: 'underline' },
  '.cm-specialChar': { color: 'var(--text2)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text)' },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--codeSelection)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--ink)',
    color: 'var(--surface)',
  },
  '.cm-completionIcon': { display: 'none' },
  '@media (prefers-reduced-motion: reduce)': {
    '&.cm-focused > .cm-scroller > .cm-cursorLayer': { animation: 'none' },
  },
});

const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: [tags.operator, tags.punctuation], color: 'var(--text)' },
  { tag: [tags.keyword, tags.bool, tags.null, tags.atom, tags.self], color: '#0000FF' },
  { tag: [tags.controlKeyword, tags.moduleKeyword], color: '#AF00DB' },
  { tag: [tags.string, tags.special(tags.string)], color: '#A31515' },
  { tag: tags.regexp, color: '#811F3F' },
  { tag: tags.number, color: codeNumber },
  { tag: tags.comment, color: '#008000' },
  { tag: [tags.propertyName, tags.variableName], color: '#001080' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#795E26' },
  { tag: [tags.typeName, tags.className, tags.definition(tags.className)], color: codeType },
]));

export default function CodeEditor(props: Props) {
  const parent = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | undefined>(undefined);
  const language = useRef(new Compartment());
  const attributes = useRef(new Compartment());
  const latest = useRef(props);
  latest.current = props;

  const contentAttributes = (label: string, run: boolean) => EditorView.contentAttributes.of({
    'aria-label': label,
    tabindex: '0',
    ...(run ? { 'aria-keyshortcuts': 'Control+Enter Meta+Enter' } : {}),
  });

  useEffect(() => {
    if (!parent.current) return;
    const current = latest.current;
    const editor = new EditorView({
      parent: parent.current,
      state: EditorState.create({
        doc: current.value,
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          theme,
          highlighting,
          language.current.of(languageSupport[current.language]()),
          attributes.current.of(contentAttributes(current.label, !!current.onRun)),
          Prec.highest(keymap.of([{
            key: 'Mod-Enter',
            run: () => {
              if (!latest.current.onRun) return false;
              latest.current.onRun();
              return true;
            },
          }])),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(setValue))) {
              latest.current.onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = undefined;
    };
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: language.current.reconfigure(languageSupport[props.language]()) });
  }, [props.language]);

  useEffect(() => {
    view.current?.dispatch({ effects: attributes.current.reconfigure(contentAttributes(props.label, !!props.onRun)) });
  }, [props.label, !!props.onRun]);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== props.value) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: props.value },
        annotations: [setValue.of(true), Transaction.addToHistory.of(false)],
      });
    }
  }, [props.value]);

  function reset() {
    const editor = view.current;
    if (editor && props.resetTo !== undefined) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: props.resetTo } });
      editor.focus();
    }
  }

  return <div class="editor-card" data-card>
    {(props.toolbar || props.resetTo !== undefined) && <div class="editor-toolbar">
      {props.toolbar}
      {props.resetTo !== undefined && <button class="button danger" type="button"
        disabled={props.busy || props.value === props.resetTo} onClick={reset}>Reset</button>}
    </div>}
    <div class="code-editor" ref={parent} style={{ '--editor-lines': props.minLines ?? 8 }} />
  </div>;
}
