// accessibility-checker/src/pages/video-transcript.js

import Head from "next/head";
import VideoTranscriptExtractor from "../../components/VideoTranscriptExtractor";

export default function VideoTranscriptPage() {
  return (
    <>
      <Head>
        <title>Video Transcript Extractor | BTA-EAA</title>

        <meta
          name="description"
          content="Upload a video or audio file and extract transcripts for SEO content."
        />
      </Head>

      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-10">
            <h1 className="mb-3 text-4xl font-bold">
              Video Transcript Extractor
            </h1>

            <p className="max-w-3xl text-gray-400">
              Upload a video or audio file to extract transcripts and generate
              SEO-friendly content automatically.
            </p>
          </div>

          <VideoTranscriptExtractor />
        </div>
      </main>
    </>
  );
}