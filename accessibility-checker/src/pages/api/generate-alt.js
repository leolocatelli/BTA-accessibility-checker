import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrls } = req.body;
  
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: "No image URLs provided." });
  }

  try {
    const results = await Promise.all(
      imageUrls.map(async (url) => {
        console.log(`📥 Sending image to GPT-4 Vision: ${url}`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant specialized in generating detailed image descriptions for accessibility.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Describe this image in detail:" },
                { type: "image_url", image_url: { url } },
              ],
            },
          ],
          max_tokens: 200,
        });

        console.log(`✅ API Response:`, response.choices[0]?.message?.content);

        return {
          url,
          altText: response.choices[0]?.message?.content || "No ALT text generated",
        };
      })
    );

    return res.status(200).json({ results });
  } catch (error) {
    console.error("❌ GPT-4 Vision API Error:", error);
    return res.status(500).json({ error: "Failed to generate ALT text.", details: error.message });
  }
}
