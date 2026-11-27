---
title: "How would you test several coupon results with one Postman request?"
topic: api
roles: [manual-qa, automation]
level: mid
type: tooling
oneLine: "I'd run the request once per data row. I'd use that row to check the status and result."
looksFor:
  - "Use CSV column names or JSON keys to supply a value for each run."
  - "Put each expected outcome next to its input in the data file."
  - "Read the expected values from the row in the script."
  - "Keep cases independent and include the case name when a check fails."
trap: "Changing the coupon by row but checking for `200` every time."
followUps:
  - question: "Why would you convert the expected status before comparing it?"
    answer: "A CSV file can supply the expected status as text. I'd turn it into a number before comparing it because pm.response.code is numeric."
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

I'd keep one request that checks a coupon. I'd put the inputs and expected results in a data file. Each CSV row or JSON object gives Postman one iteration, or repeat of the request. The `{{coupon}}` placeholder gets the coupon value. After the response, I'd read the expected status and code from `pm.iterationData`, the values for that run.

That way, valid and expired coupons use the same request but have different expected results. I'd check the column names and number conversion when I first use the file. I'd use fixed test coupons or reset them if redeeming them changes their state.

### Example

I'd submit `TRY10` and `OLD10` in a data-file run. I'd expect `200` and `accepted` for `TRY10`. I'd expect `422` and `expired` for `OLD10`. Both bodies have a `code` field.
