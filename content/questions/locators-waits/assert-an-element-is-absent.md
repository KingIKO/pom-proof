---
title: After you archive a contact, how would you check that it no longer appears in the active list?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I wait for evidence that the refreshed list is complete. Then I check that the contact has no match.
looksFor:
  - Name a positive signal that the page is ready after the current action.
  - Explain how a temporary render can make an absence check pass early.
  - Tell an element that is missing apart from one that is only hidden.
  - Use a Selenium list lookup to check for zero matches.
trap: Looking for the row before the app finishes loading the list.
followUps:
  - question: After a refresh, CSS hides row C218 but the DOM still contains it. Would you expect the check for zero matches to pass?
    answer: No. If removal from the document is required, I'd check for zero matches. If the product only promises that users can't see the row, I'd test visibility after the same refresh signal.
sources:
  - label: Playwright locator count assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Playwright Python locator count assertions
    url: https://playwright.dev/python/docs/api/class-locatorassertions
  - label: Selenium finders and empty lists
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
  - label: Selenium waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
  - label: Selenium expected conditions
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html
examples:
  - title: Check the active list after archiving C218
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('active contacts no longer include C218', async ({ page }) => {
            await page.goto('http://localhost:3000/contacts/active');
            const contact = page.getByTestId('contact-C218');
            await contact.getByRole('button', { name: 'Archive' }).click();
            await expect(page.getByRole('status')).toHaveText('Active contacts updated after C218');
            await expect(contact).toHaveCount(0);
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_archived_contact_is_removed(page):
              page.goto("http://localhost:3000/contacts/active")
              contact = page.get_by_test_id("contact-C218")
              contact.get_by_role("button", name="Archive").click()
              expect(page.get_by_role("status")).to_have_text("Active contacts updated after C218")
              expect(contact).to_have_count(0)
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertTrue;
          import java.time.Duration;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.WebDriverWait;

          class ArchiveContactTest {
            @Test
            void removesTheContactFromTheRefreshedList() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/contacts/active");
                var contact = By.cssSelector("[data-testid='contact-C218']");
                driver.findElement(contact).findElement(By.tagName("button")).click();
                new WebDriverWait(driver, Duration.ofSeconds(5)).until(
                    ExpectedConditions.textToBe(
                        By.id("contact-status"), "Active contacts updated after C218"));
                assertTrue(driver.findElements(contact).isEmpty(), "C218 should be absent");
              } finally {
                driver.quit();
              }
            }
          }
---

I first wait for a signal tied to the archive and the list refresh it causes. An empty list during a reload says very little. Once the app says it has rendered, or drawn, the refreshed active list, I check that the archived contact has no match. The test can then finish as soon as we have evidence, without waiting out a timeout on purpose.

In Selenium, I'd use a list lookup for the final check. A list lookup returns an empty list for zero matches. A single-element lookup treats zero matches as a missing-element error instead.

### Example

The local fixture, or test page, starts with active contact C218. Archiving C218 refreshes the list. After the list renders, the app publishes a status. The test waits for that status and expects zero rows for C218.
