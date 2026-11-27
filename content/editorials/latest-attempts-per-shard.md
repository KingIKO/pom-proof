---
problem: code/latest-attempts-per-shard
---

## What is going on

The CI report picks one event per shard. An event can arrive late for an older attempt, or it can update the status of the current attempt. The rules for which event to keep and where to display it are separate.

## The fix

1. Start a `Map` keyed by the exact shard name.

   **Why:** A map tracks one current winner for each shard and retains its key's first insertion position when its value changes. `numeric-shard-names` requires `"10"` before `"2"` when they arrive in that order. A plain object's enumeration of integer-like keys can give a different order.

   ```js
   const latest = new Map();
   ```

2. Read events in delivery order. Store the whole event if the shard is new or its attempt number is at least the stored attempt.

   **Why:** A lower attempt is stale even when it arrives last, as `stale-late-event` shows. Equality is different: `same-attempt-newer-event` is a later observation for the same attempt and can replace `run` with `pass`. `multiple-updates` combines both paths. Storing a reference to the event without editing it leaves the caller's log intact.

   ```js
   for (const event of events) {
     const previous = latest.get(event.shard);
     if (previous === undefined || event.attempt >= previous.attempt) {
       latest.set(event.shard, event);
     }
   }
   ```

3. Return the map values as a fresh array.

   **Why:** `two-shards` keeps the first shard ahead of the second even after replacing its event. Iterating values gives that display order without sorting and returns an empty array for `no-events`.

   ```js
   return [...latest.values()];
   ```

## Why the tempting answer fails

Strictly greater attempts work when every attempt has only one event. `same-attempt-newer-event` catches the decoy leaving a completed attempt marked `run`, and `multiple-updates` catches it leaving `wait` after a same-attempt `pass`.

## What the interviewer listens for

State both order rules and test them separately. An older attempt arriving late must lose; a later delivery for an equal attempt must win without moving its shard.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Object.keys() and numeric key ordering](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
