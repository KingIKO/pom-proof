---
title: "Two agents see the same available pickup slot. How would you prevent a double booking?"
topic: sql
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I'd make the database allow only one booking per slot. I'd have two attempts try to commit and check for one committed booking and one documented conflict."
looksFor:
  - "Give examples of what reads can return at different SQL isolation levels."
  - "Say where the database does more than the standard requires."
  - "Explain how a uniqueness constraint, a row lock, or Serializable can prevent double booking."
  - "Send both attempts through the API and read the result the database saved."
trap: "Assuming a transaction with `SELECT` and then `INSERT` automatically prevents both attempts from inserting a row."
followUps:
  - question: "When would you lock the slot row instead of using only a unique key?"
    answer: "If I need to check a wider rule, I'd consider locking a stable slot row. I'd only do it if the database supports row locks and every writer takes that lock before checking."
sources:
  - label: PostgreSQL isolation levels and read anomalies
    url: https://www.postgresql.org/docs/current/transaction-iso.html
  - label: PostgreSQL row locks
    url: https://www.postgresql.org/docs/current/explicit-locking.html
  - label: MySQL InnoDB isolation and its default
    url: https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/innodb-transaction-isolation-levels.html
  - label: SQLite single-writer isolation
    url: https://www.sqlite.org/isolation.html
  - label: SQLite UNIQUE constraints
    url: https://www.sqlite.org/lang_createtable.html
  - label: SQLite UPSERT and conflict targets
    url: https://www.sqlite.org/lang_upsert.html
examples:
  - title: Reject another booking for the same slot
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          CREATE TEMP TABLE pickups (
            slot_id INTEGER NOT NULL UNIQUE,
            agent TEXT NOT NULL
          );
          INSERT INTO pickups VALUES (14, 'first');
          INSERT INTO pickups VALUES (14, 'second') ON CONFLICT(slot_id) DO NOTHING;
          SELECT slot_id, agent FROM pickups WHERE slot_id = 14;
---

I'd check the isolation level, the rules for what transactions can see while other transactions run. Under the standard, Read Uncommitted can show changes another transaction hasn't saved. Read Committed prevents that. After another transaction saves changes, the same row or query can still give me a different result.

Repeatable Read also keeps a row the same if I read it again. A query can still find new rows that match its filter. Serializable requires the saved result to match some order in which the transactions ran one at a time.

I'd check how my database implements those rules. PostgreSQL's Repeatable Read also blocks phantoms, the new rows that would match on a second read. InnoDB uses Repeatable Read by default. SQLite allows only one writer at a time.

I'd use a unique slot key because it's the simplest direct rule here. That key enforces a uniqueness constraint, which prevents two bookings from sharing the same slot. If I need to protect a wider rule, I might lock an existing slot row. I could also retry transactions the database rejects at Serializable.

### Example

I'd use the SQLite script to try the bookings one at a time. Slot 14 should keep the first booking. In a test environment with the production database engine, I'd separately send requests that overlap. I'd expect one success, one documented conflict, and exactly one committed booking.
