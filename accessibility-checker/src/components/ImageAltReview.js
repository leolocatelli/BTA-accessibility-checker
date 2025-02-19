export default function ImageAltReview({ images, checkedImages, setCheckedImages, setSelectedImage }) {
    const getColor = (img) => {
      if (checkedImages[img.src]) return "bg-green-200";
      return img.alt === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100";
    };
  
    const toggleCheck = (imgSrc) => {
      setCheckedImages((prev) => ({
        ...prev,
        [imgSrc]: !prev[imgSrc],
      }));
    };
  
    if (!images.length) return null;
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Image ALT Review:</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {images.map((img, index) => (
            <div
              key={index}
              className={`border p-2 rounded-lg cursor-pointer ${getColor(img)}`}
              onClick={() => img.alt !== "(No ALT text)" && setSelectedImage(img)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-24 object-cover rounded-md" />
              <p className="text-sm mt-1 text-gray-600">
                <strong>ALT:</strong> {img.alt}
              </p>
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
  