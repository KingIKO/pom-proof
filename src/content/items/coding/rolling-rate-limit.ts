import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'rolling-rate-limit',
  title: 'Replay a sliding-window rate limit',
  kind: 'coding',
  difficulty: 'Hard',
  topics: ['Queues', 'Sliding windows', 'API testing'],
  roles: ['automation', 'sdet'],
  summary: 'Build a deterministic oracle for rate limiting requests by client.',
  prompt: `
Write \`rollingRateLimit(attempts, windowMs, limit)\`. Each attempt has a case-sensitive \`client\` ID and a nonnegative, safe integer timestamp \`atMs\`. Attempts arrive in nondecreasing timestamp order. Process equal timestamps in input order.

At time \`t\`, look at the same client's previously **accepted** attempts in \`(t - windowMs, t]\`. If there are fewer than \`limit\`, accept this attempt and count it for later requests. Otherwise reject it. A rejection never occupies a slot. Different clients have independent histories.

Return one boolean per attempt in input order. The window is a positive safe integer and the limit is a nonnegative safe integer. Aim for linear time in the number of attempts.

With a window of 10 and a limit of 1, a single client's attempts at 0, 9, and 10 return \`[true, false, true]\`.
`,
  fn: 'rollingRateLimit',
  params: [{ name: 'attempts', type: '{ client: string; atMs: number }[]' }, { name: 'windowMs', type: 'number' }, { name: 'limit', type: 'number' }],
  returns: 'boolean[]',
  cases: [
    { args: [[{ client: 'qa', atMs: 0 }, { client: 'qa', atMs: 9 }, { client: 'qa', atMs: 10 }], 10, 1], expected: [true,false,true] },
    { args: [[{ client: 'a', atMs: 1 }, { client: 'b', atMs: 1 }, { client: 'a', atMs: 2 }, { client: 'b', atMs: 3 }], 5, 1], expected: [true,true,false,false] },
    { args: [[{ client: 'x', atMs: 2 }, { client: 'x', atMs: 2 }, { client: 'x', atMs: 2 }], 1, 2], expected: [true,true,false] },
    { args: [[], 10, 1], expected: [], hidden: true },
    { args: [[{ client: 'a', atMs: 0 }, { client: 'a', atMs: 80 }, { client: 'b', atMs: 99 }], 10, 0], expected: [false,false,false], hidden: true },
    { args: [[{ client: 'a', atMs: 0 }, { client: 'a', atMs: 1 }, { client: 'a', atMs: 100 }, { client: 'a', atMs: 100 }], 3, 2], expected: [true,true,true,true], hidden: true },
    { args: [[{ client: 'robot', atMs: 0 }, { client: 'Robot', atMs: 0 }, { client: 'robot', atMs: 1 }, { client: 'robot', atMs: 5 }, { client: 'robot', atMs: 6 }], 5, 1], expected: [true,true,false,true,false], hidden: true },
    { args: [[{ client: '__proto__', atMs: 0 }, { client: 'constructor', atMs: 0 }, { client: '__proto__', atMs: 0 }], 2, 1], expected: [true,true,false], hidden: true },
  ],
  hints: ['Keep a queue of accepted timestamps for each client.', 'Evict timestamps at or before the left edge. A queue head index avoids shifting the whole array.'],
  reference: {
    javascript: `function rollingRateLimit(attempts, windowMs, limit) {
  const clients = new Map();
  return attempts.map(({ client, atMs }) => {
    if (!clients.has(client)) clients.set(client, { times: [], head: 0 });
    const queue = clients.get(client);
    while (queue.head < queue.times.length && queue.times[queue.head] <= atMs - windowMs) {
      queue.head++;
    }
    if (queue.times.length - queue.head >= limit) return false;
    queue.times.push(atMs);
    if (queue.head * 2 >= queue.times.length) {
      queue.times = queue.times.slice(queue.head);
      queue.head = 0;
    }
    return true;
  });
}`,
    python: `from collections import defaultdict, deque

def rolling_rate_limit(attempts, window_ms, limit):
    clients = defaultdict(deque)
    decisions = []
    for row in attempts:
        t = row["atMs"]
        queue = clients[row["client"]]
        while queue and queue[0] <= t - window_ms:
            queue.popleft()
        allowed = len(queue) < limit
        decisions.append(allowed)
        if allowed:
            queue.append(t)
    return decisions`,
  },
  solutionNotes: 'Only accepted requests enter a queue. Each accepted timestamp advances past the head at most once. In JavaScript the occasional slice reclaims old entries and costs at most the work saved by the entries dropped.',
  interviewNotes: 'Draw a window at an exact expiry and account for simultaneous requests. How would you test the same contract on a service with a controllable clock and concurrent callers?',
};

export default item;
