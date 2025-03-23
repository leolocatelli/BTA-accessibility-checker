// import { analyzePageAccessibility } from "../../../../backend/analyzePageAccessibility.js";
// import { extractImages } from "../../utils/extractImages";
// import { extractVideos } from "../../utils/extractVideos";
// import { handleViolations } from "../../utils/handleViolations.cjs";
// import { calculateScore } from "../../../../backend/calculateScore.js";
// import { cleanupScreenshots } from "../../../../backend/cleanupScreenshots.js";
// import { extractText } from "../../utils/extractText";
// import { measureLoadTime } from "../../utils/measureLoadTime"; // ✅ Added load time measurement

// export default async function handler(req, res) {
//   console.log("🔄 Received request to /api/check");

//   if (req.method !== "POST") {
//     console.log("❌ Method not allowed");
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   try {
//     const { url } = req.body;
//     console.log("🌐 URL received:", url);

//     if (!url) {
//       console.log("❌ Missing URL in request");
//       return res.status(400).json({ error: "Missing URL" });
//     }

//     if (!global.lastCheckedUrl || global.lastCheckedUrl !== url) {
//       console.log("♻️ Cleaning up screenshots...");
//       cleanupScreenshots();
//       global.lastCheckedUrl = url;
//     }

//     console.log("🧠 Analyzing page accessibility...");
//     const { browser, page, results } = await analyzePageAccessibility(url);

//     console.log("⏱ Measuring load time...");
//     const loadTime = await measureLoadTime(page);

//     console.log("🖼 Extracting images...");
//     const images = await extractImages(page);

//     console.log("🎞 Extracting videos...");
//     const videos = await extractVideos(page);

//     console.log("🚨 Handling violations...");
//     const violations = await handleViolations(page, results);

//     console.log("📄 Extracting text...");
//     const textContent = await extractText(page);

//     console.log("📊 Calculating score...");
//     const score = calculateScore(violations, images, {}, videos, {}, textContent, {});

//     console.log("🧹 Closing browser...");
//     await browser.close();

//     console.log("✅ Returning analysis data");

//     return res.status(200).json({
//       success: true,
//       url,
//       score,
//       loadTime,
//       images,
//       videos,
//       textContent,
//       violations,
//     });
//   } catch (error) {
//     console.error("❌ Error during accessibility check:", error);
//     return res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("❌ Proxy error in /api/check:", error);
    return res.status(500).json({ error: "Proxy Error", details: error.message });
  }
}
