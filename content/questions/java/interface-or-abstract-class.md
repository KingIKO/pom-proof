---
title: Where would you put the browser contract and shared setup for a returns page object?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: I use an interface for browser capabilities. If page types need shared instance state and setup, I add a small abstract class.
looksFor:
  - Tell a capability interface apart from a shared base implementation.
  - Explain that a class can implement many interfaces but inherit from only one class.
  - Compare a default method with a constructor and per-instance fields.
  - Consider composition, passing in a helper object, when pages only share a helper.
trap: Storing the browser driver in an interface field and expecting each page object to get a separate copy.
followUps:
  - question: When could a default interface method help the returns page?
    answer: I'd use a default method, one the interface already provides, to check a title through `readHeading`. I couldn't use it to set up the driver field on each page object.
sources:
  - label: Java 21 superclasses and superinterfaces
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.4
  - label: Java 21 interface fields and methods
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.3
examples:
  - title: Read a returns page with an in-memory browser fixture
    variants:
      - lang: java
        label: Java 21
        code: |
          class ReturnsPageCheck {
              interface Browser {
                  String readText(String testId);
              }

              interface Headed {
                  String heading();
              }

              abstract static class Page {
                  private final Browser browser;

                  Page(Browser browser) {
                      this.browser = browser;
                  }

                  protected String text(String id) {
                      return browser.readText(id);
                  }
              }

              static class ReturnsPage extends Page implements Headed {
                  ReturnsPage(Browser browser) {
                      super(browser);
                  }

                  public String heading() {
                      return text("returns-title");
                  }
              }

              public static void main(String[] args) {
                  Browser fixture = id -> id.equals("returns-title") ? "Start a return" : "";
                  Headed page = new ReturnsPage(fixture);
                  if (!page.heading().equals("Start a return")) {
                      throw new AssertionError("Returns heading missing");
                  }
              }
          }
---

A page object is a class that represents a page in a test. I'd use an interface for its browser contract, which says what browser actions a class must provide. An interface is a Java type that lists those methods. That lets me swap in a small test double, a stand-in for the real browser.

A class can implement several interfaces for distinct capabilities. But it only has one direct superclass, the class it extends. I'd spend that one choice on a base page only if pages have common state and setup worth sharing.

Default interface methods can share behavior. But interfaces don't have per-instance fields or constructors. An abstract class is a base class that can't be created on its own. An abstract page can receive the browser in its constructor and keep the reference. It can also provide a shared lookup method.

If pages only share a utility, I'd pass in that utility instead of building a class hierarchy.

### Example

The returns page inherits lookups and implements a contract for pages with headings. A browser double gives it the text `Start a return`. The check reads that text through the contract.
