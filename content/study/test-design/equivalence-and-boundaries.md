---
title: Equivalence partitioning and boundary value analysis
module: test-design
order: 1
level: core
summary: Group inputs by how the product should handle them. For ordered groups, test the values where the rule changes.
minutes: 2
prerequisites: [testing-foundations/why-we-test]
outcomes:
  - Pick a value from each group of inputs, including the ones the product rejects.
  - Explain which extra values a 3-value boundary check covers.
useWhen:
  - A rule handles whole sets of inputs alike, such as amounts within a limit.
avoidWhen:
  - The outcome changes when two conditions meet or when earlier actions change the starting state.
practiceTopics: [equivalence-partitioning, boundary-testing]
questionTopics: [test-design]
diagrams:
  - id: boundary-values
    type: number-line
    title: Partitions and the values BVA checks
    note: Each band shows the expected result. Both Reject partitions continue past the values shown.
    description: The expected result is Reject for 9 or less, Accept for 10 through 20 and Reject for 21 or more.
    bands:
      - { from: 5, to: 9, label: Reject, kind: reject }
      - { from: 10, to: 20, label: Accept, kind: accept }
      - { from: 21, to: 25, label: Reject, kind: reject }
    threeValue: true
    segments:
      - { title: Lower edge, from: 7, to: 12 }
      - { title: Upper edge, from: 18, to: 23 }
sources:
  - { label: "ISTQB CTFL syllabus: Equivalence partitioning and boundary value analysis", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
---
## What it is

Equivalence partitioning groups values that the product should handle the same way. Each group is a partition. The groups must contain at least one value each and must not overlap. Boundary value analysis, or BVA, checks the edges of ordered partitions, such as ranges of whole numbers.

## How it works

Read the rule and write the expected result for each group. Pick at least one value from every partition, including ones the product should reject.

Suppose a temperature setting takes whole degrees and accepts 10 through 20, including both ends.

| Partition | One value | Expected result |
| --- | --- | --- |
| 9 or less | 5 | Reject |
| 10 through 20 | 15 | Accept |
| 21 or more | 25 | Reject |

In 2-value BVA, use each boundary and the nearest value in the next partition across that edge. The distinct values here are 9, 10, 20 and 21. In 3-value BVA, check each boundary and its closest neighbours on both sides. That adds 8, 11, 19 and 22.

```diagram
boundary-values
```

## Why it helps

Partitions let you sample a large range without testing every number. Boundary checks catch mistakes like rejecting 10 when the rule includes it. The 2-value set alone would pass if the product accepted only 10 and 20. The 3-value set would catch that mistake at 11 and 19.

## When not to use it

You can partition unordered values, such as role names. For example, if only editors and owners can publish, those two roles form a partition. There is no nearest role for a boundary check.

If a result depends on several conditions together, use a decision table to list those combinations. If earlier actions change the result, use state transition testing to follow the sequence of events.
