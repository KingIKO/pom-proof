---
title: Calculate the pass rate by release
kind: sql
topic: reporting
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
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
  INSERT INTO releases VALUES (1, 'R14'), (2, 'R15'), (3, 'R16');
  INSERT INTO test_cases VALUES (10, 'Submit return'), (11, 'Print receipt'), (12, 'Find parcel');
  INSERT INTO test_runs VALUES
    (21, 1, 10, 'failed'), (22, 1, 10, 'passed'), (23, 1, 11, 'passed'),
    (24, 2, 10, 'failed'), (25, 2, 12, 'passed');
alteredSeed: |
  INSERT INTO releases VALUES (41, 'R21'), (42, 'R22'), (43, 'R23'), (44, 'R24');
  INSERT INTO test_cases VALUES (51, 'Amend address'), (52, 'Read invoice'), (53, 'Resume cart');
  INSERT INTO test_runs VALUES
    (101, 41, 51, 'failed'), (102, 41, 51, 'passed'), (103, 41, 52, 'skipped'),
    (104, 41, 53, 'passed'), (105, 42, 52, 'skipped'), (106, 42, 53, 'skipped'),
    (107, 43, 52, 'failed'), (108, 43, 51, 'skipped');
reference:
  query: |
    SELECT r.release_id,
      ROUND(100.0 * SUM(CASE WHEN t.outcome = 'passed' THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN t.outcome IN ('passed', 'failed') THEN 1 ELSE 0 END), 0), 2)
        AS pass_rate_pct
    FROM releases r
    LEFT JOIN test_runs t ON t.release_id = r.release_id
    GROUP BY r.release_id;
decoy:
  query: |
    SELECT r.release_id,
      ROUND(100.0 * SUM(CASE WHEN t.outcome = 'passed' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(t.run_id), 0), 2) AS pass_rate_pct
    FROM releases r
    LEFT JOIN test_runs t ON t.release_id = r.release_id
    GROUP BY r.release_id;
---

A release dashboard reports the percentage of **executed attempts** that passed. Each passed or failed run is an executed attempt, including retries. Skipped runs do not count. Report a numeric percentage from 0 to 100, rounded to two decimal places. Include every release, returning `NULL` for the percentage if it has no executed attempts.

Return `release_id`, `pass_rate_pct`, in that column order. Row order does not matter.
