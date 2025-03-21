import { useState, useEffect } from "react";

export function useTotalImageSize(imageSizes) {
  const [totalSize, setTotalSize] = useState("Calculating...");

  useEffect(() => {
    if (!imageSizes || Object.keys(imageSizes).length === 0) {
      setTotalSize("Fetching...");
      return;
    }

    const sizes = Object.values(imageSizes)
      .map((size) => parseFloat(size))
      .filter((size) => !isNaN(size));

    if (sizes.length > 0) {
      const totalKB = sizes.reduce((acc, size) => acc + size, 0);

      // If total size is less than 1000 KB, show it in KB
      if (totalKB < 1000) {
        setTotalSize(`${totalKB.toFixed(2)} KB`);
      } else {
        setTotalSize(`${(totalKB / 1024).toFixed(2)} MB`);
      }
    } else {
      setTotalSize("Fetching...");
    }
  }, [imageSizes]);

  return totalSize;
}
