import { PYODIDE_INDEX_URL } from '../lib/run-worker';
import type { CodeReply } from './code-evaluate';
import { pythonName, type PythonCommand, type PythonMessage } from './python-contract';

type Evaluate = (request: string) => string | null | undefined;
type LoadPyodide = (options: { indexURL: string; jsglobals: object }) =>
  Promise<{ runPython(source: string): unknown }>;

const grader = String.raw`
import copy
from io import StringIO
from json import JSONDecoder, JSONEncoder, dumps, loads
import sys
from traceback import extract_tb, format_exception_only

class RunnerStateChanged(Exception):
    pass

def watch_runner_state():
    modules = sys.modules
    watched = {name: modules[name] for name in (
        "builtins", "copy", "io", "_io", "json", "json.decoder", "json.encoder",
        "json.scanner", "_json", "sys", "traceback",
    )}
    namespaces = [vars(module) for module in watched.values()]
    namespaces.extend((vars(JSONDecoder), vars(JSONEncoder), copy._deepcopy_dispatch))
    bindings = [(attrs, dict(attrs)) for attrs in namespaces]
    count, every = len, all
    missing = object()

    def require_clean():
        if (sys.modules is not modules
            or not every(modules.get(name) is module for name, module in watched.items())
            or not every(count(attrs) == count(before) and every(
                attrs.get(key, missing) is value for key, value in before.items()
            ) for attrs, before in bindings)):
            raise RunnerStateChanged

    return require_clean

def same_value(actual, expected, *, json_numbers=False):
    if type(actual) is not type(expected):
        return (json_numbers and type(actual) in (int, float)
                and type(expected) in (int, float) and actual == expected)
    if type(actual) is list:
        return len(actual) == len(expected) and all(
            same_value(a, e, json_numbers=json_numbers) for a, e in zip(actual, expected)
        )
    if type(actual) is dict:
        return actual.keys() == expected.keys() and all(
            same_value(actual[k], expected[k], json_numbers=json_numbers) for k in expected
        )
    return actual == expected

def grade_submission(payload):
    request = loads(payload, cls=JSONDecoder)
    before = None if request.get("allowInputMutation") else loads(payload, cls=JSONDecoder)["vectors"]
    source = request["source"]
    lines = source.splitlines()
    filename = "<solution>"
    require_clean = watch_runner_state()
    get_attr = getattr

    def call_user(output, action, args, original=None):
        stdout, stderr = sys.stdout, sys.stderr
        sys.stdout = sys.stderr = output
        try:
            return action(*args)
        finally:
            changed = get_attr(sys, "stdout", None) is not output or get_attr(sys, "stderr", None) is not output
            sys.stdout, sys.stderr = stdout, stderr
            require_clean()
            if changed:
                raise RunnerStateChanged
            if original is not None and not same_value(args, original):
                raise ValueError("Your function changed its input. The problem asks you to leave it unchanged.")

    def encode(reply):
        require_clean()
        return dumps(reply, allow_nan=False, cls=JSONEncoder)

    def show_error(error):
        frames = [frame for frame in extract_tb(error.__traceback__)
                  if frame.filename == filename]
        summary = "".join(format_exception_only(type(error), error)).strip()
        if not frames:
            return summary
        stack = []
        for frame in frames:
            stack.append(f'  File "{filename}", line {frame.lineno}, in {frame.name}')
            if 0 < frame.lineno <= len(lines):
                stack.append("    " + lines[frame.lineno - 1].strip())
        return "\n".join(["Traceback (most recent call last):", *stack, summary])

    namespace = {"__name__": "__main__"}
    name = request["exportName"]
    try:
        call_user(StringIO(), exec, (compile(source, filename, "exec"), namespace))
        solve = namespace.get(name)
        if not callable(solve):
            return encode({"error": f"Define a function named {name}."})
    except RunnerStateChanged:
        raise
    except BaseException as error:
        return encode({"error": show_error(error)})

    checks = []
    for index, vector in enumerate(request["vectors"]):
        visible = vector["visible"]
        check = {"visible": visible, "passed": False}
        output = StringIO()
        args = vector["args"]
        try:
            returned = call_user(output, solve, args, None if before is None else before[index]["args"])
            try:
                actual = loads(dumps(returned, allow_nan=False, cls=JSONEncoder), cls=JSONDecoder)
            except (TypeError, ValueError, OverflowError, RecursionError):
                raise ValueError("The function did not return a JSON value.") from None
            finally:
                require_clean()
            check["passed"] = same_value(actual, vector["expected"], json_numbers=True)
            if visible:
                check["actual"] = actual
        except RunnerStateChanged:
            raise
        except BaseException as error:
            if visible:
                check["error"] = show_error(error)
        if visible:
            check["logs"] = output.getvalue().splitlines()
        checks.append(check)
    return encode({"checks": checks})

def grade(payload):
    try:
        return grade_submission(payload)
    except RunnerStateChanged:
        return None

grade
`;

let evaluate: Evaluate | undefined;

function reply(message: PythonMessage) {
  self.postMessage(message);
}

self.addEventListener('message', async ({ data }: MessageEvent<PythonCommand>) => {
  if (data.type === 'load') {
    try {
      const url = `${PYODIDE_INDEX_URL}pyodide.mjs`;
      const { loadPyodide } = await import(/* @vite-ignore */ url) as { loadPyodide: LoadPyodide };
      const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL, jsglobals: {} });
      const candidate = pyodide.runPython(grader);
      if (typeof candidate !== 'function') throw new Error('Unable to start the Python grader.');
      evaluate = candidate as Evaluate;
      reply({ type: 'ready' });
    } catch {
      reply({ type: 'load-error' });
    }
    return;
  }

  try {
    if (!evaluate) throw new Error('Python has not loaded.');
    const request = { ...data.request, exportName: pythonName(data.request.exportName) };
    const encoded = evaluate(JSON.stringify(request));
    if (encoded == null) {
      reply({ type: 'run-error', message: 'Your solution changed the Python setup used to run the checks. Remove that change and try again.' });
      return;
    }
    const result = JSON.parse(encoded) as CodeReply;
    reply({ type: 'result', reply: result });
  } catch {
    reply({ type: 'run-error', message: 'Unable to run the Python checks.' });
  }
});
