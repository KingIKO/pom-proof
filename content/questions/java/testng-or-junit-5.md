---
title: What would you check before moving a data-driven checkout suite from TestNG to JUnit 5?
topic: java
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Map suite selection, groups, data inputs, and parallel settings before judging whether a migration pays off.
looksFor:
  - Maps TestNG XML suite selection to JUnit Platform suite selectors.
  - Maps TestNG groups to JUnit Jupiter tags.
  - Uses ParameterizedTest and MethodSource as a counterpart to DataProvider.
  - Compares parallel configuration explicitly instead of assuming it transfers unchanged.
trap: Porting only the test annotations and assuming the runner still selects the same tests and scheduling rules.
followUps:
  - question: What would you compare in a pilot migration?
    answer: I'd compare selected test names and data rows, verify the same failures are reported, and watch for shared state when parallel execution is enabled.
sources:
  - label: TestNG suites, groups, data providers, and parallel execution
    url: https://testng.org/
  - label: JUnit 5 Platform suite engine
    url: https://docs.junit.org/5.14.5/advanced-topics/junit-platform-suite-engine.html
  - label: JUnit 5 Jupiter annotations and tags
    url: https://docs.junit.org/5.14.5/writing-tests/annotations.html
  - label: JUnit 5 parameterized tests and MethodSource
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
  - label: JUnit 5 Jupiter parallel execution
    url: https://docs.junit.org/5.14.5/writing-tests/parallel-execution.html
examples:
  - title: Run the checkout fee method for each delivery option
    variants:
      - lang: java
        label: JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.util.stream.Stream;
          import org.junit.jupiter.api.Tag;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.Arguments;
          import org.junit.jupiter.params.provider.MethodSource;

          @Tag("checkout")
          class DeliveryFeeTest {
              record Order(boolean pickup, int subtotalCents) {
                  int deliveryFee() {
                      return pickup || subtotalCents >= 5000 ? 0 : 499;
                  }
              }

              @ParameterizedTest
              @MethodSource("orders")
              void chargesTheExpectedFee(Order order, int expectedCents) {
                  assertEquals(expectedCents, order.deliveryFee());
              }

              static Stream<Arguments> orders() {
                  return Stream.of(
                      Arguments.of(new Order(true, 1200), 0),
                      Arguments.of(new Order(false, 1200), 499),
                      Arguments.of(new Order(false, 4999), 499),
                      Arguments.of(new Order(false, 5000), 0));
              }
          }
---

I'd inventory what the suite uses. TestNG's XML can select classes and groups. The JUnit
Platform has suite selectors and filters, and Jupiter tags cover group-style selection.
For data-driven methods, `@ParameterizedTest` with `@MethodSource` covers the usual
`@DataProvider` pattern.

I'd translate parallel settings deliberately. TestNG can parallelize by methods, classes,
instances, or XML tests. Jupiter has opt-in parallel execution with execution modes for
classes and methods. I'd keep TestNG if the existing suite relies on its XML scheduling or
dependencies and there's no clear reason to move.

### Example

Pickup is free, and courier delivery costs 499 cents below a 5,000-cent subtotal. The JUnit
method source supplies pickup and courier cases, including either side of the free-delivery
cutoff. Each row runs under the `checkout` tag.
