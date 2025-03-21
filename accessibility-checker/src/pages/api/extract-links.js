export async function extractLinks(page) {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a")).map((link) => ({
        href: link.href,
        text: link.innerText || "(No text)",
      }));
    });
  
    console.log(`🔗 Extracted ${links.length} links`);
    return links;
  }
  