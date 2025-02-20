export default function ViolationsList({ violations }) {
  if (!violations?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">WCAG Violations:</h3>
      <ul className="mt-2 space-y-4">
        {violations.map((violation, index) => (
          <li
            key={index}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500"
          >
            <p className="font-bold text-red-600">{violation.description}</p>
            <p className="text-sm text-gray-600">
              Impact: <span className="font-semibold">{violation.impact}</span>
            </p>

            {violation.affectedElements.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 font-semibold">
                  Affected Elements:
                </p>
                <ul className="list-disc pl-5 text-sm">
                  {violation.affectedElements.map((el, idx) => (
                    <li key={idx} className="text-blue-600">
                      <strong>{el.description}</strong> ({el.selector})
                      {el.screenshot && (
                        <img
                          src={el.screenshot}
                          alt="Issue preview"
                          className="w-auto h-[150px] rounded-lg shadow mt-2" // Limits width to 300px
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-2">
              <strong>Suggested Fix:</strong> {violation.suggestedFix}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
