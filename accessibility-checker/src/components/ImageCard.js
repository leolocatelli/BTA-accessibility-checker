import { useState } from "react";
import { getColor } from "../utils/getColor";
import { copyToClipboard } from "../utils/copyToClipboard";
import { Copy, CheckCircle, Check } from "lucide-react";

export default function ImageCard({ img, imageSizes, checkedImages, setCheckedImages, setSelectedImage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    copyToClipboard(img.src);
    setCopied(true);

    // Reset back to "Copy URL" after 1.5 seconds
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleCheck = () => {
    if (!img.alt || img.alt.trim() === "(No ALT text)") return;

    setCheckedImages((prev) => ({
      ...prev,
      [img.src]: true,
    }));
  };

  return (
    <div
      className="relative border p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-lg flex flex-col h-full"
      style={{ backgroundColor: getColor(img, checkedImages) }}
      onClick={() => setSelectedImage(img)}
    >
      {/* ✅ Image Preview */}
      <div className="rounded-md overflow-hidden bg-gray-100 flex items-center justify-center h-32">
        <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
      </div>

      {/* ✅ Image Information */}
      <div className="mt-3 text-gray-700 flex-grow">
        <p className="text-sm font-medium whitespace-normal break-words">
          <strong>ALT:</strong> {img.alt || "(No ALT text)"}
        </p>
        <p className="text-xs text-gray-600 mt-1"><strong>Class:</strong> {img.className || "(No class)"}</p>
        <p className="text-xs text-gray-600 mt-1"><strong>Size:</strong> {imageSizes[img.src] ? `${parseFloat(imageSizes[img.src]).toFixed(2)} KB` : "Fetching..."}</p>
      </div>

      {/* ✅ Action Buttons (Always Aligned to Bottom) */}
      <div className="flex justify-between mt-auto pt-3">
        <button
          className="flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-all duration-300 ease-in-out 
          bg-gray-300 text-gray-800 hover:bg-gray-400 active:scale-95"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy URL"}
        </button>

        {!checkedImages[img.src] && img.alt?.trim() !== "(No ALT text)" && (
          <button
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              toggleCheck();
            }}
          >
            <CheckCircle className="w-4 h-4" /> OK
          </button>
        )}
      </div>
    </div>
  );
}
