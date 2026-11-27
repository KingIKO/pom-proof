---
title: Where would you put the rules the outlet client uses to find product code P-5 and barcode 42?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: I keep the barcode lookup in the base client. I override the SKU lookup in the outlet client.
looksFor:
  - Explain why P-5 reaches the outlet override through a `Client` reference.
  - Use the numeric argument 42 to identify the barcode overload at compile time.
  - Reject a second `lookup(String)`, even if it would return a stock record instead of text.
  - Name the barcode behavior that the outlet inherits unchanged.
trap: Expecting the runtime type of an argument to select a different overload than the one the compiler chose.
followUps:
  - question: If both clients declare the SKU lookup static and you call it through a `Client` reference to an `OutletClient`, which implementation gets P-5?
    answer: I'd expect the `Client` implementation. The outlet's static method hides the base method. The compile-time type of the reference selects the method, and that type is `Client`.
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

Overriding means a subclass replaces an inherited method with its own version. I'd put the outlet's SKU rule in an override of `lookup(String)`. When the test sends `P-5`, Java runs that override because the object is an `OutletClient`. That holds even though the reference is declared as `Client`. The barcode rule can stay in the base class.

Overloading means a class has methods with the same name and different parameter lists. Those lists can differ in the number or types of parameters. Java chooses an overload when it compiles the call, using the number and types of arguments. It picks the `int` overload for `42` and the `String` overload for `"P-5"`.

If we also need a lookup that returns a stock record for a SKU, I'd give it a different name. The signature is the method name plus its parameter types. The return type isn't part of the signature. So just changing the result would leave two declarations of `lookup(String)`.

### Example

A fixture uses an outlet client through a base client reference. A SKU gets the outlet prefix. The number 42 selects the inherited barcode overload.
