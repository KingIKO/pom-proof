---
problem: code/second-highest-duration
---

Keep two slots: the highest value so far and the highest value strictly below it. A new maximum moves the previous maximum into second place. A value between the two slots replaces only the second slot. A value equal to the maximum does neither. Using an explicit empty marker avoids treating zero as missing.

Sorting a copy and taking the item at index one handles unordered input and preserves the caller's array. The missing step is removing duplicates. With durations of 90, 90, and 24, index one gives 90 even though 24 is the next distinct duration. Sorting after deduplicating is a valid alternative if you prefer the clearer expression.

The interviewer may ask why sorting is unnecessary. The report needs only two values, so the running pair takes constant extra space and no second pass. Walk through a new maximum arriving late to show both slots move correctly. Use an all-equal list to show why the function can still return null when several measurements exist.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
