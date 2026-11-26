import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'compare-release-versions',
  title: 'Compare release versions',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Strings', 'Parsing', 'Versioning'],
  roles: ['automation', 'sdet'],
  summary: 'Compare build labels without sorting numeric parts as text.',
  prompt: `
Write \`compareReleaseVersions(left, right)\` for a release gate. Return \`-1\` if the left version comes first, \`0\` if they tie, or \`1\` if it comes after the right.

Both inputs are valid release labels of the form \`major.minor.patch[-prerelease][+build]\`. Core parts are nonnegative decimal integers with no leading zero unless the part is zero. Prerelease and build are dot-separated nonempty identifiers containing ASCII letters, digits, or hyphens. Numeric prerelease identifiers also have no leading zeros.

- Ignore build metadata. Compare the core parts numerically from left to right.
- With equal cores, a version without prerelease identifiers comes after one with them.
- Compare prerelease identifiers pairwise. Compare two numeric identifiers by integer value. A numeric identifier comes before a nonnumeric one. Compare two nonnumeric identifiers in ascending ASCII order.
- If all paired identifiers match, the shorter list comes first. Numeric parts may exceed JavaScript safe-integer precision.

\`2.4.0-rc.2\` comes before \`2.4.0-rc.10\`, and \`2.4.0-rc.10\` comes before \`2.4.0\`.
`,
  fn: 'compareReleaseVersions',
  params: [{ name: 'left', type: 'string' }, { name: 'right', type: 'string' }],
  returns: '-1 | 0 | 1',
  cases: [
    { args: ['2.4.0-rc.2', '2.4.0-rc.10'], expected: -1 },
    { args: ['2.4.0', '2.4.0-rc.10'], expected: 1 },
    { args: ['1.10.0', '1.9.9'], expected: 1 },
    { args: ['1.0.0+ci.24', '1.0.0+nightly.25'], expected: 0, hidden: true },
    { args: ['1.0.0-preview.2', '1.0.0-preview'], expected: 1, hidden: true },
    { args: ['1.0.0-9', '1.0.0-A'], expected: -1, hidden: true },
    { args: ['1.0.0-RC-new.0+ci', '1.0.0-rc-new.0'], expected: -1, hidden: true },
    { args: ['9007199254740993.0.0', '9007199254740992.9.9'], expected: 1, hidden: true },
  ],
  hints: ['Strip build metadata before splitting off the prerelease. Hyphens can also appear inside identifiers.', 'For digit strings without leading zeros, compare lengths first and digits second.'],
  reference: {
    javascript: `function compareReleaseVersions(left, right) {
  const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  const cmpNumber = (a, b) => cmp(a.length, b.length) || cmp(a, b);
  const isNumber = (s) => /^[0-9]+$/.test(s);
  function parse(version) {
    const raw = version.split('+', 1)[0];
    const dash = raw.indexOf('-');
    const core = (dash < 0 ? raw : raw.slice(0, dash)).split('.');
    return [core, dash < 0 ? [] : raw.slice(dash + 1).split('.')];
  }
  const [a, ap] = parse(left);
  const [b, bp] = parse(right);
  for (let i = 0; i < 3; i++) {
    const order = cmpNumber(a[i], b[i]);
    if (order) return order;
  }
  if (!ap.length || !bp.length) return cmp(bp.length > 0, ap.length > 0);
  for (let i = 0; i < Math.min(ap.length, bp.length); i++) {
    const an = isNumber(ap[i]);
    const bn = isNumber(bp[i]);
    const order = an !== bn ? (an ? -1 : 1) : an ? cmpNumber(ap[i], bp[i]) : cmp(ap[i], bp[i]);
    if (order) return order;
  }
  return cmp(ap.length, bp.length);
}`,
    python: `def compare_release_versions(left, right):
    def compare(a, b):
        return (a > b) - (a < b)

    def numeric(text):
        return (len(text), text)

    def parse(version):
        core, _, pre = version.split("+", 1)[0].partition("-")
        return ([numeric(part) for part in core.split(".")], pre)

    def prerelease_key(part):
        return (0, numeric(part)) if part.isdigit() else (1, part)

    a, ap = parse(left)
    b, bp = parse(right)
    core_order = compare(a, b)
    if core_order:
        return core_order
    if not ap or not bp:
        return compare(not ap, not bp)
    return compare([prerelease_key(part) for part in ap.split(".")],
                   [prerelease_key(part) for part in bp.split(".")])`,
  },
  solutionNotes: 'Separate the three parts of the label before comparing. Comparing length and then digits avoids rounding large integers. A prerelease identifier’s type decides whether numeric or ASCII order applies.',
  interviewNotes: 'Offer a case that fails lexical sorting and one that fails numeric coercion. What would you test if the release gate also accepted invalid labels from CI?',
};

export default item;
