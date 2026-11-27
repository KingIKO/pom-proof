---
title: "How would you check several coupon outcomes without cloning the Postman request?"
topic: api
roles: [manual-qa, automation]
level: mid
type: tooling
oneLine: "Run the same request once per data row and assert the status and outcome specified by that row."
looksFor:
  - "Uses CSV column names or JSON keys as iteration variables."
  - "Puts expected outcomes beside the input in the data file."
  - "Reads expectations explicitly from iteration data in the script."
  - "Keeps fixtures independent and labels failures by the case."
trap: "Varying the coupon code per row but asserting `200` for every result."
followUps:
  - question: "Why convert the expected status before comparing it?"
    answer: "A CSV value may come through as text. I'd convert it to a number because pm.response.code is numeric."
sources:
  - label: Postman CSV and JSON data files
    url: https://learning.postman.com/docs/tests-and-scripts/running-collections/test-data/working-with-data-files/
  - label: Postman iteration data access
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/
  - label: Postman test and expect API
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-test-expect/
  - label: Postman response code and JSON body
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
examples:
  - title: Assert the current row's coupon outcome
    variants:
      - lang: js
        label: Postman scripts (JavaScript)
        code: |
          const coupon = pm.iterationData.get("coupon");
          pm.test(`Coupon ${coupon} follows the fixture contract`, () => {
            const expected = Number(pm.iterationData.get("expectedStatus"));
            pm.expect(pm.response.code).to.eql(expected);
            pm.expect(pm.response.json().code).to.eql(pm.iterationData.get("expectedCode"));
          });
---

I'd keep one coupon validation request and put the inputs and expectations in a data file. Each CSV row or JSON object is one iteration. The request uses `{{coupon}}` and the post-response script reads the expected status and code from `pm.iterationData`. That lets the expired and valid cases share the request without sharing an expectation.

I'd check the column names and number conversion when bringing in a file. I'd use fixed sandbox coupons, or reset them if checking redemption changes their state.

### Example

In a data-file run, submit `TRY10` and `OLD10`. The file pairs `TRY10` with `200` and `accepted`, and `OLD10` with `422` and `expired`. Both bodies have a `code` field.
