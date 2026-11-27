import { codeToTokens } from 'shiki';
import { lightPlusColors, lightPlusTheme } from '../../components/editor/light-plus.mjs';
import type { Problem, StructuredKind } from '../../lib/contracts';

type Items = Problem<StructuredKind>['items'];
type Token = [text: string, color?: string];
export type MarkedCode = Record<string, Token[][]>;

export async function highlightMarkedCode(items: Items): Promise<MarkedCode> {
  const marked: MarkedCode = {};
  for (const item of items) {
    if (item.type !== 'line-marking') continue;
    const source = item.lines.map(({ text }) => text.split(/\r\n?|\n/));
    const { tokens } = await codeToTokens(source.flat().join('\n'), {
      lang: item.language ?? 'ts',
      theme: lightPlusTheme,
      colorReplacements: lightPlusColors,
    });
    let row = 0;
    marked[item.id] = source.map((lines) => lines.flatMap((_, index): Token[] => [
      ...(index ? [['\n'] as Token] : []),
      ...tokens[row++].map(({ content, color }): Token => [content, color]),
    ]));
  }
  return marked;
}
