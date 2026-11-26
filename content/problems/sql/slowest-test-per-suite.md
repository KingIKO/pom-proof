---
title: Find the slowest recorded test runs per suite
kind: sql
topic: ranking
difficulty: medium
minutes: 9
roles: [automation, sdet]
schema: |
  CREATE TABLE test_cases (case_id INTEGER PRIMARY KEY, suite TEXT NOT NULL, title TEXT NOT NULL);
  CREATE TABLE test_runs (
    run_id INTEGER PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES test_cases(case_id),
    duration_ms INTEGER
  );
seed: |
  INSERT INTO test_cases VALUES
    (1, 'payments', 'Capture card'), (2, 'payments', 'Remove card'),
    (3, 'delivery', 'Quote shipping'), (4, 'delivery', 'Change address'), (5, 'search', 'Filter results');
  INSERT INTO test_runs VALUES
    (11, 1, 4200), (12, 1, 2100), (13, 2, NULL), (14, 2, 1100),
    (15, 3, 3600), (16, 4, 1700), (17, 5, NULL);
alteredSeed: |
  INSERT INTO test_cases VALUES
    (21, 'returns', 'Print label'), (22, 'returns', 'Cancel return'),
    (23, 'billing', 'Download invoice'), (24, 'security', 'Sign out'), (25, 'billing', 'Add credit');
  INSERT INTO test_runs VALUES
    (101, 21, 5800), (102, 22, 5800), (103, 21, 5800), (104, 21, 2600),
    (105, 23, 5800), (106, 24, NULL), (107, 25, NULL), (108, 25, 900);
reference:
  query: |
    WITH ranked AS (
      SELECT c.suite, c.case_id, r.run_id, r.duration_ms,
        RANK() OVER (PARTITION BY c.suite ORDER BY r.duration_ms DESC) AS position
      FROM test_cases c JOIN test_runs r ON r.case_id = c.case_id
      WHERE r.duration_ms IS NOT NULL
    )
    SELECT suite, case_id, run_id, duration_ms
    FROM ranked WHERE position = 1
    ORDER BY suite, run_id;
decoy:
  query: |
    WITH ranked AS (
      SELECT c.suite, c.case_id, r.run_id, r.duration_ms,
        ROW_NUMBER() OVER (PARTITION BY c.suite ORDER BY r.duration_ms DESC, r.run_id) AS position
      FROM test_cases c JOIN test_runs r ON r.case_id = c.case_id
      WHERE r.duration_ms IS NOT NULL
    )
    SELECT suite, case_id, run_id, duration_ms
    FROM ranked WHERE position = 1
    ORDER BY suite, run_id;
---

The test timing report lists the run or runs with the largest recorded duration in each suite. Include every tied run, even if two tied runs are for the same case. Ignore `NULL` durations and omit suites with no recorded durations.

Return `suite`, `case_id`, `run_id`, `duration_ms`, in that column order. Sort by `suite` ascending, then `run_id` ascending.
