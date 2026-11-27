---
title: "How would you check a delivery picker in every browser the team supports?"
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: "I'd run the same test with different browser settings. I'd pick how much to run in each job based on what could break for users."
looksFor:
  - "Choose the browser in settings instead of copying code."
  - "Test different rendering engines when the support policy requires it."
  - "Run a wider set of tests on the primary browser."
  - "Name differences someone could see in the layout or controls."
trap: "Copying the same test into several suites and letting the copies develop different expectations."
followUps:
  - question: "What would you run outside the main browser?"
    answer: "I'd start with important journeys and controls known to behave differently. I'd add more tests if past failures point to a need."
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

I'd start with the browser and operating system combinations we promise to support. I'd make browser choice a setting so the same test can run in different automated jobs. I'd run more cases in the browser most customers use. I'd run critical paths that may behave differently on the other supported combinations. If we promise Safari support, I'd test Safari itself instead of assuming a similar engine works the same way.

A rendering engine lays out and draws the page. Controls can still act differently in each browser. I'd check where keyboard focus goes after a browser's own picker closes. I'd also check that the confirmation is reachable on a smaller screen.

### Example

On my local delivery page, I'd select the depot pickup radio button and expect the delivery summary to change right away. I'd run the same check in Chromium or Chrome and in Firefox without copying the expected result.

I'd define the `chromium` and `firefox` projects in `playwright.config.ts`. For the first, I'd use `use: { browserName: 'chromium' }`. For the second, I'd use `use: { browserName: 'firefox' }`. I'd have each automated job pick one project by name.
