// 🔴 Uncomment these lines to enable SyntaxHighlighter
// import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ViolationsList({ violations }) {
  if (!violations?.length) return null;

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">WCAG Violations</h3>

      <ul className="mt-4 space-y-6">
        {violations.map((violation, index) => (
          <li
            key={index}
            className="bg-gray-50 p-5 rounded-lg shadow-sm border-l-4 border-red-500"
          >
            {/* 🟥 Violation Description */}
            <p className="font-bold text-red-600 text-lg">{violation.description}</p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Impact:</span> {violation.impact}
            </p>

            {/* 🟡 Affected Elements Section */}
            {violation.affectedElements.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-sm font-semibold text-gray-800">Affected Elements:</p>

                <ul className="mt-3 space-y-3">
                  {violation.affectedElements.map((el, idx) => (
                    <li key={idx} className="p-3 bg-gray-200 rounded-md border border-gray-300">
                      
                      {/* 🔹 Element Description */}
                      <p className="font-semibold text-gray-900">{el.description}</p>

                      {/* 🔹 Selector (Choose ONE Display Type) */}
                      
                      {/* ✅ OPTION 1: Plain Text (Current) - Comment this line to use SyntaxHighlighter */}
                      <pre className="bg-gray-300 text-gray-900 text-xs p-3 rounded-md overflow-x-auto mt-2">
                        {el.selector}
                      </pre>

                      {/* ✅ OPTION 2: SyntaxHighlighter (Future) - Uncomment below to use it instead */}
                      {/* 
                      <SyntaxHighlighter
                        language="html"
                        style={oneLight} // Change to oneDark for dark mode
                        className="rounded-lg border border-gray-500 mt-2"
                        customStyle={{
                          fontSize: "14px",
                          padding: "12px",
                          borderRadius: "8px",
                          background: "#282c34", // Dark background like VS Code
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                      >
                        {el.selector}
                      </SyntaxHighlighter>
                      */}

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
          </li>
        ))}
      </ul>
    </div>
  );
}
