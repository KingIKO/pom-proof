const preferenceKey = 'pom-proof:example-lang';

function readPreference() {
  try {
    return localStorage.getItem(preferenceKey);
  } catch {
    return undefined;
  }
}

export function setupCodeExamples() {
  const examples = [...document.querySelectorAll<HTMLElement>('[data-code-example]')].flatMap((figure) => {
    const first = figure.querySelector<HTMLPreElement>('pre[data-example-code]');
    const label = figure.querySelector<HTMLElement>('figcaption [data-example-label]');
    const status = figure.querySelector<HTMLElement>('[data-example-status]');
    const copy = figure.querySelector<HTMLButtonElement>('[data-example-copy]');
    if (!first || !label || !status || !copy) return [];

    const group = figure.querySelector<HTMLElement>('[data-example-languages]');
    const buttons = [...figure.querySelectorAll<HTMLButtonElement>('[data-example-lang]')];
    const variants = new Map<string, HTMLPreElement>();
    for (const template of figure.querySelectorAll('template')) {
      const code = template.content.querySelector<HTMLPreElement>('pre[data-example-code]');
      if (code?.dataset.exampleCode) variants.set(code.dataset.exampleCode, code);
    }

    let current = first;
    const select = (lang: string | null) => {
      const source = variants.get(lang ?? '') ?? first;
      if (source.dataset.exampleCode === current.dataset.exampleCode) return;
      const next = source === first ? first : source.cloneNode(true) as HTMLPreElement;
      const focused = document.activeElement === current;
      current.replaceWith(next);
      current = next;
      label.textContent = next.dataset.exampleCodeLabel ?? '';
      status.textContent = '';
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.exampleLang === next.dataset.exampleCode));
      }
      if (focused) next.focus({ preventScroll: true });
    };

    copy.addEventListener('click', async () => {
      const shown = current;
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(shown.querySelector('code')?.textContent ?? '');
        if (current === shown) status.textContent = 'Copied';
      } catch {
        if (current === shown) status.textContent = 'Could not copy; select the code to copy it.';
      }
    });
    copy.hidden = false;
    if (group) group.hidden = false;
    return [{ buttons, select }];
  });

  const apply = (lang: string | null | undefined) => {
    if (lang !== undefined) for (const example of examples) example.select(lang);
  };

  for (const { buttons } of examples) {
    for (const button of buttons) {
      button.addEventListener('click', () => {
        const lang = button.dataset.exampleLang;
        if (!lang) return;
        const top = button.getBoundingClientRect().top;
        apply(lang);
        const delta = button.getBoundingClientRect().top - top;
        if (delta) window.scrollBy({ top: delta, behavior: 'instant' });
        try {
          localStorage.setItem(preferenceKey, lang);
        } catch {
          // The selection remains active on this page.
        }
      });
    }
  }

  apply(readPreference());
  window.addEventListener('storage', (event) => {
    if (event.key === preferenceKey || event.key === null) apply(readPreference());
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) apply(readPreference());
  });
}
