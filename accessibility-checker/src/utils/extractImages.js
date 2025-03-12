export async function extractImages(page) {
  try {
    // 🔴 Define classes to ignore (similar to extractText)
    const ignoredClasses = [
      "mega-menu__mobile"
    ];

    return await page.evaluate(async (ignoredClasses) => {
      // Wait until all images are loaded
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const seenImages = new Set();

      return Array.from(document.querySelectorAll("img, picture"))
        .filter((el) => {
          let img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return false;

          // 🔍 Check if the image or any parent has an ignored class
          let parent = img;
          while (parent) {
            if (parent.classList && ignoredClasses.some((cls) => parent.classList.contains(cls))) {
              return false; // ❌ Ignore this image
            }
            parent = parent.parentElement;
          }
          return true; // ✅ Keep the image
        })
        .map((el) => {
          let img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return null;

          let src = img.src || img.getAttribute("data-src") || "(No image source)";
          let alt = img.alt.trim() || "(No ALT text)";
          let className = img.className || "(No class)"; // ✅ Capture class name

          const key = `${src}-${alt}`;
          if (!seenImages.has(key)) {
            seenImages.add(key);
            return { src, alt, className }; // ✅ Return class name
          }
        })
        .filter(Boolean);
    }, ignoredClasses);
  } catch (error) {
    console.error("❌ Error extracting images:", error);
    return [];
  }
}
