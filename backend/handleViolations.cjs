const fs = require("fs");
const path = require("path");
const { getSuggestedFix } = require("./getSuggestedFix.js");

async function handleViolations(page, results) {
  console.log("📸 Capturing WCAG Violation Screenshots...");

  const violations = await Promise.all(
    results.violations.map(async (violation) => {
      const affectedElements = [];

      for (const node of violation.nodes) {
        try {
          const el = await page.$(node.target[0]);
          if (!el) continue;

          const elementDescription = await page.evaluate((el) => {
            return (
              el.getAttribute("aria-label") ||
              el.innerText?.trim() ||
              el.getAttribute("alt") ||
              el.getAttribute("placeholder") ||
              el.tagName.toLowerCase()
            );
          }, el);

          let issueType = "Unknown";
          if (violation.id.includes("color-contrast")) issueType = "CSS";
          else if (violation.id.includes("heading") || violation.id.includes("aria")) issueType = "HTML";
          else if (violation.id.includes("focus") || violation.id.includes("keyboard")) issueType = "JavaScript";

          const cleanSelector = node.target[0]
            .replace(/:nth-child\(\d+\)/g, "")
            .replace(/\s*>\s*/g, " > ")
            .replace(/div\s*>\s*/g, "")
            .trim();

          const elementId = await page.evaluate((el) => el.id || null, el);
          const elementClass = await page.evaluate((el) => el.className || null, el);

          let finalSelector = cleanSelector;
          if (elementId) finalSelector = `#${elementId}`;
          else if (elementClass) finalSelector = `.${elementClass.split(" ")[0]}`;

          // ✅ Caminho corrigido para funcionar no Render
          const screenshotDir = path.join(__dirname, "public", "screenshots");
          if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

          const screenshotPath = path.join(screenshotDir, `${Date.now()}.png`);
          const boundingBox = await el.boundingBox();

          if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
            const PADDING_X = 600;
            const PADDING_Y = 150;
            const viewport = await page.viewport();

            const clip = {
              x: Math.max(boundingBox.x - PADDING_X, 0),
              y: Math.max(boundingBox.y - PADDING_Y, 0),
              width: Math.max(Math.min(boundingBox.width + PADDING_X * 2, viewport.width - boundingBox.x), 100),
              height: Math.max(Math.min(boundingBox.height + PADDING_Y * 2, viewport.height - boundingBox.y), 100),
            };

            console.log(`📸 Capturing screenshot for ${finalSelector}`, clip);

            await page.screenshot({
              path: screenshotPath,
              clip,
            });

            affectedElements.push({
              selector: `\`${finalSelector}\``,
              description: elementDescription || "Unknown element",
              issueType,
              screenshot: `/screenshots/${path.basename(screenshotPath)}`, // URL pública
            });
          }
        } catch (error) {
          console.error("❌ Error capturing screenshot:", error);
        }
      }

      return {
        description: violation.description,
        impact: violation.impact,
        affectedElements,
        suggestedFix: getSuggestedFix(violation.id),
      };
    })
  );

  return violations;
}

module.exports = { handleViolations };
