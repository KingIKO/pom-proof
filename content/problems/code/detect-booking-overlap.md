---
title: "Check if two test lab bookings overlap"
kind: code
topic: scheduling
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: detectBookingOverlap
starters:
  js: |
    export function detectBookingOverlap(bookings) {
    }
  ts: |
    export function detectBookingOverlap(bookings: [number, number][]) {
    }
  python: |
    def detect_booking_overlap(bookings):
        pass
vectors:
  - name: overlap-out-of-order
    args: [[[20,50],[10,21],[60,70]]]
    expected: true
  - name: distinct-slots
    args: [[[20,40],[5,10]]]
    expected: false
  - name: one-slot
    args: [[[3,12]]]
    expected: false
  - name: identical-slots
    args: [[[50,51],[50,51]]]
    expected: true
  - name: touching-boundary
    args: [[[20,30],[10,20]]]
    expected: false
  - name: nested-booking
    args: [[[2,80],[10,11],[20,21]]]
    expected: true
  - name: safe-integer-boundary
    args: [[[9007199254740990,9007199254740991],[0,9007199254740990]]]
    expected: false
  - name: no-bookings
    args: [[]]
    expected: false
solutions:
  js: |
    export function detectBookingOverlap(bookings) {
      const ordered = [...bookings].sort(([a], [b]) => a - b);
      let latestEnd = 0;
      for (const [start, end] of ordered) {
        if (start < latestEnd) return true;
        latestEnd = end;
      }
      return false;
    }
  ts: |
    export function detectBookingOverlap(bookings: [number, number][]) {
      const ordered = [...bookings].sort(([a], [b]) => a - b);
      let latestEnd = 0;
      for (const [start, end] of ordered) {
        if (start < latestEnd) return true;
        latestEnd = end;
      }
      return false;
    }
  python: |
    def detect_booking_overlap(bookings):
        latest_end = 0
        for start, end in sorted(bookings):
            if start < latest_end:
                return True
            latest_end = end
        return False
reference:
  language: js
  source: |
    export function detectBookingOverlap(bookings) {
      const ordered = [...bookings].sort(([a], [b]) => a - b);
      let latestEnd = 0;
      for (const [start, end] of ordered) {
        if (start < latestEnd) return true;
        latestEnd = end;
      }
      return false;
    }
decoy:
  language: js
  source: |
    export function detectBookingOverlap(bookings) {
      const ordered = [...bookings].sort(([a], [b]) => a - b);
      for (let i = 1; i < ordered.length; i++) {
        if (ordered[i][0] <= ordered[i - 1][1]) return true;
      }
      return false;
    }
---

A test lab has one room. Each booking gives a `[start, end]` pair. Both times are whole numbers on the same clock and follow `0 <= start < end`. Both times fit the safe integer range, where JavaScript can store each integer exactly. The input may list bookings in any order.

A booking starts at `start` and frees the room at `end`. For example, a booking can start at 20 as soon as another ends at 20. If any two bookings overlap, return `true`. Otherwise, return `false`. An empty schedule or a schedule with one booking cannot overlap.

For example, `detectBookingOverlap([[20,50],[10,21],[60,70]])` returns `true`. Leave the inputs unchanged.
