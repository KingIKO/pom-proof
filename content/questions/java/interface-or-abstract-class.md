---
title: Where would you put the browser contract and shared setup for a returns page object?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: Use an interface for browser capabilities and a small abstract class if page types need shared instance state and setup.
looksFor:
  - Distinguishes a capability interface from a shared base implementation.
  - Explains multiple interfaces and single class inheritance.
  - Compares a default method with a constructor and per-instance fields.
  - Considers composition when pages only share a helper.
trap: Putting a driver in an interface field and assuming every page instance gets its own copy.
followUps:
  - question: When could a default interface method help here?
    answer: It can implement an operation using other interface methods, such as checking a title through readHeading. It can't initialize a per-instance driver field.
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

I'd use an interface for the browser operations the page needs. That lets me swap in a small
test double. A class can implement several interfaces for distinct capabilities, but it only has
one direct superclass. I'd spend that choice on a base page only if pages have common state
and setup worth sharing.

Default interface methods can share behavior, but interfaces don't have per-instance fields or
constructors. An abstract page can receive the browser in its constructor, keep the reference,
and provide a shared lookup method. If pages only share a utility, I'd pass in that utility
instead of building a class hierarchy.

### Example

The returns page inherits lookups and implements a contract for pages with headings. A browser
double gives it the text `Start a return`, which the check reads through that contract.
