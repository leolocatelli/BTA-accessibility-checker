import { useEffect, useState } from "react";

export default function ImageAltReview({
  images,
  checkedImages,
  setCheckedImages,
  setSelectedImage,
}) {
  const [imageSizes, setImageSizes] = useState({});

  // ✅ Fetch image sizes from API
  useEffect(() => {
    const fetchSizes = async () => {
      const sizes = { ...imageSizes };

      for (const img of images) {
        if (!img.src || sizes[img.src]) continue; // Skip if already fetched

        try {
          const response = await fetch("/api/get-image-size", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: img.src }),
          });

          const data = await response.json();
          sizes[img.src] = data.size || "N/A";
        } catch (error) {
          console.error(`❌ Failed to get size for ${img.src}:`, error);
          sizes[img.src] = "N/A";
        }
      }

      setImageSizes(sizes);
    };

    fetchSizes();
  }, [images]);

  // ✅ Define background colors based on ALT text presence
  const getColor = (img) => {
    if (checkedImages[img.src]) return "bg-green-200"; // ✅ Marked as OK
    return img.alt?.trim() === "(No ALT text)" ? "bg-red-200" : "bg-yellow-100"; // 🔴 No ALT = Red | 🟡 ALT present = Yellow
  };

  // ✅ Toggle image check state (Only for yellow images)
  const toggleCheck = (img) => {
    if (img.alt?.trim() === "(No ALT text)") return; // ❌ Cannot mark red images as OK

    setCheckedImages((prev) => ({
      ...prev,
      [img.src]: true, // ✅ Mark as checked
    }));
  };

  // ✅ Copy the image URL to clipboard
  const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
      alert("Clipboard API not available. Please copy manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      // alert("Image URL copied to clipboard! 📋");
    } catch (error) {
      console.error("❌ Failed to copy:", error);
      alert("Failed to copy. Please try manually.");
    }
  };

  // ✅ "Hold 'i' + Click" to check all yellow images (ENSURING RED IMAGES ARE NOT SELECTED)
  useEffect(() => {
    let isHoldingI = false;

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "i") {
        isHoldingI = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "i") {
        isHoldingI = false;
      }
    };

    const handleClick = () => {
      if (isHoldingI) {
        setCheckedImages((prev) => {
          const updatedChecked = { ...prev };

          images.forEach((img) => {
            if (img.alt?.trim() !== "(No ALT text)" && !prev[img.src]) {
              updatedChecked[img.src] = true; // ✅ Only yellow images get checked
            }
          });

          return updatedChecked;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("click", handleClick);
    };
  }, [images, setCheckedImages]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">🖼️ Image ALT Review</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative border p-2 gap-3 rounded-lg cursor-pointer ${getColor(
              img
            )}`}
            onClick={() => setSelectedImage(img)}
          >
            {/* 🖼️ Image Preview */}
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-28 object-cover rounded-md"
            />
            <p className="text-sm text-gray-700 mt-2">
              <strong>ALT:</strong> {img.alt}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Class:</strong> {img.className || "(No class)"}
            </p>

            {/* ✅ Image Size Display */}
            <p className="text-xs text-gray-500 mt-1">
              <strong>Size:</strong>{" "}
              {imageSizes[img.src]
                ? `${(parseFloat(imageSizes[img.src]) * 1.0645).toFixed(2)} KB`
                : "Fetching..."}
            </p>

            {/* ✅ Copy URL & Mark as OK Buttons */}
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

              {/* ✅ Mark as OK Button (Only for yellow images) */}
              {img.alt?.trim() !== "(No ALT text)" &&
                !checkedImages[img.src] && (
                  <button
                    className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(img);
                    }}
                  >
                    ✔ Ok
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
