// backend/jobStore.js

/**
 * Temporary in-memory storage for transcription jobs.
 *
 * Why are we using this?
 * ----------------------
 * Video transcription can take time (upload + audio extraction + AI processing).
 * Instead of making the frontend wait for one long request,
 * we create a "job" and update its status over time.
 *
 * Example flow:
 * pending → processing → done / error
 *
 * In the future, this can be replaced by Redis or a database.
 */

// In-memory object to temporarily store jobs
const jobs = {};

/**
 * Creates a new transcription job
 * @param {string} jobId - Unique job identifier
 */
const createJob = (jobId) => {
  jobs[jobId] = {
    status: "pending",
    transcript: null,
    seoSummary: null,
    keywords: [],
    metaDescription: null,
    srt: null,
    vtt: null,
    error: null,
  };
};

/**
 * Updates an existing job
 * @param {string} jobId - Unique job identifier
 * @param {object} updates - Data to update
 */
const updateJob = (jobId, updates) => {
  if (!jobs[jobId]) return;

  jobs[jobId] = {
    ...jobs[jobId],
    ...updates,
  };
};

/**
 * Retrieves a job by ID
 * @param {string} jobId - Unique job identifier
 * @returns {object|null}
 */
const getJob = (jobId) => {
  return jobs[jobId] || null;
};

module.exports = {
  createJob,
  updateJob,
  getJob,
};
