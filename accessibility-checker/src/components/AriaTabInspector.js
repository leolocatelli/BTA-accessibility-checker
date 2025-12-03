"use client";
import { useEffect, useRef, useState } from "react";

export default function AriaTabInspector() {
  const [mode, setMode] = useState("url"); // "url" | "html"
  const [url, setUrl] = useState("");
  const [htmlInput, setHtmlInput] = useState("");
  const [snapshotUrl, setSnapshotUrl] = useState(""); // URL original da página (base href)
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

  // iframe
  const iframeRef = useRef(null);
  const [iframeLocked, setIframeLocked] = useState(true); // iframe não clicável por padrão

  // linha expandida
  const [expandedId, setExpandedId] = useState(null);

  // ---- helpers para a tabela ----
  const displayTagOf = (f) =>
    f?.role === "link" || f?.tag === "a" ? "link" : (f?.role || f?.tag || "");

  const isNoName = (f) =>
    !f?.accessibleName || !String(f.accessibleName).trim();

  const isSuspicious = (f) => {
    const n = String(f?.accessibleName || "").trim().toLowerCase();
    if (!n) return false; // noName já cobre
    return n === "click here" || n === "learn more" || n.length <= 2;
  };

  const severityOf = (f) =>
    isNoName(f) ? "danger" : isSuspicious(f) ? "warning" : "normal";

  // ---- API ----
  async function handleAnalyze(e) {
    e?.preventDefault?.();
    setError("");

    if (mode === "url") {
      if (!/^https?:\/\//i.test(url)) {
        setError("Please enter a valid URL starting with http or https.");
        return;
      }
    } else {
      if (!htmlInput.trim()) {
        setError("Please paste the full HTML snapshot before analyzing.");
        return;
      }
      if (snapshotUrl.trim() && !/^https?:\/\//i.test(snapshotUrl.trim())) {
        setError("Original page URL (optional) must start with http or https.");
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setExpandedId(null);

    try {
      const body = { mode, scope, includeDialogs };

      if (mode === "url") {
        body.url = url;
      } else {
        body.html = htmlInput;
        if (snapshotUrl.trim()) {
          // usamos como base href no backend
          body.url = snapshotUrl.trim();
        }
      }

      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // se não for JSON, data fica null
      }

      if (!res.ok) {
        const msg = data?.error || `API error: ${res.status}`;
        throw new Error(msg);
      }

      if (data?.errorType === "cloudflare_blocked") {
        setError(
          data.message ||
            "This URL is protected by Cloudflare and cannot be analyzed directly. Use the HTML snapshot mode."
        );
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setError("");
    setExpandedId(null);
  }

  // ---- Highlight no iframe ao passar o mouse / clicar na lista ----
  function highlightInIframe(a11yId, on = true, doScroll = false) {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    doc.querySelectorAll(".a11y-hover").forEach((el) => {
      el.classList.remove("a11y-hover");
    });

    const el = doc.querySelector(`[data-a11y-id="${a11yId}"]`);
    if (!el) return;

    if (on) el.classList.add("a11y-hover");
    if (doScroll) {
      try {
        el.scrollIntoView({
          block: "center",
          inline: "center",
          behavior: "smooth",
        });
      } catch {}
    }
  }

  // ---- Ajuste automático da altura do iframe ----
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
        const doc = iframe.contentDocument;
        if (!doc) return;
        const ro = new ResizeObserver(measure);
        ro.observe(doc.documentElement);
        ro.observe(doc.body);
        iframe._ro = ro;
      } catch {}
      setTimeout(measure, 400);
      setTimeout(measure, 1200);
    };

    iframe.addEventListener("load", onLoad);
    setTimeout(measure, 200);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (iframe._ro) {
        try {
          iframe._ro.disconnect();
        } catch {}
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
      {/* Card principal */}
      <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
        {/* Header + toggle de modo */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              ARIA &amp; Tab Order Inspector
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Inspect focusable elements, accessible names and tab order.
            </p>
          </div>

          {/* Toggle modo URL / HTML snapshot */}
          <div className="inline-flex items-center rounded-full border bg-gray-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={[
                "px-3 py-1 rounded-full transition",
                mode === "url"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
              disabled={loading}
            >
              By URL
            </button>
            <button
              type="button"
              onClick={() => setMode("html")}
              className={[
                "px-3 py-1 rounded-full transition",
                mode === "html"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
              disabled={loading}
            >
              HTML snapshot
            </button>
          </div>
        </div>

        {/* Top controls */}
        <form onSubmit={handleAnalyze} className="mb-4 flex flex-col gap-3">
          {/* Modo URL */}
          {mode === "url" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="url"
                  placeholder="https://www.example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full md:flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Analyzing…" : "Analyze"}
                </button>
                {result && (
                  <button
                    type="button"
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Use this mode for{" "}
                <span className="font-semibold">public pages</span>. If you see a
                blank / Cloudflare &quot;I&apos;m not a robot&quot; page in the
                preview, switch to{" "}
                <span className="font-semibold">HTML snapshot</span> mode.
              </p>
            </>
          )}

          {/* Modo HTML snapshot */}
          {mode === "html" && (
            <>
              <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <p className="font-semibold mb-1">How to get an HTML snapshot:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>
                    Open the page in your browser and pass any Cloudflare /
                    &quot;I&apos;m not a robot&quot; checks.
                  </li>
                  <li>
                    Open DevTools, select the{" "}
                    <code className="bg-white px-1 rounded">&lt;html&gt;</code>{" "}
                    element and choose{" "}
                    <span className="font-medium">
                      &quot;Copy &gt; Copy outerHTML&quot;
                    </span>
                    .
                  </li>
                  <li>Paste the full HTML below and click Analyze.</li>
                </ol>
              </div>

              <textarea
                placeholder="Paste the full HTML of the page here..."
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="w-full min-h-[160px] rounded-lg border px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              <div className="flex flex-col gap-2">
                {/* URL original opcional */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-700">
                    Original page URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://staging.brownthomas.com/..."
                    value={snapshotUrl}
                    onChange={(e) => setSnapshotUrl(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <p className="text-[11px] text-gray-500">
                    Used only to resolve relative CSS, images and links in the
                    preview. The inspector will not navigate to this URL.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Analyzing…" : "Analyze snapshot"}
                  </button>
                  {result && (
                    <button
                      type="button"
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      onClick={handleClear}
                      disabled={loading}
                    >
                      Clear
                    </button>
                  )}
                  <span className="text-[11px] text-gray-500">
                    Snapshot mode is ideal for staging / Cloudflare-protected
                    pages.
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Scope + Zoom + Clicks */}
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="scope"
                  value="main"
                  checked={scope === "main"}
                  onChange={() => setScope("main")}
                  disabled={loading}
                />
                <span>Main only (recommended)</span>
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
                <span>Full page</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeDialogs}
                  onChange={(e) => setIncludeDialogs(e.target.checked)}
                  disabled={loading}
                />
                <span>Include dialogs</span>
              </label>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-500">Zoom:</span>
              <select
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="rounded-md border px-2 py-1 text-sm"
                disabled={loading}
              >
                <option value={0.35}>35%</option>
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={0.9}>90%</option>
                <option value={1}>100%</option>
              </select>

              <label className="ml-3 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!iframeLocked}
                  onChange={(e) => setIframeLocked(!e.target.checked)}
                  disabled={loading}
                />
                <span>Enable clicks</span>
              </label>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Viewer */}
        <div className="rounded-xl border bg-white">
          {!result ? (
            <div className="p-6 text-sm text-gray-500">
              {mode === "url" ? (
                <>
                  Paste a URL and click <b>Analyze</b> to see the overlay here.
                  If the page is protected by Cloudflare, switch to{" "}
                  <b>HTML snapshot</b> mode.
                </>
              ) : (
                <>
                  Paste the HTML snapshot and click{" "}
                  <b>Analyze snapshot</b> to see the overlay here.
                </>
              )}
            </div>
          ) : (
            <div className="relative overflow-visible">
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
                  sandbox="allow-same-origin"
                  srcDoc={result.html}
                  className="w-full bg-white"
                  style={{
                    border: 0,
                    height: `${frameHeight}px`,
                    pointerEvents: iframeLocked ? "none" : "auto",
                  }}
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
        className={`${
          undocked ? "fixed" : "absolute right-0 top-0"
        } z-50 w-[360px] max-h-[85vh] overflow-hidden rounded-xl border bg-white shadow-lg`}
        style={undocked ? { left: pos.x, top: pos.y } : {}}
      >
        <div
          className="cursor-move select-none bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between"
          onMouseDown={undocked ? startDrag : undefined}
          title={undocked ? "Drag to move" : ""}
        >
          Focusable elements
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 pr-2">
              <i className="inline-block h-2 w-2 rounded-full bg-red-600" /> no
              name
            </span>
            <button
              className="ml-auto text-xs rounded-md border px-2 py-1 hover:bg-gray-100"
              onClick={() => setUndocked((v) => !v)}
            >
              {undocked ? "Dock" : "Undock"}
            </button>
          </div>
        </div>

        <div className="px-3 py-2 text-xs text-gray-600 border-b">
          {result?.summary ? (
            <div className="flex flex-wrap gap-3">
              <span>
                Total: <b>{result.summary.total}</b>
              </span>
              <span>
                No name:{" "}
                <b className="text-red-600">{result.summary.noName}</b>
              </span>
              {/* <span>Suspicious: <b className="text-amber-600">{result.summary.suspicious}</b></span> */}
            </div>
          ) : (
            <span>No data yet.</span>
          )}
        </div>

        <div className="max-h-[70vh] overflow-auto divide-y">
          {result?.focusables?.map((f, idx) => {
            const sev = severityOf(f); // danger | warning | normal
            const isExpanded = expandedId === f.id;

            // zebra base (par = branco, ímpar = cinza-claro)
            const zebra = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

            // cor final da linha (severidade > zebra)
            const rowBg =
              sev === "danger"
                ? "bg-red-50/70"
                : sev === "warning"
                ? "bg-amber-50/70"
                : zebra;

            const rowBorder =
              sev === "danger"
                ? "border-l-4 border-red-600"
                : sev === "warning"
                ? "border-l-4 border-amber-500"
                : "border-l-4 border-transparent";

            return (
              <div
                key={f.id}
                className={[
                  "px-3 py-2 cursor-pointer transition-colors",
                  "hover:bg-gray-100",
                  rowBg,
                  rowBorder,
                  "text-base",
                ].join(" ")}
                onMouseEnter={() => highlightInIframe(f.id, true)}
                onMouseLeave={() => highlightInIframe(f.id, false)}
                onClick={() => {
                  setExpandedId((prev) => (prev === f.id ? null : f.id));
                  highlightInIframe(f.id, true, true);
                }}
                title={`Order ${f.order}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {f.order}. {displayTagOf(f)}
                  </span>

                  <div className="flex items-center gap-2">
                    {sev === "danger" && (
                      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-red-100 text-red-700">
                        no name
                      </span>
                    )}
                    {sev === "warning" && (
                      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700">
                        suspicious
                      </span>
                    )}
                    <span className="text-[12px] text-gray-600">
                      tabIndex: {f.tabIndex}
                    </span>
                  </div>
                </div>

                {!isExpanded ? (
                  <div className="text-gray-900 truncate">
                    {f.accessibleName || "⚠ No accessible name"}
                  </div>
                ) : (
                  <div className="mt-1 whitespace-pre-wrap break-words text-gray-900">
                    {f.accessibleName || "⚠ No accessible name"}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-2 text-[12px] text-gray-600">
                    {f.role ? (
                      <>
                        role:{" "}
                        <code className="text-gray-800">{f.role}</code>
                      </>
                    ) : null}
                    {f.tag ? (
                      <>
                        {" "}
                        • tag:{" "}
                        <code className="text-gray-800">{f.tag}</code>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
