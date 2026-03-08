// backend/server.js
require("dotenv").config();
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

// ✅ importa a nova rota de upload local
const altUploadRoute = require("./altUploadRoute");

const app = express();
const PORT = process.env.PORT || 4000;

// 🌍 CORS — libere somente seu frontend do Heroku (ou * durante testes)
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

// 📁 Torna os screenshots acessíveis publicamente
app.use(
  "/screenshots",
  express.static(path.join(__dirname, "public/screenshots")),
);

// 📦 JSON do corpo (para rotas JSON como /api/check)
app.use(bodyParser.json({ limit: "1mb" }));

// 🆕 Rota para upload local de imagens → gerar ALT (multipart em memória)
app.use(altUploadRoute);

// 🚀 Rota principal da análise
app.post("/api/check", async (req, res) => {
  try {
    const { url, includeAlts = true, includeViolations = true } = req.body;

    console.log("🌐 Checking URL:", url);
    console.log("🧩 Analysis options:", {
      includeAlts,
      includeViolations,
    });

    if (!url) return res.status(400).json({ error: "Missing URL" });

    cleanupScreenshots(); // Apaga screenshots antigos

    const { browser, page, results } = await analyzePageAccessibility(url);

    const loadTime = await measureLoadTime(page);
    const images = includeAlts ? await extractImages(page) : [];
    const videos = await extractVideos(page);
    const textContent = await extractText(page);
    const violations = includeViolations
      ? await handleViolations(page, results)
      : [];
    const score = calculateScore(
      violations,
      images,
      {},
      videos,
      {},
      textContent,
      {},
    );

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
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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

// 🔍 Rota do Aria Inspector (já existente)
registerInspectRoute(app);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);
});
