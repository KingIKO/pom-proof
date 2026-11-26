---
problem: code/summarize-response-percentiles
---

Use a numeric sort on a copy. The original sample sequence can still matter to the caller, for example when it lines up a spike with a particular request. For each percentile, compute the one-based rank as specified and subtract one only to access the JavaScript or Python list.

The shortcut applies a floor to the position on a zero-based range. It can look like the same calculation with a different index convention. On short samples, though, its p95 can skip a single slow response that nearest rank would report. Repeated samples can mask this bug if the two indices happen to point at equal values.

In an interview, say which percentile definition you are implementing. Libraries offer several choices, some of which interpolate. A single sample is a useful check that both outputs use that value. Also test a 20-sample list, where the p95 rank is exactly 19, and a short list with a high final value. Together they exercise both an exact rank and a rank that needs rounding up.

[Related reference](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html)
