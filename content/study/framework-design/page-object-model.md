---
title: Page Object Model
module: framework-design
order: 1
level: core
summary: A page object wraps a screen, or a part of one, in a class. Tests call its methods instead of using selectors.
minutes: 3
prerequisites: [automation-fundamentals/locator-strategy]
outcomes:
  - Move the selectors and actions for one screen out of a test and into a page object.
  - Model a part that repeats across screens, such as a header or a table row, as its own object.
  - Explain both views on whether a page object should contain assertions.
useWhen:
  - Many tests drive the same screens, and their markup changes often.
avoidWhen:
  - The suite is small enough that the extra classes cost more than they save.
  - Page classes extend each other until a reader cannot tell what a test does.
questionTopics: [framework-design, automation-strategy]
diagrams:
  - id: locator-change
    type: blocks
    title: Edits after a button label change
    note: Each locator here uses the button's label, so a new label means editing every copy. The three tests are an example.
    description: With a page object, the three tests use one sign-in page object class. The same change takes 1 edit, and none of the three tests changes.
    panels:
      - name: Each test holds the locator
        tiers:
          - - { title: Test 1, parts: [{ name: Button locator, strong: true }] }
            - { title: Test 2, parts: [{ name: Button locator, strong: true }] }
            - { title: Test 3, parts: [{ name: Button locator, strong: true }] }
        result: 3 edits
      - name: Tests call one page object
        tiers:
          - - { title: Test 1, linkTo: { label: calls, target: sign-in } }
            - { title: Test 2, linkTo: { label: calls, target: sign-in } }
            - { title: Test 3, linkTo: { label: calls, target: sign-in } }
          - - { id: sign-in, title: Sign-in page object, parts: [{ name: Button locator, strong: true }] }
        result: 1 edit
examples:
  - title: Assertions stay in the test
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test, type Locator, type Page } from '@playwright/test';

          class SignInPage {
            readonly error: Locator;

            constructor(private readonly page: Page) {
              this.error = page.getByRole('alert');
            }

            async signIn(email: string, password: string) {
              await this.page.getByLabel('Email').fill(email);
              await this.page.getByLabel('Password').fill(password);
              await this.page.getByRole('button', { name: 'Sign in' }).click();
            }
          }

          test('a wrong password shows an error', async ({ page }) => {
            await page.goto('/sign-in');
            const signIn = new SignInPage(page);
            await signIn.signIn('ada@example.com', 'wrong-password');
            await expect(signIn.error).toHaveText('Email or password is wrong.');
          });
      - lang: java
        label: Selenium with JUnit 5
        code: |
          import java.time.Duration;

          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.WebDriverWait;

          import static org.junit.jupiter.api.Assertions.assertEquals;

          class SignInPage {
            private final WebDriver driver;

            SignInPage(WebDriver driver) {
              this.driver = driver;
            }

            // A failed sign-in stays on this page, so the method returns this page object.
            SignInPage loginAsExpectingError(String email, String password) {
              driver.findElement(By.id("email")).sendKeys(email);
              driver.findElement(By.id("password")).sendKeys(password);
              driver.findElement(By.cssSelector("button[type=submit]")).click();
              return this;
            }

            String errorText() {
              return new WebDriverWait(driver, Duration.ofSeconds(5))
                  .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role=alert]")))
                  .getText();
            }
          }

          class SignInTest {
            // Setup code, not shown, starts the browser and sets both fields before each test.
            WebDriver driver;
            String baseUrl;

            @Test
            void wrongPasswordShowsAnError() {
              driver.get(baseUrl + "/sign-in");
              var signIn = new SignInPage(driver).loginAsExpectingError("ada@example.com", "wrong-password");
              assertEquals("Email or password is wrong.", signIn.errorText());
            }
          }
  - title: An assertion inside the page object
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test, type Page } from '@playwright/test';

          class SignInPage {
            constructor(private readonly page: Page) {}

            async signIn(email: string, password: string) {
              await this.page.getByLabel('Email').fill(email);
              await this.page.getByLabel('Password').fill(password);
              await this.page.getByRole('button', { name: 'Sign in' }).click();
            }

            async expectError(message: string) {
              await expect(this.page.getByRole('alert')).toHaveText(message);
            }
          }

          test('a wrong password shows an error', async ({ page }) => {
            await page.goto('/sign-in');
            const signIn = new SignInPage(page);
            await signIn.signIn('ada@example.com', 'wrong-password');
            await signIn.expectError('Email or password is wrong.');
          });
sources:
  - { label: "Selenium: Page object models", url: "https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/", type: primary }
  - { label: "Playwright: Page object models", url: "https://playwright.dev/docs/pom", type: primary }
  - { label: "Martin Fowler: PageObject", url: "https://martinfowler.com/bliki/PageObject.html", type: practitioner }
expertsDisagree:
  - question: Should a page object contain assertions?
    note: We found no study that compares the two styles. The one study Fowler cites, from 2013, compared a suite with page objects against one without them.
    positions:
      - view: "No, as a rule. Selenium's guide says a page object should never make assertions, apart from checking that the right page loaded. Its summary puts it as \"generally\". Fowler also prefers none, but he allows checks of what must always be true on a page. For checks that repeat, he suggests shared assertion helpers."
        holdsWhen: You want every check in the test itself, and page objects that tests with different expected results can share.
        source:
          - https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
          - https://martinfowler.com/bliki/PageObject.html
      - view: "Yes, for checks the screen owns. Fowler records reasons its supporters give: less repeated assertion code and clearer failure messages. Playwright's guide calls `expect` in a page object method to confirm a navigation finished."
        holdsWhen: Many tests repeat the same check, and the team prefers one named method over the same lines in each test.
        source:
          - https://martinfowler.com/bliki/PageObject.html
          - https://playwright.dev/docs/pom
---
## What it is

A page object is a class that stands for one screen, or one part of a screen. It holds the locators for that screen and the actions a user can take there. A test calls those methods, such as `signIn`, and never touches a selector itself. The pattern is called the Page Object Model, or POM.

## How it works

Put the locators in the class, with methods for what a user can do there and what a user can see. The test keeps the intent, which is what the user does and what should happen. If a locator uses a button's label and that label changes, you fix one locator in one class. The tests that use the class do not change.

```diagram
locator-change
```

Model the parts that repeat, not only whole pages. A header, a search form or a table row that appears on many screens can be its own small object. A page object can then hold these component objects.

One rule is openly disputed: whether a page object may contain assertions. Decide your rule, write down why, and apply it to the whole suite. The examples below show both forms.

Fowler records a second dispute: whether an action that opens another screen should return that screen's page object. Selenium's guide does return it, and gives each result its own method, such as `loginAs` and `loginAsExpectingError`. Some teams use other patterns instead, such as Screenplay, or Cypress app actions that set up state through the app's own code.

## Why it helps

A selector change costs one edit instead of one edit per test. Tests read as a list of user steps, so a reviewer can check the intent without reading locators. New tests reuse the same methods and stay short. Playwright documents page objects as one way to structure a large suite.

## When not to use it

A small suite may not need a class for every page. The extra layer adds files before it saves any work. Watch for page classes that inherit from each other in long chains. A test then calls a method that is defined three classes away, and nobody can see what it does. Prefer small objects that hold other objects.
