---
problem: code/compare-monitor-urls
---

## What is going on

The monitor compares targets using a small fixture grammar. It allows differences in scheme and hostname spelling, default ports, missing root paths, and fragments. The path and query have to survive as written, even when two spellings might lead to the same resource.

## The fix

1. In a normalization helper, drop the fragment and split off the scheme and authority before folding case.

   **Why:** The first slash or question mark after `://` starts data whose spelling matters. `host-and-fragments` should still match across different hostname case and fragments, while `path-case` keeps `/Cart` distinct from `/cart`.

   ```js
   const normalize = (url) => {
     const [withoutFragment] = url.split('#', 1);
     const originEnd = withoutFragment.indexOf('://');
     const scheme = withoutFragment.slice(0, originEnd).toLowerCase();
     const rest = withoutFragment.slice(originEnd + 3);
     const boundary = rest.search(/[/?]/);
     const authority = (boundary < 0 ? rest : rest.slice(0, boundary)).toLowerCase();
   ```

2. Omit the port only if it is the default for the parsed scheme. Supply a root slash only when the suffix lacks a path.

   **Why:** `default-port-and-root` needs both corrections, but port 444 in `non-default-port` names a separate target. In `empty-query-marker`, adding `/` before `?` preserves the marker. A dictionary of query parameters would lose that distinction and could hide order changes.

   ```js
     const [host, port] = authority.split(':');
     const keptPort = port === (scheme === 'https' ? '443' : '80') ? undefined : port;
     const suffix = boundary < 0 ? '' : rest.slice(boundary);
     const pathAndQuery = suffix.startsWith('/') ? suffix : '/' + suffix;
     return scheme + '://' + host + (keptPort ? ':' + keptPort : '') + pathAndQuery;
   };
   ```

3. Compare the helper results exactly.

   **Why:** The helper has already applied every allowed change. Exact comparison preserves `different-query-order` and leaves both supplied strings untouched. A match depends only on those two strings, so the monitor needs no network requests to follow redirects or compare responses.

   ```js
   return normalize(a) === normalize(b);
   ```

## Why the tempting answer fails

Lowercasing the entire address gives false matches in `path-case` and `verbatim-percent-escapes`, where `%2f` and `%2F` must differ. It also misses genuine matches in `default-port-and-root` and `empty-query-marker` because it never supplies a slash or removes the default port.

## What the interviewer listens for

Give one false match and one missed match. For a real monitor, pick the parser and normalization contract together; the narrow fixture here calls for preserving raw text beyond the authority.

## Sources

- [WHATWG URL Standard: URL representation](https://url.spec.whatwg.org/#url-representation)
- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN: String.toLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
