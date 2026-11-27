---
problem: code/summarize-response-percentiles
---

## What is going on

A load test measures how long requests take when the system is busy. The report's `p50` and `p95` fields give the response times at the 50th and 95th percentiles. A percentile marks a point in the list of response times sorted from lowest to highest.

This report uses the nearest-rank rule, which rounds the position up to pick a recorded sample. A repeat still stands for a separate request, so it adds to the sample count. Other percentile rules may interpolate, or estimate a value between two samples. The nearest-rank rule never does that.

## The fix

1. Return both keys set to `null` when there are no samples.

   **Why:** `empty-sample` has no value at any rank. The result keeps its normal shape, so the caller still gets both fields. The `null` values also tell missing measurements apart from a measured duration of zero.

   ```js
   if (samples.length === 0) return { p50: null, p95: null };
   ```

2. Sort a copy numerically from lowest to highest and keep every sample.

   **Why:** `unsorted-tail-outlier` starts with 500, but that value belongs at the highest rank. In `duplicate-ranks`, each repeated 4 needs its own position. Removing duplicates would also change the ranks of the other samples. Sorting a copy keeps the samples in their original time order. A caller can then still trace a spike back to its request.

   ```js
   const sorted = [...samples].sort((a, b) => a - b);
   ```

3. Calculate the array index by rounding the one-based percentile rank up and subtracting one.

   **Why:** A one-based rank counts the first sample as position 1, while array indexes start at 0. With 20 samples, `upper-rank-boundary` lands exactly on position 19 for p95. In `one-sample`, both ranks must become position one. When a short sample list gives a fractional rank, the answer may be the very last value, as `safe-integer-tail` shows.

   ```js
   const rank = (p) => Math.ceil(p * sorted.length / 100) - 1;
   return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
   ```

## Why the tempting answer fails

The decoy rounds the rank down over a zero-based range of indexes. That changes which percentile definition it uses. In `unsorted-tail-outlier`, it skips the 500 millisecond tail and returns 60 for p95. `duplicate-ranks` and `safe-integer-tail` also miss their top sample. When values happen to be equal, as in `small-tail`, they can hide the wrong index.

## What the interviewer listens for

Name the percentile rule before you do the arithmetic. To show why rounding matters, test a 20-sample list with an exact rank. Then test a short list with one sample much slower than the rest.

## Sources

- [R: Sample quantile definitions, including type 1](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Math.ceil()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)
