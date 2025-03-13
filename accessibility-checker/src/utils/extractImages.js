export async function extractImages(page) {
  try {
    const ignoredClasses = ["mega-menu__mobile"];

    return await page.evaluate(async (ignoredClasses) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const seenImages = new Set();

      return Array.from(document.querySelectorAll("img, picture"))
        .filter((el) => {
          let img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return false;

          let parent = img;
          while (parent) {
            if (parent.classList && ignoredClasses.some((cls) => parent.classList.contains(cls))) {
              return false;
            }
            parent = parent.parentElement;
          }
          return true;
        })
        .map((el) => {
          let img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return null;

          let src = img.src || img.getAttribute("data-src") || "(No image source)";
          let alt = img.alt.trim() || "(No ALT text)";
          let className = img.className || "(No class)";
          let lazyLoaded = img.getAttribute("loading") === "lazy";

          const key = `${src}-${alt}`;
          if (!seenImages.has(key)) {
            seenImages.add(key);
            return { src, alt, className, lazyLoaded, size: "Fetching..." }; // Size will be fetched later
          }
        })
        .filter(Boolean);
    }, ignoredClasses);
  } catch (error) {
    console.error("❌ Error extracting images:", error);
    return [];
  }
}
