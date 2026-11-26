---
problem: code/compare-monitor-urls
---

Separate the scheme and authority from the path and query before changing case. Only the scheme and hostname are folded. Compare an explicit port against the default for that scheme, and keep any other port. Finally, supply a slash for a missing path and preserve the rest of the address through the end of the query.

The shortcut lowercases the whole address and removes its fragment. It passes for many health-check URLs, but it can treat two case-sensitive paths as the same target. It also treats an omitted port and an explicit default port as different. Add one test for each direction of mistake: a false match and a missed match.

A useful interview detail is the empty query marker. The rule deliberately preserves it, so parsing into a dictionary of query values would lose information. In a real tool, you would select a parser and a normalization contract together. Here the input grammar is small, and the comparison asks you to keep the raw parts beyond the authority.

[Related reference](https://url.spec.whatwg.org/#url-representation)
