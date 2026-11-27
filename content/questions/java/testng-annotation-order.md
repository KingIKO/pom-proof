---
title: The empty-book test finds CAD:INV-9 in a full run. Which TestNG hook should own the draft list?
topic: java
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Give each test method a fresh draft list and set the CAD currency once for the class.
looksFor:
  - Keeps CAD as class configuration and creates a fresh draft list for each method.
  - Explains why BeforeTest would share drafts across methods in the same XML test.
  - Places draft cleanup after each method and distinguishes group hooks from broader scopes.
  - Makes both invoice tests runnable without depending on each other.
trap: Putting per-method state in BeforeTest because its name sounds like it runs before each assertion method.
followUps:
  - question: Someone makes the empty-book test depend on recording CAD:INV-9. What will the report show if recording the draft fails?
    answer: With a hard dependsOnMethods dependency, the empty-book test is skipped. Give it its own draft list in setup. If two steps really need the same draft, keep those steps in one test.
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

I'd create the list in `@BeforeMethod` so the empty-book assertion never sees `CAD:INV-9`
from another method. `@AfterMethod(alwaysRun = true)` clears it even after a failure or skip.
CAD is different: the whole class uses that setting, so I'd set it in `@BeforeClass`.

If several classes need a common setting, `@BeforeTest` covers the enclosing `<test>` entry
in suite XML; `@BeforeSuite` covers the whole suite. Those wider setup hooks run before the
class and method hooks, and teardown goes back out in reverse. Group hooks bracket the first
and last methods in each group. I'd keep the two draft checks independent so either can run
on its own and report its own failure.

### Example

The class sets its invoice currency once and each method gets a new list of drafts.
Both tests work on their own; neither relies on the other method running first.
