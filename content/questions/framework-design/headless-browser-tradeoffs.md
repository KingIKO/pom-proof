---
title: "Packing slip P218 loses its heading in headless CI. What would you compare with a headed run?"
topic: framework-design
roles: [automation, sdet]
level: junior
type: concept
oneLine: "I match the two browser setups. I save the actual page size, how the page looks, and the evidence from the failure."
looksFor:
  - "Explain what a browser runs without in headless mode."
  - "Compare browser versions, page area, fonts, and media settings."
  - "Keep the saved files that show what went wrong."
  - "Change one setting at a time."
trap: "Switching to a visible browser in CI without finding which setting exposed the problem."
followUps:
  - question: "P218 passes locally, but the automated run used a narrower page area. What would you try next?"
    answer: "I'd rerun the same build locally using the same page area and fonts. I'd compare screenshots with and without a browser window. I'd keep headless as the usual mode for automated tests while finding what changed."
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

Headless mode runs the browser's rendering engine without showing a window. A headed run shows the browser window. I can use headless mode for continuous integration (CI), where automated jobs run unattended. I'd compare exact browser builds and startup settings first.

Playwright can use a separate Chromium headless shell by default. If I select the Chromium channel, I can run regular Chromium without a window.

I'd check the viewport, the area available to the page, along with fonts and media settings such as print or screen. I'd save a screenshot and useful logs from the failure. I'd repeat the run with the same build and data. When I can reproduce it, I'd change one setting at a time.

### Example

My local page shows the order number in its packing slip heading. I expect `Packing slip P218`. I'd upload `test-results` from failed CI runs so I keep the screenshot. I'd compare it with a screenshot from a visible browser at the same measured viewport.
