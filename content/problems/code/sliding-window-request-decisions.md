---
title: "Apply a sliding request quota"
kind: code
topic: scheduling
difficulty: hard
minutes: 30
roles: [automation, sdet, senior]
exportName: slidingWindowRequestDecisions
starters:
  js: |
    export function slidingWindowRequestDecisions(requests, windowMs, limit) {
    }
  ts: |
    type Request = { client: string; at: number };

    export function slidingWindowRequestDecisions(requests: Request[], windowMs: number, limit: number) {
    }
  python: |
    def sliding_window_request_decisions(requests, windowMs, limit):
        pass
vectors:
  - name: quota-burst
    args: [[{"client":"a","at":0},{"client":"a","at":2},{"client":"a","at":3}],10,2]
    expected: [true,true,false]
  - name: clients-are-independent
    args: [[{"client":"a","at":0},{"client":"b","at":0},{"client":"a","at":1}],5,1]
    expected: [true,true,false]
  - name: expiration-at-boundary
    args: [[{"client":"a","at":0},{"client":"a","at":10}],10,1]
    expected: [true,true]
  - name: same-timestamp
    args: [[{"client":"a","at":3},{"client":"a","at":3},{"client":"a","at":3}],2,2]
    expected: [true,true,false]
  - name: rejection-does-not-delay-recovery
    args: [[{"client":"a","at":0},{"client":"a","at":9},{"client":"a","at":10}],10,1]
    expected: [true,false,true]
  - name: unicode-and-zero-limit
    args: [[{"client":"Zoë","at":0},{"client":"東京","at":4}],1,0]
    expected: [false,false]
  - name: safe-integer-boundary
    args: [[{"client":"a","at":9007199254740989},{"client":"a","at":9007199254740990},{"client":"a","at":9007199254740991}],2,1]
    expected: [true,false,true]
  - name: empty-trace
    args: [[],1,2]
    expected: []
solutions:
  js: |
    export function slidingWindowRequestDecisions(requests, windowMs, limit) {
      const history = new Map();
      const decisions = [];
      for (const { client, at } of requests) {
        const queue = history.get(client) ?? { times: [], head: 0 };
        const expires = at - windowMs;
        while (queue.head < queue.times.length && queue.times[queue.head] <= expires) queue.head++;
        const accept = queue.times.length - queue.head < limit;
        if (accept) queue.times.push(at);
        decisions.push(accept);
        history.set(client, queue);
      }
      return decisions;
    }
  ts: |
    type Request = { client: string; at: number };

    export function slidingWindowRequestDecisions(requests: Request[], windowMs: number, limit: number) {
      const history = new Map<string, { times: number[]; head: number }>();
      const decisions: boolean[] = [];
      for (const { client, at } of requests) {
        const queue = history.get(client) ?? { times: [], head: 0 };
        const expires = at - windowMs;
        while (queue.head < queue.times.length && queue.times[queue.head] <= expires) queue.head++;
        const accept = queue.times.length - queue.head < limit;
        if (accept) queue.times.push(at);
        decisions.push(accept);
        history.set(client, queue);
      }
      return decisions;
    }
  python: |
    def sliding_window_request_decisions(requests, windowMs, limit):
        history = {}
        decisions = []
        for request in requests:
            client, at = request["client"], request["at"]
            times, head = history.get(client, ([], 0))
            while head < len(times) and times[head] <= at - windowMs:
                head += 1
            accepted = len(times) - head < limit
            if accepted:
                times.append(at)
            history[client] = times, head
            decisions.append(accepted)
        return decisions
reference:
  language: js
  source: |
    export function slidingWindowRequestDecisions(requests, windowMs, limit) {
      const history = new Map();
      const decisions = [];
      for (const { client, at } of requests) {
        const queue = history.get(client) ?? { times: [], head: 0 };
        const expires = at - windowMs;
        while (queue.head < queue.times.length && queue.times[queue.head] <= expires) queue.head++;
        const accept = queue.times.length - queue.head < limit;
        if (accept) queue.times.push(at);
        decisions.push(accept);
        history.set(client, queue);
      }
      return decisions;
    }
decoy:
  language: js
  source: |
    export function slidingWindowRequestDecisions(requests, windowMs, limit) {
      const history = new Map();
      return requests.map(({ client, at }) => {
        const live = (history.get(client) ?? []).filter((time) => time > at - windowMs);
        const accept = live.length < limit;
        live.push(at);
        history.set(client, live);
        return accept;
      });
    }
---

Replay a recorded request stream against a test quota. Each row is `{client, at}`. Timestamps are nonnegative safe integer milliseconds, nondecreasing in input order. Match client names exactly. At time `at`, count that client's earlier accepted requests whose times are strictly greater than `at - windowMs`. Earlier rows at the same timestamp count. Accept the current request only if that count is below `limit`. A rejected request never uses quota.

Return one boolean per row in input order, using `true` for accepted. The window is a positive safe integer. The limit is a nonnegative safe integer; zero rejects every request. Aim for work linear in the number of requests by removing expired history without rescanning it.

`slidingWindowRequestDecisions([{"client":"a","at":0},{"client":"a","at":2},{"client":"a","at":3}], 10, 2)` returns `[true,true,false]`. Leave the inputs unchanged.
