---
title: How would you parallelize report checks that download files and verify their contents?
topic: python
roles: [sdet]
level: senior
type: concept
oneLine: I'd choose how to run checks together based on where they spend time. I'd measure whether the change helps.
looksFor:
  - Explain that the one-thread limit for Python bytecode applies to CPython when its GIL is on.
  - Separate time waiting for files or network replies from time spent computing.
  - Explain why pytest-xdist workers still need separate test data.
  - Check the interpreter build before assuming threads can execute Python in parallel.
trap: Adding threads to a computation-heavy check written in pure Python and assuming it will use every CPU core.
followUps:
  - question: What would you measure before running the whole suite in parallel?
    answer: I'd pick some tests that represent the suite and give each separate resource names. I'd compare the total time and failure rates with running those tests one at a time.
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

I'd time the checks with reports already on disk and then include downloads. If checking the saved files is still slow and most of the work is in pure Python, I'd try a process pool. A process pool runs jobs in separate processes. I'd measure whether the speed gain is worth the time it takes to start workers and send them data.

CPython is the standard Python interpreter. If its global interpreter lock (GIL) is on, only one thread at a time can run Python bytecode. Bytecode is the set of instructions Python runs. A free-threaded build can execute Python in parallel, with multiple threads doing Python work at the same instant. I'd check which Python build and dependencies my suite actually uses.

If waiting for downloads accounts for the difference, I'd use threads to overlap those waits. If my download client already lets other tasks run while it waits, I'd use Python's `asyncio` library. If I use pytest-xdist to run whole tests in separate processes, each worker gets its own test setup in memory. I'd give each worker its own download path too.

### Example

I'd use two small exports in memory to stand in for larger files. I'd have the process pool check the order of their IDs. I'd expect no step backward in the first export and one in the second.
