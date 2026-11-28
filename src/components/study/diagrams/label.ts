import { inline } from '../study';

/** A label's HTML, with each hyphenated word such as End-to-end kept on one line. */
export const label = (text: string) => inline(text)
  .replace(/[^\s<>]*\p{L}-\p{L}[^\s<>]*/gu, (word) => `<span class="dg-word">${word}</span>`);
