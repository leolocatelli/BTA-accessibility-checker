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

          if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
            // 🟢 Expand capture area for better context
            const PADDING_X = 600;
            const PADDING_Y = 150;
            const viewport = await page.viewport();

            const clip = {
              x: Math.max(boundingBox.x - PADDING_X, 0),
              y: Math.max(boundingBox.y - PADDING_Y, 0),
              width: Math.max(Math.min(boundingBox.width + PADDING_X * 2, viewport.width - boundingBox.x), 100),
              height: Math.max(Math.min(boundingBox.height + PADDING_Y * 2, viewport.height - boundingBox.y), 100),
            };

            console.log(`📸 Capturing screenshot for ${node.target[0]}`, clip);

            await page.screenshot({
              path: screenshotPath,
              clip,
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
            }, 60000); // Deletes file after 1 minute
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
