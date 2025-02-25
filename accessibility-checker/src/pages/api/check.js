import { analyzePageAccessibility } from "@/utils/analyzePageAccessibility";
import { extractImages } from "@/utils/extractImages";
import { extractVideos } from "@/utils/extractVideos"; // ✅ Import video extractor
import { handleViolations } from "@/utils/handleViolations";
import { calculateScore } from "@/utils/calculateScore";
import { cleanupScreenshots } from "@/utils/cleanupScreenshots";

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

    cleanupScreenshots(); // 🗑️ Cleanup old screenshots before running analysis

    console.log(`🔍 Starting accessibility analysis for: ${url}`);

    const { browser, page, results } = await analyzePageAccessibility(url);
    const images = await extractImages(page);
    const videos = await extractVideos(page); // ✅ Extract videos
    const violations = await handleViolations(page, results);
    const score = calculateScore(results.violations);

    await browser.close();

    res.status(200).json({
      success: true,
      url,
      score,
      images,
      videos, // ✅ Include videos in response
      violations,
    });
  } catch (error) {
    console.error("❌ Error during accessibility check:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}


