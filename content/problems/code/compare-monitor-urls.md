---
title: "Compare monitoring target URLs"
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

A synthetic monitor compares addresses using a small fixture rule. Each input is a valid absolute HTTP or HTTPS URL in this subset: ASCII DNS hostname, optional port without leading zeroes, no credentials, optional path beginning with `/`, optional query, and optional fragment. Inputs contain no whitespace.

Compare scheme and hostname without regard to ASCII case. Treat HTTP port 80 and HTTPS port 443 as omitted. An absent path is `/`. Ignore everything from the first `#` onward. Compare the remaining path and query verbatim, including an empty query marker `?`, percent escapes, slash placement, and parameter order. Return a boolean. The fixture never asks you to resolve redirects or decide whether two different query strings reach the same resource.

`compareMonitorUrls("HTTPS://QA.EXAMPLE.test/ping#badge", "https://qa.example.test/ping")` returns `true`. Leave the inputs unchanged.
