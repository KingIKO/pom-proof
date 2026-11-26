import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, Prec, type Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';

export type EditorLang = 'javascript' | 'typescript' | 'python' | 'sql' | 'html';

function langExt(lang: EditorLang): Extension {
  switch (lang) {
    case 'typescript':
      return javascript({ typescript: true });
    case 'python':
      return python();
    case 'sql':
      return sql();
    case 'html':
      return html();
    default:
      return javascript();
  }
}

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', backgroundColor: 'var(--bg-layer)', color: 'var(--label-1)' },
  '.cm-scroller': { fontFamily: 'var(--font-code)', lineHeight: '20px' },
  '.cm-content': { caretColor: 'var(--accent)', padding: '8px 0' },
  '.cm-gutters': { backgroundColor: 'var(--bg-layer)', color: 'var(--label-4)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'var(--hover)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--label-2)' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--accent-soft) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--accent)' },
  '.cm-tooltip': { border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-layer)', borderRadius: '8px' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'var(--accent-soft)', color: 'var(--label-1)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--active) !important', outline: 'none' },
  '.cm-foldPlaceholder': { backgroundColor: 'var(--bg-inset)', border: 'none', color: 'var(--label-3)' },
});

interface Props {
  value: string;
  lang: EditorLang;
  onChange?: (v: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
  label: string;
  minHeight?: number;
}

/** CodeMirror 6 wrapper. Ctrl/Cmd+Enter calls onRun. */
export function Editor({ value, lang, onChange, onRun, readOnly, label, minHeight }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const langComp = useRef(new Compartment());
  const cb = useRef({ onChange, onRun });
  cb.current = { onChange, onRun };

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          // Highest precedence so basicSetup's Mod-Enter (insert blank line) never wins.
          Prec.highest(
            keymap.of([
              {
                key: 'Mod-Enter',
                run: () => {
                  cb.current.onRun?.();
                  return true;
                },
              },
            ]),
          ),
          basicSetup,
          keymap.of([indentWithTab]),
          langComp.current.of(langExt(lang)),
          theme,
          EditorState.readOnly.of(!!readOnly),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
    // Created once; value and lang changes are pushed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: langComp.current.reconfigure(langExt(lang)) });
  }, [lang]);

  return <div className="editor" ref={host} style={minHeight ? { minHeight } : undefined} />;
}
