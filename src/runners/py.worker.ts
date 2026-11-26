/// <reference lib="webworker" />
/* Python runner. Pyodide loads from jsDelivr the first time a Python problem runs. */

const PYODIDE_VERSION = '314.0.8';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface Pyodide {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { set: (k: string, v: unknown) => void };
}

let ready: Promise<Pyodide> | null = null;

function load(): Promise<Pyodide> {
  if (!ready) {
    ready = (async () => {
      const mod = (await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)) as { loadPyodide: (o: { indexURL: string }) => Promise<Pyodide> };
      return mod.loadPyodide({ indexURL: INDEX_URL });
    })();
  }
  return ready;
}

const HARNESS = `
import json, sys, io, copy, traceback
def __pp_norm(v):
    if isinstance(v, (set, frozenset)):
        return sorted([__pp_norm(x) for x in v], key=lambda x: json.dumps(x, sort_keys=True))
    if isinstance(v, tuple):
        return [__pp_norm(x) for x in v]
    if isinstance(v, list):
        return [__pp_norm(x) for x in v]
    if isinstance(v, dict):
        return {str(k): __pp_norm(x) for k, x in v.items()}
    return v

def __pp_run(code, fn_name, cases_json):
    ns = {}
    try:
        exec(code, ns)
    except Exception as e:
        return json.dumps({"compileError": "".join(traceback.format_exception_only(type(e), e)).strip()})
    fn = ns.get(fn_name)
    if not callable(fn):
        return json.dumps({"compileError": "Could not find a function named " + fn_name + ". Keep the given function name."})
    out = []
    for c in json.loads(cases_json):
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        try:
            actual = fn(*copy.deepcopy(c["args"]))
            out.append({"ok": True, "actual": json.dumps(__pp_norm(actual)), "logs": buf.getvalue()})
        except Exception as e:
            out.append({"ok": False, "error": "".join(traceback.format_exception_only(type(e), e)).strip(), "logs": buf.getvalue()})
        finally:
            sys.stdout = old
    return json.dumps({"results": out})
`;

let harnessLoaded = false;

self.onmessage = async (e: MessageEvent<{ id: number; code: string; fn: string; cases: unknown[] }>) => {
  const { id, code, fn, cases } = e.data;
  try {
    self.postMessage({ id, status: 'loading' });
    const py = await load();
    if (!harnessLoaded) {
      await py.runPythonAsync(HARNESS);
      harnessLoaded = true;
    }
    py.globals.set('__ec_code', code);
    py.globals.set('__ec_fn', fn);
    py.globals.set('__ec_cases', JSON.stringify(cases));
    const raw = (await py.runPythonAsync('__pp_run(__ec_code, __ec_fn, __ec_cases)')) as string;
    self.postMessage({ id, ok: true, result: JSON.parse(raw) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, ok: false, error: msg.includes('Failed to fetch') ? 'Could not download the Python runtime. Check your connection and try again.' : msg });
  }
};
