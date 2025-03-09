export async function extractText(page, minCharLength = 50) {
    try {
        // 🔴 Define classes to ignore (including parent elements)
        const ignoredClasses = [
            "ot-sdk-eight",
            "ot-sdk-columns",
            "footer-copyright__container",
            "prefooter__data",
            "ot-sdk-row",
        ];

        const texts = await page.evaluate((minLength, ignoredClasses) => {
            const uniqueTexts = new Set(); // 🚀 Avoid duplicate texts

            return Array.from(document.querySelectorAll("p, font")) // ✅ Extract from <p> and <font>
                .filter((el) => {
                    // 🔍 Check if element or any parent <div> has an ignored class
                    let parent = el;
                    while (parent) {
                        if (parent.classList && ignoredClasses.some((cls) => parent.classList.contains(cls))) {
                            return false; // ❌ Ignore this element and all its children
                        }
                        parent = parent.parentElement; // Move up the DOM tree
                    }
                    return true; // ✅ Keep if no ignored classes found in ancestors
                })
                .map((el) => el.innerText.trim()) // 🔹 Extract text content
                .filter((text) => {
                    // 🔴 Ignore short texts
                    if (text.length < minLength) return false;

                    // 🔴 Ignore duplicate texts
                    if (uniqueTexts.has(text)) return false;
                    
                    uniqueTexts.add(text); // ✅ Add to Set (ensures uniqueness)
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
