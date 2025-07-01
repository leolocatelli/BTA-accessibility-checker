async function extractImages(page) {
  try {
    const ignoredClasses = ["bnsimg", "footer-icons", "mega-menu__mobile"]; // ✏️ Personalize conforme necessário

    return await page.evaluate(async (args) => {
      const ignoredClasses = args.ignoredClasses;
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const seenImages = new Set();

      return Array.from(document.querySelectorAll("img, picture"))
        .filter((el) => {
          const img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return false;

          // Verifica se a imagem tem alguma das classes ignoradas
          const imgClasses = (img.className || "").split(/\s+/);
          if (ignoredClasses.some(cls => imgClasses.includes(cls))) return false;

          // Verifica se algum ancestral da imagem tem classes ignoradas
          let parent = img.parentElement;
          while (parent) {
            const parentClasses = (parent.className || "").split(/\s+/);
            if (ignoredClasses.some(cls => parentClasses.includes(cls))) return false;
            parent = parent.parentElement;
          }

          return true;
        })
        .map((el) => {
          const img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
          if (!img) return null;

          const src = img.src || img.getAttribute("data-src") || "(No image source)";
          const alt = img.alt?.trim() || "(No ALT text)";
          const className = img.className || "(No class)";
          const lazyLoaded = img.getAttribute("loading") === "lazy";

          const key = `${src}-${alt}`;
          if (!seenImages.has(key)) {
            seenImages.add(key);
            return { src, alt, className, lazyLoaded, size: "Fetching..." };
          }
        })
        .filter(Boolean);
    }, { ignoredClasses });
  } catch (error) {
    console.error("❌ Error extracting images:", error);
    return [];
  }
}

module.exports = { extractImages };
