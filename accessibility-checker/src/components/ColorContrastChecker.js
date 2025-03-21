"use client"; // ✅ Ensure this is a client component
import { useState } from "react";
import { IoColorPaletteOutline } from "react-icons/io5";
import { MdCheckCircle, MdCancel } from "react-icons/md";

export default function ColorContrastChecker() {
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
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
      {/* ✅ Header with Icon */}
      <div className="flex items-center justify-center gap-3 text-blue-600 text-2xl font-bold mb-6">
        {/* <IoColorPaletteOutline className="w-8 h-8" /> */}
        {/* <h2>Color Contrast Checker</h2> */}
      </div>

      {/* 🎨 Color Inputs */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Background Color Picker */}
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

        {/* Text Color Picker */}
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

      {/* 📝 Editable Text Preview */}
      <div
        className="mt-6 p-6 rounded-xl shadow-md text-center border border-gray-300"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full bg-transparent text-lg font-semibold text-center focus:outline-none"
        />
      </div>

      {/* ✅ WCAG Results */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center">
          Contrast Ratio: <span className="text-blue-600">{contrastRatio}:1</span>
        </h2>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-md ${passesNormal ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"} border`}>
            {passesNormal ? <MdCheckCircle className="w-5 h-5 text-green-600" /> : <MdCancel className="w-5 h-5 text-red-600" />}
            <p className="text-sm font-semibold">{passesNormal ? "Pass" : "Fail"} Normal Text</p>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-md ${passesLarge ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"} border`}>
            {passesLarge ? <MdCheckCircle className="w-5 h-5 text-green-600" /> : <MdCancel className="w-5 h-5 text-red-600" />}
            <p className="text-sm font-semibold">{passesLarge ? "Pass" : "Fail"} Large Text</p>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-md ${passesUI ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"} border`}>
            {passesUI ? <MdCheckCircle className="w-5 h-5 text-green-600" /> : <MdCancel className="w-5 h-5 text-red-600" />}
            <p className="text-sm font-semibold">{passesUI ? "Pass" : "Fail"} UI Components</p>
          </div>
        </div>
      </div>
    </div>
  );
}
