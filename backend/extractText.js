async function extractText(page, minCharLength = 30) {
    try {
      const ignoredClasses = [
        "ot-sdk-eight",
        "ot-sdk-columns",
        "footer-copyright__container",
        "prefooter__data",
        "ot-sdk-row",
      ];
  
      const texts = await page.evaluate((minLength, ignoredClasses) => {
        const uniqueTexts = new Set();
  
        return Array.from(document.querySelectorAll("p, font"))
          .filter((el) => {
            let parent = el;
            while (parent) {
              if (parent.classList && ignoredClasses.some((cls) => parent.classList.contains(cls))) {
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
      }, minCharLength, ignoredClasses);
  
      console.log("📜 Extracted Unique Texts:", texts);
      return texts;
    } catch (error) {
      console.error("❌ Error extracting text:", error);
      return [];
    }
  }
  
  module.exports = { extractText };
  