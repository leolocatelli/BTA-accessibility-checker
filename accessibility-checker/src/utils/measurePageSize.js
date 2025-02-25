import { analyzePageAccessibility } from "@/utils/analyzePageAccessibility";
import { extractImages } from "@/utils/extractImages";
import { extractVideos } from "@/utils/extractVideos";
import { handleViolations } from "@/utils/handleViolations";
import { calculateScore } from "@/utils/calculateScore";
import { cleanupScreenshots } from "@/utils/cleanupScreenshots";
import { measurePageSize } from "@/utils/measurePageSize"; // ✅ Now using Cloudflare API

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

    cleanupScreenshots(); // 🗑️ Clean old screenshots before analysis

    console.log(`🔍 Starting accessibility analysis for: ${url}`);

    const { browser, page, results } = await analyzePageAccessibility(url);

    // ✅ Get the page size using Cloudflare API
    const pageSize = await measurePageSize(url) || { bytes: 0, kb: "0.00", mb: "0.00" };

    const images = await extractImages(page);
    const videos = await extractVideos(page);
    const violations = await handleViolations(page, results);
    const score = calculateScore(results.violations);

    await browser.close();

    res.status(200).json({
      success: true,
      url,
      score,
      pageSize, // ✅ Now correctly included
      images,
      videos,
      violations,
    });
  } catch (error) {
    console.error("❌ Error during accessibility check:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
