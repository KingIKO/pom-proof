---
problem: code/redact-log-card-field
---

## What is going on

The processor fixture uses a specific token format for synthetic card numbers. The redactor must mask every valid `card=` field while preserving the rest of the line exactly. This is a test of a known format; a detector for arbitrary production logs has a different job.

## The fix

1. Split on one literal ASCII space and plan to join the result with the same delimiter.

   **Why:** `split(' ')` keeps empty pieces for repeated spaces and for spaces at either end. They let `spacing-preserved` recover every original separator. A tab stays inside its token in `punctuation-and-case`; splitting on general whitespace could turn it into a separator and match a field the fixture says to leave alone.

   ```js
   const tokens = line.split(' ');
   ```

2. Check each whole token for `card=` followed by 13 to 19 ASCII digits. Rebuild each match with one asterisk per hidden digit.

   **Why:** Anchoring preserves `other-label` and rejects the punctuation, uppercase label, and non-ASCII digits in `punctuation-and-case`. The permitted lengths include both values in `length-endpoints`, while `outside-range` must stay unchanged. Subtracting nine accounts for the five-character label and four visible digits. Mapping every token catches `same-field-twice`, and rejoining leaves the original input intact.

   ```js
   return tokens.map((token) => {
     if (/^card=[0-9]{13,19}$/.test(token) === false) return token;
     return 'card=' + '*'.repeat(token.length - 9) + token.slice(-4);
   }).join(' ');
   ```

## Why the tempting answer fails

Assuming 16 digits works for `single-field`, so a smoke test with a familiar fixture number would pass. `length-endpoints` uses an exact field with 13 digits and another with 19. The decoy leaves both values visible because it never matches those lengths. Testing those endpoints together checks that each field gets the mask length its own value requires.

## What the interviewer listens for

Bound the privacy claim to this token grammar. Include both supported endpoints and a row with two valid fields, since a single match cannot show whether scanning continues.

## Sources

- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN: Array.join()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
- [MDN: Regular expression input boundaries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion)
- [MDN: Regular expression quantifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Quantifier)
