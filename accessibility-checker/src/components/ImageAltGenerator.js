"use client";
import { useState } from "react";
import {
  Loader2,
  XCircle,
  AlertTriangle,
  Clipboard,
  CheckCircle,
} from "lucide-react";

const altCache = {};
const BASE_URL = "https://bta.scene7.com/is/image/brownthomas/";

function convertGoogleDriveLink(url) {
  const match = url.match(/\/d\/([^/]+)\//);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}

export default function ImageAltGenerator() {
  const [imageInputs, setImageInputs] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const CHARACTER_LIMIT = 150;

  const handleUrlInput = (e) => {
    const rawInputs = e.target.value
      .split("\n")
      .map((url) => convertGoogleDriveLink(url.trim()))
      .filter((url) => url);

    const processedUrls = rawInputs.map((url) =>
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${BASE_URL}${url}`
    );

    const newInputs = processedUrls
      .filter((url) => !imageInputs.some((input) => input.url === url))
      .map((url) => ({ url, keyword: "" }));

    setWarning(
      newInputs.length < processedUrls.length
        ? "Some images were already added and were skipped."
        : ""
    );
    setImageInputs((prev) => [...prev, ...newInputs]);
  };

  const removeImage = (indexToRemove) => {
    setImageInputs((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const generateAltTexts = async () => {
    if (imageInputs.length === 0) return;
    setLoading(true);
    setAltResults([]);
    setError("");

    const newResults = [];

    try {
      for (const { url, keyword } of imageInputs) {
        const cacheKey = keyword ? `${url}|${keyword}` : url;

        if (altCache[cacheKey]) {
          newResults.push({ url, altText: altCache[cacheKey] });
          continue;
        }

        const response = await fetch("/api/generate-alt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: url,
            keyword,
            charLimit: CHARACTER_LIMIT,
          }),
        });

        if (!response.ok)
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );

        const data = await response.json();
        if (data.altText) {
          altCache[cacheKey] = data.altText;
          newResults.push({ url, altText: data.altText });
        }
      }

      setAltResults(newResults);
    } catch (error) {
      console.error("❌ Error generating ALT texts:", error);
      setError(
        "Unable to access some images. Please ensure the link is valid and the file is publicly shared."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (index, altText) => {
    navigator.clipboard.writeText(altText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <textarea
        rows="4"
        className="w-full p-2 border rounded"
        placeholder="Paste image URLs here (one per line)"
        onChange={handleUrlInput}
      />

      {warning && (
        <div className="mt-2 text-sm text-yellow-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" /> {warning}
        </div>
      )}

      {imageInputs.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageInputs.map((input, index) => (
              <div
                key={input.url}
                className="relative group flex flex-col items-center"
              >
                <div className="relative w-full h-32 md:h-36 flex items-center justify-center bg-gray-200 rounded-md border overflow-hidden">
                  {input.url.includes("drive.google.com") ? (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png"
                      alt="Google Drive File"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <img
                      src={input.url}
                      alt="Uploaded Preview"
                      className="w-auto max-h-full object-contain rounded-md"
                      onError={(e) => {
                        const fallback = e.currentTarget.parentNode;
                        fallback.innerHTML = `
        <div class="flex flex-col items-center justify-center text-gray-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856C18.07 20 20 18.07 20 15.938V8.063C20 5.93 18.07 4 15.938 4H8.063C5.93 4 4 5.93 4 8.063v7.875C4 18.07 5.93 20 8.063 20z" />
          </svg>
          <p>Image not available</p>
        </div>`;
                      }}
                    />
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Optional keyword..."
                  className="mt-2 p-1 border rounded w-full text-sm"
                  value={input.keyword}
                  onChange={(e) => {
                    const updated = [...imageInputs];
                    updated[index].keyword = e.target.value;
                    setImageInputs(updated);
                  }}
                />

                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-gray-700/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-900"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={generateAltTexts}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate ALT Texts"}
      </button>

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}

      {altResults.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Generated ALT Texts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {altResults.map((result, index) => (
              <div
                key={result.url}
                className="p-4 bg-white rounded-lg shadow flex flex-col items-center"
              >
                <div className="relative w-full h-40 flex items-center justify-center rounded-md overflow-hidden">
                  <img
                    src={
                      result.url.includes("drive.google.com")
                        ? "https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png"
                        : result.url
                    }
                    alt="Preview"
                    className="w-auto max-h-full object-contain rounded-md"
                  />
                </div>

                <p className="text-gray-700 text-sm text-center mt-3">
                  {result.altText}
                </p>

                <button
                  className="mt-2 flex items-center gap-2 text-blue-600 text-xs border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-100 transition"
                  onClick={() => handleCopy(index, result.altText)}
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4" /> Copy ALT Text
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
