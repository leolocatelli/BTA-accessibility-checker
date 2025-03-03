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
    <div className="p-6 mt-10 max-w-3xl mx-auto bg-white rounded-lg">
      {/* <h2 className="text-2xl font-bold text-center mb-4">🖼️ Image ALT Generator</h2> */}

      {/* Input Field */}
      <div className="flex flex-col gap-4">
        <textarea
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Paste image URLs here (one per line)"
          onChange={handleUrlInput}
        />

        <button
          className="w-full px-4 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center"
          onClick={generateAltTexts}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate ALT Texts"}
        </button>
      </div>

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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
