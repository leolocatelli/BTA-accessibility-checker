// accessibility-checker/src/components/TranscriptUploadBox.js

import { useRef, useState } from "react";
import { FileVideo, UploadCloud, Captions, X } from "lucide-react";

export default function TranscriptUploadBox({
  selectedFile,
  setSelectedFile,
  jobStatus,
  setJobStatus,
  setResult,
  setErrorMessage,
  generateSubtitles,
  setGenerateSubtitles,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const isProcessing = jobStatus === "pending" || jobStatus === "processing";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const allowedExtensions = [".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a"];

  /**
   * Validates if the selected file has an accepted extension.
   *
   * @param {File} file
   * @returns {boolean}
   */
  const isAllowedFile = (file) => {
    if (!file?.name) return false;

    const fileName = file.name.toLowerCase();

    return allowedExtensions.some((extension) => fileName.endsWith(extension));
  };

  /**
   * Resets previous results whenever the user selects a new file.
   *
   * @param {File} file
   */
  const handleSelectedFile = (file) => {
    if (!file) return;

    if (!isAllowedFile(file)) {
      setSelectedFile(null);
      setResult(null);
      setJobStatus("idle");
      setErrorMessage("Unsupported file type. Please upload MP4, MOV, WEBM, MP3, WAV or M4A.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setErrorMessage("");
    setJobStatus("idle");
  };

  /**
   * Polls the backend until the transcription job is done or fails.
   *
   * @param {string} jobId
   */
  const pollJobStatus = async (jobId) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/transcribe/${jobId}`);
        const data = await response.json();

        setJobStatus(data.status);

        if (data.status === "done") {
          clearInterval(intervalId);
          setResult(data);
        }

        if (data.status === "error") {
          clearInterval(intervalId);
          setErrorMessage(data.error || "Failed to process transcription.");
        }
      } catch (error) {
        clearInterval(intervalId);
        setJobStatus("error");
        setErrorMessage("Failed to check transcription status.");
      }
    }, 2000);
  };

  /**
   * Uploads the selected media file and starts a transcription job.
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setJobStatus("pending");
    setResult(null);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("generateSubtitles", generateSubtitles ? "true" : "false");

    try {
      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start transcription.");
      }

      pollJobStatus(data.jobId);
    } catch (error) {
      setJobStatus("error");
      setErrorMessage(error.message || "Failed to upload file.");
    }
  };

  /**
   * Removes the selected file and clears the current result.
   */
  const removeFile = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage("");
    setJobStatus("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Opens the native file picker.
   */
  const openFilePicker = () => {
    if (isProcessing) return;

    fileInputRef.current?.click();
  };

  /**
   * Handles drag enter/over events.
   *
   * @param {DragEvent} event
   */
  const handleDragOver = (event) => {
    event.preventDefault();

    if (isProcessing) return;

    setIsDragging(true);
  };

  /**
   * Handles drag leave events.
   *
   * @param {DragEvent} event
   */
  const handleDragLeave = (event) => {
    event.preventDefault();

    setIsDragging(false);
  };

  /**
   * Handles file drop events.
   *
   * @param {DragEvent} event
   */
  const handleDrop = (event) => {
    event.preventDefault();

    if (isProcessing) return;

    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    handleSelectedFile(droppedFile);
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
        } ${isProcessing ? "pointer-events-none opacity-70" : ""}`}
        aria-label="Upload video or audio file"
      >
        <div className="mb-4 rounded-full bg-white p-3 shadow-sm ring-1 ring-gray-200 transition group-hover:ring-blue-200">
          <UploadCloud className="h-7 w-7 text-blue-600" />
        </div>

        <span className="text-base font-bold text-gray-800">
          Drop your media file here
        </span>

        <span className="mt-1 text-sm text-gray-500">
          or click to choose a video or audio file
        </span>

        <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-blue-100">
          MP4, MOV, WEBM, MP3, WAV, M4A
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/m4a"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            handleSelectedFile(file);
          }}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2">
              <FileVideo className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {selectedFile.name}
              </p>

              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeFile}
            disabled={isProcessing}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 transition hover:bg-blue-50">
        <input
          type="checkbox"
          checked={generateSubtitles}
          onChange={(event) => setGenerateSubtitles(event.target.checked)}
          disabled={isProcessing}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <Captions className="mt-0.5 h-5 w-5 text-blue-600" />

          <div>
            <span className="block text-sm font-bold text-gray-800">
              Generate subtitles
            </span>

            <span className="mt-1 block text-xs leading-5 text-gray-500">
              Optional. Creates downloadable .SRT and .VTT files for captions.
            </span>
          </div>
        </div>
      </label>

      <button
        type="button"
        disabled={!selectedFile || isProcessing}
        onClick={handleUpload}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isProcessing ? "Processing..." : "Extract Transcript"}
      </button>
    </div>
  );
}