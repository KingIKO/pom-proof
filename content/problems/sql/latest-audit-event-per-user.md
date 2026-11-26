---
title: Find the latest audit event for each user
kind: sql
topic: ranking
difficulty: hard
minutes: 12
roles: [automation, sdet]
schema: |
  CREATE TABLE users (user_id INTEGER PRIMARY KEY, email TEXT);
  CREATE TABLE audit_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    action TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
seed: |
  INSERT INTO users VALUES (1, 'lee@example.test'), (2, 'bo@example.test'), (3, NULL);
  INSERT INTO audit_events VALUES
    (11, 1, 'email_changed', '2026-03-02 09:00:00'), (12, 1, 'profile_saved', '2026-03-03 10:15:00'),
    (13, 1, 'signed_in', '2026-03-01 08:00:00'), (14, 2, 'signed_out', '2026-03-03 10:15:00');
alteredSeed: |
  INSERT INTO users VALUES (31, NULL), (32, 'mika@example.test'), (33, 'rae@example.test'), (34, 'min@example.test');
  INSERT INTO audit_events VALUES
    (111, 31, 'signed_in', '2026-04-05 14:00:00'), (103, 31, 'email_changed', '2026-04-06 09:00:00'),
    (102, 31, 'profile_saved', '2026-04-06 09:00:00'), (104, 32, 'signed_in', '2026-04-07 12:00:00'),
    (109, 32, 'signed_out', '2026-04-07 12:00:00'), (108, 32, 'password_changed', '2026-04-06 09:00:00'),
    (110, 34, 'signed_in', '2026-04-07 12:00:00');
reference:
  query: |
    WITH ranked AS (
      SELECT user_id, event_id, action, occurred_at,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at DESC, event_id DESC) AS position
      FROM audit_events
    )
    SELECT u.user_id, r.event_id, r.action, r.occurred_at
    FROM users u LEFT JOIN ranked r ON r.user_id = u.user_id AND r.position = 1
    ORDER BY u.user_id;
decoy:
  query: |
    SELECT u.user_id, e.event_id, e.action, e.occurred_at
    FROM users u
    LEFT JOIN audit_events e ON e.user_id = u.user_id AND e.occurred_at = (
      SELECT MAX(a.occurred_at) FROM audit_events a WHERE a.user_id = u.user_id
    )
    ORDER BY u.user_id, e.event_id;
---

Build an audit summary with one row per user. Choose the event with the latest `occurred_at` for that user. If several events have that timestamp, choose the one with the greatest `event_id` among them. Timestamps use `YYYY-MM-DD HH:MM:SS` in UTC. Include users with no events and return `NULL` for all three event fields for them.

Return `user_id`, `event_id`, `action`, `occurred_at`, in that column order. Sort by `user_id` ascending.
