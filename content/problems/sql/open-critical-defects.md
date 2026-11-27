---
title: Show open critical defects and any linked test titles
kind: sql
topic: joins
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
schema: |
  CREATE TABLE test_cases (case_id INTEGER PRIMARY KEY, title TEXT NOT NULL);
  CREATE TABLE defects (
    defect_id INTEGER PRIMARY KEY,
    case_id INTEGER REFERENCES test_cases(case_id),
    summary TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed'))
  );
seed: |
  INSERT INTO test_cases VALUES (1, 'Apply credit'), (2, 'Print invoice'), (3, 'Send receipt');
  INSERT INTO defects VALUES
    (11, 1, 'Credit charges full balance', 'critical', 'open'),
    (12, 2, 'Wrong tax on PDF', 'critical', 'closed'),
    (13, NULL, 'Date label overlaps', 'minor', 'open'),
    (14, 3, 'Wrong recipient gets receipt', 'critical', 'open');
alteredSeed: |
  INSERT INTO test_cases VALUES (21, 'Renew membership'), (22, 'Cancel shipment'), (23, 'Change billing address');
  INSERT INTO defects VALUES
    (101, NULL, 'Checkout charges twice', 'critical', 'open'),
    (102, 21, 'Renewal loses paid access', 'critical', 'open'),
    (103, 22, 'Cancellation is ignored', 'critical', 'in_progress'),
    (104, 21, 'Wrong renewal tier is charged', 'critical', 'open'),
    (105, 23, 'Apartment number is dropped', 'major', 'open'),
    (106, NULL, 'Guest checkout fails', 'critical', 'closed');
reference:
  query: |
    SELECT d.defect_id, d.summary, c.title AS case_title
    FROM defects d
    LEFT JOIN test_cases c ON c.case_id = d.case_id
    WHERE d.severity = 'critical' AND d.status = 'open'
    ORDER BY d.defect_id;
decoy:
  query: |
    SELECT d.defect_id, d.summary, c.title AS case_title
    FROM defects d
    JOIN test_cases c ON c.case_id = d.case_id
    WHERE d.severity = 'critical' AND d.status = 'open'
    ORDER BY d.defect_id;
---

A triage report helps the team decide which defects to address. Include all defects with severity `critical` and status `open`. Leave out defects with status `in_progress`. If a defect has no linked test case, keep the defect and return `NULL` for the title.

Return `defect_id`, `summary`, and `case_title` in that order. Sort by `defect_id` in ascending order.
