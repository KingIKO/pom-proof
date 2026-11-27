---
problem: code/redact-log-card-field
---

## What is going on

The payment processor's test log stores made-up card numbers in a specific token format. A token is a piece of the line between ordinary spaces. The redactor must hide all but the last four digits of every valid `card=` field. It must keep the rest of the line exactly as it was. This tests one known format, and a detector for any production log has a different job.

## The fix

1. Split the line on one literal ASCII space, and plan to join the result with the same character.

   **Why:** `split(' ')` keeps an empty piece for each repeated space and for spaces at either end. Those empty pieces let `spacing-preserved` restore every original separator. In `punctuation-and-case`, a tab stays inside its token. Splitting on any whitespace would treat the tab as a separator. Then the code could match a field that the fixture says to leave alone.

   ```js
   const tokens = line.split(' ');
   ```

2. Mask each whole token that is `card=` followed by 13 to 19 ASCII digits, using one asterisk per hidden digit.

   **Why:** The `^` and `$` anchors make the pattern match the whole token, not just part of it. So `other-label` stays unchanged, and the pattern rejects the punctuation, uppercase label, and non-ASCII digits in `punctuation-and-case`. Both lengths in `length-endpoints` are allowed, while `outside-range` must stay unchanged. The code subtracts nine for the five-character label and the four visible digits. Mapping every token catches `same-field-twice`, and joining builds a new string, so the input stays intact.

   ```js
   return tokens.map((token) => {
     if (/^card=[0-9]{13,19}$/.test(token) === false) return token;
     return 'card=' + '*'.repeat(token.length - 9) + token.slice(-4);
   }).join(' ');
   ```

## Why the tempting answer fails

The decoy assumes every card number has 16 digits, which works for `single-field`. A smoke test, a quick basic check, that uses a familiar fixture number would therefore pass. `length-endpoints` has one exact field with 13 digits and another with 19. The decoy never matches those lengths, so it leaves both values visible. Testing both endpoints together checks that each field gets the mask length its own value needs.

## What the interviewer listens for

Limit the privacy claim to this token format. Include both supported endpoints, 13 and 19 digits, and a row with two valid fields. A single match cannot show whether the scan continues after it.

## Sources

- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN: Array.join()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
- [MDN: Regular expression input boundaries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion)
- [MDN: Regular expression quantifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Quantifier)
