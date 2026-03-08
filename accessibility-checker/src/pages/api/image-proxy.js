export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing image URL" });
    }

    // Decode URL in case it was encoded
    const imageUrl = decodeURIComponent(url);

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Referer": "https://www.brownthomas.com/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch image" });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return res.status(400).json({ error: "URL is not an image" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prevent caching issues during development
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", contentType);

    res.send(buffer);

  } catch (error) {
    console.error("image-proxy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}