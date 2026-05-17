// accessibility-checker/src/components/TranscriptResult.js

export default function TranscriptResult({ transcript }) {
  const copyTranscript = async () => {
    if (!transcript) return;

    await navigator.clipboard.writeText(transcript);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-800">Transcript</h3>

        <button
          type="button"
          onClick={copyTranscript}
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          Copy
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        {transcript || "No transcript generated yet."}
      </div>
    </div>
  );
}