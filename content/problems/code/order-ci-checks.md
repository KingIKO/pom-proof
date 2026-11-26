---
title: "Plan CI checks in dependency order"
kind: code
topic: ci
difficulty: hard
minutes: 30
roles: [automation, sdet, senior]
exportName: orderCiChecks
starters:
  js: |
    export function orderCiChecks(jobs) {
    }
  ts: |
    type Job = { id: string; needs: string[] };

    export function orderCiChecks(jobs: Job[]) {
    }
  python: |
    def order_ci_checks(jobs):
        pass
vectors:
  - name: linear-pipeline
    args: [[{"id":"test","needs":["build"]},{"id":"build","needs":["lint"]},{"id":"lint","needs":[]}]]
    expected: ["lint","build","test"]
  - name: independent-jobs
    args: [[{"id":"z","needs":[]},{"id":"a","needs":[]}]]
    expected: ["a","z"]
  - name: wait-for-two
    args: [[{"id":"end","needs":["b","a"]},{"id":"b","needs":[]},{"id":"a","needs":[]}]]
    expected: ["a","b","end"]
  - name: cycle
    args: [[{"id":"a","needs":["b"]},{"id":"b","needs":["a"]}]]
    expected: null
  - name: earlier-id-just-became-ready
    args: [[{"id":"a","needs":["start"]},{"id":"z","needs":[]},{"id":"start","needs":[]}]]
    expected: ["start","a","z"]
  - name: duplicate-dependencies
    args: [[{"id":"ship","needs":["qa","qa"]},{"id":"qa","needs":[]}]]
    expected: ["qa","ship"]
  - name: partial-cycle
    args: [[{"id":"ready","needs":[]},{"id":"loop","needs":["loop"]}]]
    expected: null
  - name: empty-pipeline
    args: [[]]
    expected: []
solutions:
  js: |
    export function orderCiChecks(jobs) {
      const ids = jobs.map(({ id }) => id).sort();
      const counts = new Map();
      const dependents = new Map(ids.map((id) => [id, [] ]));
      for (const { id, needs } of jobs) {
        const unique = new Set(needs);
        counts.set(id, unique.size);
        for (const dep of unique) dependents.get(dep)?.push(id);
      }
      const order = [];
      while (order.length < jobs.length) {
        const next = ids.find((id) => counts.get(id) === 0);
        if (next === undefined) return null;
        order.push(next);
        counts.delete(next);
        for (const id of dependents.get(next) ?? []) counts.set(id, (counts.get(id) ?? 0) - 1);
      }
      return order;
    }
  ts: |
    type Job = { id: string; needs: string[] };

    export function orderCiChecks(jobs: Job[]) {
      const ids = jobs.map(({ id }) => id).sort();
      const counts = new Map<string, number>();
      const dependents = new Map(ids.map((id) => [id, [] as string[]]));
      for (const { id, needs } of jobs) {
        const unique = new Set(needs);
        counts.set(id, unique.size);
        for (const dep of unique) dependents.get(dep)?.push(id);
      }
      const order: string[] = [];
      while (order.length < jobs.length) {
        const next = ids.find((id) => counts.get(id) === 0);
        if (next === undefined) return null;
        order.push(next);
        counts.delete(next);
        for (const id of dependents.get(next) ?? []) counts.set(id, (counts.get(id) ?? 0) - 1);
      }
      return order;
    }
  python: |
    def order_ci_checks(jobs):
        ids = sorted(job["id"] for job in jobs)
        counts = {}
        dependents = {job_id: [] for job_id in ids}
        for job in jobs:
            job_id = job["id"]
            unique = set(job["needs"])
            counts[job_id] = len(unique)
            for dep in unique:
                dependents[dep].append(job_id)
        order = []
        while len(order) < len(jobs):
            ready = next((job_id for job_id in ids if counts.get(job_id) == 0), None)
            if ready is None:
                return None
            order.append(ready)
            del counts[ready]
            for job_id in dependents[ready]:
                counts[job_id] -= 1
        return order
reference:
  language: js
  source: |
    export function orderCiChecks(jobs) {
      const ids = jobs.map(({ id }) => id).sort();
      const counts = new Map();
      const dependents = new Map(ids.map((id) => [id, [] ]));
      for (const { id, needs } of jobs) {
        const unique = new Set(needs);
        counts.set(id, unique.size);
        for (const dep of unique) dependents.get(dep)?.push(id);
      }
      const order = [];
      while (order.length < jobs.length) {
        const next = ids.find((id) => counts.get(id) === 0);
        if (next === undefined) return null;
        order.push(next);
        counts.delete(next);
        for (const id of dependents.get(next) ?? []) counts.set(id, (counts.get(id) ?? 0) - 1);
      }
      return order;
    }
decoy:
  language: js
  source: |
    export function orderCiChecks(jobs) {
      const counts = new Map();
      const dependents = new Map(jobs.map(({ id }) => [id, []]));
      for (const { id, needs } of jobs) {
        const unique = new Set(needs);
        counts.set(id, unique.size);
        for (const dep of unique) dependents.get(dep).push(id);
      }
      const ready = jobs.filter(({ id }) => counts.get(id) === 0).map(({ id }) => id).sort();
      const order = [];
      for (let i = 0; i < ready.length; i++) {
        const next = ready[i];
        order.push(next);
        for (const id of dependents.get(next)) {
          const remaining = counts.get(id) - 1;
          counts.set(id, remaining);
          if (remaining === 0) ready.push(id);
        }
      }
      return order.length === jobs.length ? order : null;
    }
---

A CI planner receives `{id, needs}` records. Job IDs are unique nonempty ASCII strings, and every prerequisite names an existing job. A prerequisite can appear more than once in a `needs` list; duplicates have no extra effect.

Return a list of job IDs in execution order. Each job must appear after every prerequisite. Whenever multiple remaining jobs are ready, choose the ID that comes first in ascending ASCII text order, including jobs that just became ready. If any cycle prevents completing the plan, return `null` instead of a partial order. No jobs means an empty list.

`orderCiChecks([{"id":"test","needs":["build"]},{"id":"build","needs":["lint"]},{"id":"lint","needs":[]}])` returns `["lint","build","test"]`. Leave the inputs unchanged.
