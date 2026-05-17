"use client";

// accessibility-checker/src/components/VideoTranscriptExtractor.js

import { useState } from "react";
import TranscriptUploadBox from "./TranscriptUploadBox";
import TranscriptResult from "./TranscriptResult";
import TranscriptSeoPanel from "./TranscriptSeoPanel";

export default function VideoTranscriptExtractor() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobStatus, setJobStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [generateSubtitles, setGenerateSubtitles] = useState(false);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <TranscriptUploadBox
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        jobStatus={jobStatus}
        setJobStatus={setJobStatus}
        setResult={setResult}
        setErrorMessage={setErrorMessage}
        generateSubtitles={generateSubtitles}
        setGenerateSubtitles={setGenerateSubtitles}
      />

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {jobStatus !== "idle" && (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Status: <span className="font-semibold capitalize">{jobStatus}</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <TranscriptResult transcript={result.transcript} />

          <TranscriptSeoPanel
            seoSummary={result.seoSummary}
            keywords={result.keywords}
            metaDescription={result.metaDescription}
            srt={result.srt}
            vtt={result.vtt}
          />
        </div>
      )}
    </section>
  );
}