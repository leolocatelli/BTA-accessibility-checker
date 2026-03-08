export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing image URL" });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch image" });
    }

    const contentType = response.headers.get("content-type");

    if (!contentType.startsWith("image/")) {
      return res.status(400).json({ error: "URL is not an image" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.send(buffer);

  } catch (error) {
    console.error("image-proxy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}