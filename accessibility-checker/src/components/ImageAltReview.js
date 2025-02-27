export default function ImageAltReview({ images, checkedImages, setCheckedImages, setSelectedImage }) {
  const getColor = (img) => {
    if (checkedImages[img.src]) return "bg-green-200"; // ✅ Checked
    return img.alt === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100"; // 🔴 No ALT = Red | 🟡 ALT present = Yellow
  };

  const toggleCheck = (imgSrc) => {
    setCheckedImages((prev) => ({
      ...prev,
      [imgSrc]: true,
    }));
  };

  if (!images.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Image ALT Review:</h3>
      <div className="grid grid-cols-3 gap-4 mt-2"> {/* 🟢 Ajustado para 3 colunas */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`border p-2 rounded-lg cursor-pointer ${getColor(img)}`}
            onClick={() => setSelectedImage(img)}
          >
            <img src={img.src} alt={img.alt} className="w-full h-28 object-cover rounded-md" />
            <p className="text-sm text-gray-700 mt-2"><strong>ALT:</strong> {img.alt}</p> {/* 🟢 ALT visível abaixo da imagem */}

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
