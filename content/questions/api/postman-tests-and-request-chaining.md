---
title: "How would you use Postman to prove a parcel created in one request can be read in the next?"
topic: api
roles: [manual-qa, automation]
level: junior
type: tooling
oneLine: "Add post-response assertions, pass the validated parcel ID to the next request, and check the saved details there."
looksFor:
  - "Keeps the requests in a shared collection that can run in order."
  - "Uses post-response assertions on status and business fields."
  - "Passes an ID with a scope that lasts for the collection run."
  - "Adds a negative case and checks for unintended writes."
trap: "Hand-copying a parcel ID after each run and accidentally reading yesterday's record."
followUps:
  - question: "Where would you put a missing-postcode case?"
    answer: "I'd keep it as a separate request in the same collection and check the documented error field. I'd check the rejected address was never saved."
sources:
  - label: Postman, write post-response scripts
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/
  - label: Postman, test and expect API
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-test-expect/
  - label: Postman, response status and JSON
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
  - label: Postman, local variables in a collection run
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/
examples:
  - title: Save an ID only after the parcel response passes
    variants:
      - lang: js
        label: Postman scripts (JavaScript)
        code: |
          pm.test("Created a parcel with the submitted postcode", () => {
            pm.response.to.have.status(201);
            const parcel = pm.response.json();
            pm.expect(parcel.postcode).to.eql("02108");
            pm.expect(parcel.id).to.be.a("string").and.not.be.empty;
            pm.variables.set("createdParcelId", parcel.id);
          });
---

I'd save the create and read requests in one collection. In the create request's post-response script, I'd check the response status and the fields that identify the parcel we submitted. Once those assertions pass, I'd save its ID as a local variable for the run. The next request uses the variable and checks the saved address rather than relying on the create response.

I'd share the collection with reproducible test data and add a request for a documented rejection. Team members should be able to run it without copying IDs or sharing login secrets.

### Example

Run the collection against a parcel sandbox with postcode `02108`. This script expects `201` and a parcel ID. The next request reads `/parcels/{{createdParcelId}}` and should return the same postcode.
