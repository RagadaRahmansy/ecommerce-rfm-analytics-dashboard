/**
 * PyEngine — menjalankan Python + pandas di browser memakai Pyodide (WebAssembly).
 * Runtime dimuat secara lazy (hanya saat user membuka soal Python) karena ukurannya ±10 MB.
 */
window.PyEngine = (() => {
  const PYODIDE_VERSION = '0.26.4';
  const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

  const HARNESS = `
import sys, io, json, math, traceback
import pandas as pd
import numpy as np

USER_FILE = '<kode-kamu>'

def _dd_run(setup, code, post):
    ns = {'__name__': '__main__'}
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    error = None
    try:
        exec(compile(setup, '<setup>', 'exec'), ns)
        exec(compile(code, USER_FILE, 'exec'), ns)
        if post:
            exec(compile(post, '<test>', 'exec'), ns)
    except Exception as exc:
        line = None
        for frame in traceback.extract_tb(exc.__traceback__):
            if frame.filename == USER_FILE:
                line = frame.lineno
        if isinstance(exc, SyntaxError) and exc.filename == USER_FILE:
            line = exc.lineno
        prefix = f'Baris {line}: ' if line else ''
        error = prefix + ''.join(traceback.format_exception_only(type(exc), exc)).strip()
    finally:
        sys.stdout = old_stdout
    return ns, buf.getvalue(), error

def _dd_render(obj):
    if isinstance(obj, pd.Series):
        obj = obj.to_frame()
    if isinstance(obj, pd.DataFrame):
        return {'type': 'html', 'html': obj.head(50).to_html(classes='df-table', border=0), 'shape': list(obj.shape)}
    if obj is None:
        return {'type': 'none'}
    return {'type': 'text', 'text': repr(obj)}

def _dd_norm(x, keep_index):
    if isinstance(x, pd.Series):
        x = x.to_frame()
    if isinstance(x, pd.DataFrame):
        x = x.copy()
        x = x.reset_index() if keep_index else x.reset_index(drop=True)
        x.columns = [str(c) for c in x.columns]
    return x

def _dd_equal(a, b):
    if isinstance(b, pd.DataFrame):
        if not isinstance(a, pd.DataFrame):
            return False, f'Tipe hasil berbeda: diharapkan DataFrame, hasilmu {type(a).__name__}.'
        if a.shape != b.shape:
            return False, f'Ukuran berbeda: hasilmu {a.shape[0]} baris × {a.shape[1]} kolom, seharusnya {b.shape[0]} baris × {b.shape[1]} kolom.'
        missing = set(b.columns) - set(a.columns)
        if missing:
            return False, f'Kolom yang diharapkan tidak ditemukan: {sorted(missing)}.'
        try:
            pd.testing.assert_frame_equal(a, b, check_dtype=False, check_like=True,
                                          check_exact=False, rtol=1e-3, check_names=False)
            return True, ''
        except AssertionError as exc:
            msg = ' '.join(str(exc).split())
            return False, 'Isi DataFrame berbeda (cek nilai & urutan baris): ' + msg[:260]
    if isinstance(b, (float, int, np.number)) and not isinstance(b, bool):
        try:
            if isinstance(b, float) and math.isnan(b):
                return (isinstance(a, float) and math.isnan(a)), 'Nilai berbeda.'
            ok = math.isclose(float(a), float(b), rel_tol=1e-3, abs_tol=1e-6)
            return ok, '' if ok else f'Nilai berbeda: hasilmu {a!r}, seharusnya {b!r}.'
        except (TypeError, ValueError):
            return False, f'Tipe berbeda: hasilmu {type(a).__name__}, seharusnya angka.'
    if isinstance(b, (list, tuple)):
        if not isinstance(a, (list, tuple)) or len(a) != len(b):
            return False, f'Hasil berbeda: hasilmu {a!r}, seharusnya {b!r}.'
        for i, (x, y) in enumerate(zip(a, b)):
            ok, _ = _dd_equal(x, y)
            if not ok:
                return False, f'Elemen ke-{i + 1} berbeda: hasilmu {x!r}, seharusnya {y!r}.'
        return True, ''
    if isinstance(b, dict):
        if not isinstance(a, dict) or set(a.keys()) != set(b.keys()):
            return False, f'Key dictionary berbeda: hasilmu {a!r}, seharusnya {b!r}.'
        for k in b:
            ok, _ = _dd_equal(a[k], b[k])
            if not ok:
                return False, f'Nilai untuk key {k!r} berbeda.'
        return True, ''
    ok = a == b
    return bool(ok), '' if ok else f'Hasil berbeda: hasilmu {a!r}, seharusnya {b!r}.'

def dd_execute(setup, code, post):
    ns, out, err = _dd_run(setup, code, post)
    has_result = 'result' in ns and not err
    payload = {'stdout': out, 'error': err, 'has_result': has_result,
               'result': _dd_render(ns.get('result')) if has_result else {'type': 'none'}}
    return json.dumps(payload)

def dd_check(setup, code, solution, post, keep_index):
    ns, out, err = _dd_run(setup, code, post)
    payload = {'stdout': out, 'error': err, 'passed': False, 'reason': '', 'result': {'type': 'none'}, 'expected': {'type': 'none'}}
    if err:
        payload['reason'] = 'Kode kamu menghasilkan error.'
        return json.dumps(payload)
    if 'result' not in ns:
        payload['reason'] = 'Variabel result tidak ditemukan. Simpan jawabanmu ke variabel bernama result.'
        return json.dumps(payload)
    sol_ns, _, sol_err = _dd_run(setup, solution, post)
    if sol_err:
        payload['reason'] = 'Terjadi kesalahan internal pada kunci jawaban: ' + sol_err
        return json.dumps(payload)
    user_res, expected = ns['result'], sol_ns['result']
    payload['result'] = _dd_render(user_res)
    payload['expected'] = _dd_render(expected)
    passed, reason = _dd_equal(_dd_norm(user_res, keep_index), _dd_norm(expected, keep_index))
    payload['passed'] = bool(passed)
    payload['reason'] = reason
    return json.dumps(payload)
`;

  let runtimePromise = null;

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error('Gagal mengunduh Pyodide. Periksa koneksi internet.'));
      document.head.appendChild(el);
    });
  }

  /** @param {(msg: string) => void} onStatus callback progres loading */
  function load(onStatus = () => {}) {
    if (!runtimePromise) {
      runtimePromise = (async () => {
        onStatus('Mengunduh Python runtime (sekali saja, ±10 MB)…');
        if (typeof window.loadPyodide !== 'function') await injectScript(PYODIDE_URL + 'pyodide.js');
        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_URL });
        onStatus('Memasang pandas & numpy…');
        await pyodide.loadPackage(['pandas']);
        await pyodide.runPythonAsync(HARNESS);
        onStatus('Python siap 🚀');
        return pyodide;
      })();
      runtimePromise.catch(() => { runtimePromise = null; });
    }
    return runtimePromise;
  }

  function isReady() {
    return Boolean(runtimePromise);
  }

  async function execute(challenge, code) {
    const py = await load();
    const fn = py.globals.get('dd_execute');
    try {
      return JSON.parse(fn(challenge.setup, code, challenge.post || ''));
    } finally {
      fn.destroy();
    }
  }

  async function check(challenge, code) {
    const py = await load();
    const fn = py.globals.get('dd_check');
    try {
      return JSON.parse(fn(challenge.setup, code, challenge.solution, challenge.post || '', Boolean(challenge.keepIndex)));
    } finally {
      fn.destroy();
    }
  }

  return { load, isReady, execute, check };
})();
