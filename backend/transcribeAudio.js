// backend/transcribeAudio.js

const fs = require("fs");
const OpenAI = require("openai");

/**
 * OpenAI client used for audio transcription.
 *
 * The API key comes from the environment variable OPENAI_API_KEY.
 * Never hardcode API keys directly in the code.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends an audio file to OpenAI and returns the transcript text.
 *
 * @param {string} audioPath - Local path of the audio file extracted from the video
 * @returns {Promise<string>} Transcript text generated from the audio
 */
const transcribeAudio = async (audioPath) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "gpt-4o-mini-transcribe",
  });

  return transcription.text || "";
};

module.exports = transcribeAudio;