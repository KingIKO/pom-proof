---
title: Find tests whose latest run failed
kind: sql
topic: reporting
difficulty: medium
minutes: 12
roles: [automation, sdet]
schema: |
  CREATE TABLE cases (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  CREATE TABLE runs (
    seq INTEGER PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id),
    outcome TEXT NOT NULL CHECK (outcome IN ('passed', 'failed', 'skipped'))
  );
seed: |
  INSERT INTO cases VALUES (1, 'checkout'), (2, 'credits'), (3, 'pickup'), (4, 'tracking');
  INSERT INTO runs VALUES
    (10, 1, 'passed'), (11, 2, 'failed'), (12, 1, 'failed'),
    (13, 3, 'failed'), (14, 2, 'passed'), (15, 1, 'skipped'), (16, 3, 'skipped');
alteredSeed: |
  INSERT INTO cases VALUES (7, 'amend order'), (8, 'print invoice'), (9, 'switch address'), (10, 'void order');
  INSERT INTO runs VALUES
    (201, 9, 'passed'), (202, 7, 'failed'), (203, 7, 'passed'),
    (204, 9, 'failed'), (205, 8, 'skipped'), (206, 10, 'failed'), (207, 10, 'skipped');
reference:
  query: |
    WITH ranked AS (
      SELECT case_id, outcome, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY seq DESC) AS position
      FROM runs WHERE outcome <> 'skipped'
    )
    SELECT cases.name AS name
    FROM ranked JOIN cases ON cases.id = ranked.case_id
    WHERE ranked.position = 1 AND ranked.outcome = 'failed'
    ORDER BY cases.name;
decoy:
  query: |
    WITH ranked AS (
      SELECT case_id, outcome, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY seq DESC) AS position
      FROM runs
    )
    SELECT cases.name AS name
    FROM ranked JOIN cases ON cases.id = ranked.case_id
    WHERE ranked.position = 1 AND ranked.outcome = 'failed'
    ORDER BY cases.name;
---

A Playwright results dashboard needs a list of tests that currently fail. Write one SQLite query against `cases(id, name)` and `runs(seq, case_id, outcome)`. Larger `seq` values happened later. An outcome is `passed`, `failed`, or `skipped`.

For each case, ignore skipped entries and consider the most recent remaining run. Return a single column `name` for the failed cases, in ascending name order. Cases with no executed run must be absent. The query is checked against two datasets.
