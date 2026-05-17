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

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Extract transcript from media
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Upload a video or audio file to extract transcripts and generate
          SEO-friendly content automatically.
        </p>
      </div>

      <TranscriptUploadBox
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        jobStatus={jobStatus}
        setJobStatus={setJobStatus}
        setResult={setResult}
        setErrorMessage={setErrorMessage}
      />

      {errorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {jobStatus !== "idle" && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Current status: <span className="font-semibold">{jobStatus}</span>
        </div>
      )}

      {result && (
          <div className="mt-8 space-y-6">
          <TranscriptResult transcript={result.transcript} />

          <TranscriptSeoPanel
            seoSummary={result.seoSummary}
            keywords={result.keywords}
            metaDescription={result.metaDescription}
          />
        </div>
      )}
    </section>
  );
}