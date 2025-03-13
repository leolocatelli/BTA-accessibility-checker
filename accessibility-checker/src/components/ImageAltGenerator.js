<<<<<<< HEAD
import { useState } from "react";
=======
"use client"; // ✅ Mark as a client component
import { useState } from "react";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";

const altCache = {}; // 🔹 Cache to avoid redundant API calls
const BASE_URL = "https://bta.scene7.com/is/image/brownthomas/"; // 🔹 Base URL for partial inputs
>>>>>>> alt-generator-gpt

export default function ImageAltGenerator() {
  const [imageUrls, setImageUrls] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState("");

  const handleUrlInput = (e) => {
    const urls = e.target.value.split("\n").map((url) => url.trim()).filter((url) => url);
    setImageUrls(urls);
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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results) {
        setAltResults(data.results);
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (error) {
      console.error("❌ Error generating ALT texts:", error);
      setError(error.message);
    }

=======
  const [warning, setWarning] = useState(""); // 🔹 Warning for duplicate images
  const CHARACTER_LIMIT = 150; // 🔹 Max ALT text length

  // Handle URL Input (Prevents Duplicates & Auto-Formats Partial Inputs)
  const handleUrlInput = (e) => {
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
      setWarning("⚠️ Some images were already added and were skipped."); // Show warning message
    } else {
      setWarning(""); // Clear warning if no duplicates
    }

    // 🔹 Add only unique URLs
    const uniqueUrls = [...new Set([...imageUrls, ...processedUrls])];
    setImageUrls(uniqueUrls);
  };

  // 🔹 Remove Image from the List
  const removeImage = (urlToRemove) => {
    setImageUrls((prevUrls) => prevUrls.filter((url) => url !== urlToRemove));
  };

  // Generate ALT Texts (Uses Cache)
  const generateAltTexts = async () => {
    if (imageUrls.length === 0) return;
    setLoading(true);
    setAltResults([]);

    const newResults = [];

    for (const url of imageUrls) {
      if (altCache[url]) {
        newResults.push({ url, altText: altCache[url] }); // 🔹 Use cache if available
        continue;
      }

      try {
        const response = await fetch("/api/generate-alt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, charLimit: CHARACTER_LIMIT }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.altText) {
          altCache[url] = data.altText; // 🔹 Store in cache
          newResults.push({ url, altText: data.altText });
        }
      } catch (error) {
        console.error("❌ Error generating ALT texts:", error);
      }
    }

    setAltResults(newResults);
>>>>>>> alt-generator-gpt
    setLoading(false);
  };

  return (
<<<<<<< HEAD
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">🖼️ Image ALT Generator</h2>

      {/* Input de URLs */}
      <textarea
        rows="4"
        className="w-full p-2 border rounded"
        placeholder="Paste image URLs here (one per line)"
        onChange={handleUrlInput}
      />

      {/* Botão para gerar ALT */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={generateAltTexts}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate ALT Texts"}
      </button>

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
=======
    <div className="p-6 max-w-3xl mx-auto">
      {/* URL Input */}
      <textarea
        rows="3"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
        placeholder="Paste image URLs or image codes here (one per line)"
        onChange={handleUrlInput}
      />

      {/* Duplicate Warning Message */}
      {warning && (
        <div className="mt-2 text-sm text-yellow-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {warning}
        </div>
      )}

      {/* Uploaded Image Previews */}
      {imageUrls.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
          <div className="flex flex-wrap gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt="Uploaded Preview" className="w-auto h-32 object-cover rounded-md border shadow" />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-0 right-0 bg-gray-700/40 text-white rounded-full p-1 hover:bg-gray-900/50"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        className="mt-4 w-full px-4 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center"
        onClick={generateAltTexts}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate ALT Texts"}
      </button>

      {/* Results Section */}
      {altResults.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated ALT Texts</h3>
          <ul className="space-y-6">
            {altResults.map((result, index) => (
              <li key={index} className="p-4 bg-white rounded-lg shadow flex flex-col items-center">
                <img
                  src={result.url}
                  alt="Preview"
                  className="w-36 h-36 object-cover rounded-md border shadow-md mb-3"
                />
                <p className="text-gray-700 text-sm text-center">{result.altText}</p>
>>>>>>> alt-generator-gpt
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
