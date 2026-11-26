---
title: Find planned tests without an executed run
kind: sql
topic: joins
difficulty: hard
minutes: 12
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE releases (release_id INTEGER PRIMARY KEY, release_name TEXT NOT NULL);
  CREATE TABLE test_cases (case_id INTEGER PRIMARY KEY, title TEXT NOT NULL);
  CREATE TABLE release_cases (
    release_id INTEGER NOT NULL REFERENCES releases(release_id),
    case_id INTEGER NOT NULL REFERENCES test_cases(case_id),
    PRIMARY KEY (release_id, case_id)
  );
  CREATE TABLE test_runs (
    run_id INTEGER PRIMARY KEY,
    release_id INTEGER NOT NULL REFERENCES releases(release_id),
    case_id INTEGER NOT NULL REFERENCES test_cases(case_id),
    outcome TEXT NOT NULL CHECK (outcome IN ('passed', 'failed', 'skipped'))
  );
seed: |
  INSERT INTO releases VALUES (1, 'R14'), (2, 'R15');
  INSERT INTO test_cases VALUES (11, 'Void refund'), (12, 'Set pickup time'), (13, 'Print receipt'), (14, 'Add card');
  INSERT INTO release_cases VALUES (1, 11), (1, 12), (2, 13);
  INSERT INTO test_runs VALUES
    (21, 1, 11, 'failed'), (22, 1, 12, 'skipped'), (23, 2, 14, 'passed');
alteredSeed: |
  INSERT INTO releases VALUES (31, 'R21'), (32, 'R22'), (33, 'R23');
  INSERT INTO test_cases VALUES (51, 'Cancel pickup'), (52, 'Track parcel'), (53, 'Draft return'), (54, 'Read invoice');
  INSERT INTO release_cases VALUES (31, 51), (32, 51), (31, 52), (32, 53), (33, 54), (31, 54);
  INSERT INTO test_runs VALUES
    (101, 31, 51, 'skipped'), (102, 32, 51, 'passed'), (103, 31, 52, 'failed'),
    (104, 31, 52, 'passed'), (105, 33, 54, 'passed'), (106, 31, 54, 'skipped'),
    (107, 33, 52, 'passed');
reference:
  query: |
    SELECT p.release_id, p.case_id
    FROM release_cases p
    WHERE NOT EXISTS (
      SELECT 1
      FROM test_runs t
      WHERE t.case_id = p.case_id AND t.release_id = p.release_id
        AND t.outcome IN ('passed', 'failed')
    );
decoy:
  query: |
    SELECT p.release_id, p.case_id
    FROM release_cases p
    WHERE NOT EXISTS (
      SELECT 1
      FROM test_runs t
      WHERE t.case_id = p.case_id AND t.outcome IN ('passed', 'failed')
    );
---

Compare the release test plan with recorded runs. `release_cases` lists the planned release and case pairs. Return each planned pair that has no passed or failed run for that same pair. A pair with only skipped runs still qualifies. An unplanned pair never qualifies.

Return `release_id`, `case_id`, in that column order. Row order does not matter.
