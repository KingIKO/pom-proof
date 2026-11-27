import { lightPlusColors, lightPlusTheme } from '../components/editor/light-plus.mjs';

export const xpath = {
  name: 'xpath',
  scopeName: 'source.xpath',
  patterns: [
    { name: 'string.quoted.single.xpath', begin: "'", end: "'" },
    { name: 'string.quoted.double.xpath', begin: '"', end: '"' },
    { name: 'constant.numeric.xpath', match: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'entity.name.function.xpath', match: '\\b[\\w-]+(?=\\s*\\()' },
    { name: 'variable.other.xpath', match: '[@$][\\w:-]+' },
    { name: 'keyword.control.xpath', match: '\\b(?:and|or|div|mod)\\b' },
  ],
};

/** @type {{ theme: typeof lightPlusTheme, wrap: null, transformers: import('shiki').ShikiTransformer[] }} */
export const shikiConfig = {
  theme: lightPlusTheme,
  wrap: null,
  transformers: [{
    name: 'pom-proof:code-surface',
    pre(node) {
      delete node.properties.style;
    },
    tokens(lines) {
      for (const tokens of lines) {
        for (const token of tokens) {
          const replacement = token.color && lightPlusColors[token.color.toLowerCase()];
          if (replacement) token.color = replacement;
        }
      }
    },
  }],
};
