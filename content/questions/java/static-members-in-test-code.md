---
title: Which parts of a shipment test helper would you make static?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: Share constants and stateless methods, and give each test its own mutable fixtures and browser session.
looksFor:
  - Explains that static members belong to the class.
  - Picks a constant and a stateless helper as appropriate examples.
  - Traces the risk of parallel tests sharing a driver or a mutable fixture.
  - Gives mutable test state a per-test owner with explicit cleanup.
trap: Making the driver static for convenience and letting one test close the session while another is using it.
followUps:
  - question: Does a static final list become a safe shared fixture?
    answer: The field can't be reassigned, but a mutable list can still change. Use an unmodifiable list with immutable elements if the tests only read it.
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

A `static` field belongs to the class, so instances see the same field. I'd make a fixed
default SKU a static constant and make a fixture factory static if the method needs no
per-instance state. A factory can still give every caller its own list.

I'd keep a `WebDriver` session with the test that owns it and close it in that test's
teardown. If parallel tests share one static driver, one test can change the page under
the other or close its session. The same problem applies to shared maps and lists that
tests edit.

### Example

Both shipments start with a default box. Adding a second box to the first shipment
leaves the second shipment's list unchanged.
