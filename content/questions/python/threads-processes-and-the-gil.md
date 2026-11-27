---
title: How would you parallelize report checks that download files and verify their contents?
topic: python
roles: [sdet]
level: senior
type: concept
oneLine: Match the worker model to what the checks spend time doing, and measure whether it improves the run.
looksFor:
  - Qualifies the bytecode limit as applying to CPython with the GIL enabled.
  - Separates time spent waiting for I/O from time spent doing CPU work.
  - Explains why pytest-xdist workers need isolated test data.
  - Checks the interpreter build before assuming threads can execute Python in parallel.
trap: Adding threads to a CPU-heavy pure Python check and assuming they will use all cores.
followUps:
  - question: What would you check before making the entire suite parallel?
    answer: I'd rerun a representative slice with independent resource names and compare elapsed time and failure rates against the serial run.
sources:
  - label: Python threading and the GIL
    url: https://docs.python.org/3/library/threading.html#gil-and-performance-considerations
  - label: Python support for free threading
    url: https://docs.python.org/3/howto/free-threading-python.html
  - label: Python executor objects
    url: https://docs.python.org/3/library/concurrent.futures.html
  - label: Python asyncio
    url: https://docs.python.org/3/library/asyncio.html
  - label: pytest-xdist worker model
    url: https://pytest-xdist.readthedocs.io/en/stable/how-it-works.html
examples:
  - title: Check local export fixtures with a process pool
    variants:
      - lang: python
        label: Python 3
        code: |
          from concurrent.futures import ProcessPoolExecutor


          def count_out_of_order(ids):
              return sum(left > right for left, right in zip(ids, ids[1:]))


          if __name__ == "__main__":
              exports = [[100, 101, 102], [200, 202, 201]]
              with ProcessPoolExecutor(max_workers=2) as pool:
                  counts = list(pool.map(count_out_of_order, exports))
              assert counts == [0, 1]
---

I'd time the checks with the reports already on disk, then with downloads included. If the
cached run is still slow and the check spends most of its time in pure Python, I'd try a process
pool and see whether the work offsets worker startup and data transfer. With CPython's GIL enabled,
only one thread executes Python bytecode at a time. A free-threaded build can run Python threads
in parallel, so I'd check which interpreter and dependencies the suite actually uses.

If the difference comes from waiting on downloads, I'd overlap those waits with threads or use
`asyncio` if the client is already async. If I spread whole tests across pytest-xdist processes,
each worker gets its own in-memory fixtures. I'd also give each worker its own download path.

### Example

Two small in-memory exports stand in for larger files. The process pool checks their ID ordering.
The first export has no backwards steps and the second has one.
