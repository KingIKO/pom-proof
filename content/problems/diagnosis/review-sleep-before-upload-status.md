---
title: Review a fixed wait before checking upload status
kind: diagnosis
topic: test-code-review
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: review
    type: line-marking
    language: java
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "@Test" }
      - { id: l02, text: "void showsUploadedReceipt() throws InterruptedException {" }
      - { id: l03, text: "    driver.get(baseUrl + \"/receipts\");" }
      - { id: l04, text: "    By input = By.id(\"receipt-file\");" }
      - { id: l05, text: "    By submit = By.id(\"upload-receipt\");" }
      - { id: l06, text: "    driver.findElement(input).sendKeys(receiptPdf.toString());" }
      - { id: l07, text: "    driver.findElement(submit).click();" }
      - { id: l08, text: "    Thread.sleep(1500);" }
      - { id: l09, text: "    By state = By.id(\"upload-state\");" }
      - { id: l10, text: "    assertEquals(\"Uploaded\", driver.findElement(state).getText());" }
      - { id: l11, text: "    assertEquals(receiptPdf.getFileName().toString()," }
      - { id: l12, text: "        driver.findElement(By.id(\"uploaded-filename\")).getText());" }
      - { id: l13, text: "}" }
  - id: category
    type: single-choice
    prompt: "What is the most serious problem in this change?"
    choices:
      - { id: sync, text: "The test guesses when an asynchronous upload will finish." }
      - { id: scope, text: "The test checks the displayed filename as well as the upload status." }
      - { id: locators, text: "The test uses stable IDs instead of XPath to find form elements." }
      - { id: setup, text: "The test does not start the driver inside the test method." }
reference:
  review: [l08, l10]
  category: sync
decoy:
  review: [l08]
  category: sync
---

The test fixture provides a driver, a base URL and an absolute path to a valid PDF. The driver is the WebDriver object that controls the browser. The status element exists from page load and first reads `Ready`.

The upload is asynchronous: the browser can keep working while the upload runs in the background. The upload replaces the status text with `Uploaded`. That change guarantees that the filename is already on screen.

Review the statements that handle timing, which is called synchronization. The method's `throws` clause can be removed along with the sleep. Leave the method signature unmarked.
