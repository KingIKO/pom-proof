---
title: Review a sleep before upload status
kind: diagnosis
topic: test-code-review
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: review
    type: line-marking
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
      - { id: scope, text: "The test covers filename display as well as upload status." }
      - { id: locators, text: "The test uses stable IDs instead of XPath to find form elements." }
      - { id: setup, text: "The test does not start the driver inside the test method." }
reference:
  review: [l08, l10]
  category: sync
decoy:
  review: [l08]
  category: sync
---

The fixture provides a driver, a base URL and an absolute path to a valid PDF. The status node exists from page load and initially reads `Ready`. Uploading replaces that text with `Uploaded`, which guarantees the filename is already rendered. Review the synchronization statements. The method's `throws` clause can be cleaned up with the sleep; leave the signature unmarked.
