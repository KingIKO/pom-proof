---
problem: code/latest-attempts-per-shard
---

## What is going on

A shard is one slice of a test suite that runs separately from the others. The continuous integration (CI) report, which tracks automated test runs, picks one event for each shard. A late event may belong to an older attempt. Another event may update the status of the current attempt. Two separate rules decide which event to keep and where to show it.

## The fix

1. Start a `Map` keyed by the exact shard name.

   **Why:** A `Map` stores one value per key, so it holds one current winning event for each shard. When a key's value changes, the key keeps its first insertion position. `numeric-shard-names` needs `"10"` before `"2"` when they arrive in that order. A plain object can list integer-like keys in a different order.

   ```js
   const latest = new Map();
   ```

2. Read events in delivery order and store each event whose shard is new or whose attempt is at least the stored attempt.

   **Why:** A lower attempt is stale, meaning out of date, even when it arrives last, as `stale-late-event` shows. An equal attempt is different. In `same-attempt-newer-event`, the later event reports on the same attempt, so it can replace `run` with `pass`. `multiple-updates` combines both cases. The code stores a reference to the event without editing it, so the caller's log stays intact.

   ```js
   for (const event of events) {
     const previous = latest.get(event.shard);
     if (previous === undefined || event.attempt >= previous.attempt) {
       latest.set(event.shard, event);
     }
   }
   ```

3. Return the map's values as a new array.

   **Why:** In `two-shards`, shard `b` stays ahead of shard `a`, even after its event is replaced. Reading the values in map order gives that display order without sorting. It also returns an empty array for `no-events`.

   ```js
   return [...latest.values()];
   ```

## Why the tempting answer fails

The decoy replaces an event only when the new attempt is strictly greater. That works when every attempt has only one event. In `same-attempt-newer-event`, the decoy leaves a completed attempt marked `run`. In `multiple-updates`, it keeps `wait` even after a `pass` for the same attempt.

## What the interviewer listens for

State both order rules and test each one separately. An older attempt that arrives late must lose. A later event for an equal attempt must win, and its shard must keep its place.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Object.keys() and numeric key ordering](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
