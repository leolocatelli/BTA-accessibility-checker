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

const altUploadRoute = require("./altUploadRoute");
const transcribeRoute = require("./transcribeRoute");

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * CORS configuration.
 *
 * In production, FRONTEND_ORIGIN should point to the deployed frontend URL.
 * During local development, it usually points to http://localhost:3000.
 */
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

/**
 * Public screenshots folder.
 *
 * This makes generated accessibility screenshots available through:
 * /screenshots/:filename
 */
app.use(
  "/screenshots",
  express.static(path.join(__dirname, "public/screenshots")),
);

/**
 * JSON parser for routes that receive JSON payloads, such as /api/check.
 *
 * Multipart upload routes use Multer instead, so they do not depend on this.
 */
app.use(bodyParser.json({ limit: "1mb" }));

/**
 * Image ALT generation route.
 *
 * This route handles local image uploads and sends them to the AI ALT generator.
 */
app.use(altUploadRoute);

/**
 * Video/audio transcription route.
 *
 * Final endpoints:
 * POST /api/transcribe
 * GET /api/transcribe/:jobId
 */
app.use("/api/transcribe", transcribeRoute);

/**
 * Main accessibility analysis route.
 *
 * This endpoint opens the target page with Puppeteer, extracts accessibility data,
 * generates screenshots for violations, and returns the final report.
 */
app.post("/api/check", async (req, res) => {
  try {
    const { url, includeAlts = true, includeViolations = true } = req.body;

    console.log("🌐 Checking URL:", url);
    console.log("🧩 Analysis options:", {
      includeAlts,
      includeViolations,
    });

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // Remove old screenshots before starting a new accessibility scan.
    cleanupScreenshots();

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

    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

/**
 * Lists generated screenshot files.
 *
 * This is useful for debugging and for displaying available screenshots
 * in the frontend when needed.
 */
app.get("/api/screenshots", (req, res) => {
  const screenshotDir = path.join(__dirname, "public/screenshots");

  if (!fs.existsSync(screenshotDir)) {
    return res.json({ files: [] });
  }

  const files = fs.readdirSync(screenshotDir);

  return res.json({ files });
});

/**
 * Deletes all generated screenshots.
 *
 * This keeps the screenshots folder clean between analyses.
 */
app.delete("/api/screenshots", (req, res) => {
  const screenshotDir = path.join(__dirname, "public/screenshots");

  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir);

    files.forEach((file) => {
      fs.unlinkSync(path.join(screenshotDir, file));
    });
  }

  return res.json({ success: true });
});

/**
 * Registers the ARIA Inspector route.
 *
 * This keeps the inspector logic isolated in its own module.
 */
registerInspectRoute(app);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);
});