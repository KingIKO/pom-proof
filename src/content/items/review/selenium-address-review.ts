import type { ReviewItem } from '../../types';

const item: ReviewItem = {
  id: 'selenium-address-review',
  title: 'Review a Selenium address page object',
  kind: 'review',
  difficulty: 'Medium',
  topics: ['Selenium', 'Page objects', 'Code review'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Spot setup duplication, timing assumptions and a weak saved-address check.',
  prompt: 'An address form mounts its street field asynchronously and can replace it when the delivery country changes. Review this Java page object and its two tests. The shell heading remains visible even if saving fails. Assume driver and JUnit setup exist elsewhere.',
  lang: 'java',
  code: `
class AddressPage {
    private final WebDriver driver;
    private final WebElement street;

    AddressPage(WebDriver driver) {
        this.driver = driver;
        this.street = driver.findElement(By.id("street"));
    }

    void saveStreet(String text) throws InterruptedException {
        street.sendKeys(text);
        driver.findElement(By.cssSelector(".form > div:nth-child(4) button")).click();
        Thread.sleep(1200);
    }
}

class AddressTests {
    WebDriver driver;

    @Test void savesStreet() throws Exception {
        driver.get(BASE + "/account");
        driver.findElement(By.id("edit-address")).click();
        new AddressPage(driver).saveStreet("14 Alder Road");
        assertTrue(driver.findElement(By.id("address-title")).isDisplayed());
    }

    @Test void savesApartment() throws Exception {
        driver.get(BASE + "/account");
        driver.findElement(By.id("edit-address")).click();
        new AddressPage(driver).saveStreet("9 Birch Lane Apt 2");
        assertEquals("9 Birch Lane Apt 2", driver.findElement(By.id("saved-street")).getText());
    }
}`,
  issues: [
    { id: 'eager', lines: [7, 7], category: 'Brittle locator', title: 'Constructor caches an element before the form is ready', explanation: 'If the field has not mounted, construction fails. If it is later replaced, the cached WebElement can go stale. Store a By locator and resolve a usable field when the action needs it.' },
    { id: 'position', lines: [12, 12], category: 'Brittle locator', title: 'Save button depends on layout order', explanation: 'A new section above the button can break the positional selector. Use a stable identifier tied to the save action.' },
    { id: 'sleep', lines: [13, 13], category: 'Hard-coded wait', title: 'Sleep guesses when saving finishes', explanation: 'Wait for the saved address or completion message. That condition reports what the user sees and avoids an unconditional delay.' },
    { id: 'assert', lines: [24, 24], category: 'Missing or weak assertion', title: 'The heading does not prove that saving worked', explanation: 'The unchanged shell can show a heading after a rejected save. Assert that the stored address equals the submitted value.' },
    { id: 'setup', lines: [28, 29], category: 'Duplicated setup', title: 'The account-to-edit flow is copied', explanation: 'Both tests open the account and click Edit address. Put that setup in a test fixture or focused helper so each test can still run independently.' },
  ],
  hints: ['What can happen between constructing the page object and using it?', 'Look for setup that both tests perform and assertions that could pass after a failed save.'],
  solutionNotes: 'Use on-demand element resolution and a stable save locator. Replace the sleep with a condition that observes the saved value, and factor out opening the form without sharing the state of one test with another.',
  interviewNotes: 'Distinguish waiting for a field to be usable from asserting the result. Keep navigation reuse separate from session or test-data reuse.',
  sources: [
    { label: 'Selenium: Page object models', url: 'https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/' },
    { label: 'Selenium: Waiting strategies', url: 'https://www.selenium.dev/documentation/webdriver/waits/' },
    { label: 'Selenium: WebDriver errors', url: 'https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/' },
  ],
};

export default item;
