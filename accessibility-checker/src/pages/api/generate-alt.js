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

  const { imageUrl, charLimit = 150 } = req.body; // Ideal charLimit = 400


  if (!imageUrl) {
    return res.status(400).json({ error: "No image URL provided." });
  }

  try {
    console.log(`📥 Downloading & resizing image: ${imageUrl}`);

    // Download Image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to download image.");

    const imageBuffer = await response.buffer();

    // Resize Image to 512px Width (Maintain Aspect Ratio)
    const resizedImageBuffer = await sharp(imageBuffer).resize({ width: 512 }).toBuffer();
    const base64Image = `data:image/jpeg;base64,${resizedImageBuffer.toString("base64")}`;

    console.log(`📤 Sending resized image to GPT-4o Vision`);

    // Send Image to OpenAI GPT-4o Vision
    const responseAI = await openai.chat.completions.create({
      model: "gpt-4o", // ✅ Use GPT-4o (supports images)
      messages: [
        {
          role: "system",
          content: `You are an AI that generates concise image descriptions. Provide an alt text under ${charLimit} characters.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in a concise way:" },
            { type: "image_url", image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 100, // ✅ Keep max tokens low to reduce costs ideal max_tokens = 300
    });

    console.log(`✅ API Response:`, responseAI.choices[0]?.message?.content);

    return res.status(200).json({ altText: responseAI.choices[0]?.message?.content || "No ALT text generated" });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    return res.status(500).json({ error: "Failed to generate ALT text.", details: error.message });
  }
}
