---
title: The empty-book test finds CAD:INV-9 when all tests run. Which TestNG setup method should create the draft list?
topic: java
roles: [automation, sdet]
level: junior
type: tooling
oneLine: I give each test method a fresh draft list. I set the CAD currency once for the class.
looksFor:
  - Keep CAD as class configuration and create a fresh draft list for each method.
  - Explain why `@BeforeTest` would share drafts across methods in the same XML test.
  - Clean up drafts after each method, and tell group hooks apart from broader scopes.
  - Make both invoice tests runnable without depending on each other.
trap: Putting per-method state in `@BeforeTest` because its name sounds like it runs before each assertion method.
followUps:
  - question: The empty-book test now depends on the test that records CAD:INV-9. How will the report mark the empty-book test if recording fails?
    answer: With a hard `dependsOnMethods` dependency, the empty-book test is skipped. I'd give it its own draft list in setup. If two steps really need the same draft, I'd keep those steps in one test.
sources:
  - label: TestNG configuration annotations and dependencies
    url: https://testng.org/#_annotations
  - label: TestNG method dependencies
    url: https://testng.org/#_dependencies_with_annotations
examples:
  - title: Reset invoice drafts for each standalone test
    variants:
      - lang: java
        label: TestNG (Java)
        code: |
          import static org.testng.Assert.assertEquals;
          import static org.testng.Assert.assertTrue;
          import java.util.ArrayList;
          import java.util.List;
          import org.testng.annotations.AfterMethod;
          import org.testng.annotations.BeforeClass;
          import org.testng.annotations.BeforeMethod;
          import org.testng.annotations.Test;

          public class InvoiceDraftTest {
              private String currency;
              private List<String> drafts;

              @BeforeClass
              public void configureCurrency() {
                  currency = "CAD";
              }

              @BeforeMethod
              public void startDrafts() {
                  drafts = new ArrayList<>();
              }

              @AfterMethod(alwaysRun = true)
              public void clearDrafts() {
                  drafts = null;
              }

              @Test
              public void opensAnEmptyDraftBook() {
                  assertTrue(drafts.isEmpty());
              }

              @Test
              public void recordsACanadianDraft() {
                  drafts.add(currency + ":INV-9");
                  assertEquals(drafts, List.of("CAD:INV-9"));
              }
          }
---

A hook is a setup or teardown method that TestNG runs around tests. I'd create the list in `@BeforeMethod`, which runs before each test method. Then the empty-book assertion never sees `CAD:INV-9` from another method. `@AfterMethod(alwaysRun = true)` clears the list, even after a failure or skip.

CAD is different. The whole class uses that setting, so I'd set it in `@BeforeClass`.

If several classes need a common setting, `@BeforeTest` covers the enclosing `<test>` entry in suite XML. `@BeforeSuite` covers the whole suite. Those wider setup hooks run before the class and method hooks. Teardown goes back out in reverse order.

Group hooks run before the first method and after the last method in each group. I'd keep the two draft checks independent. Then either one can run on its own and report its own failure.

### Example

The class sets its invoice currency once, and each method gets a new list of drafts. Both tests work on their own. Neither relies on the other method running first.
