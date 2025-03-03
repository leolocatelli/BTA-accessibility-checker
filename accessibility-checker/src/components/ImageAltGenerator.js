import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ImageAltGenerator() {
  const [imageUrls, setImageUrls] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUrlInput = (e) => {
    const urls = e.target.value.split("\n").map((url) => url.trim()).filter((url) => url);
    setImageUrls(urls);
  };

  const generateAltTexts = async () => {
    if (imageUrls.length === 0) return;

    setLoading(true);
    setAltResults([]);

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
      setAltResults(data.results || []);
    } catch (error) {
      console.error("❌ Error generating ALT texts:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🖼️ Image ALT Generator</h2>

        <textarea
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Paste image URLs here (one per line)"
          onChange={handleUrlInput}
        />

        <button
          className="mt-4 w-full px-4 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          onClick={generateAltTexts}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : "Generate ALT Texts"}
        </button>
      </div>

      {altResults.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Generated ALT Texts:</h3>
          <ul className="mt-4 space-y-6">
            {altResults.map((result, index) => (
              <li key={index} className="p-5 bg-gray-50 rounded-lg shadow-md flex flex-col items-center">
                <img src={result.url} alt="Preview" className="w-40 h-40 object-cover rounded-md border shadow-md mb-3" />
                <p className="text-gray-700 text-sm"><strong>Description:</strong> {result.altText}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
