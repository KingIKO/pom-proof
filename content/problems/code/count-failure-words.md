---
title: "Count how often each word appears in failure notes"
kind: code
topic: reporting
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: countFailureWords
starters:
  js: |
    export function countFailureWords(notes) {
    }
  ts: |
    export function countFailureWords(notes: string) {
    }
  python: |
    def count_failure_words(notes):
        pass
vectors:
  - name: repeat-with-punctuation
    args: ["Retry, timeout retry."]
    expected: [["retry",2],["timeout",1]]
  - name: order-ties-by-word
    args: ["timeout cart checkout"]
    expected: [["cart",1],["checkout",1],["timeout",1]]
  - name: one-token
    args: ["502"]
    expected: [["502",1]]
  - name: newlines
    args: ["cart\ncart\npayment"]
    expected: [["cart",2],["payment",1]]
  - name: interior-punctuation
    args: ["cart-timeout cart_timeout"]
    expected: [["cart",2],["timeout",2]]
  - name: unicode-separators
    args: ["cart表tax tax"]
    expected: [["tax",2],["cart",1]]
  - name: only-separators
    args: ["… _ ?"]
    expected: []
  - name: empty-notes
    args: [""]
    expected: []
solutions:
  js: |
    export function countFailureWords(notes) {
      const counts = new Map();
      for (const token of notes.match(/[A-Za-z0-9]+/g) ?? []) {
        const word = token.toLowerCase();
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
      return [...counts].sort(([a, x], [b, y]) => y - x || (a < b ? -1 : a > b ? 1 : 0));
    }
  ts: |
    export function countFailureWords(notes: string) {
      const counts = new Map<string, number>();
      for (const token of notes.match(/[A-Za-z0-9]+/g) ?? []) {
        const word = token.toLowerCase();
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
      return [...counts].sort(([a, x], [b, y]) => y - x || (a < b ? -1 : a > b ? 1 : 0));
    }
  python: |
    def count_failure_words(notes):
        counts = {}
        word = []
        for char in notes + " ":
            if "a" <= char <= "z" or "A" <= char <= "Z" or "0" <= char <= "9":
                word.append(char.lower())
            elif word:
                token = "".join(word)
                counts[token] = counts.get(token, 0) + 1
                word = []
        return [[token, count] for token, count in sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))]
reference:
  language: js
  source: |
    export function countFailureWords(notes) {
      const counts = new Map();
      for (const token of notes.match(/[A-Za-z0-9]+/g) ?? []) {
        const word = token.toLowerCase();
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
      return [...counts].sort(([a, x], [b, y]) => y - x || (a < b ? -1 : a > b ? 1 : 0));
    }
decoy:
  language: js
  source: |
    export function countFailureWords(notes) {
      const counts = new Map();
      for (const token of notes.split(/\s+/)) {
        const word = token.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        if (word) counts.set(word, (counts.get(word) ?? 0) + 1);
      }
      return [...counts].sort(([a, x], [b, y]) => y - x || (a < b ? -1 : a > b ? 1 : 0));
    }
---

The dashboard counts words in test failure notes. For this exercise, group consecutive letters `A` to `Z` or `a` to `z` and digits `0` to `9` into one word. Every other character separates words, including underscores and letters outside ASCII.

Ignore letter case when you count. Return `[[word, count], ...]` with each word in lowercase. Put the highest counts first. If counts tie, sort by the ASCII number for each character, lowest first. If the notes have no words, return an empty array.

For example, `countFailureWords("Retry, timeout retry.")` returns `[["retry",2],["timeout",1]]`. Leave the inputs unchanged.
