import { getColor } from "@/utils/getColor";
import { copyToClipboard } from "@/utils/copyToClipboard";

export default function ImageCard({ img, imageSizes, checkedImages, setCheckedImages, setSelectedImage }) {
  const toggleCheck = () => {
    if (img.alt?.trim() === "(No ALT text)") return;

    setCheckedImages((prev) => ({
      ...prev,
      [img.src]: true,
    }));
  };

  return (
    <div
      className={`relative border p-2 gap-3 rounded-lg cursor-pointer ${getColor(img, checkedImages)}`}
      onClick={() => setSelectedImage(img)}
    >
      {/* 🖼️ Image Preview */}
      <img src={img.src} alt={img.alt} className="w-full h-28 object-cover rounded-md" />
      <p className="text-sm text-gray-700 mt-2"><strong>ALT:</strong> {img.alt}</p>
      <p className="text-xs text-gray-500 mt-1"><strong>Class:</strong> {img.className || "(No class)"}</p>

      {/* ✅ Image Size Display */}
      <p className="text-xs text-gray-500 mt-1">
        <strong>Size:</strong> {imageSizes[img.src] ? `${parseFloat(imageSizes[img.src]).toFixed(2)} KB` : "Fetching..."}
      </p>

      {/* ✅ Buttons */}
      <div className="flex gap-2 mt-2">
        <button
          className="px-2 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(img.src);
          }}
        >
          📋 Copy URL
        </button>

        {img.alt?.trim() !== "(No ALT text)" && !checkedImages[img.src] && (
          <button
            className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500"
            onClick={(e) => {
              e.stopPropagation();
              toggleCheck();
            }}
          >
            ✔ Ok
          </button>
        )}
      </div>
    </div>
  );
}
