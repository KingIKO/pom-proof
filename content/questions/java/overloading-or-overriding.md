---
title: An outlet client looks up SKU P-5 and barcode 42. Where would you put each lookup rule?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: Keep the barcode lookup in the base client and override the SKU lookup in the outlet client.
looksFor:
  - Explains why P-5 reaches the outlet override through a Client reference.
  - Uses the numeric argument 42 to identify the barcode overload at compile time.
  - Rejects a second lookup(String) even if it would return a stock record instead of text.
  - Identifies the barcode behavior the outlet inherits unchanged.
trap: Expecting a runtime argument type to select a different overload than the compiler chose.
followUps:
  - question: If both clients declare the SKU lookup static and you call it through a Client reference to an OutletClient, which implementation gets P-5?
    answer: Client's implementation. The outlet's static method hides the base method, and the reference's compile-time type selects Client.
sources:
  - label: Java 21 method signatures
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.2
  - label: Java 21 overriding, hiding, and overloading
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.8
examples:
  - title: Dispatch a SKU lookup through the test client
    variants:
      - lang: java
        label: Java 21
        code: |
          class WarehouseLookupCheck {
              static class Client {
                  String lookup(int barcode) {
                      return "barcode:" + barcode;
                  }

                  String lookup(String sku) {
                      return "default:" + sku;
                  }
              }

              static class OutletClient extends Client {
                  @Override
                  String lookup(String sku) {
                      return "outlet:" + sku;
                  }
              }

              public static void main(String[] args) {
                  Client client = new OutletClient();
                  if (!client.lookup("P-5").equals("outlet:P-5")) {
                      throw new AssertionError("SKU did not use the outlet lookup");
                  }
                  if (!client.lookup(42).equals("barcode:42")) {
                      throw new AssertionError("Barcode did not use the inherited lookup");
                  }
              }
          }
---

I'd put the outlet's SKU rule in an override of `lookup(String)`. When the test sends `P-5`,
Java runs that override because the object is an `OutletClient`, even though the reference
is declared as `Client`. The barcode rule can stay in the base class.

Java picks the `int` overload for `42` and the `String` overload for `"P-5"` at compile time,
using the argument types. If we also need a lookup that returns a stock record for a SKU,
I'd give it a different name. The return type isn't part of the signature, so just changing
the result would leave two declarations of `lookup(String)`.

### Example

A fixture uses an outlet client through a base client reference. A SKU gets the outlet
prefix, while the number 42 selects the inherited barcode overload.
