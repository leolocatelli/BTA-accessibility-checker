import fs from "fs";
import path from "path";
import { getSuggestedFix } from "./getSuggestedFix.js";

export async function handleViolations(page, results) {
  console.log("📸 Capturing WCAG Violation Screenshots...");

  const violations = await Promise.all(
    results.violations.map(async (violation) => {
      const affectedElements = [];

      for (const node of violation.nodes) {
        try {
          const el = await page.$(node.target[0]);
          if (!el) continue;

          const elementDescription = await page.evaluate((el) => {
            return el.innerText || el.getAttribute("aria-label") || el.tagName;
          }, el);

          // Define screenshot directory
          const screenshotDir = path.join(process.cwd(), "public", "screenshots");
          if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

          // Define screenshot path
          const screenshotPath = path.join(screenshotDir, `${Date.now()}.png`);
          const boundingBox = await el.boundingBox();

          if (boundingBox) {
            await page.screenshot({
              path: screenshotPath,
              clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: Math.min(boundingBox.width, 500),
                height: Math.min(boundingBox.height, 300),
              },
            });

            affectedElements.push({
              selector: node.target[0],
              description: elementDescription,
              screenshot: `/screenshots/${path.basename(screenshotPath)}`,
            });

            // 🗑️ Delete screenshot after 1 minute
            setTimeout(() => {
              try {
                fs.unlinkSync(screenshotPath);
                console.log(`🗑️ Deleted screenshot: ${screenshotPath}`);
              } catch (err) {
                console.error(`❌ Failed to delete ${screenshotPath}:`, err);
              }
            }, 600000); // Deletes file after 10min
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
