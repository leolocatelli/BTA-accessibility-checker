export default function ViolationsList({ violations }) {
    if (!violations?.length) return null;
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold">WCAG Violations:</h3>
        <ul className="mt-2 space-y-2">
          {violations.map((violation, index) => (
            <li key={index} className="bg-white p-3 rounded-lg shadow-md border-l-4 border-red-500">
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
      </div>
    );
  }
  