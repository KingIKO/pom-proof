---
problem: code/password-rejection-reasons
---

Treat each rule as an independent check. Append the label as you visit its rule. That preserves the specified order and gives a person all available feedback on one form submission. The empty string is useful here because several failures occur together, but the rule about a space still stays false.

The shortcut reads JavaScript's string length directly. That counts UTF-16 code units, and some characters occupy two. A password with six Deseret letters and the characters `A1` has eight code points, even though its JavaScript length is greater than ten. Iterating the string counts the units this exercise asks for. Python's length on a string already gives that count.

Mention that an ASCII digit test is narrower than checking whether a character is a digit in every writing system. Otherwise the language you choose can change the verdict. This policy belongs to the fixture. The task is to report its rules exactly, without adding policy decisions of your own.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator)
