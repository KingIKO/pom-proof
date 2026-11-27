---
title: The test shop starts with Blue mug and Red mug. If the grid check fails, what should it report?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: I'd report whether the mug grid returned the wrong number of titles, or returned two titles that matched each other.
looksFor:
  - Make a missing title fail the count check for the two-row fixture.
  - Keep both observed titles in a list for the failure message.
  - Use the size of a set to tell two matching titles apart from two distinct ones.
  - Explain how a map can show the title for each SKU or count repeated labels.
trap: Passing the grid check because an empty list and an empty set both contain zero items.
followUps:
  - question: Both mugs now show Ceramic mug on the label and still have different product codes. Which field would you check for duplicates?
    answer: I'd check for duplicate SKUs. A map of expected titles by SKU can still check each label, and it doesn't require the labels to differ.
sources:
  - label: Java 21 List
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html
  - label: Java 21 Set
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Set.html
  - label: Java 21 Stream toList
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html
  - label: Java 21 Map
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html
  - label: Selenium WebDriver element lookups
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/WebDriver.html
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Check title uniqueness on a two-row product grid
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.util.HashSet;
          import java.util.List;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.WebElement;
          import org.openqa.selenium.chrome.ChromeDriver;

          class ProductGridTest {
              @Test
              void showsTwoDistinctTitles() {
                  WebDriver driver = new ChromeDriver();
                  try {
                      String html = "<h2 class='title'>Blue mug</h2><h2 class='title'>Red mug</h2>";
                      driver.get("data:text/html," + html);
                      List<String> titles = driver.findElements(By.cssSelector(".title"))
                          .stream().map(WebElement::getText).toList();

                      assertEquals(2, titles.size(), "Missing or extra product rows");
                      assertEquals(titles.size(), new HashSet<>(titles).size(), titles.toString());
                  } finally {
                      driver.quit();
                  }
              }
          }
---

If the grid reports `Blue mug` twice, I want the failure to show both readings. I'd keep them in a `List`, which keeps items in order and allows repeats. I'd compare its size with a `Set` built from those readings. A set keeps only distinct values. Two rows but only one distinct title tells me what went wrong.

I'd assert the count of two first. If the page finds no matching title elements, Selenium's `findElements` returns an empty list. Comparing sizes alone would then give me zero on both sides.

If the failure needs counts for each repeated label, I'd use a `Map`, which stores values by key. I can also keep expected titles in a map keyed by SKU, the product code.

### Example

Chrome opens a fixture grid with two mugs. The test expects two rows and two distinct titles. Removing both rows fails the count check. Repeating either title fails the uniqueness check.
