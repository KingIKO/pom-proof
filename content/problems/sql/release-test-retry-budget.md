---
title: Flag test cases with at least three executed attempts
kind: sql
topic: aggregation
difficulty: medium
minutes: 7
roles: [automation, sdet]
schema: |
  CREATE TABLE releases (release_id INTEGER PRIMARY KEY, release_name TEXT NOT NULL);
  CREATE TABLE test_cases (case_id INTEGER PRIMARY KEY, title TEXT NOT NULL);
  CREATE TABLE test_runs (
    run_id INTEGER PRIMARY KEY,
    release_id INTEGER NOT NULL REFERENCES releases(release_id),
    case_id INTEGER NOT NULL REFERENCES test_cases(case_id),
    outcome TEXT NOT NULL CHECK (outcome IN ('passed', 'failed', 'skipped'))
  );
seed: |
  INSERT INTO releases VALUES (1, 'R14'), (2, 'R15');
  INSERT INTO test_cases VALUES (11, 'Apply coupon'), (12, 'View refund'), (13, 'Change pickup time');
  INSERT INTO test_runs VALUES
    (21, 1, 11, 'failed'), (22, 1, 11, 'failed'), (23, 1, 11, 'passed'),
    (24, 1, 12, 'failed'), (25, 1, 12, 'passed'), (26, 2, 12, 'failed'), (27, 2, 13, 'passed');
alteredSeed: |
  INSERT INTO releases VALUES (31, 'R21'), (32, 'R22'), (33, 'R23');
  INSERT INTO test_cases VALUES (51, 'Add card'), (52, 'Send receipt'), (53, 'Renew plan');
  INSERT INTO test_runs VALUES
    (101, 31, 51, 'failed'), (102, 31, 51, 'skipped'), (103, 31, 51, 'passed'),
    (104, 31, 52, 'failed'), (105, 31, 52, 'failed'), (106, 31, 52, 'passed'),
    (107, 31, 52, 'skipped'), (108, 32, 51, 'failed'), (109, 32, 51, 'passed'),
    (110, 32, 51, 'passed'), (111, 33, 53, 'skipped');
reference:
  query: |
    SELECT release_id, case_id, COUNT(*) AS executed_attempts
    FROM test_runs
    WHERE outcome IN ('passed', 'failed')
    GROUP BY release_id, case_id
    HAVING COUNT(*) >= 3;
decoy:
  query: |
    SELECT release_id, case_id, COUNT(*) AS executed_attempts
    FROM test_runs
    GROUP BY release_id, case_id
    HAVING COUNT(*) >= 3;
---

Find test cases that used at least three executed attempts in a single release. The first executed run counts as an attempt. Either a pass or a failure counts; a skipped run does not. Count attempts separately for each release and case.

Return `release_id`, `case_id`, `executed_attempts`, in that column order. Row order does not matter.
