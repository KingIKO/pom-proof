---
title: Find duplicate audit event fingerprints
kind: sql
topic: aggregation
difficulty: easy
minutes: 7
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE users (user_id INTEGER PRIMARY KEY);
  CREATE TABLE audit_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
seed: |
  INSERT INTO users VALUES (1), (2);
  INSERT INTO audit_events VALUES
    (11, 1, 'profile_saved', '2026-03-02 09:00:00'), (12, 1, 'profile_saved', '2026-03-02 09:00:00'),
    (13, 2, 'profile_saved', '2026-03-02 09:00:00'), (14, 2, 'signed_out', '2026-03-02 09:00:00'),
    (15, NULL, 'export_started', '2026-03-02 10:00:00'), (16, NULL, 'export_started', '2026-03-02 10:00:00');
alteredSeed: |
  INSERT INTO users VALUES (31), (32), (33);
  INSERT INTO audit_events VALUES
    (101, 31, 'profile_saved', '2026-04-08 11:00:00'), (102, 31, 'profile_saved', '2026-04-08 11:00:01'),
    (103, 32, 'profile_saved', '2026-04-08 11:00:00'), (104, 32, 'profile_saved', '2026-04-08 11:00:00'),
    (105, 32, 'profile_saved', '2026-04-08 11:00:00'), (106, 32, 'profile_saved', '2026-04-08 11:25:00'),
    (107, NULL, 'export_finished', '2026-04-08 12:10:00'), (108, NULL, 'export_finished', '2026-04-08 12:10:00'),
    (109, NULL, 'export_finished', '2026-04-08 13:00:00'), (110, 33, 'signed_out', '2026-04-08 13:00:00');
reference:
  query: |
    SELECT user_id, action, occurred_at, COUNT(*) AS copies
    FROM audit_events
    GROUP BY user_id, action, occurred_at
    HAVING COUNT(*) > 1;
decoy:
  query: |
    SELECT user_id, action, MIN(occurred_at) AS occurred_at, COUNT(*) AS copies
    FROM audit_events
    GROUP BY user_id, action
    HAVING COUNT(*) > 1;
---

An audit import may repeat the same event under a new `event_id`. For this check, a duplicate fingerprint is the same `user_id`, `action`, and `occurred_at`. Two `NULL` user IDs match for this check. Return one row for each fingerprint that occurs at least twice, with the total number of copies, including the first.

Return `user_id`, `action`, `occurred_at`, `copies`, in that column order. Row order does not matter.
