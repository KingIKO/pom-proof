---
problem: code/dedupe-case-ids
---

Handle the queue as an ordered stream. The first time an ID appears, keep it. When the same string appears again, leave the earlier entry where it is. A set gives JavaScript both a membership check and insertion order. In Python a dictionary can provide those two properties with the strings as keys.

The shortcut sorts the distinct IDs. Sorting can make a snapshot easier to read, and it passes if the queue happened to arrive in alphabetic order. A rerun queue can encode priority through order, though. If a failing smoke test comes first and its ID sorts after a cleanup test, sorting changes what runs first.

An interviewer might ask whether case or accents should be folded before comparing. That choice belongs to the identifier contract. This one uses exact strings, so visually similar but differently encoded values remain separate. Test one queue where order conflicts with spelling and another with two identical empty-string IDs. Those cases check the two independent parts of the requirement.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
