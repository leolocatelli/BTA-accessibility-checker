import { useState } from "react";

export default function ImageAltGenerator() {
  const [imageUrls, setImageUrls] = useState([]);
  const [altResults, setAltResults] = useState([]);
  const [loading, setLoading] = useState(false);
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

    setLoading(false);
  };

  return (
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
