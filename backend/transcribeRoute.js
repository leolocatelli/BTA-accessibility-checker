// backend/transcribeRoute.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const extractAudio = require("./extractAudio");
const transcribeAudio = require("./transcribeAudio");
const generateSeoFromTranscript = require("./generateSeoFromTranscript");
const { generateSubtitles } = require("./generateSubtitles");
const { createJob, updateJob, getJob } = require("./jobStore");

const router = express.Router();

const uploadsDir = path.join(__dirname, "uploads");

/**
 * Ensure the uploads directory exists.
 *
 * Videos and extracted audio files will be stored here temporarily.
 */
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer storage configuration.
 *
 * We save uploaded videos to disk because FFmpeg needs a local file path
 * to extract the audio.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${fileExtension}`);
  },
});

/**
 * Upload middleware configuration.
 *
 * For the MVP, we limit files to 100MB and only allow common video/audio types.
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log("Uploaded MIME type:", file.mimetype);
    console.log("Uploaded file name:", file.originalname);

    const allowedMimeTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/m4a",
      "application/octet-stream",
    ];

    const allowedExtensions = [".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a"];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);
    const isAllowedExtension = allowedExtensions.includes(fileExtension);

    if (isAllowedMimeType && isAllowedExtension) {
      cb(null, true);
    } else {
      cb(new Error("unsupported_file_type"), false);
    }
  },
});

/**
 * Process the transcription job in the background.
 *
 * This avoids keeping the HTTP request open while FFmpeg and OpenAI work.
 */
const processTranscriptionJob = async (
  jobId,
  filePath,
  mimeType,
  shouldGenerateSubtitles = false,
) => {
  let audioPath = null;

  try {
    updateJob(jobId, { status: "processing" });

    const isAudioFile = mimeType.startsWith("audio/");

    /**
     * If the uploaded file is already an audio file, we can send it directly
     * to the transcription API.
     *
     * If it is a video file, we first extract the audio with FFmpeg.
     */
    audioPath = isAudioFile ? filePath : await extractAudio(filePath);

    const transcript = await transcribeAudio(audioPath);
    const seoContent = await generateSeoFromTranscript(transcript);

    let subtitleContent = {
      srt: null,
      vtt: null,
    };

    if (shouldGenerateSubtitles) {
      subtitleContent = await generateSubtitles(audioPath);
    }

    updateJob(jobId, {
      status: "done",
      transcript,
      seoSummary: seoContent.seoSummary,
      keywords: seoContent.keywords,
      metaDescription: seoContent.metaDescription,
      srt: subtitleContent.srt,
      vtt: subtitleContent.vtt,
    });
  } catch (error) {
    updateJob(jobId, {
      status: "error",
      error: error.message || "Failed to process transcription",
    });
  } finally {
    /**
     * Remove temporary files after processing.
     *
     * This keeps the Render disk cleaner and avoids accumulating videos/audio.
     */
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};

/**
 * Starts a new transcription job.
 *
 * The frontend sends a file using the field name "file".
 * The backend immediately returns a jobId.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "missing_file" });
    }

    const jobId = uuidv4();

    const shouldGenerateSubtitles = req.body.generateSubtitles === "true";

    createJob(jobId);

    processTranscriptionJob(
      jobId,
      req.file.path,
      req.file.mimetype,
      shouldGenerateSubtitles,
    );

    return res.status(202).json({
      jobId,
      status: "pending",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to start transcription job",
    });
  }
});

/**
 * Returns the current status of a transcription job.
 */
router.get("/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: "job_not_found" });
  }

  return res.json(job);
});

module.exports = router;
