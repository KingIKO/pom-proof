---
title: List users who changed their email and their password
kind: sql
topic: aggregation
difficulty: medium
minutes: 7
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE users (user_id INTEGER PRIMARY KEY);
  CREATE TABLE audit_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    action TEXT NOT NULL
  );
seed: |
  INSERT INTO users VALUES (1), (2), (3), (4);
  INSERT INTO audit_events VALUES
    (11, 1, 'email_changed'), (12, 1, 'password_changed'), (13, 1, 'signed_in'),
    (14, 2, 'email_changed'), (15, 2, 'signed_in'), (16, 3, 'password_changed');
alteredSeed: |
  INSERT INTO users VALUES (31), (32), (33), (34), (35);
  INSERT INTO audit_events VALUES
    (101, 31, 'email_changed'), (102, 31, 'email_changed'), (103, 31, 'signed_out'),
    (104, 32, 'password_changed'), (105, 32, 'email_changed'), (106, 32, 'password_changed'),
    (107, 33, 'password_changed'), (108, 33, 'password_changed'),
    (109, 34, 'email_changed'), (110, 34, 'password_changed'), (111, 35, 'profile_saved');
reference:
  query: |
    SELECT user_id
    FROM audit_events
    WHERE action IN ('email_changed', 'password_changed')
    GROUP BY user_id
    HAVING COUNT(DISTINCT action) = 2;
decoy:
  query: |
    SELECT user_id
    FROM audit_events
    WHERE action IN ('email_changed', 'password_changed')
    GROUP BY user_id
    HAVING COUNT(*) >= 2;
---

The account settings audit looks for two types of changes. A user qualifies if they have at least one `email_changed` event and at least one `password_changed` event. The changes can happen in either order. If a user has only one type of change, repeats of that type do not count for the other. Return one row per qualifying user.

Return only `user_id`. Rows can appear in any order.
