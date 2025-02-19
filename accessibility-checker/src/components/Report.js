import React, { useState } from "react";

export default function Report({ report }) {
  if (!report) return null;

  const { score, violations = [], images = [] } = report;
  const [selectedImage, setSelectedImage] = useState(null);

  const getColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Accessibility Report</h2>

      {/* Score Visualization */}
      <div className="mb-4">
        <p className="font-bold">Score: {score}/100</p>
        <div className="w-full bg-gray-300 rounded-full h-6">
          <div
            className={`h-6 ${getColor(score)} rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Violations List */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Issues Found:</h3>
        {violations.length === 0 ? (
          <p className="text-green-600 font-semibold">✅ No accessibility issues detected!</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {violations.map((violation, index) => (
              <li key={index} className="bg-white p-3 rounded-lg shadow-md">
                <p className="font-bold text-red-600">{violation.description}</p>
                <p className="text-sm text-gray-600">
                  Impact: <span className="font-semibold">{violation.impact}</span>
                </p>
                <p className="text-sm text-gray-600">Affected Elements:</p>
                <ul className="list-disc pl-5 text-sm">
                  {violation.nodes.map((node, idx) => (
                    <li key={idx} className="text-blue-600">{node}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image ALT Review Section */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Image ALT Review:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {images.map((img, index) => (
              <div
                key={index}
                className={`border p-2 rounded-lg cursor-pointer ${
                  img.alt === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-24 object-cover rounded-md" />
                <p className="text-sm mt-1 text-gray-600">
                  <strong>ALT:</strong> {img.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
{selectedImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={() => setSelectedImage(null)}
  >
    <div
      className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button className="absolute top-4 right-4 text-gray-600 text-xl" onClick={() => setSelectedImage(null)}>
        ✖
      </button>
      <img 
        src={selectedImage.src} 
        alt={selectedImage.alt} 
        className="max-w-full max-h-[80vh] mx-auto rounded-lg"
      />
      <p className="text-center text-gray-600 mt-4"><strong>ALT:</strong> {selectedImage.alt}</p>
    </div>
  </div>
)}
    </div>
  );
}
