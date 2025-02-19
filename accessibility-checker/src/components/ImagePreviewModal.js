export default function ImagePreviewModal({ selectedImage, setSelectedImage, filter, setFilter, checkedImages, toggleCheck }) {
    const colorFilters = {
      protanopia: "grayscale(15%) sepia(0.5) hue-rotate(-15deg) contrast(1.05)",
      deuteranopia: "grayscale(30%) sepia(0.5) hue-rotate(-7deg) contrast(1.05)",
      tritanopia: "grayscale(15%) sepia(0.5) hue-rotate(25deg) contrast(1.1)",
      achromatopsia: "grayscale(70%)",
      normal: "none",
    };
  
    if (!selectedImage) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={() => setSelectedImage(null)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full overflow-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-4 right-4 text-gray-600 text-xl" onClick={() => setSelectedImage(null)}>✖</button>
          <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-[65vh] mx-auto rounded-lg" style={{ filter: colorFilters[filter] }} />
          <p className="text-center text-gray-600 mt-8"><strong>ALT:</strong> {selectedImage.alt}</p>
  
          {/* Daltonism Filter Buttons */}
          <div className="flex justify-center gap-2 mt-8">
            {Object.keys(colorFilters).map((key) => (
              <button key={key} className="px-3 py-1 bg-gray-300 rounded" onClick={() => setFilter(key)}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
  
          {/* ✅ Check Button inside Modal */}
          {selectedImage.alt !== "(No ALT text)" && !checkedImages[selectedImage.src] && (
            <div className="flex justify-center mt-4">
              <button className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500" onClick={() => toggleCheck(selectedImage.src)}>✔ Mark as Checked</button>
            </div>
          )}
        </div>
      </div>
    );
  }
  