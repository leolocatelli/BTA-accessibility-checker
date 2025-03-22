// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { analyzePageAccessibility } = require("./backend/analyzePageAccessibility");
const { cleanupScreenshots } = require("./backend/cleanupScreenshots");
const { calculateScore } = require("./backend/calculateScore");
const { extractImages } = require("./accessibility-checker/src/utils/extractImages");
const { extractVideos } = require("./accessibility-checker/src/utils/extractVideos");
const { extractText } = require("./accessibility-checker/src/utils/extractText");
const { handleViolations } = require("./accessibility-checker/src/utils/handleViolations.cjs");
const { measureLoadTime } = require("./accessibility-checker/src/utils/measureLoadTime");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/check", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("🌐 Checking URL:", url);

    if (!url) return res.status(400).json({ error: "Missing URL" });

    cleanupScreenshots();

    const { browser, page, results } = await analyzePageAccessibility(url);

    const loadTime = await measureLoadTime(page);
    const images = await extractImages(page);
    const videos = await extractVideos(page);
    const textContent = await extractText(page);
    const violations = await handleViolations(page, results);
    const score = calculateScore(violations, images, {}, videos, {}, textContent, {});

    await browser.close();

    return res.json({
      success: true,
      url,
      score,
      loadTime,
      images,
      videos,
      textContent,
      violations,
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
