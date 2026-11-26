---
problem: code/count-failure-words
---

Recognize the words before counting them. The JavaScript version uses a pattern for runs of ASCII letters or digits. The Python version accumulates the same characters until a separator. Both lowercase only the tokens they recognize, then sort the counts using the stated tie rule.

The shortcut splits on whitespace and deletes punctuation within each token. That handles a comma attached to the end of a word, but it joins two words around a hyphen or underscore. A report for `cart-timeout` would count a new term `carttimeout` and lose the two meaningful terms. Deleting separators and splitting on separators are different operations.

One good interview example uses punctuation at the beginning, middle, and end to check where a word starts and stops. Another shows why character classes matter across languages: the same character could count as a letter under a Unicode definition and as a separator here. Say that the exercise chooses ASCII explicitly to keep the two implementations comparable.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
