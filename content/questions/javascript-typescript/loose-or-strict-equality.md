---
title: How would you catch a cart API sending its item count as text?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: Use strict equality for scalar fields and a deep equality assertion when comparing response objects.
looksFor:
  - Explains how loose equality can mask a type mismatch.
  - Describes identity checks for objects under both operators.
  - Selects a deep equality assertion for separately constructed response objects.
  - Knows how strict equality and Object.is treat NaN and signed zeros.
trap: Comparing the returned count to the number 2 with loose equality and passing a response that contains a string.
followUps:
  - question: When would Object.is be useful in a numeric test?
    answer: Strict equality considers the two signed zeros equal and considers NaN unequal to itself. Object.is distinguishes the signed zeros and considers NaN the same as itself.
sources:
  - label: MDN loose equality
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
  - label: MDN strict equality
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
  - label: MDN Object.is
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
  - label: Node.js deep strict equality
    url: https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message
examples:
  - title: Check a cart payload without coercing its values
    variants:
      - lang: js
        label: JavaScript (Node.js)
        code: |
          import assert from 'node:assert/strict';

          const expected = { cartId: 'C-7', itemCount: 2 };
          const actual = JSON.parse('{"cartId":"C-7","itemCount":2}');
          const wrong = JSON.parse('{"cartId":"C-7","itemCount":"2"}');

          assert.ok(wrong.itemCount == 2);
          assert.ok(wrong.itemCount !== 2);
          assert.ok(actual !== expected);
          assert.deepStrictEqual(actual, expected);
          assert.notDeepStrictEqual(wrong, expected);
---

I'd check the count with `===`. Loose equality can convert one operand before comparing it, so the
string `"2"` can pass a check against the number `2`. Strict equality preserves that distinction.
If I compare the whole JSON payload, I'd use a deep equality assertion. Both operators only
consider two objects equal when they refer to the same object.

For numeric edge cases I check the assertion's equality rule. With `===`, `NaN` differs from itself
and `0` equals `-0`. `Object.is` treats `NaN` as the same value and distinguishes the two zeros.

### Example

The check compares two decoded cart responses with a separately constructed expected object.
The response with a numeric count matches by value. The otherwise identical response with a
string count fails the comparison.
