"use client";
import { useEffect, useRef, useState } from "react";

export default function AriaTabInspector() {
  const [url, setUrl] = useState("");
  const [scope, setScope] = useState("main"); // "main" | "full"
  const [includeDialogs, setIncludeDialogs] = useState(false);
  const [zoom, setZoom] = useState(0.9); // 0.35 | 0.5 | 0.75 | 0.9 | 1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { html, focusables, summary }
  const [frameHeight, setFrameHeight] = useState(1200);

  // floating panel
  const [undocked, setUndocked] = useState(true);
  const [pos, setPos] = useState({ x: 24, y: 120 });
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const iframeRef = useRef(null);

  // ---- API ----
  async function handleAnalyze(e) {
    e?.preventDefault?.();
    setError("");

    if (!/^https?:\/\//i.test(url)) {
      setError("Please enter a valid URL starting with http or https");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scope, includeDialogs }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setError("");
  }

  // ---- Highlight no iframe ao passar o mouse na lista ----
  function highlightInIframe(a11yId, on = true) {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    // remove highlights antigos
    doc.querySelectorAll(".a11y-hover").forEach((el) => el.classList.remove("a11y-hover"));

    if (on) {
      const el = doc.querySelector(`[data-a11y-id="${a11yId}"]`);
      if (el) {
        el.classList.add("a11y-hover");
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }

  // ---- Ajuste automático da altura do iframe (altura total do documento) ----
  useEffect(() => {
    if (!result) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const measure = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0
      );
      setFrameHeight(h > 0 ? h : 1200);
    };

    const onLoad = () => {
      measure();
      try {
        const win = iframe.contentWindow;
        if (!win) return;
        const ro = new win.ResizeObserver(measure);
        ro.observe(docEl(doc));
        ro.observe(docBody(doc));
        iframe._ro = ro;
      } catch {}
      setTimeout(measure, 400);
      setTimeout(measure, 1200);
    };

    const docEl = (d) => d.documentElement;
    const docBody = (d) => d.body;

    iframe.addEventListener("load", onLoad);
    // mede também se o srcDoc já veio carregado
    setTimeout(measure, 200);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (iframe._ro) {
        try { iframe._ro.disconnect(); } catch {}
        iframe._ro = null;
      }
    };
  }, [result, zoom]);

  // ---- Drag da janela flutuante ----
  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      setPos({
        x: Math.max(12, e.clientX - offset.current.x),
        y: Math.max(12, e.clientY - offset.current.y),
      });
    }
    function onUp() {
      dragging.current = false;
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function startDrag(e) {
    if (!dragRef.current) return;
    dragging.current = true;
    const rect = dragRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    document.body.style.userSelect = "none";
  }

  return (
    <div className="relative">
      {/* Card estilo Contrast */}
      <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
        {/* Top controls */}
        <form onSubmit={handleAnalyze} className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="url"
            placeholder="https://www.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full md:flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          {result && (
            <button
              type="button"
              className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          )}
        </form>

        {/* Scope + Zoom */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                value="main"
                checked={scope === "main"}
                onChange={() => setScope("main")}
                disabled={loading}
              />
              Main only (recommended)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                value="full"
                checked={scope === "full"}
                onChange={() => setScope("full")}
                disabled={loading}
              />
              Full page
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDialogs}
                onChange={(e) => setIncludeDialogs(e.target.checked)}
                disabled={loading}
              />
              Include dialogs
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-500">Zoom:</span>
            <select
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="rounded-md border px-2 py-1"
              disabled={loading}
            >
              <option value={0.35}>35%</option>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={0.9}>90%</option>
              <option value={1}>100%</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Viewer */}
        <div className="rounded-xl border bg-white">
          {!result ? (
            <div className="p-6 text-sm text-gray-500">
              Paste a URL and click <b>Analyze</b> to see the overlay here.
            </div>
          ) : (
            <div className="relative overflow-visible">
              {/* Wrapper para scale; largura controlada pelo zoom. Altura segue o conteúdo. */}
              <div
                className="origin-top-left"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  width: `${100 / zoom}%`,
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="ARIA & Tab Inspector Preview"
                  // sem scripts do site (já removidos); same-origin p/ medir altura
                  sandbox="allow-same-origin"
                  srcDoc={result.html}
                  className="w-full bg-white"
                  style={{ border: 0, height: `${frameHeight}px` }}
                />
              </div>

              {loading && (
                <div className="absolute inset-0 grid place-items-center bg-white/60 text-sm">
                  Analyzing…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Focusable elements panel (floating) */}
      <div
        ref={dragRef}
        className={`${undocked ? "fixed" : "absolute right-0 top-0"} z-50 w-[340px] max-h-[85vh] overflow-hidden rounded-xl border bg-white shadow-lg`}
        style={undocked ? { left: pos.x, top: pos.y } : {}}
      >
        <div
          className="cursor-move select-none bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between"
          onMouseDown={undocked ? startDrag : undefined}
          title={undocked ? "Drag to move" : ""}
        >
          Focusable elements
          <button
            className="text-xs rounded-md border px-2 py-1 hover:bg-gray-100"
            onClick={() => setUndocked((v) => !v)}
          >
            {undocked ? "Dock" : "Undock"}
          </button>
        </div>

        <div className="px-3 py-2 text-xs text-gray-600 border-b">
          {result?.summary ? (
            <div className="flex flex-wrap gap-3">
              <span>Total: <b>{result.summary.total}</b></span>
              <span>No name: <b>{result.summary.noName}</b></span>
              <span>Suspicious: <b>{result.summary.suspicious}</b></span>
            </div>
          ) : (
            <span>No data yet.</span>
          )}
        </div>

        <div className="max-h-[70vh] overflow-auto divide-y">
          {result?.focusables?.map((f) => (
            <div
              key={f.id}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              onMouseEnter={() => highlightInIframe(f.id, true)}
              onMouseLeave={() => highlightInIframe(f.id, false)}
              title={`Order ${f.order}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {f.order}. {f.role || f.tag}
                </span>
                <span className="text-xs text-gray-500">tabIndex: {f.tabIndex}</span>
              </div>
              <div
                className="text-gray-700 truncate"
                title={f.accessibleName || "⚠ No accessible name"}
              >
                {f.accessibleName || "⚠ No accessible name"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
