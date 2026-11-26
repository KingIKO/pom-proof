import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'normalize-route-urls',
  title: 'Compare request routes in a replay log',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Strings', 'URLs', 'Sorting'],
  roles: ['automation', 'sdet'],
  summary: 'Compare two logged routes using the replay tool’s normalization rules.',
  prompt: `
Write \`sameReplayRoute(left, right)\` for a replay tool. Both inputs are ASCII, start with a single slash, and contain a path with an optional query and fragment. Compare them using these project rules:

- Drop the first \`#\` and everything after it. Split what remains at the first \`?\` into path and query.
- Remove all trailing slashes from the path, except keep \`/\` as the root. Preserve case and all other characters.
- Split the query on \`&\`. Discard empty pieces and sort the remaining raw pieces in ASCII order. Keep duplicates.
- Compare the normalized paths and lists. Do not decode percent escapes, translate \`+\`, or treat \`flag\` and \`flag=\` as the same piece.

\`/runs/?day=Mon&mode=fast#results\` and \`/runs?mode=fast&day=Mon\` match.
`,
  fn: 'sameReplayRoute',
  params: [{ name: 'left', type: 'string' }, { name: 'right', type: 'string' }],
  returns: 'boolean',
  cases: [
    { args: ['/runs/?day=Mon&mode=fast#results', '/runs?mode=fast&day=Mon'], expected: true },
    { args: ['/runs?tag=a&tag=a', '/runs?tag=a'], expected: false },
    { args: ['/Runs', '/runs'], expected: false },
    { args: ['/?&&#view', '/'], expected: true, hidden: true },
    { args: ['/runs///?tag=b&tag=a&tag=b', '/runs?tag=b&tag=b&tag=a'], expected: true, hidden: true },
    { args: ['/query?q=a+b', '/query?q=a%20b'], expected: false, hidden: true },
    { args: ['/runs?flag', '/runs?flag='], expected: false, hidden: true },
    { args: ['/a//b?q=one?two', '/a/b?q=one'], expected: false, hidden: true },
  ],
  hints: ['Parse the fragment before looking for the query.', 'Sort a list of pieces. A set would discard repeated parameters.'],
  reference: {
    javascript: `function sameReplayRoute(left, right) {
  function normalize(route) {
    const raw = route.split('#', 1)[0];
    const queryAt = raw.indexOf('?');
    const path = queryAt < 0 ? raw : raw.slice(0, queryAt);
    const query = queryAt < 0 ? '' : raw.slice(queryAt + 1);
    return [path.replace(/\\/+$/, '') || '/', query.split('&').filter(Boolean).sort()];
  }
  const [leftPath, leftParts] = normalize(left);
  const [rightPath, rightParts] = normalize(right);
  return leftPath === rightPath && leftParts.length === rightParts.length &&
    leftParts.every((part, index) => part === rightParts[index]);
}`,
    python: `def same_replay_route(left, right):
    def normalize(route):
        path, _, query = route.split("#", 1)[0].partition("?")
        return (path.rstrip("/") or "/", sorted(piece for piece in query.split("&") if piece))
    return normalize(left) == normalize(right)`,
  },
  solutionNotes: 'Normalize each route once, then compare the path and sorted query pieces. Keeping the protocol narrow avoids URL-library defaults about decoding and re-encoding query parameters.',
  interviewNotes: 'Ask whether parameter order matters for the actual endpoint before applying these rules. What example would distinguish dropping a duplicate from reordering it?',
};

export default item;
