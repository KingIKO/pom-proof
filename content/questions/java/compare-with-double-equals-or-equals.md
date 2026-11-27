---
title: The receipt log shows PAID, but expected == fromReceipt is false. What would you compare in the test?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: I assert that the receipt text equals PAID, no matter where the string came from.
looksFor:
  - Use `String.equals` to check the receipt text.
  - Explain why a decoded PAID and a literal PAID can be different objects.
  - Name where double equals (`==`) still fits, such as an integer status or enum constant.
  - Keep equality and hashing consistent if the receipt status becomes a custom value object.
trap: Trying a string identity check with two literals and taking that pass as proof that parsed strings work too.
followUps:
  - question: The parser can return null, which you expect when the status is missing. How would you compare both that result and PAID?
    answer: I'd use `Objects.equals` with the expected and decoded statuses. Two nulls match. A non-null expected string compares by content.
sources:
  - label: Java 21 equality operators
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.21
  - label: Java 21 String equals
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html
  - label: Java 21 Object equality and hashing
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html
  - label: Java 21 Objects equals
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html
examples:
  - title: Compare a decoded status with a literal
    variants:
      - lang: java
        label: Java 21
        code: |
          class PaymentStatusCheck {
              public static void main(String[] args) {
                  String expected = "PAID";
                  String fromReceipt = new String(new char[] {'P', 'A', 'I', 'D'});

                  if (expected == fromReceipt) {
                      throw new AssertionError("Fixture must contain separate String objects");
                  }
                  if (!expected.equals(fromReceipt)) {
                      throw new AssertionError("Expected PAID but got " + fromReceipt);
                  }
              }
          }
---

I'd assert `expected.equals(fromReceipt)`. The log shows the characters I want. A literal is a string written directly in the code. A freshly decoded `String` can have those characters without being the same object as the literal.

With two object references, `==` only accepts the same object or two nulls. That makes it an identity check. I'd still use it for an integer status code, or to compare enum constants by identity.

With a custom value class, I'd define `equals` and `hashCode` together. Equal objects need equal hashes. Otherwise a map or set that uses hashing can miss an equal value.

### Example

The expected status is a literal. The result stands in for a separately decoded string. The two references differ. The content check passes because both strings say `PAID`.
