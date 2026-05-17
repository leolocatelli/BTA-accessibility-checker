// backend/generateSubtitles.js

const fs = require("fs");
const OpenAI = require("openai");

/**
 * OpenAI client instance.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates subtitles in SRT and VTT format using Whisper.
 *
 * Why Whisper?
 * - Better timestamp accuracy
 * - Native subtitle generation
 * - Supports SRT and VTT output
 *
 * @param {string} audioPath - Path to extracted audio file.
 * @returns {Promise<{srt: string, vtt: string}>}
 */
async function generateSubtitles(audioPath) {
  try {
    /**
     * Generate SRT subtitles.
     */
    const srtResponse =
      await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
        response_format: "srt",
      });

    /**
     * Generate VTT subtitles.
     */
    const vttResponse =
      await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
        response_format: "vtt",
      });

    return {
      srt: srtResponse,
      vtt: vttResponse,
    };
  } catch (error) {
    console.error("❌ Subtitle generation error:", error);

    throw new Error("Failed to generate subtitles.");
  }
}

module.exports = {
  generateSubtitles,
};