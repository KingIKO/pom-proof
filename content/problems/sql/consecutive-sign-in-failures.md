---
title: Find failed sign-ins that follow another failure
kind: sql
topic: reporting
difficulty: hard
minutes: 13
roles: [automation, sdet]
schema: |
  CREATE TABLE users (user_id INTEGER PRIMARY KEY);
  CREATE TABLE audit_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    action TEXT NOT NULL,
    outcome TEXT CHECK (outcome IN ('failed', 'succeeded')),
    occurred_at TEXT NOT NULL,
    CHECK (action <> 'sign_in' OR outcome IS NOT NULL)
  );
seed: |
  INSERT INTO users VALUES (1), (2), (3);
  INSERT INTO audit_events VALUES
    (11, 1, 'sign_in', 'failed', '2026-03-02 08:00:00'), (12, 2, 'sign_in', 'failed', '2026-03-02 08:00:00'),
    (13, 1, 'profile_saved', NULL, '2026-03-02 08:00:01'), (14, 1, 'sign_in', 'failed', '2026-03-02 08:00:02'),
    (15, 1, 'sign_in', 'succeeded', '2026-03-02 08:00:03'), (16, 3, 'sign_in', 'succeeded', '2026-03-02 08:00:04');
alteredSeed: |
  INSERT INTO users VALUES (31), (32), (33);
  INSERT INTO audit_events VALUES
    (105, 31, 'sign_in', 'failed', '2026-04-08 10:00:02'), (101, 31, 'sign_in', 'failed', '2026-04-08 10:00:00'),
    (103, 31, 'sign_in', 'succeeded', '2026-04-08 10:00:01'), (106, 31, 'sign_in', 'failed', '2026-04-08 10:00:02'),
    (107, 31, 'sign_in', 'failed', '2026-04-08 10:00:03'), (102, 32, 'sign_in', 'failed', '2026-04-08 10:00:00'),
    (108, 32, 'sign_in', 'failed', '2026-04-08 10:00:02'), (109, 32, 'profile_saved', NULL, '2026-04-08 10:00:01'),
    (110, 33, 'sign_in', 'succeeded', '2026-04-08 10:00:00');
reference:
  query: |
    WITH sequenced AS (
      SELECT user_id, event_id, outcome,
        LAG(outcome) OVER (PARTITION BY user_id ORDER BY occurred_at, event_id) AS previous_outcome
      FROM audit_events
      WHERE action = 'sign_in'
    )
    SELECT user_id, event_id
    FROM sequenced
    WHERE outcome = 'failed' AND previous_outcome = 'failed'
    ORDER BY user_id, event_id;
decoy:
  query: |
    WITH sequenced AS (
      SELECT user_id, event_id,
        LAG(outcome) OVER (PARTITION BY user_id ORDER BY occurred_at, event_id) AS previous_outcome
      FROM audit_events
      WHERE action = 'sign_in' AND outcome = 'failed'
    )
    SELECT user_id, event_id
    FROM sequenced
    WHERE previous_outcome = 'failed'
    ORDER BY user_id, event_id;
---

For each user, look only at `sign_in` attempts. Put the attempts in time order, earliest `occurred_at` first. If times match, put the smaller `event_id` first. The timestamps store UTC time as `YYYY-MM-DD HH:MM:SS`.

If a sign-in failed right after another failed sign-in for that user, report the later attempt. A successful sign-in breaks the streak. Other actions do not affect it.

Return `user_id` first and `event_id` second. Sort by `user_id` from smallest to largest, then by `event_id` from smallest to largest.
