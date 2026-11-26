---
title: Find tests that failed and later passed in the same release
kind: sql
topic: reporting
difficulty: hard
minutes: 13
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
  INSERT INTO test_cases VALUES (10, 'Add card'), (11, 'View invoice'), (12, 'Save address');
  INSERT INTO test_runs VALUES
    (21, 1, 10, 'failed'), (22, 1, 10, 'skipped'), (23, 1, 10, 'passed'),
    (24, 1, 10, 'passed'), (25, 1, 11, 'passed'), (26, 2, 11, 'failed'),
    (27, 2, 12, 'failed'), (28, 2, 12, 'passed');
alteredSeed: |
  INSERT INTO releases VALUES (41, 'R21'), (42, 'R22'), (43, 'R23');
  INSERT INTO test_cases VALUES (51, 'Cancel pickup'), (52, 'Draft return'), (53, 'Track parcel'), (54, 'Send receipt');
  INSERT INTO test_runs VALUES
    (101, 41, 51, 'passed'), (102, 41, 51, 'failed'), (103, 41, 51, 'skipped'),
    (104, 41, 52, 'failed'), (105, 42, 52, 'passed'),
    (106, 42, 53, 'failed'), (107, 42, 53, 'failed'), (108, 42, 53, 'passed'),
    (109, 43, 53, 'failed'), (110, 42, 53, 'passed'), (111, 43, 53, 'passed'),
    (112, 43, 54, 'skipped');
reference:
  query: |
    SELECT DISTINCT f.release_id, f.case_id, c.title AS case_title
    FROM test_runs f
    JOIN test_cases c ON c.case_id = f.case_id
    WHERE f.outcome = 'failed' AND EXISTS (
      SELECT 1
      FROM test_runs p
      WHERE p.release_id = f.release_id AND p.case_id = f.case_id
        AND p.outcome = 'passed' AND p.run_id > f.run_id
    )
    ORDER BY f.release_id, f.case_id;
decoy:
  query: |
    SELECT DISTINCT f.release_id, f.case_id, c.title AS case_title
    FROM test_runs f
    JOIN test_cases c ON c.case_id = f.case_id
    WHERE f.outcome = 'failed' AND EXISTS (
      SELECT 1
      FROM test_runs p
      WHERE p.release_id = f.release_id AND p.case_id = f.case_id
        AND p.outcome = 'passed'
    )
    ORDER BY f.release_id, f.case_id;
---

For this report, flag a test case in a release if at least one failure is followed by a pass for the same case in the same release. Larger `run_id` values are later. The failure and pass do not have to be adjacent. Return one row per qualifying release and case, even if several retries qualify. A pass followed only by failures does not qualify.

Return `release_id`, `case_id`, `case_title`, in that column order. Sort by `release_id` ascending, then `case_id` ascending.
