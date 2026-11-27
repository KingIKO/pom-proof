---
title: "How would you create a parcel in Postman and check it with the next request?"
topic: api
roles: [manual-qa, automation]
level: junior
type: tooling
oneLine: "I'd check the create reply and pass the confirmed parcel ID to the read request. I'd use the read reply to check what the service saved."
looksFor:
  - "Save both requests in a shared collection that runs them in order."
  - "Check the response status and the fields that identify the parcel."
  - "Store the ID in a variable available for the collection run."
  - "Add a rejection case and check that it saved nothing by mistake."
trap: "Copying parcel IDs by hand and accidentally reading a record from the last run."
followUps:
  - question: "Where would you test an address without a postcode?"
    answer: "I'd add a separate request to the collection and check the documented error field. I'd make sure the service didn't save the rejected address."
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

I'd keep both requests in one Postman collection, a saved group of requests I can run in order. In the script that runs after the create reply, I'd check the status and the fields that identify the parcel. If those checks pass, I'd save its ID in a local variable that lasts for the run. I'd use that variable in the next request and check the saved address.

I'd share the collection with test data other people can recreate. I'd add a separate request for a documented rejection. People should be able to run it without copying IDs or sharing login secrets.

### Example

I'd run the collection in a parcel sandbox with postcode `02108`. I'd expect `201` and a parcel ID. I'd read `/parcels/{{createdParcelId}}` and expect the same postcode in the reply.
