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
  - Several tests use the same screens, and selector changes keep costing you time.
avoidWhen:
  - A small suite, where a class for every page adds more code than it saves.
  - Page classes that grow into deep inheritance chains and hide what a test does.
practiceTopics: [test-code-review]
questionTopics: [framework-design, automation-strategy]
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
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;

          class SignInPage {
            private final WebDriver driver;

            SignInPage(WebDriver driver) {
              this.driver = driver;
            }

            void signIn(String email, String password) {
              driver.findElement(By.id("email")).sendKeys(email);
              driver.findElement(By.id("password")).sendKeys(password);
              driver.findElement(By.cssSelector("button[type=submit]")).click();
            }

            String errorText() {
              return driver.findElement(By.cssSelector("[role=alert]")).getText();
            }
          }

          @Test
          void wrongPasswordShowsAnError() {
            driver.get(baseUrl + "/sign-in");
            SignInPage signIn = new SignInPage(driver);
            signIn.signIn("ada@example.com", "wrong-password");
            assertEquals("Email or password is wrong.", signIn.errorText());
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
    note: No study compares the two styles. Both rest on the experience of the people who wrote them.
    positions:
      - view: No. Selenium's documentation says a page object should never make assertions, except a check that the right page has loaded. Martin Fowler also prefers none.
        holdsWhen: You want every check in the test itself, and page objects that tests with different expected results can share.
        source: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
      - view: Yes, when the check belongs to the screen. Playwright's own page object example calls `expect` inside a page object method.
        holdsWhen: Many tests repeat the same check, and the team prefers one named method over the same lines in each test.
        source: https://playwright.dev/docs/pom
---
## What it is

A page object is a class that stands for one screen, or one part of a screen. It holds the locators for that screen and the actions a user can take there. A test calls those methods, such as `signIn`, and never touches a selector itself. The pattern is called the Page Object Model, or POM.

## How it works

Put two things in the class: the locators, and methods named after user actions. The test keeps the intent, which is what the user does and what should happen. When a button label changes, you fix one locator in one class. Every test that uses it keeps working.

Model the parts that repeat, not only whole pages. A header, a search form or a table row that appears on many screens can be its own small object. A page object can then hold these component objects.

Teams disagree about one rule: whether a page object may contain assertions. Decide your rule, write down why, and apply it to the whole suite. The examples below show both forms.

## Why it helps

A selector change costs one edit instead of one edit per test. Tests read as a list of user steps, so a reviewer can check the intent without reading locators. New tests reuse the same methods and stay short. Playwright still documents page objects as one way to structure a large suite.

## When not to use it

A small suite may not need a class for every page. The extra layer adds files before it saves any work. Watch for page classes that inherit from each other in long chains. A test then calls a method that is defined three classes away, and nobody can see what it does. Prefer small objects that hold other objects.
