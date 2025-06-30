async function extractText(page, minCharLength = 40) {
  try {
    const ignoredClasses = [
,
    ];

    const allowedTdClasses = [
      "ImgRTextL",
      
    ];

    const texts = await page.evaluate(
      (minLength, ignoredClasses, allowedTdClasses) => {
        const uniqueTexts = new Set();

        const isAllowedTd = (el) => {
          if (el.tagName.toLowerCase() !== "td") return true; // Só filtra td
          if (!el.classList) return false;
          return allowedTdClasses.some((cls) => el.classList.contains(cls));
        };

        return Array.from(document.querySelectorAll("p, font, td"))
          .filter((el) => {
            if (!isAllowedTd(el)) return false;

            let parent = el;
            while (parent) {
              if (
                parent.classList &&
                ignoredClasses.some((cls) => parent.classList.contains(cls))
              ) {
                return false;
              }
              parent = parent.parentElement;
            }
            return true;
          })
          .map((el) => el.innerText.trim())
          .filter((text) => {
            if (text.length < minLength) return false;
            if (uniqueTexts.has(text)) return false;
            uniqueTexts.add(text);
            return true;
          });
      },
      minCharLength,
      ignoredClasses,
      allowedTdClasses
    );

    console.log("📜 Extracted Filtered Texts:", texts);
    return texts;
  } catch (error) {
    console.error("❌ Error extracting text:", error);
    return [];
  }
}

module.exports = { extractText };
