---
title: How would you write a report on differences between orders and leave the shared heading unchanged?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: I keep the heading as a shared `String`. I append the report rows to a local `StringBuilder`.
looksFor:
  - Explain that a `String` value cannot change after it is created.
  - Connect immutability with interning, sharing, and hashes that can be cached.
  - Use `StringBuilder` for repeated appends in a loop.
  - Tell `StringBuilder` apart from the synchronized operations of `StringBuffer`.
trap: Sharing one `StringBuilder` across parallel tests because the `String` values passed to it are immutable.
followUps:
  - question: Is `StringBuffer` enough to keep a whole report together across threads?
    answer: I can use it to run one operation at a time on the same buffer. Calls from different threads can still alternate. I'd build each report separately.
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

A Java `String` never changes its characters after creation. This is called immutability. Because of it, threads can share the same heading, and no thread can edit its value.

Interned strings can share one instance. Interning means Java keeps one shared copy of a string value in a pool. A hash worked out from the characters can also be cached. OpenJDK 21 does that internally.

For a report with a row per mismatch, I'd use a `StringBuilder` that is local to the call. I'd append each row in a loop. The builder is mutable, which means its contents can change. It produces the finished string with `toString`.

`StringBuffer` synchronizes its operations, so only one thread at a time can run them on the same buffer. I don't need that overhead for a builder that only one thread uses.

### Example

One report lists two missing order IDs under the shared heading. A second report has no missing IDs. It returns only the heading, with no rows carried over.
