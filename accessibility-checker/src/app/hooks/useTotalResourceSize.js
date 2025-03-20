import { useState, useEffect } from "react";

export function useTotalResourceSize() {
  const [totalSize, setTotalSize] = useState("Calculating...");
  const [resourceBreakdown, setResourceBreakdown] = useState({});

  useEffect(() => {
    setTimeout(() => {
      const resources = performance.getEntriesByType("resource");

      if (!resources.length) {
        setTotalSize("Fetching...");
        return;
      }

      const categories = {
        "CSS": 0,
        "JavaScript": 0,
        "Fonts": 0,
        "XHR/Fetch": 0,
      };

      resources.forEach((resource) => {
        // ✅ Use transferSize first (most accurate network size)
        const sizeKB =
          (resource.transferSize || resource.encodedBodySize || 0) / 1024;
        if (!sizeKB) return;

        const url = resource.name.toLowerCase();
        const type = resource.initiatorType || "";

        if (url.endsWith(".css")) {
          categories.CSS += sizeKB;
        } else if (url.endsWith(".js")) {
          categories.JavaScript += sizeKB;
        } else if (url.match(/\.(woff|woff2|ttf|otf)$/)) {
          categories.Fonts += sizeKB;
        } else if (type === "xmlhttprequest" || type === "fetch") {
          categories["XHR/Fetch"] += sizeKB;
        }
      });

      // 🔹 Convert to KB/MB dynamically
      Object.keys(categories).forEach((key) => {
        categories[key] =
          categories[key] > 1000
            ? `${(categories[key] / 1024).toFixed(2)} MB`
            : `${categories[key].toFixed(2)} KB`;
      });

      // 🔹 Calculate total size (sum of all resources)
      const totalKB = Object.values(categories)
        .map((size) => parseFloat(size))
        .filter((size) => !isNaN(size))
        .reduce((acc, size) => acc + size, 0);

      setTotalSize(
        totalKB > 1000
          ? `${(totalKB / 1024).toFixed(2)} MB`
          : `${totalKB.toFixed(2)} KB`
      );
      setResourceBreakdown(categories);

      console.table(categories); // Debugging: Check values in Chrome DevTools
    }, 2000); // Wait 2s to ensure all resources are loaded
  }, []);

  return { totalSize, resourceBreakdown };
}
