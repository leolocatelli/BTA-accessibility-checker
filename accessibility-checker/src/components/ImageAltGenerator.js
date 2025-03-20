"use client"; // ✅ Ensure it's a client component
import { useState } from "react";
import { Loader2, XCircle, AlertTriangle, Clipboard, CheckCircle } from "lucide-react";

const altCache = {}; // 🔹 Cache to avoid redundant API calls
const BASE_URL = "https://bta.scene7.com/is/image/brownthomas/"; // 🔹 Base URL for partial inputs

export default function ImageAltGenerator() {
  const [imageUrls, setImageUrls] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null); // ✅ Track copied text
  const CHARACTER_LIMIT = 150; 

  const handleUrlInput = (e) => {
    const rawInputs = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    const processedUrls = rawInputs.map((url) =>
      url.startsWith("http://") || url.startsWith("https://") ? url : `${BASE_URL}${url}`
    );

    const duplicates = processedUrls.filter((url) => imageUrls.includes(url));
    setWarning(duplicates.length > 0 ? "Some images were already added and were skipped." : "");
    
    setImageUrls([...new Set([...imageUrls, ...processedUrls])]);
  };

  const removeImage = (urlToRemove) => {
    setImageUrls((prevUrls) => prevUrls.filter((url) => url !== urlToRemove));
  };

  const generateAltTexts = async () => {
    if (imageUrls.length === 0) return;
    setLoading(true);
    setAltResults([]);
    setError("");

    const newResults = [];

    try {
      for (const url of imageUrls) {
        if (altCache[url]) {
          newResults.push({ url, altText: altCache[url] });
          continue;
        }

        const response = await fetch("/api/generate-alt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, charLimit: CHARACTER_LIMIT }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);

        const data = await response.json();
        if (data.altText) {
          altCache[url] = data.altText;
          newResults.push({ url, altText: data.altText });
        }
      }

      setAltResults(newResults);
    } catch (error) {
      console.error("❌ Error generating ALT texts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (index, altText) => {
    navigator.clipboard.writeText(altText);
    setCopiedIndex(index); // ✅ Set copied state

    // ⏳ Reset after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
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

      {imageUrls.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group flex items-center justify-center">
                <div className="relative w-full h-32 md:h-36 flex items-center justify-center bg-gray-200 rounded-md border overflow-hidden">
                  <img src={url} alt="Uploaded Preview" className="w-auto max-h-full object-contain rounded-md" />
                </div>
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-gray-700/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-900"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={generateAltTexts} disabled={loading}>
        {loading ? "Generating..." : "Generate ALT Texts"}
      </button>

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}

      {altResults.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated ALT Texts</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {altResults.map((result, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow flex flex-col items-center">
                <div className="relative w-full h-40 flex items-center justify-center rounded-md overflow-hidden">
                  <img src={result.url} alt="Preview" className="w-auto max-h-full object-contain rounded-md" />
                </div>

                <p className="text-gray-700 text-sm text-center mt-3">{result.altText}</p>

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
