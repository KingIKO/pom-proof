---
title: Your checkout tests run with several sets of data. What would you check before moving them from TestNG to JUnit 5?
topic: java
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Before I judge whether a migration pays off, I map suite selection, groups, data inputs, and parallel settings.
looksFor:
  - Map TestNG XML suite selection to JUnit Platform suite selectors.
  - Map TestNG groups to JUnit Jupiter tags.
  - Use `@ParameterizedTest` and `@MethodSource` as a counterpart to `@DataProvider`.
  - Compare parallel settings explicitly instead of assuming they carry over unchanged.
trap: Porting only the test annotations and assuming the runner still uses the same test selection and scheduling rules.
followUps:
  - question: What would you compare if you moved a small set of tests first?
    answer: I'd compare the selected test names and data rows. I'd check that the same failures are reported. When parallel execution is enabled, I'd watch for shared state.
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

First I'd list what the suite uses. In TestNG, the suite XML file can select classes and groups. The JUnit Platform is the base that runs JUnit 5 tests. It has suite selectors and filters for that job. Jupiter, the JUnit 5 way of writing tests, uses tags for group-style selection.

Data-driven methods run once for each row of input data. For those methods, `@ParameterizedTest` with `@MethodSource` covers the usual `@DataProvider` pattern.

I'd translate the parallel settings on purpose. TestNG can run tests in parallel by methods, classes, instances, or XML tests. Jupiter's parallel execution is opt-in, so it stays off until I turn it on. It has execution modes for classes and methods.

If the existing suite relies on TestNG's XML scheduling or dependencies and there's no clear reason to move, I'd keep TestNG.

### Example

Pickup is free. Courier delivery costs 499 cents below a 5,000-cent subtotal. The JUnit method source supplies pickup and courier cases. They include cases on either side of the free-delivery cutoff. Each row runs under the `checkout` tag.
