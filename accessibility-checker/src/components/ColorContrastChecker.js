"use client";
import { useState } from "react";
import { IoColorPaletteOutline } from "react-icons/io5";
import { MdCheckCircle, MdCancel } from "react-icons/md";

export default function ColorContrastChecker() {
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [customText, setCustomText] = useState("Your text preview here");
  const [fontSize, setFontSize] = useState("16px");
  const MAX_PREVIEW_LENGTH = 60;

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

  const handleCopyCSS = () => {
    const cssText = `color: ${textColor}; background-color: ${bgColor};`;
    navigator.clipboard.writeText(cssText);
    alert("CSS copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* 🎨 Color Inputs */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Background */}
        <div className="flex flex-col items-center">
          <label htmlFor="bg-color" className="text-sm font-semibold mb-1">
            Background Color
          </label>
          <input
            id="bg-color"
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

        {/* Text */}
        <div className="flex flex-col items-center">
          <label htmlFor="text-color" className="text-sm font-semibold mb-1">
            Text Color
          </label>
          <input
            id="text-color"
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

      {/* 🅰 Font Size Selector */}
      <div className="mb-6 text-center">
        <label htmlFor="font-size" className="mr-2 text-sm font-medium">
          Font Size:
        </label>
        <select
          id="font-size"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="p-1 border rounded-md text-sm"
        >
          <option value="11px">Small (11px)</option>
          <option value="16px">Normal (16px)</option>
          <option value="24px">Large (24px)</option>
          {/* <option value="32px">Extra Large (32px)</option> */}
        </select>
      </div>

      {/* 📝 Preview */}
      <div
        className="mt-6 p-6 rounded-xl shadow-md text-center border border-gray-300 relative"
        style={{ backgroundColor: bgColor, color: textColor, fontSize }}
      >
        <input
          type="text"
          value={customText}
          onChange={(e) =>
            e.target.value.length <= MAX_PREVIEW_LENGTH &&
            setCustomText(e.target.value)
          }
          maxLength={MAX_PREVIEW_LENGTH}
          className="w-full bg-transparent font-semibold text-center focus:outline-none"
          style={{ fontSize }}
        />
        <p className="absolute right-4 bottom-2 text-xs text-gray-500">
          {customText.length}/{MAX_PREVIEW_LENGTH}
        </p>
      </div>

      {/* ⚠️ Contrast Warning */}
      {!passesNormal && (
        <p className="text-sm text-red-600 text-center mt-3">
          Warning: This color combination does not meet WCAG 2.1 AA contrast
          requirements for normal text.
        </p>
      )}

      {/* ✅ Results */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center">
          Contrast Ratio:{" "}
          <span className="text-blue-600">{contrastRatio}:1</span>
        </h2>
        <p className="text-xs text-center text-gray-500 mt-1">
          Based on WCAG 2.1 AA (1.4.3 Contrast Minimum)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
          {[
            {
              label: "Normal Text",
              pass: passesNormal,
              tooltip:
                "Requires at least 4.5:1 contrast ratio for readability (WCAG 2.1 AA)",
            },
            {
              label: "Large Text",
              pass: passesLarge,
              tooltip:
                "Requires at least 3:1 contrast ratio for large text (WCAG 2.1 AA)",
            },
            {
              label: "UI Components",
              pass: passesUI,
              tooltip:
                "Requires at least 3:1 contrast ratio for UI elements like buttons and inputs",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-md ${
                item.pass
                  ? "bg-green-100 border-green-500"
                  : "bg-red-100 border-red-500"
              } border`}
              title={item.tooltip}
            >
              {item.pass ? (
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <MdCancel className="w-5 h-5 text-red-600" />
              )}
              <p className="text-sm font-semibold">
                {item.pass ? "Pass" : "Fail"} {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* 📋 Copy CSS Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleCopyCSS}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
          >
            Copy CSS
          </button>
        </div>
      </div>
    </div>
  );
}
