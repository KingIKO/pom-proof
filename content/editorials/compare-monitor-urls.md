---
problem: code/compare-monitor-urls
---

## What is going on

The monitor checks whether two target URLs point to the same place. It uses a small fixture grammar, which is a short set of URL rules for this exercise. The scheme, such as `https`, tells the monitor how to connect. The hostname names the server. Letter case may differ in both.

The port number tells the monitor which service on the server to use. An explicit default port counts the same as a missing one. The root path, `/`, counts the same as a missing path. The fragment can also differ.

The fragment is the part from `#` onward. The path and the query, which is the part after `?`, must stay exactly as written. That holds even when two spellings might lead to the same resource.

## The fix

1. In a normalization helper, drop the fragment, then split off the scheme and the authority and lowercase only those two parts.

   **Why:** A normalization helper rewrites each URL into one standard form. The authority is the hostname plus any port, and it ends at the first `/` or `?` after `://`. From that point on, the exact spelling matters. So `host-and-fragments` still matches despite a different hostname case and a fragment, while `path-case` keeps `/Cart` distinct from `/cart`.

   ```js
   const normalize = (url) => {
     const [withoutFragment] = url.split('#', 1);
     const originEnd = withoutFragment.indexOf('://');
     const scheme = withoutFragment.slice(0, originEnd).toLowerCase();
     const rest = withoutFragment.slice(originEnd + 3);
     const boundary = rest.search(/[/?]/);
     const authority = (boundary < 0 ? rest : rest.slice(0, boundary)).toLowerCase();
   ```

2. Remove the port only when it is the default for the parsed scheme, and add a root slash only when the path is missing.

   **Why:** The default port is 443 for HTTPS and 80 for HTTP. The `default-port-and-root` test case needs both corrections. Port 444 in `non-default-port` names a separate target, so it stays. In `empty-query-marker`, the helper adds `/` before `?`, and the marker survives. Parsing the query into a dictionary of parameters would lose the difference between an empty `?` and no query, and could hide order changes.

   ```js
     const [host, port] = authority.split(':');
     const keptPort = port === (scheme === 'https' ? '443' : '80') ? undefined : port;
     const suffix = boundary < 0 ? '' : rest.slice(boundary);
     const pathAndQuery = suffix.startsWith('/') ? suffix : '/' + suffix;
     return scheme + '://' + host + (keptPort ? ':' + keptPort : '') + pathAndQuery;
   };
   ```

3. Compare the two helper results exactly.

   **Why:** The helper has already made every allowed change, so nothing else may differ. An exact comparison keeps `different-query-order` as a mismatch, and it leaves both supplied strings untouched. A match depends only on those two strings. So the monitor needs no network requests to follow redirects or compare responses.

   ```js
   return normalize(a) === normalize(b);
   ```

## Why the tempting answer fails

The tempting answer lowercases the entire address. That gives false matches in `path-case` and in `verbatim-percent-escapes`, where `%2f` and `%2F` must differ. It also misses real matches in `default-port-and-root` and `empty-query-marker`. It never adds a missing slash, and it never removes the default port.

## What the interviewer listens for

Give one false match and one missed match. For a real monitor, choose the URL parser and the normalization contract together. The contract is the written list of changes that still count as the same URL. This narrow fixture calls for keeping the raw text after the authority.

## Sources

- [WHATWG URL Standard: URL representation](https://url.spec.whatwg.org/#url-representation)
- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN: String.toLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
