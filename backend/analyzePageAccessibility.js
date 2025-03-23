const { AxePuppeteer } = require("@axe-core/puppeteer");
const puppeteer = require("puppeteer");

async function analyzePageAccessibility(url) {
  let browser;

  try {
    const isHeroku = process.env.NODE_ENV === "production" && process.env.RENDER !== "true";
    const isRender = process.env.RENDER === "true";

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions"
      ],
      executablePath: isHeroku ? "/app/.apt/usr/bin/google-chrome-stable" : undefined,
    });

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

    await new Promise((resolve) => setTimeout(resolve, 5000));
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

module.exports = { analyzePageAccessibility };
