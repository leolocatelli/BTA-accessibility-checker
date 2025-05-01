import OpenAI from "openai";
import fetch from "node-fetch";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrl, keyword = "", charLimit = 150 } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "No image URL provided." });
  }

  try {
    console.log(`📥 Downloading & resizing image: ${imageUrl}`);

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to download image.");
    const imageBuffer = await response.buffer();

    const resizedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 512 })
      .toBuffer();
    const base64Image = `data:image/jpeg;base64,${resizedImageBuffer.toString("base64")}`;

    console.log(`📤 Sending image to OpenAI with context keyword: ${keyword || "none"}`);

    const userPrompt = keyword
      ? `Describe this image in a concise way. Be sure to mention the keyword context: "${keyword}".`
      : "Describe this image in a concise way.";

    const responseAI = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI that generates concise image descriptions. Provide an alt text under ${charLimit} characters.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 100,
    });

    const rawAltText = responseAI.choices[0]?.message?.content || "No ALT text generated";
    const altText = rawAltText.replace(/"/g, "'"); // ✅ troca aspas duplas por simples

    console.log(`✅ ALT Text:`, altText);

    return res.status(200).json({ altText });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    return res.status(500).json({ error: "Failed to generate ALT text.", details: error.message });
  }
}
