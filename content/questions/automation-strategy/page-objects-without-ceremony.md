---
title: "When would you add a page object, and when would you keep the actions in the test?"
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd name screen actions that several tests share. I'd leave the business result each test expects in the test itself."
looksFor:
  - "Show an interaction that more than one test uses."
  - "Explain when an object for a small part of the page fits better."
  - "Keep the result unique to each case visible in its test file."
  - "Give a sign that grouping actions has made the tests harder to read."
trap: "Building a base class and wrapping every browser method before writing the first feature test."
followUps:
  - question: "The expired and valid return cases both submit the form. Where would you check the deadline message?"
    answer: "I'd check it in the expired-return test because the valid return has a different result. The form helper can still wait for the controls it needs."
  - question: "What should the helper give the test when a valid return opens a confirmation page?"
    answer: "I'd let the test read the confirmation number or use a separate object for that screen. I'd keep selectors private. In new Selenium code, I'd use plain locator fields so the reader can see when the test looks up a control."
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

I'd use a page object, a class that names screen actions, when several tests share the same steps. A method like `applyCoupon` tells me more about the test than a list of clicks. If two pages share a coupon widget, I'd model the widget once instead of copying it into two large classes.

If reading a test sends me into four more files, the page object adds work. I'd also avoid one method that sets up every case, performs the action, and checks the result. I want to see the expected price in the test. If only one test uses an action and it reads well where it is, I'd leave it there.

I'd also avoid starting with a base class, a shared class that other page objects inherit code from. I'd write a feature test before deciding what code belongs there.

### Example

I'd give a small return form object a `chooseReason` method (`choose_reason` in Python) and a `submit` method. On the local test setup, a valid reason for an expired return shows a deadline error as soon as I submit. I'd check that message in the expired-return test. I'd reuse `submit` in the valid case and check the confirmation number there.
