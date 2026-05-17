// backend/generateSeoFromTranscript.js

const OpenAI = require("openai");

/**
 * OpenAI client used to generate SEO content from the transcript.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates SEO content from a video transcript.
 *
 * @param {string} transcript - Full transcript extracted from the video
 * @returns {Promise<object>} SEO content generated from the transcript
 */
const generateSeoFromTranscript = async (transcript) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  if (!transcript || transcript.trim().length === 0) {
    return {
      seoSummary: "",
      keywords: [],
      metaDescription: "",
    };
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an SEO assistant. Return only valid JSON with the keys: seoSummary, keywords, metaDescription.",
      },
      {
        role: "user",
        content: `
Create SEO content from this video transcript.

Requirements:
- seoSummary: short summary with 2 to 4 sentences
- keywords: array with 5 to 10 SEO keywords
- metaDescription: maximum 155 characters

Transcript:
${transcript}
        `,
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content || "{}";

  try {
    const parsedContent = JSON.parse(rawContent);

    return {
      seoSummary: parsedContent.seoSummary || "",
      keywords: Array.isArray(parsedContent.keywords)
        ? parsedContent.keywords
        : [],
      metaDescription: parsedContent.metaDescription || "",
    };
  } catch (error) {
    return {
      seoSummary: "",
      keywords: [],
      metaDescription: "",
    };
  }
};

module.exports = generateSeoFromTranscript;