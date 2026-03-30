// backend/altUploadRoute.js (CommonJS)
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const OpenAI = require("openai");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
      file.mimetype,
    );
    cb(ok ? null : new Error("unsupported_type"), ok);
  },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/api/alt-from-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "missing_file" });

    const keyword = String(req.body.keyword || "");
    const charLimit = Math.min(parseInt(req.body.charLimit || "150", 10), 200);

    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({
        width: 512,
        withoutEnlargement: true,
        fit: "inside",
        fastShrinkOnLoad: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${resizedImageBuffer.toString("base64")}`;

    const userPrompt = keyword
      ? `Generate an accessible alt text for this image. Context keyword: "${keyword}".`
      : "Generate an accessible alt text for this image.";

    const responseAI = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You generate high-quality, accessible ALT text for images.

Rules:
- Use clear, concise, and descriptive language
- Focus on what is important in the image
- Avoid phrases like "image of" or "picture of"
- Prioritise clarity for screen readers
- Respect the character limit (${charLimit})

Language rules:
- Use British/Irish English spelling and vocabulary
- Avoid American English
- Use natural wording commonly used in Ireland and the UK
- Keep tone neutral and professional

Accessibility rules:
- Describe key elements, context, and purpose
- Include relevant objects, people, or actions when meaningful
- Avoid unnecessary details`,
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

    const rawAltText =
      responseAI.choices?.[0]?.message?.content || "No ALT text generated";
    const altText = rawAltText.replace(/"/g, "'");

    return res.json({ altText });
  } catch (err) {
    console.error("upload_alt_error:", err);
    const msg =
      err.message === "unsupported_type"
        ? "Unsupported image type. Allowed: jpeg, png, webp, gif."
        : err.message || "processing_failed";
    return res.status(400).json({ error: msg });
  }
});

module.exports = router;
