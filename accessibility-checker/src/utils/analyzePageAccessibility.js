import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";

export async function analyzePageAccessibility(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--ignore-certificate-errors"],
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);

  console.log(`⏳ Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  console.log("✅ Page loaded successfully");

  // Ensure all images and lazy-loaded content appear before running analysis
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  // Extra delay to allow JS-based elements (lazy-loaded images, carousels, etc.)
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🔍 Running Axe Accessibility Analysis...");
  const results = await new AxePuppeteer(page).analyze();
  console.log("✅ Accessibility Analysis Completed");

  return { browser, page, results };
}
