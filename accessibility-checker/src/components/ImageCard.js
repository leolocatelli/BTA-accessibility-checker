import { useMemo, useState } from "react";
import { getColor } from "../utils/getColor";
import { copyToClipboard } from "../utils/copyToClipboard";
import { Copy, Check } from "lucide-react";

export default function ImageCard({
  img,
  imageSizes,
  checkedImages,
  setCheckedImages,
  setSelectedImage,
}) {
  const [copied, setCopied] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);

  const rawSrc =
    img.src && img.src !== "(No image source)" ? img.src : img.dataSrc || "";

  const isBrownThomasImage =
    typeof rawSrc === "string" && rawSrc.includes("images.brownthomas.com");

  const proxySrc = rawSrc
    ? `/api/image-proxy?url=${encodeURIComponent(rawSrc)}`
    : "";

  const previewSrc = useMemo(() => {
    if (!rawSrc) return "";

    if (imageAttempt === 0) return rawSrc;

    if (imageAttempt === 1 && img.dataSrc && img.dataSrc !== rawSrc) {
      return img.dataSrc;
    }

    if (imageAttempt >= 2 && isBrownThomasImage) {
      return proxySrc;
    }

    return rawSrc;
  }, [rawSrc, img.dataSrc, imageAttempt, isBrownThomasImage, proxySrc]);

  const handleCopy = (e) => {
    e.stopPropagation();
    copyToClipboard(img.src);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleCheck = () => {
    if (!img.alt || img.alt.trim() === "(No ALT text)") return;

    setCheckedImages((prev) => ({
      ...prev,
      [img.src]: true,
    }));
  };

  const getAltStatus = () => {
    if (!img.alt || img.alt === "(No ALT text)") {
      return { label: "Missing", color: "text-red-600" };
    }

    if (img.altStatus === "generic") {
      return { label: "Generic", color: "text-yellow-600" };
    }

    if (img.altStatus === "weak") {
      return { label: "Weak", color: "text-yellow-600" };
    }

    return { label: "Descriptive", color: "text-green-600" };
  };

  const altStatus = getAltStatus();

  const displaySize =
    img.sizeKB ||
    (imageSizes[img.src]
      ? `${parseFloat(imageSizes[img.src]).toFixed(2)}`
      : null);

  const numericSize = displaySize ? parseFloat(displaySize) : null;

  const getSizeBadgeClasses = (size) => {
    if (size === null || Number.isNaN(size)) {
      return "bg-gray-100 text-gray-600 border border-gray-200";
    }

    if (size >= 900) {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    if (size >= 600) {
      return "bg-orange-100 text-orange-700 border border-orange-200";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getSizeLabel = (size) => {
    if (size === null || Number.isNaN(size)) return "Fetching...";
    if (size >= 900) return "Heavy";
    if (size >= 600) return "Warning";
    return "OK";
  };

  return (
    <div
      className="relative border p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-lg flex flex-col h-full"
      style={{ backgroundColor: getColor(img, checkedImages) }}
      onClick={() => setSelectedImage(img)}
    >
      <div className="rounded-md overflow-hidden bg-gray-100 flex items-center justify-center h-32">
        <img
          src={previewSrc}
          alt={img.alt || ""}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.stopPropagation();

            if (imageAttempt < 2) {
              setImageAttempt((prev) => prev + 1);
              return;
            }

            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="mt-3 text-gray-700 flex-grow">
        <p className="text-sm font-medium whitespace-normal break-words">
          <strong>ALT:</strong> {img.alt || "(No ALT text)"}
        </p>

        <p className={`text-xs mt-1 ${altStatus.color}`}>
          <strong>Status:</strong> {altStatus.label}
        </p>

        {img.altLength !== undefined && (
          <p className="text-xs text-gray-600 mt-1">
            <strong>ALT Length:</strong> {img.altLength} characters
          </p>
        )}

        {img.duplicateAlt && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠ Duplicate ALT ({img.duplicateCount} times)
          </p>
        )}

        <p className="text-xs text-gray-600 mt-1">
          <strong>Class:</strong> {img.className || "(No class)"}
        </p>

        {(img.displayedWidth || img.naturalWidth) && (
          <p className="text-xs text-gray-600 mt-1">
            <strong>Displayed:</strong> {img.displayedWidth}x
            {img.displayedHeight}
          </p>
        )}

        <div className="text-xs text-gray-600 mt-2 flex items-center gap-2 flex-wrap">
          <strong>Size:</strong>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getSizeBadgeClasses(
              numericSize
            )}`}
          >
            {displaySize ? `${displaySize} KB` : "Fetching..."}
          </span>

          {displaySize && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getSizeBadgeClasses(
                numericSize
              )}`}
            >
              {getSizeLabel(numericSize)}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-auto pt-3">
        <button
          className="flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-all duration-300 ease-in-out 
          bg-gray-300 text-gray-800 hover:bg-gray-400 active:scale-95"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}