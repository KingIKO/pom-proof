import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql, SQLite } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Annotation, Compartment, EditorState, Prec, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'preact/hooks';
import './editor.css';

interface Props {
  value: string;
  onChange(value: string): void;
  language: 'js' | 'ts' | 'python' | 'sql';
  label: string;
  onRun?(): void;
  minLines?: number;
}

const languageSupport = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  python,
  sql: () => sql({ dialect: SQLite }),
};

const setValue = Annotation.define<boolean>();

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--paper)', color: 'var(--ink)', fontSize: '.94rem' },
  '&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '-2px' },
  '.cm-scroller': {
    fontFamily: 'var(--font-code)',
    lineHeight: '1.5',
    minHeight: 'calc(var(--editor-lines) * 1.5em + 8px)',
    maxHeight: '28rem',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--surface)',
    color: 'var(--muted)',
    borderRight: 'var(--rule)',
  },
  '.cm-activeLine, .cm-activeLineGutter, .cm-tooltip, .cm-panels': {
    backgroundColor: 'var(--surface)',
    color: 'var(--ink)',
  },
  '.cm-button, .cm-button:active, .cm-textfield': {
    background: 'var(--paper)',
    color: 'var(--ink)',
    border: '1px solid var(--control-line, var(--line))',
    borderRadius: 'var(--radius)',
  },
  '.cm-selectionMatch, .cm-searchMatch, &.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--surface)',
  },
  '.cm-searchMatch-selected': { outline: '1px solid var(--accent)' },
  '&.cm-focused .cm-nonmatchingBracket': { backgroundColor: 'transparent', textDecoration: 'underline' },
  '.cm-specialChar': { color: 'var(--muted)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ink)' },
  '.cm-content': { caretColor: 'var(--ink)' },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 20%, var(--paper))',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--ink)',
    color: 'var(--paper)',
  },
  '.cm-completionIcon': { display: 'none' },
  '@media (prefers-reduced-motion: reduce)': {
    '&.cm-focused > .cm-scroller > .cm-cursorLayer': { animation: 'none' },
  },
});

const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: [tags.keyword, tags.bool, tags.null], fontWeight: 'var(--strong)' },
  { tag: tags.comment, color: 'var(--muted)' },
  { tag: [tags.string, tags.regexp, tags.number], color: 'var(--muted)' },
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

  return <div class="code-editor" ref={parent} style={{ '--editor-lines': props.minLines ?? 8 }} />;
}
