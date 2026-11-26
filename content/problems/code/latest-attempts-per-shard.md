---
title: "Pick the latest attempt per shard"
kind: code
topic: ci
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: latestAttemptsPerShard
starters:
  js: |
    export function latestAttemptsPerShard(events) {
    }
  ts: |
    type Attempt = { shard: string; attempt: number; status: string };

    export function latestAttemptsPerShard(events: Attempt[]) {
    }
  python: |
    def latest_attempts_per_shard(events):
        pass
vectors:
  - name: two-shards
    args: [[{"shard":"b","attempt":1,"status":"run"},{"shard":"a","attempt":1,"status":"pass"},{"shard":"b","attempt":2,"status":"pass"}]]
    expected: [{"shard":"b","attempt":2,"status":"pass"},{"shard":"a","attempt":1,"status":"pass"}]
  - name: stale-late-event
    args: [[{"shard":"a","attempt":4,"status":"fail"},{"shard":"a","attempt":2,"status":"run"}]]
    expected: [{"shard":"a","attempt":4,"status":"fail"}]
  - name: one-event
    args: [[{"shard":"a","attempt":0,"status":"ready"}]]
    expected: [{"shard":"a","attempt":0,"status":"ready"}]
  - name: no-events
    args: [[]]
    expected: []
  - name: same-attempt-newer-event
    args: [[{"shard":"a","attempt":12,"status":"run"},{"shard":"a","attempt":12,"status":"pass"}]]
    expected: [{"shard":"a","attempt":12,"status":"pass"}]
  - name: numeric-shard-names
    args: [[{"shard":"10","attempt":1,"status":"run"},{"shard":"2","attempt":1,"status":"run"}]]
    expected: [{"shard":"10","attempt":1,"status":"run"},{"shard":"2","attempt":1,"status":"run"}]
  - name: unicode-and-safe-integer
    args: [[{"shard":"東京","attempt":9007199254740991,"status":"fail"},{"shard":"東京","attempt":9007199254740990,"status":"run"}]]
    expected: [{"shard":"東京","attempt":9007199254740991,"status":"fail"}]
  - name: multiple-updates
    args: [[{"shard":"x","attempt":8,"status":"run"},{"shard":"y","attempt":3,"status":"ready"},{"shard":"x","attempt":9,"status":"wait"},{"shard":"x","attempt":9,"status":"pass"},{"shard":"x","attempt":8,"status":"fail"}]]
    expected: [{"shard":"x","attempt":9,"status":"pass"},{"shard":"y","attempt":3,"status":"ready"}]
solutions:
  js: |
    export function latestAttemptsPerShard(events) {
      const latest = new Map();
      for (const event of events) {
        const previous = latest.get(event.shard);
        if (previous === undefined || event.attempt >= previous.attempt) latest.set(event.shard, event);
      }
      return [...latest.values()];
    }
  ts: |
    type Attempt = { shard: string; attempt: number; status: string };

    export function latestAttemptsPerShard(events: Attempt[]) {
      const latest = new Map<string, Attempt>();
      for (const event of events) {
        const previous = latest.get(event.shard);
        if (previous === undefined || event.attempt >= previous.attempt) latest.set(event.shard, event);
      }
      return [...latest.values()];
    }
  python: |
    def latest_attempts_per_shard(events):
        latest = {}
        for event in events:
            shard = event["shard"]
            if shard not in latest or event["attempt"] >= latest[shard]["attempt"]:
                latest[shard] = event
        return list(latest.values())
reference:
  language: js
  source: |
    export function latestAttemptsPerShard(events) {
      const latest = new Map();
      for (const event of events) {
        const previous = latest.get(event.shard);
        if (previous === undefined || event.attempt >= previous.attempt) latest.set(event.shard, event);
      }
      return [...latest.values()];
    }
decoy:
  language: js
  source: |
    export function latestAttemptsPerShard(events) {
      const latest = new Map();
      for (const event of events) {
        const previous = latest.get(event.shard);
        if (previous === undefined || event.attempt > previous.attempt) latest.set(event.shard, event);
      }
      return [...latest.values()];
    }
---

A CI service receives an ordered delivery of `{shard, attempt, status}` events, possibly out of attempt order. Return one whole event per exact shard name. Prefer the greatest attempt number; when two events for a shard have that number, prefer the event delivered later in the input. Return chosen events in the order their shards first appeared. Attempt numbers are nonnegative safe integers. An empty stream returns an empty array.

`latestAttemptsPerShard([{"shard":"b","attempt":1,"status":"run"},{"shard":"a","attempt":1,"status":"pass"},{"shard":"b","attempt":2,"status":"pass"}])` returns `[{"shard":"b","attempt":2,"status":"pass"},{"shard":"a","attempt":1,"status":"pass"}]`. Leave the inputs unchanged.
