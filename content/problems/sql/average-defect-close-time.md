---
title: Measure average defect close time by severity
kind: sql
topic: date-time
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE defects (
    defect_id INTEGER PRIMARY KEY,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
    opened_at TEXT NOT NULL,
    closed_at TEXT
  );
seed: |
  INSERT INTO defects VALUES
    (1, 'critical', '2026-01-02 09:00:00', '2026-01-03 09:00:00'),
    (2, 'critical', '2026-01-04 15:00:00', '2026-01-07 15:00:00'),
    (3, 'major', '2026-01-10 18:00:00', '2026-01-12 18:00:00'),
    (4, 'major', '2026-01-12 12:00:00', NULL),
    (5, 'minor', '2026-01-12 12:00:00', NULL);
alteredSeed: |
  INSERT INTO defects VALUES
    (21, 'critical', '2026-02-01 22:00:00', '2026-02-02 10:00:00'),
    (22, 'critical', '2026-02-02 06:00:00', '2026-02-03 12:00:00'),
    (23, 'major', '2026-02-08 08:00:00', '2026-02-08 17:00:00'),
    (24, 'major', '2026-02-09 12:00:00', '2026-02-09 12:00:00'),
    (25, 'critical', '2026-02-11 12:00:00', NULL),
    (26, 'minor', '2026-02-12 09:00:00', '2026-02-13 15:00:00'),
    (27, 'minor', '2026-02-14 09:00:00', NULL);
reference:
  query: |
    SELECT severity, ROUND(AVG(julianday(closed_at) - julianday(opened_at)), 2) AS avg_days
    FROM defects
    WHERE closed_at IS NOT NULL
    GROUP BY severity;
decoy:
  query: |
    SELECT severity, ROUND(AVG(julianday(date(closed_at)) - julianday(date(opened_at))), 2) AS avg_days
    FROM defects
    WHERE closed_at IS NOT NULL
    GROUP BY severity;
---

The defect report compares average elapsed days to close across severities. `opened_at` and `closed_at` use UTC timestamps in `YYYY-MM-DD HH:MM:SS` format. An unclosed defect has a `NULL` close time. Exclude these defects and omit severities with no closed defects. Use a 24-hour day, include fractional days, and round the final average to two decimal places.

Return `severity`, `avg_days`, in that column order. Row order does not matter.
