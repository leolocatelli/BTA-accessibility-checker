"use client";
import { useState, useRef } from "react";
import { IoColorPaletteOutline } from "react-icons/io5";
import { MdCheckCircle, MdCancel, MdOutlineImage } from "react-icons/md";

const colorFilters = {
  protanopia: "grayscale(50%) sepia(0.5) hue-rotate(-15deg) contrast(1.05)",
  deuteranopia: "grayscale(50%) sepia(0.5) hue-rotate(-3deg) contrast(1.05)",
  tritanopia: "grayscale(50%) sepia(0.5) hue-rotate(25deg) contrast(1.1)",
  achromatopsia: "grayscale(90%)",
  normal: "none",
};

const LENS_SIZE = 80;
const ZOOM = 3;

export default function ColorContrastChecker() {
  // 🎨 Original contrast states
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [customText, setCustomText] = useState("Your text preview here");
  const [fontSize, setFontSize] = useState("16px");
  const MAX_PREVIEW_LENGTH = 60;

  // 🖼️ Image + filters + eyedropper
  const [imageSrc, setImageSrc] = useState(null);
  const [filter, setFilter] = useState("normal");
  const [pickedColor, setPickedColor] = useState("");
  const [isPicking, setIsPicking] = useState(false);
  const [pickFeedback, setPickFeedback] = useState("");

  // 🔍 Lens state
  const [lensVisible, setLensVisible] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [lensBackground, setLensBackground] = useState({
    sizeX: 0,
    sizeY: 0,
    posX: 0,
    posY: 0,
  });

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // 📏 Contrast ratio
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

  // 📋 Copy CSS
  const handleCopyCSS = () => {
    const cssText = `color: ${textColor}; background-color: ${bgColor};`;
    navigator.clipboard.writeText(cssText);
  };

  // 🖼️ Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setFilter("normal");
      setPickedColor("");
      setPickFeedback("");
      setLensVisible(false);
    };
    reader.readAsDataURL(file);
  };

  // 🧮 Draw image in hidden canvas
  const drawImageToCanvas = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const rgbToHex = (r, g, b) => {
    const toHex = (c) => c.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // 🎯 Eyedropper click on image
  const handleImageClick = (e) => {
    if (!isPicking) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setPickedColor(hex);
    setIsPicking(false);
    setLensVisible(false);

    navigator.clipboard.writeText(hex).catch(() => {});

    setPickFeedback(
      `Color ${hex} copied to clipboard. Paste it into the fields below.`
    );
  };

  // 🔍 Lens follow mouse
  const handleImageMouseMove = (e) => {
    if (!isPicking || !imageSrc) {
      setLensVisible(false);
      return;
    }

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const xRel = e.clientX - rect.left;
    const yRel = e.clientY - rect.top;

    if (xRel < 0 || yRel < 0 || xRel > rect.width || yRel > rect.height) {
      setLensVisible(false);
      return;
    }

    setLensVisible(true);
    setLensPosition({ x: e.clientX + 16, y: e.clientY + 16 });

    setLensBackground({
      sizeX: rect.width * ZOOM,
      sizeY: rect.height * ZOOM,
      posX: -xRel * ZOOM + LENS_SIZE / 2,
      posY: -yRel * ZOOM + LENS_SIZE / 2,
    });
  };

  const handleImageMouseLeave = () => {
    setLensVisible(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg space-y-8">
      {/* 🖼️ IMAGE + FILTERS + EYEDROPPER */}
      <section>
        {/* <div className="flex items-center gap-2 mb-4">
          <IoColorPaletteOutline className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">
            Image preview & color picker
          </h2>
        </div> */}

        {/* Upload button */}
        <div className="flex items-center gap-4 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow hover:bg-blue-700"
          >
            <MdOutlineImage className="w-4 h-4" />
            Upload images
          </button>
        </div>

        {imageSrc && (
          <div className="border rounded-lg p-4 bg-gray-50 relative">
            {/* LENS */}
            {lensVisible && (
              <div
                className="pointer-events-none rounded-full shadow-lg"
                style={{
                  position: "fixed",
                  top: lensPosition.y,
                  left: lensPosition.x,
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  border: "2px solid #2563eb",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                  backgroundImage: `url(${imageSrc})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${lensBackground.sizeX}px ${lensBackground.sizeY}px`,
                  backgroundPosition: `${lensBackground.posX}px ${lensBackground.posY}px`,
                  backgroundColor: "#ffffff",
                  zIndex: 60,
                  overflow: "hidden",
                }}
              >
                {/* ponto central que marca exatamente o pixel selecionado */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 8,
                    height: 8,
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
                  }}
                />
              </div>
            )}

            <div className="relative">
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Uploaded preview"
                className="max-h-72 mx-auto rounded-lg"
                style={{
                  filter: colorFilters[filter],
                  cursor: isPicking
                    ? "url('/eyedropper-cursor.svg') 4 20, crosshair"
                    : "pointer",
                }}
                onLoad={drawImageToCanvas}
                onClick={handleImageClick}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
              />

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Color blindness filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {Object.keys(colorFilters).map((key) => (
                <button
                  key={key}
                  className={`px-3 py-1 rounded text-xs sm:text-sm border transition ${
                    filter === key
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilter(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {pickFeedback && (
              <p className="mt-3 text-xs text-center text-gray-600">
                {pickFeedback}
              </p>
            )}

            {/* Eyedropper */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsPicking(true);
                  setPickFeedback(
                    "Click on the image to pick a color. It will be copied to your clipboard."
                  );
                }}
                className="px-4 py-2 rounded text-sm font-medium shadow bg-blue-600 text-white hover:bg-blue-700"
              >
                {isPicking ? "Click on the image..." : "Pick color from image"}
              </button>

              {pickedColor && (
                <div className="flex items-center gap-2 text-sm">
                  <span>Last picked:</span>
                  <span className="flex items-center gap-2 px-2 py-1 border rounded bg-white">
                    <span
                      className="w-4 h-4 border rounded"
                      style={{ backgroundColor: pickedColor }}
                    />
                    {pickedColor}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 🎨 ORIGINAL CONTRAST TOOL */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Background */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold mb-1">
              Background Color
            </label>
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
              className="mt-2 w-28 text-center p-1 border rounded-md text-sm shadow"
              maxLength={7}
            />
          </div>

          {/* Text */}
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
              className="mt-2 w-28 text-center p-1 border rounded-md text-sm shadow"
              maxLength={7}
            />
          </div>
        </div>

        {/* Font size selector */}
        <div className="mb-6 text-center">
          <label className="mr-2 text-sm font-medium">Font Size:</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="p-1 border rounded-md text-sm"
          >
            <option value="11px">Small (11px)</option>
            <option value="16px">Normal (16px)</option>
            <option value="24px">Large (24px)</option>
          </select>
        </div>

        {/* Preview */}
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

        {/* Warning */}
        {!passesNormal && (
          <p className="text-sm text-red-600 text-center mt-3">
            Warning: This color combination does not meet WCAG 2.1 AA
            requirements.
          </p>
        )}

        {/* Results */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-center">
            Contrast Ratio:{" "}
            <span className="text-blue-600">{contrastRatio}:1</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
            {[
              { label: "Normal Text", pass: passesNormal },
              { label: "Large Text", pass: passesLarge },
              { label: "UI Components", pass: passesUI },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-md ${
                  item.pass
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                } border`}
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

          {/* Copy CSS */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCopyCSS}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
            >
              Copy CSS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
