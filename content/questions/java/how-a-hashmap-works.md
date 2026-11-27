---
title: An inventory fixture for P-7 gets a new SKU mid-test. What should the stock map use as its key?
topic: java
roles: [sdet]
level: senior
type: concept
oneLine: Keep an immutable SKU key and put the editable inventory fixture in the value.
looksFor:
  - Keeps fixture edits from changing the fields used as a map key.
  - Explains why changing those fields can send a lookup to a different bucket.
  - Uses P-7 and P-8 to distinguish sharing a hash from being equal.
  - Reads stock by key without assuming an order for map iteration.
trap: Keeping a mutable fixture as the key and assuming the map will move its entry after the SKU changes.
followUps:
  - question: If both keys hash to 1, what happens to P-8's count when you update the count for P-7?
    answer: P-8 still has 3. A new key equal to P-7 replaces the value for P-7 only.
sources:
  - label: Java 21 HashMap contract
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html
  - label: Java 21 Map rules for mutable keys
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html
  - label: OpenJDK 21 HashMap implementation
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/HashMap.java
examples:
  - title: Resolve two colliding inventory keys
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.HashMap;

          class InventoryMapCheck {
              record StockKey(String sku) {
                  @Override
                  public int hashCode() {
                      return 1;
                  }
              }

              public static void main(String[] args) {
                  var stock = new HashMap<StockKey, Integer>();
                  stock.put(new StockKey("P-7"), 12);
                  stock.put(new StockKey("P-8"), 3);

                  if (stock.get(new StockKey("P-7")) != 12 || stock.get(new StockKey("P-8")) != 3) {
                      throw new AssertionError("A collision lost or replaced an inventory value");
                  }
              }
          }
---

I'd keep an immutable key for `P-7` and keep the editable fixture as the value. Editing a
SKU on an object that's already a key could change which bucket a fresh lookup searches
or which keys compare equal. The `Map` contract leaves behavior unspecified when that edit
affects equality.

I can still store `P-7` and `P-8` when their hashes collide. In OpenJDK's `HashMap`, the mixed
hash picks a bucket; a lookup checks the stored hash and compares keys by identity or `equals`.
Good distribution keeps buckets small. OpenJDK 21 can turn a crowded bucket into a balanced
red-black tree. Its `TREEIFY_THRESHOLD` is 8, and the table grows instead if its capacity is
below 64.

### Example

This key deliberately returns the same hash for two SKUs. Each lookup uses a fresh key and
must still read its own stock count, 12 or 3.
