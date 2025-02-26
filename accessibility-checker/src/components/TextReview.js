import { useEffect } from "react";

export default function TextReview({ texts, checkedTexts, setCheckedTexts }) {
  if (!texts.length) return null;

  const toggleCheck = (index) => {
    setCheckedTexts((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle state (checked/unchecked)
    }));
  };

  // ✅ Hold "T" + Click to Mark All Texts
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
    <div className="mt-6">
      <h3 className="text-lg font-semibold">📝 Text Content Review</h3>
      <ul className="mt-2 space-y-4">
        {texts.map((text, index) => (
          <li
            key={index}
            className={`p-4 rounded-lg shadow-md border-l-4 ${
              checkedTexts[index] ? "border-green-500 bg-green-100" : "border-yellow-500 bg-yellow-100"
            }`}
          >
            <p className="text-gray-800">{text}</p>

            {/* ✅ Review Button */}
            <button
              onClick={() => toggleCheck(index)}
              className={`mt-2 px-4 py-2 text-sm font-semibold rounded-lg shadow ${
                checkedTexts[index] ? "bg-green-600 text-white" : "bg-yellow-500 text-gray-800"
              }`}
            >
              {checkedTexts[index] ? "✅ Reviewed" : "🔍 Mark as Reviewed"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
