---
title: "Decide which requests fit the rolling limit"
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

Replay recorded requests against a test quota, the most requests a client can make in a set span of time. The span moves with each request, so it is called a sliding window. Each `{client, at}` row gives a client name and a time. Times go from earliest to latest and can repeat. Match client names exactly.

For the current request at time `at`, count earlier accepted requests from that client with times greater than `at - windowMs`. Include earlier rows at the same time. If the count is below `limit`, accept the request. Otherwise, reject it. Rejected requests never count toward the quota.

Times are whole milliseconds of zero or more. The window is a positive whole number. The limit is a whole number of zero or more. All these values fit the safe integer range, where JavaScript can store each integer exactly. A limit of zero rejects every request.

Return one boolean per row in input order: `true` if accepted, `false` if rejected. Aim for work that grows in direct proportion to the number of requests. Remove requests that fall outside the window without scanning the history again.

For example, `slidingWindowRequestDecisions([{"client":"a","at":0},{"client":"a","at":2},{"client":"a","at":3}], 10, 2)` returns `[true,true,false]`. Leave the inputs unchanged.
