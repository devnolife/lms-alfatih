/* FunPython — Python runtime Web Worker (classic worker).
 *
 * Loads Pyodide from the CDN and runs student code, streaming stdout/stderr
 * back to the main thread. Ships a lightweight `turtle` shim that records
 * drawing commands (line segments) so the editor can render real visual output
 * on an HTML canvas — CPython's Tkinter-based turtle is not available in WASM.
 *
 * Runs are serialized (single-flight queue) so shared stdin/stdout/turtle state
 * can never interleave between concurrent runs.
 *
 * Message protocol (main -> worker):
 *   { type: "init" }
 *   { type: "run", id, code, stdin }
 * Message protocol (worker -> main):
 *   { type: "status", status: "loading" | "ready" }
 *   { type: "exec", id }              // emitted right before user code runs
 *   { type: "stdout", id, text }
 *   { type: "stderr", id, text }
 *   { type: "done", id, ok, error, draw, hadTurtle }
 */

const PYODIDE_VERSION = "0.29.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReady = null;

// Python preamble: registers a canvas-backed `turtle` module + reset helper.
// All turtles (module-level functions AND Turtle() instances) append to a
// single shared command list so every drawing is captured.
const PREAMBLE = `
import sys, types, math, json

_CMDS = []


def _norm_color(*c):
    if len(c) == 1:
        v = c[0]
        if isinstance(v, (tuple, list)):
            return _norm_color(*v)
        return v
    if len(c) == 3:
        r, g, b = c
        if isinstance(r, float) or isinstance(g, float) or isinstance(b, float):
            r, g, b = int(r * 255), int(g * 255), int(b * 255)
        return "rgb(%d,%d,%d)" % (r, g, b)
    return "black"


class _FunTurtle:
    def __init__(self, *args, **kwargs):
        self.x = 0.0
        self.y = 0.0
        self.angle = 0.0  # degrees, 0 = east, counter-clockwise positive
        self.pen = True
        self.pen_color = "black"
        self.pen_width = 2

    def _line_to(self, nx, ny):
        if self.pen:
            _CMDS.append({
                "op": "line",
                "x1": self.x, "y1": self.y,
                "x2": nx, "y2": ny,
                "color": self.pen_color,
                "width": self.pen_width,
            })
        self.x, self.y = nx, ny

    def forward(self, dist):
        nx = self.x + dist * math.cos(math.radians(self.angle))
        ny = self.y + dist * math.sin(math.radians(self.angle))
        self._line_to(nx, ny)

    def backward(self, dist):
        self.forward(-dist)

    def right(self, ang):
        self.angle -= ang

    def left(self, ang):
        self.angle += ang

    def setheading(self, ang):
        self.angle = ang

    def goto(self, x, y=None):
        if y is None:
            try:
                x, y = x
            except TypeError:
                raise TypeError("goto() butuh dua angka: goto(x, y)")
        self._line_to(float(x), float(y))

    def penup(self):
        self.pen = False

    def pendown(self):
        self.pen = True

    def pencolor(self, *c):
        if c:
            self.pen_color = _norm_color(*c)
        return self.pen_color

    def color(self, *c):
        if c:
            self.pen_color = _norm_color(*c)
        return self.pen_color

    def pensize(self, w=None):
        if w is not None:
            self.pen_width = w
        return self.pen_width

    def width(self, w=None):
        return self.pensize(w)

    def dot(self, size=None, *c):
        size = size or max(self.pen_width + 4, 6)
        col = _norm_color(*c) if c else self.pen_color
        _CMDS.append({"op": "dot", "x": self.x, "y": self.y, "r": size / 2, "color": col})

    def circle(self, radius, extent=360, steps=None):
        if steps is None:
            steps = max(8, int(abs(extent) / 6))
        frac = extent / steps
        for _ in range(steps):
            self.forward(2 * radius * math.sin(math.radians(frac / 2)))
            self.left(frac)

    def home(self):
        self.goto(0, 0)
        self.angle = 0.0

    # No-ops so typical scripts don't crash.
    def speed(self, *a, **k):
        pass

    def hideturtle(self, *a, **k):
        pass

    def showturtle(self, *a, **k):
        pass

    # Aliases
    fd = forward
    bk = backward
    back = backward
    rt = right
    lt = left
    seth = setheading
    pu = penup
    up = penup
    pd = pendown
    down = pendown
    ht = hideturtle
    st = showturtle


_active = _FunTurtle()


def __funpython_reset_turtle__():
    global _active
    _CMDS.clear()
    _active = _FunTurtle()


def __funpython_get_cmds__():
    return json.dumps(_CMDS)


def _build_turtle_module():
    mod = types.ModuleType("turtle")

    def _bind(name):
        def fn(*args, **kwargs):
            return getattr(_active, name)(*args, **kwargs)
        fn.__name__ = name
        return fn

    for _name in [
        "forward", "fd", "backward", "bk", "back", "right", "rt", "left", "lt",
        "setheading", "seth", "goto", "penup", "pu", "up", "pendown", "pd", "down",
        "pencolor", "color", "pensize", "width", "dot", "circle", "home", "speed",
        "hideturtle", "showturtle", "ht", "st",
    ]:
        setattr(mod, _name, _bind(_name))

    class _Screen:
        def bgcolor(self, *a, **k):
            pass

        def setup(self, *a, **k):
            pass

        def tracer(self, *a, **k):
            pass

        def update(self, *a, **k):
            pass

        def exitonclick(self, *a, **k):
            pass

    mod.Turtle = _FunTurtle
    mod.Pen = _FunTurtle
    mod.Screen = lambda *a, **k: _Screen()
    mod.done = lambda *a, **k: None
    mod.mainloop = lambda *a, **k: None
    mod.bye = lambda *a, **k: None
    return mod


def __funpython_register_turtle__():
    sys.modules["turtle"] = _build_turtle_module()


__funpython_register_turtle__()
`;

async function ensurePyodide() {
  if (pyodideReady) return pyodideReady;

  pyodideReady = (async () => {
    postMessage({ type: "status", status: "loading" });
    importScripts(`${PYODIDE_BASE}pyodide.js`);
    const pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
    await pyodide.runPythonAsync(PREAMBLE);
    postMessage({ type: "status", status: "ready" });
    return pyodide;
  })();

  return pyodideReady;
}

async function runCode(id, code, stdin) {
  let pyodide;
  try {
    pyodide = await ensurePyodide();
  } catch {
    pyodideReady = null; // allow a retry on next run
    postMessage({
      type: "done",
      id,
      ok: false,
      error: "Gagal memuat mesin Python. Cek koneksi internet lalu coba lagi.",
      draw: [],
      hadTurtle: false,
    });
    return;
  }

  // Signal the main thread that actual execution is starting so it can begin
  // the (short) execution watchdog rather than the (long) boot timeout.
  postMessage({ type: "exec", id });

  pyodide.setStdout({ batched: (text) => postMessage({ type: "stdout", id, text }) });
  pyodide.setStderr({ batched: (text) => postMessage({ type: "stderr", id, text }) });

  const lines = (stdin ?? "").length ? String(stdin).split("\n") : [];
  let idx = 0;
  pyodide.setStdin({
    // Returning null signals EOF (raises EOFError) when input is exhausted.
    stdin: () => (idx < lines.length ? lines[idx++] : null),
  });

  let ok = true;
  let error = null;
  let draw = [];
  let hadTurtle = false;

  try {
    // Restore a clean turtle module each run so user code can't corrupt it.
    pyodide.runPython("__funpython_register_turtle__()");
    pyodide.runPython("__funpython_reset_turtle__()");
    await pyodide.runPythonAsync(code);
    const raw = pyodide.runPython("__funpython_get_cmds__()");
    draw = JSON.parse(raw || "[]");
    hadTurtle = draw.length > 0;
  } catch (err) {
    ok = false;
    error = String(err && err.message ? err.message : err);
  }

  postMessage({ type: "done", id, ok, error, draw, hadTurtle });
}

// Serialize runs: only one executes at a time.
let chain = Promise.resolve();

self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === "init") {
    ensurePyodide();
  } else if (data.type === "run") {
    chain = chain.then(() => runCode(data.id, data.code ?? "", data.stdin ?? ""));
  }
};
