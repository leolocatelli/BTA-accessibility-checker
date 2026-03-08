async function extractImages(page) {
  try {
    // Classes that should be ignored when extracting images
    const ignoredClasses = ["bnsimg", "footer-icons", "mega-menu__mobile"];

    const images = await page.evaluate(
      async (args) => {
        const ignoredClasses = args.ignoredClasses;

        // Wait a few seconds to allow lazy images to load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const seenImages = new Set();

        const genericAltWords = ["image", "photo", "picture", "img", "banner"];

        // Detect placeholder or fake sources used by lazy loaders
        function isPlaceholderSource(value) {
          if (!value || typeof value !== "string") return true;

          const normalized = value.trim().toLowerCase();

          return (
            normalized === "" ||
            normalized === "(no image source)" ||
            normalized.startsWith("data:image/gif") ||
            normalized.startsWith("data:image/png") ||
            normalized.startsWith("data:image/webp") ||
            normalized.startsWith("data:image/jpeg") ||
            normalized.includes("blank.gif") ||
            normalized.includes("placeholder")
          );
        }

        const results = Array.from(document.querySelectorAll("img"))
          .filter((img) => {
            if (!img) return false;

            // Ignore images with certain classes
            const imgClasses = (img.className || "").split(/\s+/).filter(Boolean);
            if (ignoredClasses.some((cls) => imgClasses.includes(cls))) {
              return false;
            }

            // Ignore images whose parent contains ignored classes
            let parent = img.parentElement;
            while (parent) {
              const parentClasses = (parent.className || "")
                .split(/\s+/)
                .filter(Boolean);

              if (ignoredClasses.some((cls) => parentClasses.includes(cls))) {
                return false;
              }

              parent = parent.parentElement;
            }

            return true;
          })
          .map((img) => {
            if (!img) return null;

            const currentSrc = img.currentSrc || "";
            const directSrc = img.src || "";
            const dataSrc = img.getAttribute("data-src") || "";
            const dataOriginal = img.getAttribute("data-original") || "";
            const dataLazy = img.getAttribute("data-lazy") || "";
            const dataSrcset = img.getAttribute("data-srcset") || "";

            // Pick the first valid non-placeholder source
            const srcCandidates = [
              dataSrc,
              dataOriginal,
              dataLazy,
              currentSrc,
              directSrc,
              dataSrcset,
            ];

            const src =
              srcCandidates.find((value) => !isPlaceholderSource(value)) ||
              "(No image source)";

            const altRaw = img.getAttribute("alt");
            const alt = altRaw?.trim() || "";

            const className = img.className || "(No class)";
            const lazyLoaded =
              img.getAttribute("loading") === "lazy" ||
              className.includes("lazyload") ||
              className.includes("lazyloaded");

            // Displayed size (rendered size in the page)
            const displayedWidth =
              img.clientWidth || img.width || parseInt(img.getAttribute("width"), 10) || 0;
            const displayedHeight =
              img.clientHeight || img.height || parseInt(img.getAttribute("height"), 10) || 0;

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
              genericAltWords.some((word) => alt.toLowerCase().includes(word))
            ) {
              altStatus = "generic";
            }

            const key = `${src}-${alt}`;

            if (seenImages.has(key)) return null;
            seenImages.add(key);

            return {
              src,
              dataSrc,
              currentSrc,
              directSrc,
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
          })
          .filter(Boolean);

        return results;
      },
      { ignoredClasses }
    );

    // ----------------------------------------------------
    // Fetch image file sizes from Node (outside the browser)
    // ----------------------------------------------------

    const updatedImages = await Promise.all(
      images.map(async (img) => {
        try {
          if (!img.src || img.src.startsWith("data:") || img.src === "(No image source)") {
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