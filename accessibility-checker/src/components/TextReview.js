import { useEffect } from "react";

export default function TextReview({ texts, checkedTexts, setCheckedTexts }) {
  if (!texts.length) return null;

  const toggleCheck = (index) => {
    setCheckedTexts((prev) => ({
      ...prev,
      [index]: !prev[index], // ✅ Toggle reviewed state
    }));
  };

  // ✅ Press "T" + Click to mark all texts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === "t") {
        document.addEventListener("click", markAllChecked);
      }
    };

    const handleKeyRelease = (event) => {
      if (event.key.toLowerCase() === "t") {
        document.removeEventListener("click", markAllChecked);
      }
    };

    const markAllChecked = () => {
      setCheckedTexts((prev) => {
        const updatedTexts = {};
        texts.forEach((_, index) => {
          updatedTexts[index] = true;
        });
        return updatedTexts;
      });
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("keyup", handleKeyRelease);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("keyup", handleKeyRelease);
      document.removeEventListener("click", markAllChecked);
    };
  }, [texts, setCheckedTexts]);

  return (
    <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
      {/* ✅ Title with SVG Icon */}
      <div className="flex items-center gap-2 text-gray-800 mb-3">
        

        <h3 className="text-xl font-semibold">Text Content Review</h3>
      </div>

      {/* ✅ Review List */}
      <ul className="space-y-4">
        {texts.map((text, index) => (
          <li
            key={index}
            className={`p-4 rounded-lg shadow-md border-l-4 ${
              checkedTexts[index] ? "border-green-500 bg-green-100" : "border-yellow-500 bg-yellow-100"
            }`}
          >
            <p className="text-gray-800">{text}</p>

            {/* ✅ Review Button with SVG Check Icon */}
            <button
              className={`mt-2 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow transition ${
                checkedTexts[index] ? "bg-green-600 text-white" : "bg-yellow-500 text-gray-800"
              }`}
              onClick={() => toggleCheck(index)}
            >
              {/* SVG Check Icon */}
              {checkedTexts[index] ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5v14"></path>
                </svg>
              )}

              {checkedTexts[index] ? "Reviewed" : "Mark as Reviewed"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
