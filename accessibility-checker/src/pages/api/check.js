import { analyzePageAccessibility } from "@/utils/analyzePageAccessibility";
import { extractImages } from "@/utils/extractImages";
import { handleViolations } from "@/utils/handleViolations";
import { calculateScore } from "@/utils/calculateScore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("❌ Method not allowed");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { url } = req.body;

    if (!url) {
      console.log("❌ Missing URL in request");
      return res.status(400).json({ error: "Missing URL" });
    }

    console.log(`🔍 Starting accessibility analysis for: ${url}`);

    // Launch Puppeteer and run Axe analysis
    const { browser, page, results } = await analyzePageAccessibility(url);

    // Extract images from the page
    const images = await extractImages(page);

    // Process WCAG violations and generate screenshots
    const violations = await handleViolations(page, results);

    // Calculate accessibility score
    const score = calculateScore(results.violations);

    // Close browser session
    await browser.close();

    // Send response with analysis results
    res.status(200).json({
      success: true,
      url,
      score,
      images,
      violations,
    });
  } catch (error) {
    console.error("❌ Error during accessibility check:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
