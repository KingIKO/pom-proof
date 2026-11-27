---
title: How would you catch a cart API sending its item count as text?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: I use strict equality for single values such as the item count. I compare the contents of response objects with a deep equality assertion.
looksFor:
  - Explain how loose equality can hide a difference in types.
  - Explain that both operators check whether the values refer to the same object.
  - Use a deep equality assertion to compare objects created separately.
  - Explain how strict equality and `Object.is` treat `NaN` and signed zeros.
trap: Comparing the count to the number 2 with loose equality, which can pass when the response contains text.
followUps:
  - question: When would `Object.is` be useful in a numeric test?
    answer: I'd use `Object.is` if I need to tell the two signed zeros apart or compare `NaN` with itself. Strict equality treats both zeros as equal and `NaN` as unequal to itself. `Object.is` treats the zeros as different and `NaN` as equal to itself.
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

I'd check the count with `===`, the strict equality operator. Loose equality can change the type of a value before comparing it. The string `"2"` can therefore pass a loose check against the number `2`. Strict equality keeps the types apart.

If I compare the whole JSON response, I'd use a deep equality assertion to check its contents. Both equality operators treat two objects as equal only when both values refer to the same object.

For unusual numeric values, I check which equality rule the assertion uses. With `===`, `NaN` differs from itself and `0` equals `-0`. The `Object.is` method treats `NaN` as equal to itself and tells the two signed zeros apart.

### Example

I'd compare two decoded cart responses with an expected object I created separately. The response with a numeric count matches by value. The other response has the same contents except for the count type. It fails because its count is text.
