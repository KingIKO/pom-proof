---
title: Packing slip P218 loses its heading in windowless CI. What would you compare with a headed run?
topic: framework-design
roles: [automation, sdet]
level: junior
type: concept
oneLine: Compare equivalent browser setups and capture the headless run's actual viewport, rendering, and failure evidence.
looksFor:
  - Explains what headless execution removes.
  - Checks browser builds, viewport, fonts, and media settings.
  - Keeps artifacts from the failing run.
  - Tests one suspected difference at a time.
trap: Changing the CI test to headed mode without finding which setting exposed the problem.
followUps:
  - question: P218 passes locally, but CI captured it at a narrower viewport. Which run would you do next?
    answer: I'd rerun the same build locally with the CI viewport and fonts, then compare headed and headless captures. I'd keep headless as the normal CI mode while I isolate the difference.
sources:
  - label: Playwright browsers and Chromium headless modes
    url: https://playwright.dev/docs/browsers
  - label: Playwright Test screenshots on failure
    url: https://playwright.dev/docs/test-use-options
  - label: Playwright Python browser and artifact options
    url: https://playwright.dev/python/docs/test-runners
  - label: Selenium Chrome options
    url: https://www.selenium.dev/documentation/webdriver/browsers/chrome/
  - label: Selenium screenshots
    url: https://www.selenium.dev/documentation/webdriver/interactions/windows/#takescreenshot
  - label: Java Files and unique directories
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html
examples:
  - title: Preserve the failing packing slip preview
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test.use({
            channel: 'chromium',
            viewport: { width: 1100, height: 800 },
            screenshot: 'only-on-failure',
          });

          test('packing slip shows the order number', async ({ page }) => {
            await page.goto('http://localhost:3000/packing-slips/P218');
            await expect(page.getByRole('heading', { name: 'Packing slip P218' })).toBeVisible();
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          # pytest --browser-channel chromium --screenshot only-on-failure --output test-results
          def test_packing_slip(page):
              page.set_viewport_size({"width": 1100, "height": 800})
              page.goto("http://localhost:3000/packing-slips/P218")
              expect(page.get_by_role("heading", name="Packing slip P218")).to_be_visible()
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.io.IOException;
          import java.nio.file.Files;
          import java.nio.file.Path;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.OutputType;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.chrome.ChromeOptions;

          class PackingSlipTest {
            @Test
            void packingSlipShowsOrderNumber() throws Exception {
              var options = new ChromeOptions()
                  .addArguments("--headless=new", "--window-size=1100,800");
              var driver = new ChromeDriver(options);
              try {
                driver.get("http://localhost:3000/packing-slips/P218");
                assertEquals("Packing slip P218", driver.findElement(By.tagName("h1")).getText());
              } catch (AssertionError | RuntimeException error) {
                try {
                  var root = Files.createDirectories(Path.of("test-results"));
                  var attempt = Files.createTempDirectory(root, "packing-slip-");
                  Files.write(attempt.resolve("preview.png"), driver.getScreenshotAs(OutputType.BYTES));
                } catch (IOException | RuntimeException captureError) {
                  error.addSuppressed(captureError);
                }
                throw error;
              } finally {
                driver.quit();
              }
            }
          }
---

Headless runs a browser rendering engine without a visible window, which fits unattended CI. I'd first compare the exact browser builds and launch options. Playwright can use a separate Chromium headless shell by default; choosing the Chromium channel lets its regular Chromium build run headless. I'd check viewport, fonts, and media settings before blaming the difference on a missing window.

I'd retain an image and useful logs from the failing run, then repeat it with the same build and data. Once I can reproduce it, I'd vary one setting at a time.

### Example

The local packing slip page serves a heading with the order number. Each check expects `Packing slip P218`. Publish `test-results` from failed CI runs so the screenshot survives. Compare it with a headed capture at a measured matching viewport.
