import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";

export async function analyzePageAccessibility(url) {
  let browser;

  try {
    const isProd = process.env.NODE_ENV === "production";

    browser = await (isProd
      ? puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: process.env.CHROME_BIN || "/app/.apt/usr/bin/google-chrome-stable",
        })
      : puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }));

    const page = await browser.newPage();
    await page.setBypassCSP(true);

    console.log(`⏳ Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("✅ Page loaded successfully");

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

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Extra delay
    console.log("🔍 Running Axe Accessibility Analysis...");

    const results = await new AxePuppeteer(page).analyze();
    console.log("✅ Accessibility Analysis Completed");

    return { browser, page, results };
  } catch (error) {
    console.error("❌ Puppeteer error:", error);
    if (browser) await browser.close();
    throw error;
  }
}
