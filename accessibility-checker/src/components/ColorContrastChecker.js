import { useState } from "react";

export default function ColorContrastChecker() {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customText, setCustomText] = useState("Your text preview here");

  // Function to calculate contrast ratio
  const getContrastRatio = (hex1, hex2) => {
    const luminance = (hex) => {
      let rgb = parseInt(hex.substring(1), 16);
      let r = (rgb >> 16) & 255,
        g = (rgb >> 8) & 255,
        b = rgb & 255;
      [r, g, b] = [r, g, b].map((c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const lum1 = luminance(hex1) + 0.05;
    const lum2 = luminance(hex2) + 0.05;
    return (Math.max(lum1, lum2) / Math.min(lum1, lum2)).toFixed(2);
  };

  const contrastRatio = getContrastRatio(textColor, bgColor);
  const passesNormal = contrastRatio >= 4.5;
  const passesLarge = contrastRatio >= 3.0;
  const passesUI = contrastRatio >= 3.0;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* <h2 className="text-2xl font-bold text-center mb-6">🎨 Color Contrast Checker</h2> */}

      {/* Color Inputs */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Background Color Picker & Input */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-semibold mb-1">Background Color</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-20 h-12 border-2 rounded-lg shadow-md"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="mt-2 w-24 text-center p-1 border rounded-md text-sm shadow"
            maxLength={7}
          />
        </div>

        {/* Text Color Picker & Input */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-semibold mb-1">Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-20 h-12 border-2 rounded-lg shadow-md"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="mt-2 w-24 text-center p-1 border rounded-md text-sm shadow"
            maxLength={7}
          />
        </div>
      </div>

      {/* Editable Text Preview */}
      <div
        className="mt-6 p-6 rounded-xl shadow-md text-center border"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full bg-transparent text-lg font-semibold text-center focus:outline-none"
        />
      </div>

      {/* WCAG Results */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center">
          Contrast Ratio: <span className="text-blue-600">{contrastRatio}:1</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-5 mt-4 justify-center text-center">
          <p className={passesNormal ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            Normal Text: {passesNormal ? "✅ Pass" : "❌ Fail (Needs 4.5:1)"}
          </p>
          <p className={passesLarge ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            Large Text: {passesLarge ? "✅ Pass" : "❌ Fail (Needs 3.0:1)"}
          </p>
          <p className={passesUI ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            UI Components: {passesUI ? "✅ Pass" : "❌ Fail (Needs 3.0:1)"}
          </p>
        </div>
      </div>
    </div>
  );
}
