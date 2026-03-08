// accessibility-checker/src/pages/unified-checker.js

import { useState } from "react";

export default function UnifiedCheckerPage() {
  const [url, setUrl] = useState("");
  const [checks, setChecks] = useState({
    images: true,
    wcag: true,
    aria: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleToggle = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    setChecks({ images: true, wcag: true, aria: true });
  };

  const handleRun = async () => {
    setError("");
    setResult(null);

    if (!url) {
      setError("Please enter a URL to analyze.");
      return;
    }

    if (!checks.images && !checks.wcag && !checks.aria) {
      setError("Select at least one check.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, checks }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch (e) {
      console.error(e);
      setError("Request failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Unified Accessibility Checker</h1>

      {/* URL input */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="url" style={{ display: "block", marginBottom: 4 }}>
          URL to analyze
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Checks */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={checks.images}
            onChange={() => handleToggle("images")}
          />{" "}
          Images ALT &amp; Size
        </label>
        <label>
          <input
            type="checkbox"
            checked={checks.wcag}
            onChange={() => handleToggle("wcag")}
          />{" "}
          WCAG Violations
        </label>
        <label>
          <input
            type="checkbox"
            checked={checks.aria}
            onChange={() => handleToggle("aria")}
          />{" "}
          ARIA Tab Inspector
        </label>
        <button
          type="button"
          onClick={handleSelectAll}
          style={{
            padding: "0.3rem 0.8rem",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          Select all
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: 6,
            background: "#ffe5e5",
            color: "#8a0000",
          }}
        >
          {error}
        </div>
      )}

      {/* Run button */}
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        style={{
          padding: "0.6rem 1.4rem",
          borderRadius: 999,
          border: "none",
          background: loading ? "#999" : "#111827",
          color: "#fff",
          cursor: loading ? "default" : "pointer",
          marginBottom: "1.5rem",
        }}
      >
        {loading ? "Running analysis..." : "Run analysis"}
      </button>

      {/* Result */}
      {result && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Results for: {result.url}</h2>

          {/* Images */}
          {checks.images && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Images ALT &amp; Size</h3>
              {!result.images && <p>No image data found.</p>}
              {Array.isArray(result.images) && result.images.length > 0 && (
                <ul>
                  {result.images.map((img, idx) => (
                    <li key={idx} style={{ marginBottom: "0.5rem" }}>
                      <code>{img.src}</code>
                      <br />
                      ALT:{" "}
                      <strong>{img.alt || "<empty alt or missing>"}</strong>
                      {img.width && img.height && (
                        <>
                          <br />
                          Size: {img.width} x {img.height}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* WCAG */}
          {checks.wcag && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3>WCAG Violations</h3>
              {result.wcag?.score != null && (
                <p>
                  Score: <strong>{result.wcag.score}</strong> / 100
                </p>
              )}
              {Array.isArray(result.wcag?.violations) &&
              result.wcag.violations.length > 0 ? (
                <ul>
                  {result.wcag.violations.map((v, idx) => (
                    <li key={idx} style={{ marginBottom: "0.75rem" }}>
                      <strong>{v.id || v.rule || "Violation"}</strong>{" "}
                      {v.impact && <>({v.impact})</>}
                      <br />
                      <span>{v.description || v.help || ""}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No violations returned.</p>
              )}
            </div>
          )}

          {/* ARIA */}
          {checks.aria && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3>ARIA Tab Inspector</h3>
              {Array.isArray(result.aria?.focusOrder) &&
              result.aria.focusOrder.length > 0 ? (
                <ol>
                  {result.aria.focusOrder.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "0.75rem" }}>
                      <strong>{item.accessibleName || "(no name)"}</strong>
                      {item.role && <> – role: {item.role}</>}
                      {item.tag && <> – tag: {item.tag}</>}
                      {item.selector && (
                        <>
                          <br />
                          <code>{item.selector}</code>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No ARIA focus data found.</p>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
