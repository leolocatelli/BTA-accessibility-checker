export async function extractImages(page) {
  return await page.evaluate(async () => {
    // Wait until all images are loaded
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const seenImages = new Set();

    return Array.from(document.querySelectorAll("img, picture"))
      .map((el) => {
        let img = el.tagName.toLowerCase() === "picture" ? el.querySelector("img") : el;
        if (!img) return null;

        let src = img.src || img.getAttribute("data-src") || "(No image source)";
        let alt = img.alt.trim() || "(No ALT text)";

        const key = `${src}-${alt}`;
        if (!seenImages.has(key)) {
          seenImages.add(key);
          return { src, alt };
        }
      })
      .filter(Boolean);
  });
}
