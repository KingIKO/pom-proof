---
title: When does a page object help, and when does it get in the way?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: Put repeated interactions behind clear names and keep each test's business claim easy to read.
looksFor:
  - A concrete interaction shared by multiple tests
  - A reason to prefer a small component object
  - Test-specific expectations visible in the spec
  - A sign that an abstraction should be removed
trap: Building a base class and wrapping every browser method before writing the first feature test.
followUps:
  - question: An expired return and a valid return both use submit. Where would you check the deadline message?
    answer: In the expired-return spec, since the valid case needs a different outcome. The form helper can still wait for the controls it needs.
  - question: A valid return opens a confirmation page. What should the test get from the helper?
    answer: I'd let the test read the confirmation number or work with that next screen through its own object. I'd keep selectors private. In Selenium I'd use plain locator fields for new code so the reader can see when the lookup happens.
sources:
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
  - label: Playwright Python page object models
    url: https://playwright.dev/python/docs/pom
  - label: Playwright Python native select controls
    url: https://playwright.dev/python/docs/input
  - label: Selenium page object models
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - label: Selenium PageFactory proxies
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/PageFactory.html
  - label: Selenium native select controls
    url: https://www.selenium.dev/documentation/webdriver/support_features/select_lists/
examples:
  - title: Use a small page object for the return form
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test, type Page } from '@playwright/test';

          class ReturnForm {
            constructor(private readonly page: Page) {}

            async chooseReason(reason: string) {
              await this.page.getByLabel('Reason').selectOption(reason);
            }

            async submit() {
              await this.page.getByRole('button', { name: 'Request return' }).click();
            }
          }

          test('explains the deadline for an expired return', async ({ page }) => {
            await page.goto('http://localhost:3000/returns/expired');
            const form = new ReturnForm(page);
            await form.chooseReason('damaged');
            await form.submit();
            await expect(page.getByRole('alert')).toHaveText('The return window has closed.');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          class ReturnForm:
              def __init__(self, page):
                  self._reason = page.get_by_label("Reason")
                  self._submit = page.get_by_role("button", name="Request return")

              def choose_reason(self, reason):
                  self._reason.select_option(reason)

              def submit(self):
                  self._submit.click()

          def test_explains_expired_return(page):
              page.goto("http://localhost:3000/returns/expired")
              form = ReturnForm(page)
              form.choose_reason("damaged")
              form.submit()
              expect(page.get_by_role("alert")).to_have_text("The return window has closed.")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.Select;

          class ReturnFormTest {
            record ReturnForm(WebDriver driver) {
              private static final By REASON = By.id("reason");

              void chooseReason(String reason) {
                new Select(driver.findElement(REASON)).selectByValue(reason);
              }

              void submit() {
                driver.findElement(By.id("request-return")).click();
              }
            }

            @Test
            void explainsTheExpiredReturn() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/returns/expired");
                var form = new ReturnForm(driver);
                form.chooseReason("damaged");
                form.submit();
                var message = driver.findElement(By.cssSelector("[role='alert']"));
                assertEquals("The return window has closed.", message.getText());
              } finally {
                driver.quit();
              }
            }
          }
---

I'd extract a page object when multiple tests need the same interaction and a name like `applyCoupon` describes it better than a sequence of clicks. If the same coupon widget appears on two pages, I'd model that widget instead of duplicating it in two large classes.

A page object starts to hurt when reading the test means opening four more files or when one method does setup, interaction, and assertions for every caller. I want to see the expected price in the test. If there's one caller and the interaction already reads well, I'd keep it there until there's a reason to extract it.

### Example

On returns, I'd add a small form object with `chooseReason` (`choose_reason` in Python) and `submit`. The test for an expired return would still assert that the screen explains the deadline. A valid return can reuse `submit` and check for a confirmation number.

On the local expired-return fixture, selecting a valid reason and submitting shows a deadline error synchronously. The page object handles the interaction and the test owns the expected message.
