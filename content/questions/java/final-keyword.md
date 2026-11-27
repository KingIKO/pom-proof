---
title: What does final protect when a Java refund test hands its fixture to a helper?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: A final variable gets one assignment, a final method cannot be overridden, and a final class cannot be extended.
looksFor:
  - Applies final correctly to variables, methods, and classes.
  - Distinguishes a fixed reference from an immutable object.
  - Shows mutation through a final collection reference.
  - Explains how an unmodifiable copy can protect a test's expected data.
trap: Passing a final mutable list to a helper and assuming the helper cannot change it.
followUps:
  - question: Does List.copyOf make the objects inside an immutable snapshot too?
    answer: No. It makes the list unmodifiable. Mutable elements can still change, so I'd copy those separately if needed.
sources:
  - label: Java 21 final variables
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4
  - label: Java 21 final classes and methods
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html
  - label: Java 21 List.copyOf
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html
examples:
  - title: Keep expected refund codes separate from mutable test data
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.ArrayList;
          import java.util.List;

          class RefundCodesCheck {
              static void addWrongItemCode(List<String> codes) {
                  codes.add("WRONG_ITEM");
              }

              public static void main(String[] args) {
                  final List<String> codes = new ArrayList<>(List.of("DAMAGED"));
                  final List<String> expected = List.copyOf(codes);

                  addWrongItemCode(codes);

                  if (!codes.equals(List.of("DAMAGED", "WRONG_ITEM"))
                      || !expected.equals(List.of("DAMAGED"))) {
                      throw new AssertionError("Expected codes were not kept as a snapshot");
                  }
              }
          }
---

For a variable, `final` prevents a second assignment. If I declare a list reference final,
I can't point it at another list. The list can still change if it's mutable. For methods,
`final` prevents overriding an instance method. A final class can't have subclasses.

In a refund test I'd use `final` to express that a binding stays put, then separately
choose whether the data should be editable. For expected codes that are strings, I'd use
`List.copyOf` to keep a separate, unmodifiable snapshot.

### Example

The fixture starts with `DAMAGED`. The test passes its final list reference to a helper,
which appends `WRONG_ITEM`. The saved expectation still contains only `DAMAGED`.
