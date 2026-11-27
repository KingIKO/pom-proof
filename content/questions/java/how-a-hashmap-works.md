---
title: The product code for the P-7 test item changes during the test. What should the stock map use as its key?
topic: java
roles: [sdet]
level: senior
type: concept
oneLine: I keep an immutable SKU key. I put the editable inventory fixture in the value.
looksFor:
  - Keep fixture edits from changing the fields used as a map key.
  - Explain why changing those fields can send a lookup to a different bucket.
  - Use P-7 and P-8 to tell sharing a hash apart from being equal.
  - Read stock by key without assuming any order when iterating over the map.
trap: Using editable test data as the key and expecting the map to move the entry when the product code changes.
followUps:
  - question: Both keys have a hash of 1. If you change P-7's count, what happens to the count for P-8?
    answer: I'd still read 3 for P-8. If I use a new key equal to P-7, I replace only the value for P-7.
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

A key is the value I use to look up an entry in a map. A hash map puts each entry in a bucket, a slot it picks from the key's hash code. I'd use a key for `P-7` that can't change and keep the editable test data as the value.

If I edit the SKU on an object that's already a key, a fresh lookup could search a different bucket. The edit could also change which keys compare equal. If the edit affects equality, the `Map` contract makes no promise about what happens.

I can still store `P-7` and `P-8` when their hashes collide, which means they share a hash. OpenJDK's `HashMap` mixes the bits of the hash code and uses the result to pick a bucket. For a lookup, it checks the stored hash. It also checks whether both keys are the same object or match under `equals`.

Good distribution keeps buckets small. OpenJDK 21 can turn a crowded bucket into a balanced red-black tree, a kind of search tree. Its `TREEIFY_THRESHOLD` is 8. If the table's capacity is below 64, the table grows instead.

### Example

This key deliberately returns the same hash for two SKUs. Each lookup uses a fresh key. It must still read its own stock count, 12 or 3.
