// export async function extractLinks(page) {
//     const links = await page.evaluate(() => {
//       const linkElements = document.querySelectorAll("a");
  
//       return Array.from(linkElements)
//         .map((link) => ({
//           href: link.href.trim(),
//           text: link.innerText.trim(),
//           inMainContent: !!link.closest("main, article, section"),
//           isButton: link.getAttribute("role") === "button" || link.closest("button"),
//           visible: link.offsetWidth > 0 && link.offsetHeight > 0,
//         }))
//         .filter(
//           (link) =>
//             link.href &&
//             link.text.length > 3 &&
//             link.visible &&
//             (link.inMainContent || link.isButton || link.text.length > 10)
//         );
//     });
  
//     // ✅ Deduplicate links based on both `href` and `text`
//     const uniqueLinks = Array.from(
//       new Map(links.map((l) => [`${l.href}::${l.text}`, l])).values()
//     );
  
//     console.log(`🔗 Extracted ${uniqueLinks.length} meaningful unique links`);
//     return uniqueLinks;
//   }
  