---
title: "Find duplicate test emails"
kind: code
topic: test-data
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: duplicateTestEmails
starters:
  js: |
    export function duplicateTestEmails(emails) {
    }
  ts: |
    export function duplicateTestEmails(emails: string[]) {
    }
  python: |
    def duplicate_test_emails(emails):
        pass
vectors:
  - name: case-match
    args: [["Sam@example.test","sam@example.test","lee@example.test"]]
    expected: ["sam@example.test"]
  - name: independent-aliases
    args: [["a@example.test","a+qa@example.test","a.b@example.test"]]
    expected: []
  - name: repeated-more-than-twice
    args: [["OPS@example.test","ops@example.test","Ops@example.test"]]
    expected: ["ops@example.test"]
  - name: both-duplicate
    args: [["a@ci.test","b@ci.test","A@ci.test","B@ci.test"]]
    expected: ["a@ci.test","b@ci.test"]
  - name: second-occurrence-order
    args: [["a@ci.test","b@ci.test","B@ci.test","A@ci.test"]]
    expected: ["b@ci.test","a@ci.test"]
  - name: interleaved-third-occurrence
    args: [["a@ci.test","b@ci.test","c@ci.test","C@ci.test","B@ci.test","b@ci.test","A@ci.test"]]
    expected: ["c@ci.test","b@ci.test","a@ci.test"]
  - name: one-address
    args: [["solo@example.test"]]
    expected: []
  - name: empty-fixture
    args: [[]]
    expected: []
solutions:
  js: |
    export function duplicateTestEmails(emails) {
      const seen = new Set();
      const duplicates = new Set();
      for (const email of emails) {
        const normalized = email.toLowerCase();
        if (seen.has(normalized)) duplicates.add(normalized);
        seen.add(normalized);
      }
      return [...duplicates];
    }
  ts: |
    export function duplicateTestEmails(emails: string[]) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      for (const email of emails) {
        const normalized = email.toLowerCase();
        if (seen.has(normalized)) duplicates.add(normalized);
        seen.add(normalized);
      }
      return [...duplicates];
    }
  python: |
    def duplicate_test_emails(emails):
        seen = set()
        duplicates = {}
        for email in emails:
            normalized = email.lower()
            if normalized in seen:
                duplicates[normalized] = None
            seen.add(normalized)
        return list(duplicates)
reference:
  language: js
  source: |
    export function duplicateTestEmails(emails) {
      const seen = new Set();
      const duplicates = new Set();
      for (const email of emails) {
        const normalized = email.toLowerCase();
        if (seen.has(normalized)) duplicates.add(normalized);
        seen.add(normalized);
      }
      return [...duplicates];
    }
decoy:
  language: js
  source: |
    export function duplicateTestEmails(emails) {
      const counts = new Map();
      for (const email of emails) {
        const key = email.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return Array.from(counts).filter(([, count]) => count >= 2).map(([email]) => email);
    }
---

A fixture loader checks account aliases before seeding a test database. Each entry is a nonempty ASCII email with no whitespace. For this fixture only, compare the whole address after lowercasing it. Return each repeated address once, in lowercase, ordered by the position where its second occurrence appears. Preserve dots and plus tags. Return an empty array if nothing repeats.

`duplicateTestEmails(["Sam@example.test","sam@example.test","lee@example.test"])` returns `["sam@example.test"]`. Leave the inputs unchanged.
