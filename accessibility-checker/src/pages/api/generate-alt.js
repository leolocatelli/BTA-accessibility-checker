<<<<<<< HEAD
import axios from "axios";
=======
import OpenAI from "openai";
import fetch from "node-fetch";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
>>>>>>> alt-generator-gpt

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

<<<<<<< HEAD
  const { imageUrls } = req.body;
  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    console.error("❌ Missing Hugging Face API Key.");
    return res.status(500).json({ error: "Hugging Face API key is missing." });
  }

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    console.error("❌ No image URLs provided.");
    return res.status(400).json({ error: "No image URLs provided." });
  }

  try {
    const results = await Promise.all(
      imageUrls.map(async (url) => {
        console.log(`📥 Sending image URL to Hugging Face: ${url}`);

        // Faz apenas UMA requisição ao modelo
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
          { inputs: url },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Obtém a descrição básica gerada pelo modelo
        const altBasic = response.data[0]?.generated_text || "No ALT text generated";

        // 🔹 Geramos manualmente as variações
        const altFormal = `A professional description: ${altBasic}`;
        const altIdeal = `WCAG-compliant ALT text: ${altBasic}`;

        console.log(`✅ Generated ALT Texts for ${url}`);
        console.log(`🔹 Basic: ${altBasic}`);
        console.log(`🔹 Formal: ${altFormal}`);
        console.log(`🔹 Ideal (WCAG): ${altIdeal}`);

        return { url, altBasic, altFormal, altIdeal };
      })
    );

    return res.status(200).json({ results });
  } catch (error) {
    console.error("❌ Hugging Face API Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to generate ALT text.",
      details: error.response?.data || error.message,
    });
=======
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
>>>>>>> alt-generator-gpt
  }
}
