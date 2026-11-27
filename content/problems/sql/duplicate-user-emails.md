---
title: Find email addresses that appear on more than one user row
kind: sql
topic: data-integrity
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    email TEXT
  );
seed: |
  INSERT INTO users VALUES
    (1, 'returns@example.test'), (2, 'returns@example.test'),
    (3, 'Billing@example.test'), (4, NULL), (5, NULL), (6, 'orders@example.test');
alteredSeed: |
  INSERT INTO users VALUES
    (31, 'Lee@example.test'), (32, 'lee@EXAMPLE.test'), (33, 'LEE@example.test'),
    (34, 'Sam@example.test'), (35, 'sam@example.test'), (36, 'Sami@example.test'),
    (37, NULL), (38, NULL), (39, 'orders@example.test'), (40, 'orders@example.test');
reference:
  query: |
    SELECT LOWER(email) AS normalized_email, COUNT(*) AS user_count
    FROM users
    WHERE email IS NOT NULL
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
    ORDER BY normalized_email;
decoy:
  query: |
    SELECT LOWER(email) AS normalized_email, COUNT(*) AS user_count
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
    ORDER BY normalized_email;
---

The account import expects each email address to belong to only one user. Ignore ASCII letter case across the whole address. Make no other changes to the address. Skip `NULL` values, which mean the address is missing.

If an address appears on more than one user row under that rule, return it in lowercase. Count all users with that address.

Return `normalized_email` first and `user_count` second. Sort by `normalized_email` in ascending order.
