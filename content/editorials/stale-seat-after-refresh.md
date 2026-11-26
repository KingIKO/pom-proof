---
problem: diagnosis/stale-seat-after-refresh
---

The wait for map version 43 succeeds. By the time it succeeds, the node Selenium found in version 42 has been replaced. Both nodes can have the same `data-seat` value, but the `WebElement` in `b12` still identifies the old node. Selenium reports that reference as stale when the test tries to use it.

Keep the `By` for B12. Wait for the refreshed version, then look up the seat in that map and click the fresh element. If the actual app can replace the map again, handle a stale reference by making a new lookup in the correct map and rechecking which seat it represents. Repeating the command on the original element cannot restore it.

The trap is to see an exception after an asynchronous update and add a sleep. Here, waiting longer only leaves the old handle stale for longer. An interviewer will want to hear the difference between a locator and a saved element, and how a DOM capture and a successful fresh lookup would establish that B12 still exists.

[Selenium: stale element references](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#staleelementreferenceexception)
