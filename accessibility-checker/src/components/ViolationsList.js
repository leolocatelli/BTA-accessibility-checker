import { useState } from "react";

// 🔴 Uncomment these lines to enable SyntaxHighlighter
// import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ViolationsList({ violations }) {
  if (!violations?.length) return null;

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Toggle a violation open/closed
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">WCAG Violations</h3>

      <ul className="mt-4 space-y-2">
        {violations.map((violation, index) => (
          <li key={index} className="bg-gray-50 rounded-lg shadow-sm border-l-4 border-red-500">
            {/* 🔹 Clickable Title Bar */}
            <button
              className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 font-semibold flex justify-between items-center rounded-lg"
              onClick={() => toggleExpand(index)}
            >
              <span className="text-red-600">{violation.description}</span>
              <span>{expandedIndex === index ? "🔼" : "🔽"}</span>
            </button>

            {/* 🔹 Hidden Details Section (Expands when clicked) */}
            {expandedIndex === index && (
              <div className="p-5">
                {/* Impact */}
                <p className="text-sm text-gray-700">
                  <strong>Impact:</strong> {violation.impact}
                </p>

                {/* Affected Elements Section */}
                {violation.affectedElements.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <p className="text-sm font-semibold text-gray-800">Affected Elements:</p>

                    <ul className="mt-3 space-y-3">
                      {violation.affectedElements.map((el, idx) => (
                        <li key={idx} className="p-3 bg-gray-200 rounded-md border border-gray-300">
                          
                          {/* 🔹 Element Description */}
                          <p className="font-semibold text-gray-900">{el.description}</p>

                          {/* 🔹 Selector (Choose ONE Display Type) */}
                          <pre className="bg-gray-300 text-gray-900 text-xs p-3 rounded-md overflow-x-auto mt-2">
                            {el.selector}
                          </pre>

                          {/* 🖼️ Screenshot Preview */}
                          {el.screenshot && (
                            <img
                              src={el.screenshot}
                              alt="Issue preview"
                              className="w-auto h-[180px] rounded-lg shadow-md mt-3"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ✅ Suggested Fix */}
                <p className="text-sm text-gray-700 mt-4">
                  <strong>Suggested Fix:</strong> {violation.suggestedFix}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
