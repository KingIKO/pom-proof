---
title: How would you close both invoice streams when an export comparison fails halfway through?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: Declare both AutoCloseable resources in the try header and inspect suppressed exceptions for cleanup failures.
looksFor:
  - Opens resources in the try header and closes them in reverse order.
  - Explains what happens when a later resource fails to initialize.
  - Preserves the comparison failure when a close call throws as well.
  - Uses getSuppressed to diagnose secondary failures.
trap: Closing resources one by one in finally and letting the first close failure skip the other close.
followUps:
  - question: If the second stream fails to open, what happens to the first?
    answer: The first stream is closed if it initialized successfully. A failure closing it is suppressed on the opening failure.
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

I'd open both streams in the try header. Java closes successfully initialized non-null
resources in reverse order, even if the comparison throws. If the second stream fails to
open, Java still closes the first one. If closing one stream fails, Java still attempts
to close the other.

When the comparison and a close call both fail, the comparison exception remains primary.
Java puts the close failure on its suppressed list. I'd look at `getSuppressed()` when
diagnosing a failure so I can see the cleanup problem alongside the original mismatch.

### Example

Two fixture streams return different invoice IDs. The export's close call also fails.
The check expects both close attempts, export first, and finds the close error on the
invoice mismatch's suppressed list.
