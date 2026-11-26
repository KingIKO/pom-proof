---
title: "Check brackets in a log fragment"
kind: code
topic: parsing
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: balancedLogBrackets
starters:
  js: |
    export function balancedLogBrackets(fragment) {
    }
  ts: |
    export function balancedLogBrackets(fragment: string) {
    }
  python: |
    def balanced_log_brackets(fragment):
        pass
vectors:
  - name: nested-context
    args: ["filter({mode: [fast]})"]
    expected: true
  - name: missing-close
    args: ["filter({"]
    expected: false
  - name: nothing-to-match
    args: ["event 4"]
    expected: true
  - name: closing-first
    args: ["}{}"]
    expected: false
  - name: crossed-pairs
    args: ["([)]"]
    expected: false
  - name: empty-fragment
    args: [""]
    expected: true
  - name: unicode-in-expression
    args: ["{résumé[状態] (λ)}"]
    expected: true
  - name: quotes-still-count
    args: ["label=\"[\""]
    expected: false
solutions:
  js: |
    export function balancedLogBrackets(fragment) {
      const stack = [];
      const opening = new Map([[')', '('], [']', '['], ['}', '{']]);
      for (const char of fragment) {
        if ('([{'.includes(char)) {
          stack.push(char);
        } else if (opening.has(char) && stack.pop() !== opening.get(char)) {
          return false;
        }
      }
      return stack.length === 0;
    }
  ts: |
    export function balancedLogBrackets(fragment: string) {
      const stack: string[] = [];
      const opening = new Map([[')', '('], [']', '['], ['}', '{']]);
      for (const char of fragment) {
        if ('([{'.includes(char)) {
          stack.push(char);
        } else if (opening.has(char) && stack.pop() !== opening.get(char)) {
          return false;
        }
      }
      return stack.length === 0;
    }
  python: |
    def balanced_log_brackets(fragment):
        expected_open = {")": "(", "]": "[", "}": "{"}
        stack = []
        for char in fragment:
            if char in "([{":
                stack.append(char)
            elif char in expected_open:
                if not stack or stack.pop() != expected_open[char]:
                    return False
        return not stack
reference:
  language: js
  source: |
    export function balancedLogBrackets(fragment) {
      const stack = [];
      const opening = new Map([[')', '('], [']', '['], ['}', '{']]);
      for (const char of fragment) {
        if ('([{'.includes(char)) {
          stack.push(char);
        } else if (opening.has(char) && stack.pop() !== opening.get(char)) {
          return false;
        }
      }
      return stack.length === 0;
    }
decoy:
  language: js
  source: |
    export function balancedLogBrackets(fragment) {
      for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
        let depth = 0;
        for (const char of fragment) {
          if (char === open) depth++;
          if (char === close && --depth < 0) return false;
        }
        if (depth !== 0) return false;
      }
      return true;
    }
---

A diagnostic log prints a small expression fragment. Return `true` if its parentheses, square brackets, and braces are properly matched and nested, and `false` otherwise. Ignore every other character, even quotes and backslashes. A fragment with no brackets is balanced. A closing bracket must match the most recent opening bracket that has not been closed.

`balancedLogBrackets("filter({mode: [fast]})")` returns `true`. Leave the inputs unchanged.
