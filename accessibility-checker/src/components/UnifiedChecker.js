"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

import ImageAltReview from "./ImageAltReview";
import PerformanceSummary from "./PerformanceSummary";
import ViolationsList from "./ViolationsList";
import AriaTabInspector from "./AriaTabInspector";

export default function UnifiedChecker() {
  const [url, setUrl] = useState("");
  const [checks, setChecks] = useState({
    images: true,
    wcag: true,
    aria: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // States necessários para ImageAltReview
  const [checkedImages, setCheckedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSizes, setImageSizes] = useState({});

  const toggle = (key) =>
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  // 🔹 Remove tracking pixels / data images
  const filteredImages = useMemo(() => {
    const imgs = Array.isArray(data?.images) ? data.images : [];
    return imgs.filter((img) => {
      const src = img?.src || "";
      const isDataImage = src.startsWith("data:image");
      const isTrackingPixel = src.includes("R0lGODlhAQAB");
      return !isDataImage && !isTrackingPixel;
    });
  }, [data]);

  const loadTime =
    data?.performance?.loadTime ??
    data?.wcag?.loadTime ??
    data?.loadTime ??
    data?.fullLoadTime ??
    null;

  const runAudit = async () => {
    setError("");
    setData(null);

    if (!url.trim()) {
      setError("Please enter a valid URL.");
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
        body: JSON.stringify({ url: url.trim(), checks }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Audit failed.");
      } else {
        setData(json);
        console.log("AUDIT RESPONSE:", json);
      }
    } catch (err) {
      console.error(err);
      setError("Request failed. Check console/network logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Unified Checker (Beta)
        </h2>
        <p className="text-gray-600 mt-1">
          Run Images + WCAG + ARIA focus order in one place.
        </p>
      </div>

      {/* URL input */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-gray-700">
          URL to analyze
        </label>
        <input
          className="mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* Checks */}
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={checks.images}
            onChange={() => toggle("images")}
          />
          Images ALT &amp; Size
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={checks.wcag}
            onChange={() => toggle("wcag")}
          />
          WCAG Violations
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={checks.aria}
            onChange={() => toggle("aria")}
          />
          ARIA Tab Inspector
        </label>

        <button
          type="button"
          onClick={() => setChecks({ images: true, wcag: true, aria: true })}
          className="ml-auto text-xs font-semibold px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          Select all
        </button>
      </div>

      {/* Run button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={runAudit}
          className="px-4 py-2 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </span>
          ) : (
            "Run analysis"
          )}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {data && (
        <div className="mt-6 space-y-6">
          {/* Images */}
          {checks.images && (
            <section className="rounded-md border p-4">
              <h3 className="font-bold text-gray-800 mb-2">
                Images ALT &amp; Size
              </h3>

              {filteredImages.length > 0 ? (
                <>
                  <PerformanceSummary
                    images={filteredImages}
                    imageSizes={imageSizes}
                    loadTime={loadTime ?? "—"}
                  />

                  <ImageAltReview
                    images={filteredImages}
                    checkedImages={checkedImages}
                    setCheckedImages={setCheckedImages}
                    setSelectedImage={setSelectedImage}
                    setImageSizes={setImageSizes}
                  />
                </>
              ) : (
                <p className="text-sm text-gray-600">No image data returned.</p>
              )}
            </section>
          )}

          {/* WCAG */}
          {checks.wcag && (
            <section className="rounded-md border p-4">
              <h3 className="font-bold text-gray-800 mb-2">
                WCAG Violations
              </h3>

              {data?.wcag?.score != null && (
                <p className="text-sm text-gray-700">
                  Score:{" "}
                  <span className="font-bold">{data.wcag.score}</span>/100
                </p>
              )}

              {Array.isArray(data?.wcag?.violations) &&
              data.wcag.violations.length > 0 ? (
                <div className="mt-4">
                  <ViolationsList violations={data.wcag.violations} />
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  No violations returned.
                </p>
              )}
            </section>
          )}

          {/* ARIA — FULL INSPECTOR */}
          {checks.aria && (
            <section className="rounded-md border p-4">
              <AriaTabInspector />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
