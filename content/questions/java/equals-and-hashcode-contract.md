---
title: Why does a Java set keep two claims with the same claim ID?
topic: java
roles: [sdet]
level: mid
type: concept
oneLine: Define equality and hashing from the same claim fields, or use a record whose components match the claim key.
looksFor:
  - States the hashCode contract for equal objects and allows collisions for unequal objects.
  - Explains how inconsistent hashes can keep equal values in separate buckets.
  - Chooses fields that actually define the business key.
  - Shows how a record supplies matching equals and hashCode implementations.
trap: Adding an equals method alone and assuming a HashSet will find the equal key.
followUps:
  - question: Should the amount go into a claim key record?
    answer: Only if it defines identity. If one claim ID remains the same claim after an amount change, I'd leave the amount out of the key.
sources:
  - label: Java 21 Object equality and hashing
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html
  - label: Java 21 record members
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.10.3
  - label: Java 21 HashSet
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashSet.html
  - label: OpenJDK 21 HashMap bucket lookup
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/HashMap.java
examples:
  - title: Show how the same claim can slip into a set
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.HashSet;

          class ClaimKeyCheck {
              record BrokenKey(String id, int row) {
                  @Override
                  public boolean equals(Object other) {
                      return other instanceof BrokenKey key && id.equals(key.id());
                  }

                  @Override
                  public int hashCode() {
                      return row;
                  }
              }

              record ClaimKey(String id) {}

              public static void main(String[] args) {
                  var broken = new HashSet<BrokenKey>();
                  broken.add(new BrokenKey("CL-18", 1));
                  broken.add(new BrokenKey("CL-18", 2));
                  if (broken.size() != 2) throw new AssertionError("Expected duplicate in bad set");

                  var corrected = new HashSet<ClaimKey>();
                  corrected.add(new ClaimKey("CL-18"));
                  if (corrected.add(new ClaimKey("CL-18"))) {
                      throw new AssertionError("The same claim ID should already be present");
                  }
              }
          }
---

I'd identify the fields that make two claims the same. If equality only looks at the claim ID,
including the export row number in the hash breaks the contract. Equal objects must produce the
same hash code. Unequal objects can share one. A hash set can put equal keys with different
hashes in different buckets and never compare them.

For a claim ID key I'd choose a record with just that component. Java supplies `equals` and
`hashCode` based on the record components unless I provide my own. I'd keep row numbers and
amounts in the export row itself.

### Example

The input has two rows for claim `CL-18`. A deliberately broken hash admits both keys. The
record keyed just by claim ID rejects the second insertion.
