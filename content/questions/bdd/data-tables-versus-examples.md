---
title: How would you pass several parcel items into one Cucumber scenario?
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Give one step a data table for the parcel contents, and use Examples only to repeat the whole case.
looksFor:
  - Distinguishes a step argument from rows that rerun a scenario outline.
  - Uses headers to read basket rows as maps in Java.
  - Keeps the item quantities together in one scenario.
  - Asserts an outcome that depends on both items.
trap: Using two Examples rows when the rule depends on both items being in the same parcel.
followUps:
  - question: When would you use an outline for parcel weights?
    answer: Use it for independent parcels on either side of a shipping price cutoff.
sources:
  - label: Cucumber, data tables and scenario outlines
    url: https://cucumber.io/docs/gherkin/reference/
  - label: Cucumber-JVM, DataTable asMaps
    url: https://github.com/cucumber/cucumber-jvm/blob/v7.20.1/datatable/src/main/java/io/cucumber/datatable/DataTable.java
  - label: Cucumber Expressions parameter types
    url: https://cucumber.io/docs/cucumber/cucumber-expressions/
  - label: JUnit 5 Assertions
    url: https://docs.junit.org/5.14.5/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
examples:
  - title: Two different items in the same basket
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Parcel packing weight
            Scenario: The weight includes all items packed together
              Given a parcel with these items
                | item | quantity |
                | mug  | 2        |
                | book | 1        |
              When the packer weighs the items
              Then the items weigh 1050 grams
  - title: Convert the table to parcel lines
    variants:
      - lang: java
        label: Cucumber-JVM (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import io.cucumber.datatable.DataTable;
          import io.cucumber.java.en.Given;
          import io.cucumber.java.en.Then;
          import io.cucumber.java.en.When;
          import java.util.List;
          import java.util.Map;

          public class ParcelSteps {
            private final Parcel parcel = new Parcel();
            private int weighedGrams;

            @Given("a parcel with these items")
            public void pack(DataTable table) {
              List<Map<String, String>> rows = table.asMaps();
              for (var row : rows) {
                parcel.add(row.get("item"), Integer.parseInt(row.get("quantity")));
              }
            }

            @When("the packer weighs the items")
            public void weigh() {
              weighedGrams = parcel.itemGrams();
            }

            @Then("the items weigh {int} grams")
            public void checkWeight(int expectedGrams) {
              assertEquals(expectedGrams, weighedGrams);
            }
          }

          final class Parcel {
            private static final Map<String, Integer> GRAMS = Map.of("mug", 275, "book", 500);
            private int itemGrams;

            void add(String item, int quantity) {
              itemGrams += GRAMS.get(item) * quantity;
            }

            int itemGrams() {
              return itemGrams;
            }
          }
---

A data table is an argument to one step. I'd use it when a parcel needs several different
items at the same time. In Cucumber-JVM, `asMaps()` reads the first row as headers and
gives me a map for each item row. The step converts the quantity and passes each line to
the parcel.

If I used Examples rows instead, each row would run the whole outline separately. That's
useful when I want distinct parcels to exercise one pricing rule. It would miss a bug in
the combined weight if I put the mug in one run and the book in another.

### Example

The Java steps use a small parcel model with a 275-gram mug and a 500-gram book. The two
rows load one parcel. Two mugs plus a book should weigh 1,050 grams before packaging.
