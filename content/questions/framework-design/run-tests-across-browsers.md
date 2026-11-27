---
title: How would you check that a delivery picker works in every supported browser?
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Reuse the same test across browser settings and vary the CI selection by support risk.
looksFor:
  - Treats browser choice as configuration.
  - Tests distinct rendering engines where the support policy calls for them.
  - Runs broader coverage on the primary browser.
  - Names realistic layout or interaction differences.
trap: Copying the same test into several suites and letting the copies drift.
followUps:
  - question: What would you run outside the primary browser?
    answer: I'd start with critical journeys and known browser-sensitive controls, then expand where the failure history warrants it.
sources:
  - label: Playwright projects
    url: https://playwright.dev/docs/test-projects
  - label: Playwright test command options
    url: https://playwright.dev/docs/test-cli
  - label: Playwright pytest browser options
    url: https://playwright.dev/python/docs/test-runners
  - label: Selenium supported browsers
    url: https://www.selenium.dev/documentation/webdriver/browsers/
  - label: Selenium element interactions
    url: https://www.selenium.dev/documentation/webdriver/elements/interactions/
  - label: JUnit 5 parameterized tests
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
examples:
  - title: Run the same delivery choice on Chromium and Firefox
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          // Run in separate jobs with npx playwright test --project=chromium
          // and npx playwright test --project=firefox.
          test('chooses depot pickup', async ({ page }) => {
            await page.goto('http://localhost:3000/delivery/options');
            await page.getByRole('radio', { name: 'Depot pickup' }).check();
            await expect(page.getByTestId('delivery-choice')).toHaveText('Depot pickup');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          # Run with pytest --browser chromium --browser firefox.
          def test_depot_pickup(page):
              page.goto("http://localhost:3000/delivery/options")
              page.get_by_role("radio", name="Depot pickup").check()
              expect(page.get_by_test_id("delivery-choice")).to_have_text("Depot pickup")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.ValueSource;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.firefox.FirefoxDriver;

          class DeliveryBrowserTest {
            @ParameterizedTest
            @ValueSource(strings = {"chrome", "firefox"})
            void depotPickupWorks(String browser) {
              WebDriver driver = browser.equals("chrome") ? new ChromeDriver() : new FirefoxDriver();
              try {
                driver.get("http://localhost:3000/delivery/options");
                driver.findElement(By.id("depot-pickup")).click();
                assertEquals("Depot pickup", driver.findElement(By.id("delivery-choice")).getText());
              } finally {
                driver.quit();
              }
            }
          }
---

I'd start with the browser and OS combinations we promise to support. Then I'd make browser choice a setting so the same spec can run in different CI jobs. I'd run broader coverage on the browser most customers use and run critical, browser-sensitive paths on the other supported combinations. A real Safari requirement deserves validation on the actual target rather than an assumption based on engine similarity.

Controls can still behave differently across browsers. I'd look at focus after a native picker closes and whether the layout leaves its confirmation reachable on a small screen.

### Example

On the local delivery page, selecting the depot pickup radio should update the delivery summary synchronously. The examples run that check in Chromium or Chrome and Firefox without duplicating its expected result.

In `playwright.config.ts`, define the `chromium` and `firefox` projects with `use: { browserName: 'chromium' }` and `use: { browserName: 'firefox' }`, respectively. Each CI job selects one project by name.
