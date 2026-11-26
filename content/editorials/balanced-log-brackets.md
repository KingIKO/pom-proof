---
problem: code/balanced-log-brackets
---

Use a stack of opening brackets. The newest opening bracket is the only one a closing bracket may match. If there is no opening bracket to pop, or the popped symbol has a different type, the fragment fails immediately. At the end, any leftover opening bracket also means failure.

Counting each bracket type separately looks reasonable. It can catch missing brackets and even rule out closing before opening within one type. But in `([)]`, both individual counts look fine. The parenthesis closes while a square bracket is still waiting, which the stack catches.

Say how you will handle non-bracket characters. In this exercise they carry no meaning, so a quote does not turn bracket matching off. That differs from a parser for source code, where quoted strings may need their own state. A concise interview explanation includes the invariant: the stack holds exactly the opening brackets that still need closes, in their original order. The scan takes linear time and uses space proportional to nesting depth.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
