async function extractImages(page) {
  try {
    // Classes that should be ignored when extracting images
    const ignoredClasses = ["bnsimg", "footer-icons", "mega-menu__mobile"];

    const images = await page.evaluate(async (args) => {
      const ignoredClasses = args.ignoredClasses;

      // Wait a few seconds to allow lazy images to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const seenImages = new Set();

      const genericAltWords = [
        "image",
        "photo",
        "picture",
        "img",
        "banner",
      ];

      const results = Array.from(document.querySelectorAll("img, picture"))
        .filter((el) => {
          const img =
            el.tagName.toLowerCase() === "picture"
              ? el.querySelector("img")
              : el;

          if (!img) return false;

          // Ignore images with certain classes
          const imgClasses = (img.className || "").split(/\s+/);
          if (ignoredClasses.some((cls) => imgClasses.includes(cls)))
            return false;

          // Ignore images whose parent contains ignored classes
          let parent = img.parentElement;
          while (parent) {
            const parentClasses = (parent.className || "").split(/\s+/);
            if (ignoredClasses.some((cls) => parentClasses.includes(cls)))
              return false;
            parent = parent.parentElement;
          }

          return true;
        })
        .map((el) => {
          const img =
            el.tagName.toLowerCase() === "picture"
              ? el.querySelector("img")
              : el;

          if (!img) return null;

          const src =
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy") ||
            "(No image source)";

          const altRaw = img.getAttribute("alt");
          const alt = altRaw?.trim() || "";

          const className = img.className || "(No class)";
          const lazyLoaded = img.getAttribute("loading") === "lazy";

          // Displayed size (rendered size in the page)
          const displayedWidth = img.width || img.clientWidth || 0;
          const displayedHeight = img.height || img.clientHeight || 0;

          // Natural image size
          const naturalWidth = img.naturalWidth || 0;
          const naturalHeight = img.naturalHeight || 0;

          // ALT length
          const altLength = alt.length;

          // ALT status detection
          let altStatus = "descriptive";

          if (!alt) {
            altStatus = "missing";
          } else if (altLength < 5) {
            altStatus = "weak";
          } else if (
            genericAltWords.some((word) =>
              alt.toLowerCase().includes(word)
            )
          ) {
            altStatus = "generic";
          }

          const key = `${src}-${alt}`;

          if (!seenImages.has(key)) {
            seenImages.add(key);

            return {
              src,
              alt: alt || "(No ALT text)",
              className,
              lazyLoaded,

              // ALT analysis
              altStatus,
              altLength,

              // Dimensions
              displayedWidth,
              displayedHeight,
              naturalWidth,
              naturalHeight,

              // Placeholder for size (will be calculated later)
              sizeKB: null,
            };
          }
        })
        .filter(Boolean);

      return results;
    }, { ignoredClasses });

    // ----------------------------------------------------
    // Fetch image file sizes from Node (outside the browser)
    // ----------------------------------------------------

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        try {
          if (!img.src || img.src.startsWith("data:")) {
            return { ...img, sizeKB: "N/A" };
          }

          const response = await fetch(img.src);
          const buffer = await response.arrayBuffer();

          const sizeKB = (buffer.byteLength / 1024).toFixed(2);

          return {
            ...img,
            sizeKB,
          };
        } catch {
          return {
            ...img,
            sizeKB: "Unknown",
          };
        }
      })
    );

    // ----------------------------------------------------
    // Detect duplicate ALT texts
    // ----------------------------------------------------

    const altCounts = {};

    updatedImages.forEach((img) => {
      const alt = img.alt;
      if (!altCounts[alt]) altCounts[alt] = 0;
      altCounts[alt]++;
    });

    const finalImages = updatedImages.map((img) => ({
      ...img,
      duplicateAlt: altCounts[img.alt] > 1,
      duplicateCount: altCounts[img.alt],
    }));

    return finalImages;
  } catch (error) {
    console.error("❌ Error extracting images:", error);
    return [];
  }
}

module.exports = { extractImages };