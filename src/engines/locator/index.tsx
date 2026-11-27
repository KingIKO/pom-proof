import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import ResultPanel from '../../components/shell/ResultPanel';
import type { GradeResult, Problem } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import { compileLocator, locatorSyntaxLabel, resolveLocator } from '../../runners/locator-expression';
import { fixtureHtml, fixtureSrcDoc } from './fixtures';
import { grade } from './grade';
import './locator.css';

function Fixture({ fixture, title, source, syntax, live }: {
  fixture: string; title: string; source: string; syntax?: Problem<'locator'>['syntax']; live?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState<Document>();
  const [preview, setPreview] = useState('');
  const html = useMemo(() => loaded ? fixtureHtml(loaded) : null, [loaded]);
  function readFrame() {
    const doc = frame.current?.contentDocument;
    if (doc?.URL === 'about:srcdoc' && doc.body && doc.readyState === 'complete') setLoaded(doc);
  }
  useEffect(readFrame, []);
  useEffect(() => {
    if (!loaded || !source.trim()) { setPreview(''); return; }
    const highlights: Animation[] = [];
    try {
      const elements = resolveLocator(loaded, compileLocator({ by: 'expression', source }, syntax));
      setPreview(`${elements.length} ${elements.length === 1 ? 'match' : 'matches'}`);
      const color = getComputedStyle(frame.current!).getPropertyValue('--accent');
      for (const element of elements) {
        const animation = element.animate([{ outline: `2px solid ${color}`, outlineOffset: '2px' }], { duration: 1, fill: 'both' });
        animation.finish();
        highlights.push(animation);
      }
    } catch (error) {
      setPreview(error instanceof Error ? error.message : 'Unable to read the locator');
    }
    return () => highlights.forEach((highlight) => highlight.cancel());
  }, [loaded, source, syntax]);

  return <section class="locator-fixture-card" aria-label={title} data-card>
    <figure>
      <figcaption>{live ? <h3>{title}</h3> : title}</figcaption>
      <iframe
        ref={frame}
        class="locator-fixture"
        title={title}
        tabIndex={-1}
        aria-hidden="true"
        sandbox="allow-same-origin"
        srcDoc={fixtureSrcDoc(fixture, true)}
        onLoad={readFrame}
      />
    </figure>
    {live && <p class="muted" role="status">{preview || (!source.trim() ? 'Enter a locator to see matches.' : '')}</p>}
    {html !== null && <details>
      <summary>Show fixture HTML</summary>
      <pre><code>{html}</code></pre>
    </details>}
  </section>;
}

export default function Locator({ problem }: { problem: Problem<'locator'> }) {
  const [source, setSource] = useState('');
  const [submitted, setSubmitted] = useState<string>();
  const [result, setResult] = useState<GradeResult<'locator'> | null>(null);
  const [busy, setBusy] = useState(false);
  useGradeHook(problem, grade);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = await grade(problem, { kind: 'locator', value: { by: 'expression', source } });
      setSubmitted(source);
      setResult(outcome);
      recordResult(problem.id, outcome);
    } finally {
      setBusy(false);
    }
  }

  const details = result?.status === 'graded' ? result.details : undefined;
  const misses = details?.fixtures.filter(({ matchedTarget }) => !matchedTarget).map(({ name, matches }) =>
    `Breaks on ${name}: matched ${matches} ${matches === 1 ? 'element' : 'elements'}.`);

  return <div class="locator-workspace">
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <div class="locator-field" data-card>
        <label for="locator-expression">Locator expression</label>
        <input id="locator-expression" class="input code-font" type="text" value={source}
          aria-describedby="locator-formats" spellcheck={false} autoComplete="off" autoCapitalize="off"
          onInput={(event) => setSource(event.currentTarget.value)} />
        <p class="muted" id="locator-formats">{problem.syntax
          ? <>Use {locatorSyntaxLabel[problem.syntax]}{problem.syntax === 'xpath' && <>, such as <code>xpath=//button</code></>}.</>
          : <>Use CSS, XPath, or a Playwright-style locator such as <code>page.getByRole('button')</code>.</>}
        </p>
      </div>
      <div class="engine-actions">
        <button class="button primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Submit'}</button>
      </div>
    </form>
    <ResultPanel result={result} busy={busy} misses={misses} />
    {details?.warnings.map((warning) => <p class="locator-warning" key={warning}>Warning: {warning}</p>)}
    <Fixture title="Original fixture" fixture={problem.fixture} source={source} syntax={problem.syntax} live />
    {submitted !== undefined && <section aria-labelledby="locator-variants">
      <h3 id="locator-variants">Fixture variants</h3>
      <div class="locator-variants-grid">
        {problem.variants.map(({ name, fixture }) =>
          <Fixture key={name} title={name} fixture={fixture} source={submitted} syntax={problem.syntax} />)}
      </div>
    </section>}
  </div>;
}
