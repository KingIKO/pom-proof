---
title: The receipt log says PAID, but expected == fromReceipt is false. What should the assertion compare?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: Assert that the receipt text equals PAID regardless of where the string came from.
looksFor:
  - Uses String.equals to check the receipt text.
  - Explains why a decoded PAID and a literal PAID can be different objects.
  - Identifies where double equals still fits, such as an integer status or enum constant.
  - Keeps equality and hashing consistent if the receipt status becomes a custom value object.
trap: Trying a string identity check with two literals and taking that pass as proof for parsed strings.
followUps:
  - question: The missing-status case expects null, and the parser can return null too. What would you use for both that case and the PAID case?
    answer: Use Objects.equals with the expected and decoded statuses. Two nulls match, and a non-null expected string compares by content.
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

I'd assert `expected.equals(fromReceipt)`. The log shows the characters I want, and a
freshly decoded `String` can have those characters without being the same object as the
literal. With two object references, `==` only accepts the same object or two nulls.
I'd still use it for an integer status code or to compare enum constants by identity.

With a custom value class I'd define `equals` and `hashCode` together. Equal objects need equal
hashes or a map or set that uses hashing can miss an equal value.

### Example

The expected status is a literal and the result stands in for a separately decoded string.
The two references differ. The content check passes because both strings say `PAID`.
