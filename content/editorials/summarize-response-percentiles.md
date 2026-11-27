---
problem: code/summarize-response-percentiles
---

## What is going on

The load report uses nearest rank for p50 and p95, so each answer comes from a recorded sample. A duplicate still represents a request and contributes to the sample count. Other percentile definitions may interpolate; this report never does.

## The fix

1. Return both keys with `null` values when there are no samples.

   **Why:** `empty-sample` has no observation at any rank. Keeping the normal object shape gives the caller both fields and distinguishes missing measurements from a measured duration of zero.

   ```js
   if (samples.length === 0) return { p50: null, p95: null };
   ```

2. Sort a copy numerically from lowest to highest and retain every sample.

   **Why:** `unsorted-tail-outlier` starts with 500, but it belongs at the highest rank. `duplicate-ranks` needs each repeated 4 to occupy its own position, since removing duplicates changes the ranks of other samples too. Sorting a copy preserves the original chronology so a caller can still trace a spike to a request.

   ```js
   const sorted = [...samples].sort((a, b) => a - b);
   ```

3. Round the one-based percentile rank up, then subtract one to index the array.

   **Why:** With 20 samples, `upper-rank-boundary` lands exactly on position 19 for p95. With one sample, `one-sample` needs both ranks to become position one. Short samples with a fractional rank may need the very last value, as `safe-integer-tail` shows.

   ```js
   const rank = (p) => Math.ceil(p * sorted.length / 100) - 1;
   return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
   ```

## Why the tempting answer fails

Flooring the percentile on a zero-based range changes the percentile definition. In `unsorted-tail-outlier` it skips the 500 millisecond tail and returns 60 for p95. `duplicate-ranks` and `safe-integer-tail` also miss their top sample. Coincidentally equal values, as in `small-tail`, can hide an index mismatch.

## What the interviewer listens for

Name the percentile rule before doing the arithmetic. Pair a 20-sample exact rank with a short list and an isolated slowest value to show why rounding matters.

## Sources

- [R: Sample quantile definitions, including type 1](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Math.ceil()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)
