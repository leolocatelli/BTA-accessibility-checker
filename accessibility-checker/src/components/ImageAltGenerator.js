<<<<<<< HEAD
import { useState } from "react";
=======
"use client"; // ✅ Ensure it's a client component
import { useState } from "react";
import { Loader2, XCircle, AlertTriangle, Clipboard } from "lucide-react";

const altCache = {}; // 🔹 Cache to avoid redundant API calls
const BASE_URL = "https://bta.scene7.com/is/image/brownthomas/"; // 🔹 Base URL for partial inputs
>>>>>>> alt-generator-gpt

export default function ImageAltGenerator() {
  const [imageUrls, setImageUrls] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState("");
=======
  const [warning, setWarning] = useState("");
  const CHARACTER_LIMIT = 150; // 🔹 Max ALT text length
>>>>>>> alt-generator-gpt

  const handleUrlInput = (e) => {
<<<<<<< HEAD
    const urls = e.target.value.split("\n").map((url) => url.trim()).filter((url) => url);
    setImageUrls(urls);
=======
    const rawInputs = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    const processedUrls = rawInputs.map((url) =>
      url.startsWith("http://") || url.startsWith("https://") ? url : `${BASE_URL}${url}`
    );

    // 🔹 Find duplicates
    const duplicates = processedUrls.filter((url) => imageUrls.includes(url));

    if (duplicates.length > 0) {
      setWarning("Some images were already added and were skipped.");
    } else {
      setWarning("");
    }

    // 🔹 Add only unique URLs
    const uniqueUrls = [...new Set([...imageUrls, ...processedUrls])];
    setImageUrls(uniqueUrls);
>>>>>>> alt-generator-gpt
  };

  const generateAltTexts = async () => {
    if (imageUrls.length === 0) return;

    setLoading(true);
    setAltResults([]);
    setError("");

    try {
      const response = await fetch("/api/generate-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls }),
      });

<<<<<<< HEAD
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
=======
    for (const url of imageUrls) {
      if (altCache[url]) {
        newResults.push({ url, altText: altCache[url] });
        continue;
>>>>>>> alt-generator-gpt
      }

      const data = await response.json();

<<<<<<< HEAD
      if (data.results) {
        setAltResults(data.results);
      } else {
        throw new Error("Invalid response from API");
=======
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.altText) {
          altCache[url] = data.altText;
          newResults.push({ url, altText: data.altText });
        }
      } catch (error) {
        console.error("❌ Error generating ALT texts:", error);
>>>>>>> alt-generator-gpt
      }
    } catch (error) {
      console.error("❌ Error generating ALT texts:", error);
      setError(error.message);
    }

    setLoading(false);
  };

  return (
<<<<<<< HEAD
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">🖼️ Image ALT Generator</h2>

      {/* Input de URLs */}
=======
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      {/* ✅ URL Input */}
>>>>>>> alt-generator-gpt
      <textarea
        rows="4"
        className="w-full p-2 border rounded"
        placeholder="Paste image URLs here (one per line)"
        onChange={handleUrlInput}
      />

<<<<<<< HEAD
      {/* Botão para gerar ALT */}
=======
      {/* ⚠️ Warning Message */}
      {warning && (
        <div className="mt-2 text-sm text-yellow-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" /> {warning}
        </div>
      )}

      {/* ✅ Uploaded Image Previews */}
      {imageUrls.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group flex items-center justify-center">
                <div className="relative w-full h-32 md:h-36 flex items-center justify-center bg-gray-200 rounded-md border overflow-hidden">
                  <img
                    src={url}
                    alt="Uploaded Preview"
                    className="w-auto max-h-full object-contain rounded-md"
                  />
                </div>

                {/* ✅ Close (X) Button - Correctly Positioned */}
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

      {/* ✅ Generate Button */}
>>>>>>> alt-generator-gpt
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={generateAltTexts}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate ALT Texts"}
      </button>

<<<<<<< HEAD
      {/* Exibir erro caso ocorra */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* Exibir Resultados */}
      {altResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Generated ALT Texts:</h3>
          <ul className="mt-2 space-y-4">
            {altResults.map((result, index) => (
              <li key={index} className="p-4 bg-gray-100 rounded-lg shadow">
                <img src={result.url} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                <p><strong>Basic:</strong> {result.altBasic}</p>
                <p><strong>Formal:</strong> {result.altFormal}</p>
                <p><strong>Ideal (WCAG):</strong> {result.altIdeal}</p>
              </li>
=======
      {/* ✅ Results Section */}
      {altResults.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated ALT Texts</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {altResults.map((result, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow flex flex-col items-center">
                <div className="relative w-full h-40 flex items-center justify-center rounded-md  overflow-hidden">
                  <img
                    src={result.url}
                    alt="Preview"
                    className="w-auto max-h-full object-contain rounded-md"
                  />
                </div>

                {/* ✅ ALT Text */}
                <p className="text-gray-700 text-sm text-center mt-3">{result.altText}</p>

                {/* ✅ Copy to Clipboard Button */}
                <button
                  className="mt-2 flex items-center gap-2 text-blue-600 text-xs border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-100 transition"
                  onClick={() => navigator.clipboard.writeText(result.altText)}
                >
                  <Clipboard className="w-4 h-4" /> Copy ALT Text
                </button>
              </div>
>>>>>>> alt-generator-gpt
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
