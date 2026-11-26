---
problem: test-design/shipping-service-matrix
---

Work out the expected fees before choosing the weights. Each allowed weight band has four combinations of membership and express. The light band costs 600 cents for a nonmember on standard, 300 for a member on standard, and 1,300 on express for either customer. The same four combinations on the heavy band cost 1,000, 700, 1,700, and 1,700. Listing both express cases checks the guarantee that membership never changes that price.

Use 5,000 and 5,001 grams as the two representative weights. This covers the service decisions and checks which rate applies on either side of the weight change. Check 20,000 and 20,001 separately because the maximum shipping weight is a second decision. An overweight member selecting express must still receive `-1`.

The weaker answer samples a light standard order, a heavy express order, and an overweight order. It checks enough to catch a missing heavy express surcharge. Without heavy standard membership and member express cases, it leaves both ways to misapply the discount untouched.

An interviewer listens for the order of the rules. Decide whether the parcel can ship first. Then explain which options affect the price and which are irrelevant.

Source: [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3, boundaries and decision tables](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
