export function fixtureSrcDoc(fixture: string, inert = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'">
    <style>
      :root{color-scheme:light dark}
      body{font:1rem/1.55 system-ui,sans-serif;background:#faf8f2;color:#22221f;margin:.75rem}
      button,input,select,textarea{font:inherit}
      @media(prefers-color-scheme:dark){body{background:#1d1d1b;color:#f0eee6}}
    </style></head><body${inert ? ' inert' : ''}>${fixture}</body></html>`;
}

export function fixtureHtml(doc: Document) {
  const body = doc.body.cloneNode(true) as HTMLElement;
  for (const element of body.querySelectorAll('[data-fixture-target]')) {
    element.removeAttribute('data-fixture-target');
  }
  return body.innerHTML.trim();
}

export async function inFixture<T>(fixture: string, read: (doc: Document) => T): Promise<T> {
  const frame = document.createElement('iframe');
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.className = 'locator-fixture locator-measurement';
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.srcdoc = fixtureSrcDoc(fixture);
  try {
    await new Promise<void>((resolve) => {
      frame.addEventListener('load', () => resolve(), { once: true });
      document.body.append(frame);
    });
    if (!frame.contentDocument) throw new Error('Unable to read the fixture');
    return read(frame.contentDocument);
  } finally {
    frame.remove();
  }
}
