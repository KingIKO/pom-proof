---
title: In a shipment test helper, what would you make static so it belongs to the class?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: I share constants and stateless methods. I give each test its own mutable fixtures and browser session.
looksFor:
  - Explain that `static` members belong to the class.
  - Pick a constant and a stateless helper as suitable examples.
  - Trace the risk when parallel tests share a driver or a mutable fixture.
  - Give mutable test state an owner for each test, with explicit cleanup.
trap: Making the driver `static` for convenience and letting one test close the session while another is using it.
followUps:
  - question: Does a `static final` list become a safe shared fixture?
    answer: The field can't be reassigned, but a mutable list can still change. If the tests only read it, I'd use an unmodifiable list with immutable elements.
sources:
  - label: Java 21 static fields and class methods
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html
  - label: Java 21 final variables
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4
  - label: Java 21 unmodifiable lists
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html
  - label: Selenium guidance for avoiding shared state
    url: https://www.selenium.dev/documentation/test_practices/encouraged/avoid_sharing_state/
examples:
  - title: Share a shipment fixture constructor without sharing fixtures
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.ArrayList;
          import java.util.List;

          class ShipmentFixtureCheck {
              private static final String DEFAULT_SKU = "BOX-1";

              static List<String> newShipment() {
                  return new ArrayList<>(List.of(DEFAULT_SKU));
              }

              public static void main(String[] args) {
                  var shipmentA = newShipment();
                  var shipmentB = newShipment();
                  shipmentA.add("BOX-2");
                  if (!shipmentB.equals(List.of("BOX-1"))) {
                      throw new AssertionError("Shipment B inherited A's change");
                  }
              }
          }
---

A `static` field belongs to the class, so all instances see the same field. I'd make a fixed default SKU, or product code, a static constant.

A fixture factory is a method that builds new test data. If the method needs no per-instance state, meaning data stored on one object, I'd make it static. A static factory can still give every caller its own list.

A `WebDriver` session is the browser connection that Selenium controls. I'd keep it with the test that owns it and close it in that test's teardown. If parallel tests share one static driver, one test can change the page under the other test. It can also close the other test's session. The same problem applies to shared maps and lists that tests edit.

### Example

Both shipments start with a default box. Adding a second box to the first shipment leaves the second shipment's list unchanged.
