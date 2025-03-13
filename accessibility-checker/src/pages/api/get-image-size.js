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

    const response = await fetch(imageUrl, { method: "HEAD" });

    // Get Content-Length from headers
    const contentLength = response.headers.get("content-length");

    if (!contentLength) {
      return res.status(400).json({ error: "Failed to retrieve image size" });
    }

    const sizeKB = (parseInt(contentLength, 10) / 1024).toFixed(2);

    res.status(200).json({ size: `${sizeKB} KB` });
  } catch (error) {
    console.error("❌ Error fetching image size:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
