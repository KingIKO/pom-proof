---
title: "Check if two monitored URLs match"
kind: code
topic: api
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: compareMonitorUrls
starters:
  js: |
    export function compareMonitorUrls(a, b) {
    }
  ts: |
    export function compareMonitorUrls(a: string, b: string) {
    }
  python: |
    def compare_monitor_urls(a, b):
        pass
vectors:
  - name: host-and-fragments
    args: ["HTTPS://QA.EXAMPLE.test/ping#badge","https://qa.example.test/ping"]
    expected: true
  - name: different-target
    args: ["https://qa.example.test/ping","https://other.example.test/ping"]
    expected: false
  - name: different-query-order
    args: ["https://qa.example.test/p?a=1&b=2","https://qa.example.test/p?b=2&a=1"]
    expected: false
  - name: non-default-port
    args: ["https://qa.example.test:444/p","https://qa.example.test/p"]
    expected: false
  - name: default-port-and-root
    args: ["https://QA.example.test:443","https://qa.example.test/"]
    expected: true
  - name: path-case
    args: ["https://qa.example.test/Cart","https://qa.example.test/cart"]
    expected: false
  - name: empty-query-marker
    args: ["http://qa.example.test:80?","http://qa.example.test/?"]
    expected: true
  - name: verbatim-percent-escapes
    args: ["https://qa.example.test/%2f","https://qa.example.test/%2F"]
    expected: false
solutions:
  js: |
    export function compareMonitorUrls(a, b) {
      const normalize = (url) => {
        const [withoutFragment] = url.split('#', 1);
        const originEnd = withoutFragment.indexOf('://');
        const scheme = withoutFragment.slice(0, originEnd).toLowerCase();
        const rest = withoutFragment.slice(originEnd + 3);
        const boundary = rest.search(/[/?]/);
        const authority = (boundary < 0 ? rest : rest.slice(0, boundary)).toLowerCase();
        const [host, port] = authority.split(':');
        const keptPort = port === (scheme === 'https' ? '443' : '80') ? undefined : port;
        const suffix = boundary < 0 ? '' : rest.slice(boundary);
        const pathAndQuery = suffix.startsWith('/') ? suffix : '/' + suffix;
        return scheme + '://' + host + (keptPort ? ':' + keptPort : '') + pathAndQuery;
      };
      return normalize(a) === normalize(b);
    }
  ts: |
    export function compareMonitorUrls(a: string, b: string) {
      const normalize = (url: string): string => {
        const [withoutFragment] = url.split('#', 1);
        const originEnd = withoutFragment.indexOf('://');
        const scheme = withoutFragment.slice(0, originEnd).toLowerCase();
        const rest = withoutFragment.slice(originEnd + 3);
        const boundary = rest.search(/[/?]/);
        const authority = (boundary < 0 ? rest : rest.slice(0, boundary)).toLowerCase();
        const [host, port] = authority.split(':');
        const keptPort = port === (scheme === 'https' ? '443' : '80') ? undefined : port;
        const suffix = boundary < 0 ? '' : rest.slice(boundary);
        const pathAndQuery = suffix.startsWith('/') ? suffix : '/' + suffix;
        return scheme + '://' + host + (keptPort ? ':' + keptPort : '') + pathAndQuery;
      };
      return normalize(a) === normalize(b);
    }
  python: |
    def compare_monitor_urls(a, b):
        def normalize(url):
            clean = url.split("#", 1)[0]
            scheme, rest = clean.split("://", 1)
            scheme = scheme.lower()
            boundary = min(rest.find(char) if char in rest else len(rest) for char in "/?")
            host, sep, port = rest[:boundary].lower().partition(":")
            if port == ("443" if scheme == "https" else "80"):
                sep, port = "", ""
            suffix = rest[boundary:]
            if not suffix.startswith("/"):
                suffix = "/" + suffix
            return scheme, host, sep, port, suffix
        return normalize(a) == normalize(b)
reference:
  language: js
  source: |
    export function compareMonitorUrls(a, b) {
      const normalize = (url) => {
        const [withoutFragment] = url.split('#', 1);
        const originEnd = withoutFragment.indexOf('://');
        const scheme = withoutFragment.slice(0, originEnd).toLowerCase();
        const rest = withoutFragment.slice(originEnd + 3);
        const boundary = rest.search(/[/?]/);
        const authority = (boundary < 0 ? rest : rest.slice(0, boundary)).toLowerCase();
        const [host, port] = authority.split(':');
        const keptPort = port === (scheme === 'https' ? '443' : '80') ? undefined : port;
        const suffix = boundary < 0 ? '' : rest.slice(boundary);
        const pathAndQuery = suffix.startsWith('/') ? suffix : '/' + suffix;
        return scheme + '://' + host + (keptPort ? ':' + keptPort : '') + pathAndQuery;
      };
      return normalize(a) === normalize(b);
    }
decoy:
  language: js
  source: |
    export function compareMonitorUrls(a, b) {
      const normalize = (url) => url.split('#', 1)[0].toLowerCase();
      return normalize(a) === normalize(b);
    }
---

A synthetic monitor runs a test to check a service. Here it compares web addresses using only the rules below. Each input is a valid absolute HTTP or HTTPS URL, so it includes the scheme and hostname. The scheme says which protocol the address uses. The hostname is an ASCII name, such as `qa.example.test`, in the Domain Name System (DNS).

A URL may have a port, the number for the connection, with no leading zeroes. It may have a path starting with `/`, a query starting with `?`, or a fragment starting with `#`. No input contains credentials, such as a username or password. No input contains whitespace, such as spaces or tabs.

Ignore ASCII letter case in the scheme and hostname. Treat HTTP port 80 and HTTPS port 443 as if they were missing. Compare other ports as written. If a path is missing, use `/`. Ignore the first `#` and everything after it.

Compare the remaining path and query exactly as written. Keep an empty query marker `?`, percent escapes such as `%20`, slash placement, and the order of query parameters. Return a boolean, `true` for a match and `false` otherwise. The test inputs never require you to follow redirects or decide if different queries reach the same resource.

For example, `compareMonitorUrls("HTTPS://QA.EXAMPLE.test/ping#badge", "https://qa.example.test/ping")` returns `true`. Leave the inputs unchanged.
