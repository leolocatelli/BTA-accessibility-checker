import { analyzePageAccessibility } from "../../../../backend/analyzePageAccessibility.js";
import { extractImages } from "../../../backend/extractImages.js";
import { extractVideos } from "../../../backend/extractVideos.js";
import { handleViolations } from "../../../backend/handleViolations.cjs/index.js";
import { calculateScore } from "../../../../backend/calculateScore.js";
import { cleanupScreenshots } from "../../../../backend/cleanupScreenshots.js";
import { measurePageSize } from "./measurePageSize";

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

    // ❗ Corrigido: passa os argumentos corretos
    const score = calculateScore(
      violations,
      images,
      {}, // checkedImages (vazio por padrão aqui)
      videos,
      {}, // checkedVideos
      [], // textContent (não extraído aqui)
      {}  // checkedTexts
    );

    await browser.close();

    res.status(200).json({
      success: true,
      url,
      score,
      pageSize,
      images,
      videos,
      violations,
    });
  } catch (error) {
    console.error("❌ Error during accessibility check:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
