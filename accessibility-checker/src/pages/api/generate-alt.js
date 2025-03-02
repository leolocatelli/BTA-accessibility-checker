import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
  }
}
