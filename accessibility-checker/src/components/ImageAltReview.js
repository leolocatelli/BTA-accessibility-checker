import { useEffect } from "react";

export default function ImageAltReview({ images, checkedImages, setCheckedImages, setSelectedImage }) {
  if (!images.length) return null;

  // ✅ Define background colors based on ALT text presence
  const getColor = (img) => {
    if (checkedImages[img.src]) return "bg-green-200"; // ✅ Marked as OK
    return img.alt === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100"; // 🔴 No ALT = Red | 🟡 ALT present = Yellow
  };

  // ✅ Function to toggle image check state
  const toggleCheck = (imgSrc) => {
    setCheckedImages((prev) => ({
      ...prev,
      [imgSrc]: true, // ✅ Mark this image as checked
    }));
  };

  // ✅ Reintroduzido: Segurar "i" + Clique para marcar todas as imagens
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "i") {
        document.addEventListener("click", markAllImagesChecked);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "i") {
        document.removeEventListener("click", markAllImagesChecked);
      }
    };

    const markAllImagesChecked = () => {
      setCheckedImages((prev) => {
        const updatedChecked = { ...prev };
        images.forEach((img) => {
          if (!prev[img.src]) {
            updatedChecked[img.src] = true;
          }
        });
        return updatedChecked;
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("click", markAllImagesChecked);
    };
  }, [images, setCheckedImages]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">🖼️ Image ALT Review</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {images.map((img, index) => (
          <div
            key={index}
            className={`border p-2 rounded-lg cursor-pointer ${getColor(img)}`}
            onClick={() => setSelectedImage(img)}
          >
            <img src={img.src} alt={img.alt} className="w-full h-28 object-cover rounded-md" />
            <p className="text-sm text-gray-700 mt-2"><strong>ALT:</strong> {img.alt}</p>

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
          </div>
        ))}
      </div>
    </div>
  );
}
