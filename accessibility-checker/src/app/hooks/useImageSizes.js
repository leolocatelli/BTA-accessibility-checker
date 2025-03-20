import { useEffect, useState } from "react";

export function useImageSizes(images) {
  const [imageSizes, setImageSizes] = useState({});

  useEffect(() => {
    const fetchSizes = async () => {
      const sizes = { ...imageSizes };

      for (const img of images) {
        if (!img.src || sizes[img.src]) continue;

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

  return imageSizes;
}
