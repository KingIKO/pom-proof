---
title: "How would you put several items in one parcel in a Cucumber scenario?"
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd use a data table to give the items to one step. I'd use Examples only when I want to repeat the whole scenario."
looksFor:
  - "Tell a table passed to one step apart from rows that repeat the scenario."
  - "Read basket rows in Java using their column names."
  - "Keep all the items and quantities in one run."
  - "Check a result that depends on both items."
trap: "Using two Examples rows when the test needs both items in the same parcel."
followUps:
  - question: "When would you use a scenario outline for parcel weights?"
    answer: "I'd use it to run separate parcels on either side of a cutoff where the price changes."
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

I'd give one step a data table if a parcel needs several items together. In Cucumber-JVM, I can call `asMaps()` to read the first row as column names. I get one map per item row, so Java can look up each value by its column name. The step converts each quantity and adds the items to the parcel.

An Examples table supplies inputs for a scenario outline, a template for repeating the whole case. I'd use it to test one pricing rule with separate parcels. If the mug and book go into separate runs, I'd miss a bug in their combined weight.

### Example

I'd use the Java steps to load two rows into one parcel model. I enter a 275-gram mug and a 500-gram book. With two mugs and one book, I'd expect 1,050 grams before packaging.
