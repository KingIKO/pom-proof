---
title: What error should the test data loader raise if the receipt test can't find missing.txt?
topic: java
roles: [automation, sdet]
level: mid
type: concept
oneLine: I fail the receipt test with the fixture path and the original I/O error still attached.
looksFor:
  - Give the test runner the missing receipt path and the original exception.
  - Close an opened reader even when the read fails.
  - Explain why the loader must catch or declare `IOException`.
  - Treat a bad argument as an unchecked failure, and leave unexpected errors visible.
trap: Giving the test empty data if reading the file fails and letting the test pass without checking what it read.
followUps:
  - question: The test might start before the export finishes, or the receipt path might be wrong. Which step, if any, would you retry?
    answer: I'd wait for the export under its documented completion rule. Once the export is due to be readable, a missing fixture or a permissions error should fail with the path.
sources:
  - label: Java 21 checked and unchecked exceptions
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html
  - label: Java 21 try-with-resources
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.20.3
  - label: Java 21 Files
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html
  - label: Java 21 UncheckedIOException
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/UncheckedIOException.html
examples:
  - title: Include the missing receipt fixture path and cause
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.io.IOException;
          import java.io.UncheckedIOException;
          import java.nio.file.Files;
          import java.nio.file.Path;

          class ReceiptFixtureCheck {
              static String firstLine(Path fixture) {
                  try (var reader = Files.newBufferedReader(fixture)) {
                      return reader.readLine();
                  } catch (IOException cause) {
                      throw new UncheckedIOException("Cannot read receipt fixture: " + fixture, cause);
                  }
              }

              public static void main(String[] args) throws IOException {
                  Path dir = Files.createTempDirectory("receipts-");
                  Path missing = dir.resolve("missing.txt");
                  try {
                      firstLine(missing);
                      throw new AssertionError("Missing fixture should fail the check");
                  } catch (UncheckedIOException error) {
                      if (error.getCause() == null || !error.getMessage().contains(missing.toString())) {
                          throw new AssertionError("Fixture context was lost", error);
                      }
                  } finally {
                      Files.delete(dir);
                  }
              }
          }
---

I'd make the failure report name `missing.txt`. I'd also keep the exception that explains why the read failed.

`IOException` is a checked exception. Java requires the loader to catch or declare it. If the receipt is required, I'd wrap the `IOException` in an `UncheckedIOException` with the path and the original cause. If the caller can recover, I'd consider declaring the checked exception instead.

Try-with-resources is a form of `try` that closes the resources it opens. If the loader opens the file but fails during the read, try-with-resources still closes the reader. A bad argument can throw `IllegalArgumentException`. That exception is unchecked, so it need not be caught or declared. I'd let unexpected exceptions reach the test runner.

### Example

The check reads a missing path inside a fresh temporary directory. It expects a failure that identifies the missing fixture. That failure must still carry the original I/O exception.
