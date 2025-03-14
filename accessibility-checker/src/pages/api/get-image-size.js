import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Missing image URL" });
    }

    // Fetch file size
    const response = await fetch(imageUrl, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");

    if (!contentLength) {
      return res.status(400).json({ error: "Failed to retrieve image size" });
    }

    let sizeKB = parseInt(contentLength, 10) / 1024; // Convert bytes to KB

    // 🔹 Scene7 Compression Mapping
    const scene7Presets = {
      // ✅ LARGE VARIANTS (NO COMPRESSION)
      "$Large-16-9$": 1.0,
      // "$Large-1-1$": 1.0,
      "$Large-2-1$": 1.0,
      "$Large-1-2$": 1.0,
      "$Large-4-3$": 1.0,
      // "$Large-3-4$": 1.0,
      "$Large-1-5$": 1.0,
      "$Large-5-1$": 1.0,
      "$Large-9-16$": 1.0,
      "%3ALarge-1-1": 0.68,
      "%3ALarge-3-4": 0.55, 

      // ✅ XSMALL VARIANTS (ESTIMATED 65% REDUCTION)
      "$XSmall-16-9$": 0.35,
      // "$XSmall-1-1$": 0.35,
      "$XSmall-2-1$": 0.35,
      "$XSmall-1-2$": 0.35,
      "$XSmall-4-3$": 0.35, 
      // "$XSmall-3-4$": 0.35, 
      "$XSmall-1-5$": 0.35,
      "$XSmall-5-1$": 0.35,
      "$XSmall-9-16$": 0.35,
      ":Large-3-4?$XSmall-3-4$": 0.14,
      ":Large-1-1?$XSmall-1-1$": 0.063,
    };


    // 🔍 Detect preset in URL & apply compression
    Object.keys(scene7Presets).forEach((preset) => {
      if (imageUrl.includes(preset)) {
        sizeKB *= scene7Presets[preset]; // Apply compression ratio
      }
    });

    res.status(200).json({ size: `${sizeKB.toFixed(2)} KB` });
  } catch (error) {
    console.error("❌ Error fetching image size:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
