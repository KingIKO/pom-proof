---
title: How would you report store titles that match after you ignore case and spaces at either end?
topic: java
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I normalize the collected strings and count equal titles with `groupingBy`. Then I keep the counts greater than one.
looksFor:
  - Apply the product's normalization rule before grouping.
  - Use `map` followed by `groupingBy` and `counting`.
  - Return the duplicate titles with their counts for diagnosis.
  - Know when a loop gives clearer diagnostics than a longer pipeline.
trap: Starting a stream from live browser calls and adding side effects inside `map` to gather diagnostic state.
followUps:
  - question: When does `map` run in this example?
    answer: I use `map` as an intermediate operation, which sets up a step without processing the input yet. I start the work when I call the terminal operation `collect`, the final step in this stream.
sources:
  - label: Java 21 stream pipelines
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html
  - label: Java 21 grouping and counting collectors
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Collectors.html
  - label: Java 21 String normalization methods
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html
examples:
  - title: Count repeated titles after trimming and case normalization
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.List;
          import java.util.Locale;
          import java.util.Map;
          import java.util.function.Function;
          import java.util.stream.Collectors;

          class StoreTitleCheck {
              static Map<String, Long> duplicates(List<String> titles) {
                  var counts = titles.stream()
                      .map(title -> title.strip().toLowerCase(Locale.ROOT))
                      .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
                  return counts.entrySet().stream()
                      .filter(entry -> entry.getValue() > 1)
                      .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
              }

              public static void main(String[] args) {
                  var repeats = duplicates(List.of(" Mug ", "Apron", "MUG"));
                  if (!repeats.equals(Map.of("mug", 2L))) {
                      throw new AssertionError("Unexpected duplicates: " + repeats);
                  }
              }
          }
---

A stream is a Java pipeline of steps over a collection of values. I'd collect the page texts before I start the stream. That keeps browser operations separate from the data check.

If the store ignores surrounding spaces and case, I'd map each title to its normalized form. That form has no surrounding spaces and uses one letter case. For this fixture, I'd use a locale-neutral lowercase conversion, one that doesn't depend on a language setting.

Then I'd group by that title with `groupingBy` and `counting`. `groupingBy` sorts values into groups by a key, and `counting` counts each group. I'd report the entries whose counts exceed one.

A loop that increments counts in a map is also fine. If I need to show original spellings and row numbers for each duplicate, I'd use whichever version makes that evidence easier to follow.

### Example

The fixture contains two spellings of `mug` and one `apron`. The result reports only `mug`, with a count of two.
