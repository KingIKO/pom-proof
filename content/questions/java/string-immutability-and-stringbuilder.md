---
title: How would you build an order mismatch report without changing its shared heading?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: Keep the heading as a shared String and append the report rows to a local StringBuilder.
looksFor:
  - Explains that a String value cannot change after creation.
  - Connects immutability with interning, sharing, and cacheable hashes.
  - Uses StringBuilder for repeated appends in a loop.
  - Distinguishes StringBuilder from synchronized StringBuffer operations.
trap: Sharing one StringBuilder across parallel tests because the String values passed to it are immutable.
followUps:
  - question: Is StringBuffer enough to keep a whole report together across threads?
    answer: It synchronizes its operations. Multiple calls can still interleave, so I'd build each report separately.
sources:
  - label: Java 21 String immutability and interning
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html
  - label: OpenJDK 21 String hash implementation
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/lang/String.java
  - label: Java 21 StringBuilder
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html
  - label: Java 21 StringBuffer
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuffer.html
examples:
  - title: Report both order IDs with missing receipts
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.List;

          class ReceiptReportCheck {
              private static final String HEADING = "Missing receipts";

              static String report(List<String> ids) {
                  var text = new StringBuilder(HEADING);
                  for (String id : ids) {
                      text.append('\n').append(id);
                  }
                  return text.toString();
              }

              public static void main(String[] args) {
                  if (!report(List.of("O-17", "O-19")).equals("Missing receipts\nO-17\nO-19")) {
                      throw new AssertionError("Report is missing an order");
                  }
                  if (!report(List.of()).equals("Missing receipts")) {
                      throw new AssertionError("Report carried over earlier orders");
                  }
              }
          }
---

A Java `String` never changes its characters after creation. That lets threads share the same
heading without a thread being able to edit its value. Interned strings can share an instance,
and a hash derived from the characters can be cached. OpenJDK 21 does that internally.

For a report with a row per mismatch, I'd use a `StringBuilder` local to the call and append
each row in a loop. The builder is mutable and produces the finished string with `toString`.
`StringBuffer` synchronizes its operations. I don't need that overhead for a builder that only
one thread uses.

### Example

One report lists two missing order IDs under the shared heading. A second report with no
missing IDs returns only the heading, with no rows carried over.
