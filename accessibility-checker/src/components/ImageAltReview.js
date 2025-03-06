import { useEffect } from "react";

export default function ImageAltReview({ images, checkedImages, setCheckedImages, setSelectedImage }) {
  if (!images.length) return null;

  // ✅ Define background colors based on ALT text presence
  const getColor = (img) => {
    if (checkedImages[img.src]) return "bg-green-200"; // ✅ Marked as OK (Checked)
    return img.alt === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100"; // 🔴 No ALT = Red | 🟡 ALT present = Yellow
  };

  // ✅ Toggle check state for a single image
  const toggleCheck = (imgSrc) => {
    setCheckedImages((prev) => ({
      ...prev,
      [imgSrc]: true, // ✅ Mark as checked (only yellow)
    }));
  };

  // ✅ Remove image from the review list
  const removeImage = (imgSrc) => {
    setCheckedImages((prev) => {
      const updatedChecked = { ...prev };
      return updatedChecked;
    });
  };

  // ✅ "Hold 'i' + Click" to check all yellow images
  useEffect(() => {
    const markAllYellowImagesChecked = () => {
      setCheckedImages((prev) => {
        const updatedChecked = { ...prev };
        images.forEach((img) => {
          if (img.alt !== "(No ALT text)" && !prev[img.src]) { 
            updatedChecked[img.src] = true; // ✅ Only yellow images get checked
          }
        });
        return updatedChecked;
      });
    };

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "i") {
        document.addEventListener("mousedown", markAllYellowImagesChecked);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "i") {
        document.removeEventListener("mousedown", markAllYellowImagesChecked);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", markAllYellowImagesChecked);
    };
  }, [images, setCheckedImages]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">🖼️ Image ALT Review</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative border p-2 rounded-lg cursor-pointer ${getColor(img)}`}
            onClick={() => setSelectedImage(img)}
          >
            {/* 🖼️ Image Preview */}
            <img src={img.src} alt={img.alt} className="w-full h-28 object-cover rounded-md" />
            <p className="text-sm text-gray-700 mt-2"><strong>ALT:</strong> {img.alt}</p>

            {/* ✅ Mark as OK Button */}
            {img.alt !== "(No ALT text)" && !checkedImages[img.src] && (
              <button
                className="mt-2 px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(img.src);
                }}
              >
                ✔ Ok
              </button>
            )}

            {/* ❌ Remove Image Button */}
            {/* <button
              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(img.src);
              }}
            >
              ✕
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
}
