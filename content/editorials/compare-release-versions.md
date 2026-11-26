---
problem: code/compare-release-versions
---

Separate the parts that affect precedence. Compare the three core fields first. Only when they tie do you inspect the prerelease list. Compare its identifiers from left to right, returning at the first difference. Valid numeric identifiers have no leading zeroes, so length and then digit order give exact numeric comparison without a floating-point conversion.

The shortcut takes the three numeric core fields and stops. That works for plain releases and even gives the right tie when build metadata differs. However, it treats a release candidate as equal to the final release. It can also collapse neighboring integers above JavaScript's safe range. Both failures affect the order a release report displays.

Interviewers listen for why you cannot use a simple string comparison. An identifier like `rc.11` sorts below `rc.9` as text even though its numeric suffix ranks higher. Mention the assumption of already valid input. Rejecting versions outside the grammar is a separate concern and would need an error contract that this exercise does not have.

[Related reference](https://semver.org/#spec-item-11)
