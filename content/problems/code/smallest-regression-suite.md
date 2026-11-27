---
title: "Cover every required check with the fewest tests"
kind: code
topic: test-design
difficulty: hard
minutes: 30
roles: [automation, sdet, senior]
exportName: smallestRegressionSuite
starters:
  js: |
    export function smallestRegressionSuite(tests, required) {
    }
  ts: |
    type TestCase = { id: string; covers: string[] };

    export function smallestRegressionSuite(tests: TestCase[], required: string[]) {
    }
  python: |
    def smallest_regression_suite(tests, required):
        pass
vectors:
  - name: one-test-covers-all
    args: [[{"id":"only","covers":["auth","cart"]},{"id":"auth","covers":["auth"]}],["cart","auth"]]
    expected: ["only"]
  - name: needs-two
    args: [[{"id":"a","covers":["auth"]},{"id":"b","covers":["cart"]}],["auth","cart"]]
    expected: ["a","b"]
  - name: uncovered-requirement
    args: [[{"id":"a","covers":["auth"]}],["auth","refund"]]
    expected: null
  - name: nothing-required
    args: [[{"id":"a","covers":["auth"]}],[]]
    expected: []
  - name: greedy-trap
    args: [[{"id":"a","covers":["1","2","3","4"]},{"id":"b","covers":["1","2","5"]},{"id":"c","covers":["3","4","6"]}],["1","2","3","4","5","6"]]
    expected: ["b","c"]
  - name: equal-size-tie
    args: [[{"id":"b","covers":["A","B"]},{"id":"a","covers":["A"]},{"id":"c","covers":["B","C"]},{"id":"d","covers":["C"]}],["A","B","C"]]
    expected: ["a","c"]
  - name: duplicates-and-unicode
    args: [[{"id":"a","covers":["確認","確認","extra"]},{"id":"b","covers":["確認","測試"]}],["確認","測試","確認"]]
    expected: ["b"]
  - name: empty-catalog
    args: [[],["auth"]]
    expected: null
solutions:
  js: |
    export function smallestRegressionSuite(tests, required) {
      const wanted = new Set(required);
      const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      let best = null;
      const search = (index, chosen, covered) => {
        if (covered.size === wanted.size) {
          if (best === null || chosen.length < best.length) best = chosen;
          return;
        }
        if (index >= ordered.length || (best !== null && chosen.length >= best.length)) return;
        const { id, covers } = ordered[index];
        const next = new Set(covered);
        for (const label of covers) if (wanted.has(label)) next.add(label);
        if (next.size > covered.size) search(index + 1, [...chosen, id], next);
        search(index + 1, chosen, covered);
      };
      search(0, [], new Set());
      return best;
    }
  ts: |
    type TestCase = { id: string; covers: string[] };

    export function smallestRegressionSuite(tests: TestCase[], required: string[]) {
      const wanted = new Set(required);
      const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      let best: string[] | null = null;
      const search = (index: number, chosen: string[], covered: Set<string>): void => {
        if (covered.size === wanted.size) {
          if (best === null || chosen.length < best.length) best = chosen;
          return;
        }
        if (index >= ordered.length || (best !== null && chosen.length >= best.length)) return;
        const { id, covers } = ordered[index];
        const next = new Set(covered);
        for (const label of covers) if (wanted.has(label)) next.add(label);
        if (next.size > covered.size) search(index + 1, [...chosen, id], next);
        search(index + 1, chosen, covered);
      };
      search(0, [], new Set());
      return best;
    }
  python: |
    def smallest_regression_suite(tests, required):
        wanted = set(required)
        ordered = sorted(tests, key=lambda test: test["id"])
        best = None
        def search(index, chosen, covered):
            nonlocal best
            if covered == wanted:
                if best is None or len(chosen) < len(best):
                    best = chosen
                return
            if index >= len(ordered) or (best is not None and len(chosen) >= len(best)):
                return
            case = ordered[index]
            next_covered = covered | (wanted & set(case["covers"]))
            if next_covered != covered:
                search(index + 1, chosen + [case["id"]], next_covered)
            search(index + 1, chosen, covered)
        search(0, [], set())
        return best
reference:
  language: js
  source: |
    export function smallestRegressionSuite(tests, required) {
      const wanted = new Set(required);
      const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      let best = null;
      const search = (index, chosen, covered) => {
        if (covered.size === wanted.size) {
          if (best === null || chosen.length < best.length) best = chosen;
          return;
        }
        if (index >= ordered.length || (best !== null && chosen.length >= best.length)) return;
        const { id, covers } = ordered[index];
        const next = new Set(covered);
        for (const label of covers) if (wanted.has(label)) next.add(label);
        if (next.size > covered.size) search(index + 1, [...chosen, id], next);
        search(index + 1, chosen, covered);
      };
      search(0, [], new Set());
      return best;
    }
decoy:
  language: js
  source: |
    export function smallestRegressionSuite(tests, required) {
      const uncovered = new Set(required);
      const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      const chosen = [];
      while (uncovered.size) {
        let pick = null;
        let best = 0;
        for (const test of ordered) {
          const gain = new Set(test.covers.filter((label) => uncovered.has(label))).size;
          if (gain > best) {
            pick = test;
            best = gain;
          }
        }
        if (pick === null) return null;
        chosen.push(pick.id);
        for (const label of pick.covers) uncovered.delete(label);
      }
      return chosen.sort();
    }
---

A release needs a regression suite, a group of tests that check whether existing behavior still works. Choose the fewest available tests that cover every required check label. Each test has an `id` and a `covers` list of check labels. Match labels exactly and keep only one copy of each label. Ignore labels that do not appear in `required`.

Choose each test at most once. Return the chosen IDs in ascending ASCII text order, using the ASCII number for each character. If several suites tie for fewest tests, compare their sorted ID lists from left to right. Return the list that sorts first.

If no suite covers every required label, return `null`. If there are no required labels, return an empty list. This exercise asks for an exact answer and uses test inputs with at most 12 tests. Each test ID is unique, nonempty, and written in ASCII.

For example, `smallestRegressionSuite([{"id":"only","covers":["auth","cart"]},{"id":"auth","covers":["auth"]}], ["cart","auth"])` returns `["only"]`. Leave the inputs unchanged.
