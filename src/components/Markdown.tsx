import { Fragment, type ReactNode } from 'react';

/**
 * Small Markdown renderer for authored content. Builds React elements
 * directly (no innerHTML). Supports headings, paragraphs, fenced code,
 * lists (one nesting level), tables, blockquotes, rules and inline
 * code / bold / italic / links.
 */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return <div className={className ? `md ${className}` : 'md'}>{renderBlocks(dedent(text))}</div>;
}

function dedent(s: string) {
  const lines = s.replace(/\r\n/g, '\n').replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

type ListItem = { text: string; children: string[] };

function renderBlocks(src: string): ReactNode[] {
  const lines = src.split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      out.push(
        <pre key={k++} className="md-pre" data-lang={fence[1] || undefined}>
          <code>{body.join('\n')}</code>
        </pre>,
      );
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 5);
      const Tag = `h${level}` as 'h2';
      out.push(<Tag key={k++}>{inline(h[2])}</Tag>);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push(<hr key={k++} />);
      i++;
      continue;
    }
    if (line.startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      out.push(<blockquote key={k++}>{renderBlocks(body.join('\n'))}</blockquote>);
      continue;
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows: string[][] = [];
      const split = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = split(line);
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(split(lines[i++]));
      out.push(
        <div key={k++} className="md-table-wrap">
          <table>
            <thead>
              <tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+/);
    if (listMatch && listMatch[1].length === 0) {
      const ordered = /\d/.test(listMatch[2]);
      const items: ListItem[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const top = l.match(/^([-*]|\d+\.)\s+(.*)$/);
        const nested = l.match(/^\s{2,}([-*]|\d+\.)\s+(.*)$/);
        if (top) items.push({ text: top[2], children: [] });
        else if (nested && items.length) items[items.length - 1].children.push(nested[2]);
        else if (l.match(/^\s{2,}\S/) && items.length) items[items.length - 1].text += ' ' + l.trim();
        else break;
        i++;
      }
      const Tag = ordered ? 'ol' : 'ul';
      out.push(
        <Tag key={k++}>
          {items.map((it, j) => (
            <li key={j}>
              {inline(it.text)}
              {it.children.length > 0 && (
                <ul>
                  {it.children.map((c, ci) => (
                    <li key={ci}>{inline(c)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>,
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(```|#{1,4}\s|>|\s*([-*]|\d+\.)\s|\|)/.test(lines[i])
    ) {
      para.push(lines[i++].trim());
    }
    if (para.length === 0) {
      para.push(lines[i++].trim());
    }
    out.push(<p key={k++}>{inline(para.join(' '))}</p>);
  }
  return out;
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const tok = m[0];
    if (tok.startsWith('`')) parts.push(<code key={k++}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) parts.push(<strong key={k++}>{inline(tok.slice(2, -2))}</strong>);
    else if (tok.startsWith('*')) parts.push(<em key={k++}>{inline(tok.slice(1, -1))}</em>);
    else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = lm[2];
      const safe = /^(https?:|\/|#|mailto:)/.test(href) ? href : '#';
      const external = /^https?:/.test(safe);
      parts.push(
        <a key={k++} href={safe} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {lm[1]}
        </a>,
      );
    }
    last = idx + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Fragment>{parts}</Fragment>;
}
