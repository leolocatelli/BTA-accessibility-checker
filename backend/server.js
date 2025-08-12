const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const { analyzePageAccessibility } = require("./analyzePageAccessibility");
const { cleanupScreenshots } = require("./cleanupScreenshots");
const { calculateScore } = require("./calculateScore");
const { extractImages } = require("./extractImages");
const { extractVideos } = require("./extractVideos");
const { extractText } = require("./extractText");
const { handleViolations } = require("./handleViolations.cjs");
const { measureLoadTime } = require("./measureLoadTime");
const { registerInspectRoute } = require("./inspectRoute");


const app = express();
const PORT = process.env.PORT || 4000;

// 📁 Torna os screenshots acessíveis publicamente
app.use("/screenshots", express.static(path.join(__dirname, "public/screenshots")));

app.use(cors());
app.use(bodyParser.json());

// 🚀 Rota principal da análise
app.post("/api/check", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("🌐 Checking URL:", url);

    if (!url) return res.status(400).json({ error: "Missing URL" });

    cleanupScreenshots(); // Apaga screenshots antigos

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

// 📸 Listar arquivos de screenshot
app.get("/api/screenshots", (req, res) => {
  const screenshotDir = path.join(__dirname, "public/screenshots");
  if (!fs.existsSync(screenshotDir)) {
    return res.json({ files: [] });
  }
  const files = fs.readdirSync(screenshotDir);
  res.json({ files });
});

// 🗑️ Apagar todos os screenshots
app.delete("/api/screenshots", (req, res) => {
  const screenshotDir = path.join(__dirname, "public/screenshots");
  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir);
    files.forEach((file) => {
      fs.unlinkSync(path.join(screenshotDir, file));
    });
  }
  res.json({ success: true });
});

// 🧠 Adiciona rota do ARIA Inspector
registerInspectRoute(app);  // ✅ <-- Esta linha estava faltando

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
