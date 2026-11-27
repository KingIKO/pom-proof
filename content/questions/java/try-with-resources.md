---
title: If a test fails halfway through comparing invoice exports, how would you close both input streams?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: I declare both `AutoCloseable` resources in the try header. Then I check the suppressed exceptions for cleanup failures.
looksFor:
  - Open the resources in the try header and close them in reverse order.
  - Explain what happens when a later resource fails to initialize.
  - Keep the comparison failure when a close call also throws.
  - Use `getSuppressed` to find secondary failures, such as a failed close.
trap: Closing resources one at a time in `finally` and letting the first failed close skip the other close.
followUps:
  - question: If the second stream fails to open, what happens to the first?
    answer: If the first stream opened successfully, I'd expect Java to close it. If that close fails, I'd find its error as a suppressed exception, attached to the error from opening the second stream.
sources:
  - label: Java 21 try-with-resources and suppression
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.20.3
  - label: Java 21 Throwable getSuppressed
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html
examples:
  - title: Keep an invoice mismatch as the primary failure
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.io.IOException;
          import java.util.ArrayList;
          import java.util.List;

          class InvoiceCloseCheck {
              record Source(String row, List<String> closed, boolean failClose)
                  implements AutoCloseable {
                  public void close() throws IOException {
                      closed.add(row);
                      if (failClose) throw new IOException("Could not close export");
                  }
              }

              public static void main(String[] args) {
                  List<String> closed = new ArrayList<>();
                  try (var expected = new Source("INV-7", closed, false);
                       var export = new Source("INV-9", closed, true)) {
                      if (!expected.row().equals(export.row())) {
                          throw new IllegalStateException("Invoice ID mismatch");
                      }
                  } catch (IllegalStateException mismatch) {
                      if (!closed.equals(List.of("INV-9", "INV-7"))
                          || mismatch.getSuppressed().length != 1
                          || !(mismatch.getSuppressed()[0] instanceof IOException)) {
                          throw new AssertionError("Incorrect cleanup or suppression", mismatch);
                      }
                      return;
                  } catch (IOException unexpected) {
                      throw new AssertionError("The mismatch should be primary", unexpected);
                  }
                  throw new AssertionError("Expected an invoice mismatch");
              }
          }
---

I'd open both streams in the try header, the parentheses right after `try`. This form is called try-with-resources. Each stream is an `AutoCloseable` resource, an object with a `close()` method that Java calls for me.

Java closes each resource that initialized successfully and isn't null. It closes them in reverse order, even if the comparison throws. If the second stream fails to open, Java still closes the first one. If closing one stream fails, Java still tries to close the other.

Sometimes the comparison and a close call both fail. Then the comparison exception stays primary, which means the try statement throws it. Java adds the close failure to that exception's suppressed list. That list holds extra exceptions attached to the main one. When I diagnose a failure, I look at `getSuppressed()` to see the cleanup problem next to the original mismatch.

### Example

Two fixture streams return different invoice IDs. The export's close call also fails. The check expects both close attempts, with the export closed first. It finds the close error on the suppressed list of the invoice mismatch.
