// backend/extractAudio.js

const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

/**
 * Set the FFmpeg binary path.
 *
 * This is important for deployment because Render may not have FFmpeg
 * installed globally. The ffmpeg-static package provides a local binary.
 */
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Extracts audio from a video file and saves it as MP3.
 *
 * @param {string} videoPath - Local path of the uploaded video file
 * @returns {Promise<string>} Local path of the generated audio file
 */
const extractAudio = (videoPath) => {
  return new Promise((resolve, reject) => {
    const parsedPath = path.parse(videoPath);
    const audioPath = path.join(parsedPath.dir, `${parsedPath.name}.mp3`);

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("64k")
      .audioChannels(1)
      .format("mp3")
      .on("end", () => {
        resolve(audioPath);
      })
      .on("error", (error) => {
        reject(error);
      })
      .save(audioPath);
  });
};

module.exports = extractAudio;