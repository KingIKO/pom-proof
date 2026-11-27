---
title: "Two agents both see an open pickup slot. What keeps them from booking it twice?"
topic: sql
roles: [sdet, senior]
level: senior
type: concept
oneLine: "Enforce one booking per slot in the database, then test that two committed attempts leave one booking and one documented conflict."
looksFor:
  - "Connects the SQL isolation levels to concrete read anomalies."
  - "Distinguishes the database's actual behavior from the standard's minimum guarantees."
  - "Explains a uniqueness constraint and alternatives such as row locks or serializable transactions."
  - "Exercises concurrent attempts through the API and reads the committed result."
trap: "Assuming a transaction around SELECT followed by INSERT automatically prevents both inserts."
followUps:
  - question: "When would you lock a row instead?"
    answer: "When a wider rule must be checked, I can lock a stable slot row if the engine supports row locks and every writer takes the same lock before checking."
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

At the standard's minimum, Read Uncommitted can read dirty data. Read Committed rules that out, but the same row or query can yield different results after another commit. Repeatable Read also prevents the same row from changing on reread, while new matches to a predicate can still appear. Serializable requires the committed result to be equivalent to some serial order.

I'd check the engine. PostgreSQL's Repeatable Read also prevents phantoms, InnoDB defaults to Repeatable Read, and SQLite serializes writes. A unique slot key is the simplest direct rule here. For a broader invariant I'd consider locking an existing slot row or retrying transactions rejected at Serializable.

### Example

The SQLite script shows the uniqueness rule in sequence: slot 14 keeps the first booking. I would separately send concurrent requests against the production database engine in a test environment. I'd expect one success, one documented conflict, and exactly one committed booking.
